package br.com.senac.sistema_gestao_absenteismo.aviso.service;

import br.com.senac.sistema_gestao_absenteismo.aviso.dto.AvisoRequest;
import br.com.senac.sistema_gestao_absenteismo.aviso.dto.AvisoResponse;
import br.com.senac.sistema_gestao_absenteismo.aviso.model.Aviso;
import br.com.senac.sistema_gestao_absenteismo.aviso.model.DestinoAviso;
import br.com.senac.sistema_gestao_absenteismo.aviso.repository.AvisoRepository;
import br.com.senac.sistema_gestao_absenteismo.funcionario.model.Funcionario;
import br.com.senac.sistema_gestao_absenteismo.funcionario.model.StatusFuncionario;
import br.com.senac.sistema_gestao_absenteismo.funcionario.repository.FuncionarioRepository;
import br.com.senac.sistema_gestao_absenteismo.shared.exception.RecursoNaoEncontradoException;
import br.com.senac.sistema_gestao_absenteismo.shared.exception.UsuarioInativoException;
import br.com.senac.sistema_gestao_absenteismo.funcionario.model.TipoUsuario;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AvisoService {

    private final AvisoRepository avisoRepository;
    private final FuncionarioRepository funcionarioRepository;

    @Transactional
    public AvisoResponse criar(Long criadorId,AvisoRequest request) {

        Funcionario criador = buscarFuncionarioAtivo(criadorId);

        validarRequest(request);

        LocalDateTime publicadoEm = definirDataPublicacao(request);

        Aviso aviso = Aviso.builder().titulo(request.titulo().trim()).mensagem(request.mensagem().trim()).nivel(request.nivel()).destino(request.destino())
        .tipoAcessoAlvo(definirTipoAcessoAlvo(request)).setorAlvo(definirSetorAlvo(request)).ativo(true).publicadoEm(publicadoEm)
        .expiraEm(request.expiraEm()).criadoPor(criador).build();

        Aviso salvo = avisoRepository.save(aviso);

        return AvisoResponse.from(salvo);
    }

    @Transactional(readOnly = true)
    public List<AvisoResponse> listarGerencial(Boolean ativo) {
        List<Aviso> avisos = ativo == null ? avisoRepository.findAllByOrderByPublicadoEmDesc() : avisoRepository.findByAtivoOrderByPublicadoEmDesc(ativo);

        return avisos.stream().map(AvisoResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public List<AvisoResponse> listarMeus(Long funcionarioId) {

        Funcionario funcionario = buscarFuncionarioAtivo(funcionarioId);

        LocalDateTime agora = LocalDateTime.now().withNano(0);

        return avisoRepository.findByAtivoTrueOrderByPublicadoEmDesc().stream().filter(aviso -> avisoDisponivelNaData(aviso,agora))
        .filter(aviso -> avisoDestinadoAoFuncionario(aviso,funcionario)).map(AvisoResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public AvisoResponse buscarPorIdGerencial(Long avisoId) {
        return AvisoResponse.from(buscarAviso(avisoId));
    }

    @Transactional
    public AvisoResponse atualizar(Long avisoId,AvisoRequest request) {

        Aviso aviso = buscarAviso(avisoId);

        validarRequest(request);

        aviso.setTitulo(request.titulo().trim());

        aviso.setMensagem(request.mensagem().trim());

        aviso.setNivel(request.nivel());

        aviso.setDestino(request.destino());

        aviso.setTipoAcessoAlvo(definirTipoAcessoAlvo(request));

        aviso.setSetorAlvo(definirSetorAlvo(request));

        aviso.setPublicadoEm(definirDataPublicacao(request));

        aviso.setExpiraEm(request.expiraEm());

        Aviso atualizado = avisoRepository.save(aviso);

        return AvisoResponse.from(atualizado);
    }

    @Transactional
    public void excluir(Long avisoId) {

        Aviso aviso = buscarAviso(avisoId);

        avisoRepository.delete(aviso);
    }

    private Funcionario buscarFuncionarioAtivo(Long funcionarioId) {

        Funcionario funcionario = funcionarioRepository.findById(funcionarioId).orElseThrow(() ->
        new RecursoNaoEncontradoException("Funcionário autenticado não encontrado"));

        if (funcionario.getStatus() != StatusFuncionario.ATIVO) {

            throw new UsuarioInativoException("O funcionário autenticado está inativo");
        }

        return funcionario;
    }

    private Aviso buscarAviso(Long avisoId) {
        return avisoRepository.findById(avisoId).orElseThrow(() ->
        new RecursoNaoEncontradoException("Aviso não encontrado com o id " + avisoId));
    }

    private void validarRequest(AvisoRequest request) {

        validarDestino(request);

        LocalDateTime publicadoEm =
                definirDataPublicacao(request);

        if (request.expiraEm() != null && !request.expiraEm().isAfter(publicadoEm)) {
            throw new IllegalArgumentException("A data de expiração deve ser posterior à data de publicação");
        }
    }

    private void validarDestino(
            AvisoRequest request
    ) {
        switch (request.destino()) {

            case TODOS -> {
                if (request.tipoAcessoAlvo() != null || possuiTexto(request.setorAlvo())) {
                    throw new IllegalArgumentException("Avisos destinados a todos não devem possuir tipo de acesso ou setor alvo");
                }
            }

            case TIPO_ACESSO -> {

                if (request.tipoAcessoAlvo() == null) {
                    throw new IllegalArgumentException("O tipo de acesso alvo é obrigatório");
                }

                if (possuiTexto(request.setorAlvo())) {
                    throw new IllegalArgumentException("Avisos por tipo de acesso não devem possuir setor alvo");
                }
            }

            case SETOR -> {
                if (!possuiTexto(request.setorAlvo())) {
                    throw new IllegalArgumentException("O setor alvo é obrigatório");
                }

                if (request.tipoAcessoAlvo() != null) {
                    throw new IllegalArgumentException("Avisos por setor não devem possuir tipo de acesso alvo");
                }
            }
        }
    }

    private LocalDateTime definirDataPublicacao(AvisoRequest request) {
        if (request.publicadoEm() == null) {
            return LocalDateTime.now().withNano(0);
        }

        return request.publicadoEm().withNano(0);
    }

    private boolean avisoDisponivelNaData(Aviso aviso,LocalDateTime agora) {

        boolean publicacaoIniciada = !aviso.getPublicadoEm().isAfter(agora);

        boolean naoExpirou = aviso.getExpiraEm() == null || aviso.getExpiraEm().isAfter(agora);

        return publicacaoIniciada
                && naoExpirou;
    }

    private boolean avisoDestinadoAoFuncionario(Aviso aviso,Funcionario funcionario) {
        return switch (aviso.getDestino()) {

            case TODOS -> true;

            case TIPO_ACESSO -> aviso.getTipoAcessoAlvo() == funcionario.getTipoAcesso();

            case SETOR -> aviso.getSetorAlvo() != null && funcionario.getSetor() != null && aviso.getSetorAlvo().equalsIgnoreCase(funcionario.getSetor());
        };
    }

    private TipoUsuario definirTipoAcessoAlvo(AvisoRequest request) {
        return request.destino() == DestinoAviso.TIPO_ACESSO ? request.tipoAcessoAlvo() : null;
    }

    private String definirSetorAlvo(AvisoRequest request) {
        return request.destino()
                == DestinoAviso.SETOR ? request.setorAlvo().trim() : null;
    }

    private boolean possuiTexto(String valor) {
        return valor != null && !valor.isBlank();
    }
}