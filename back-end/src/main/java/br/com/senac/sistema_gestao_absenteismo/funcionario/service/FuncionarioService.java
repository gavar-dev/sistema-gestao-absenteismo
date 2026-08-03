package br.com.senac.sistema_gestao_absenteismo.funcionario.service;

import br.com.senac.sistema_gestao_absenteismo.funcionario.dto.FuncionarioCreateRequest;
import br.com.senac.sistema_gestao_absenteismo.funcionario.dto.FuncionarioResponse;
import br.com.senac.sistema_gestao_absenteismo.funcionario.dto.FuncionarioUpdateRequest;
import br.com.senac.sistema_gestao_absenteismo.funcionario.model.Funcionario;
import br.com.senac.sistema_gestao_absenteismo.funcionario.model.StatusFuncionario;
import br.com.senac.sistema_gestao_absenteismo.funcionario.repository.FuncionarioRepository;
import br.com.senac.sistema_gestao_absenteismo.shared.exception.ConflitoDeDadosException;
import br.com.senac.sistema_gestao_absenteismo.shared.exception.RecursoNaoEncontradoException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class FuncionarioService {

    private final FuncionarioRepository funcionarioRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public FuncionarioResponse criar(FuncionarioCreateRequest request) {
        String email = normalizarEmail(request.emailCorporativo());
        String cpf = somenteDigitos(request.cpf());
        String matricula = request.matricula().trim();

        validarDuplicidadesParaCriacao(email, cpf, matricula);

        Funcionario funcionario = Funcionario.builder()
                .nomeCompleto(request.nomeCompleto().trim())
                .emailCorporativo(email)
                .cpf(cpf)
                .telefone(request.telefone().trim())
                .dataNascimento(request.dataNascimento())
                .estadoCivil(limparOpcional(request.estadoCivil()))
                .nacionalidade(request.nacionalidade().trim())
                .naturalidade(limparOpcional(request.naturalidade()))
                .matricula(matricula)
                .cargo(request.cargo().trim())
                .setor(request.setor().trim())
                .dataAdmissao(request.dataAdmissao())
                .tipoVinculo(request.tipoVinculo())
                .cargaHorariaSemanal(request.cargaHorariaSemanal())
                .gestorImediato(limparOpcional(request.gestorImediato()))
                .localTrabalho(limparOpcional(request.localTrabalho()))
                .tipoAcesso(request.tipoAcesso())
                .status(request.status())
                .senhaHash(passwordEncoder.encode(request.senhaProvisoria()))
                .build();

        return FuncionarioResponse.from(funcionarioRepository.save(funcionario));
    }

    @Transactional(readOnly = true)
    public List<FuncionarioResponse> listar(StatusFuncionario status) {
        List<Funcionario> funcionarios = status == null
                ? funcionarioRepository.findAllByOrderByNomeCompletoAsc()
                : funcionarioRepository.findByStatusOrderByNomeCompletoAsc(status);

        return funcionarios.stream()
                .map(FuncionarioResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public FuncionarioResponse buscarPorId(Long id) {
        return FuncionarioResponse.from(buscarEntidade(id));
    }

    @Transactional
    public FuncionarioResponse atualizar(Long id, FuncionarioUpdateRequest request) {
        Funcionario funcionario = buscarEntidade(id);
        String email = normalizarEmail(request.emailCorporativo());
        String cpf = somenteDigitos(request.cpf());
        String matricula = request.matricula().trim();

        validarDuplicidadesParaAtualizacao(id, email, cpf, matricula);

        funcionario.setNomeCompleto(request.nomeCompleto().trim());
        funcionario.setEmailCorporativo(email);
        funcionario.setCpf(cpf);
        funcionario.setTelefone(request.telefone().trim());
        funcionario.setDataNascimento(request.dataNascimento());
        funcionario.setEstadoCivil(limparOpcional(request.estadoCivil()));
        funcionario.setNacionalidade(request.nacionalidade().trim());
        funcionario.setNaturalidade(limparOpcional(request.naturalidade()));
        funcionario.setMatricula(matricula);
        funcionario.setCargo(request.cargo().trim());
        funcionario.setSetor(request.setor().trim());
        funcionario.setDataAdmissao(request.dataAdmissao());
        funcionario.setTipoVinculo(request.tipoVinculo());
        funcionario.setCargaHorariaSemanal(request.cargaHorariaSemanal());
        funcionario.setGestorImediato(limparOpcional(request.gestorImediato()));
        funcionario.setLocalTrabalho(limparOpcional(request.localTrabalho()));
        funcionario.setTipoAcesso(request.tipoAcesso());
        funcionario.setStatus(request.status());

        return FuncionarioResponse.from(funcionarioRepository.save(funcionario));
    }

    @Transactional
    public FuncionarioResponse alterarStatus(Long id, StatusFuncionario status) {
        Funcionario funcionario = buscarEntidade(id);
        funcionario.setStatus(status);
        return FuncionarioResponse.from(funcionarioRepository.save(funcionario));
    }

    @Transactional
    public void desativar(Long id) {
        Funcionario funcionario = buscarEntidade(id);
        funcionario.setStatus(StatusFuncionario.INATIVO);
        funcionarioRepository.save(funcionario);
    }

    private Funcionario buscarEntidade(Long id) {
        return funcionarioRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException(
                        "Funcionário não encontrado com o id " + id
                ));
    }

    private void validarDuplicidadesParaCriacao(String email, String cpf, String matricula) {
        if (funcionarioRepository.existsByEmailCorporativoIgnoreCase(email)) {
            throw new ConflitoDeDadosException("Já existe um funcionário com este e-mail");
        }
        if (funcionarioRepository.existsByCpf(cpf)) {
            throw new ConflitoDeDadosException("Já existe um funcionário com este CPF");
        }
        if (funcionarioRepository.existsByMatriculaIgnoreCase(matricula)) {
            throw new ConflitoDeDadosException("Já existe um funcionário com esta matrícula");
        }
    }

    private void validarDuplicidadesParaAtualizacao(Long id, String email, String cpf, String matricula) {
        if (funcionarioRepository.existsByEmailCorporativoIgnoreCaseAndIdNot(email, id)) {
            throw new ConflitoDeDadosException("Já existe outro funcionário com este e-mail");
        }
        if (funcionarioRepository.existsByCpfAndIdNot(cpf, id)) {
            throw new ConflitoDeDadosException("Já existe outro funcionário com este CPF");
        }
        if (funcionarioRepository.existsByMatriculaIgnoreCaseAndIdNot(matricula, id)) {
            throw new ConflitoDeDadosException("Já existe outro funcionário com esta matrícula");
        }
    }

    private String normalizarEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }

    private String somenteDigitos(String valor) {
        return valor.replaceAll("\\D", "");
    }

    private String limparOpcional(String valor) {
        if (valor == null || valor.isBlank()) {
            return null;
        }
        return valor.trim();
    }
}
