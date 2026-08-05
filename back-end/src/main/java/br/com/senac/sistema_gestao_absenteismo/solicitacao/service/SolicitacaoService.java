package br.com.senac.sistema_gestao_absenteismo.solicitacao.service;

import java.text.Normalizer;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.senac.sistema_gestao_absenteismo.funcionario.model.Funcionario;
import br.com.senac.sistema_gestao_absenteismo.funcionario.model.StatusFuncionario;
import br.com.senac.sistema_gestao_absenteismo.funcionario.repository.FuncionarioRepository;
import br.com.senac.sistema_gestao_absenteismo.ponto.model.RegistroPonto;
import br.com.senac.sistema_gestao_absenteismo.ponto.repository.RegistroPontoRepository;
import br.com.senac.sistema_gestao_absenteismo.shared.exception.ConflitoDeDadosException;
import br.com.senac.sistema_gestao_absenteismo.shared.exception.RecursoNaoEncontradoException;
import br.com.senac.sistema_gestao_absenteismo.shared.exception.UsuarioInativoException;
import br.com.senac.sistema_gestao_absenteismo.solicitacao.dto.SolicitacaoCreateRequest;
import br.com.senac.sistema_gestao_absenteismo.solicitacao.dto.SolicitacaoResponse;
import br.com.senac.sistema_gestao_absenteismo.solicitacao.model.PrioridadeSolicitacao;
import br.com.senac.sistema_gestao_absenteismo.solicitacao.model.Solicitacao;
import br.com.senac.sistema_gestao_absenteismo.solicitacao.model.StatusSolicitacao;
import br.com.senac.sistema_gestao_absenteismo.solicitacao.repository.SolicitacaoRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class SolicitacaoService {

    private static final LocalTime HORARIO_REFERENCIA = LocalTime.of(8, 0);

    private final SolicitacaoRepository solicitacaoRepository;
    private final FuncionarioRepository funcionarioRepository;
    private final RegistroPontoRepository registroPontoRepository;

    @Transactional
    public SolicitacaoResponse criar(Long funcionarioId,SolicitacaoCreateRequest request) {

        Funcionario funcionario = buscarFuncionarioAtivo(funcionarioId);

        validarRequest(funcionarioId, request);

        Solicitacao solicitacao = Solicitacao.builder().funcionario(funcionario)
        .tipo(request.tipo()).status(StatusSolicitacao.PENDENTE).prioridade(
            request.prioridade() == null ? PrioridadeSolicitacao.NORMAL : request.prioridade())
            .justificativa(request.justificativa().trim()).build();

        preencherDadosEspecificos(solicitacao,funcionarioId,request);

        Solicitacao salva = solicitacaoRepository.save(solicitacao);

        return SolicitacaoResponse.from(salva);
    }

    private Funcionario buscarFuncionarioAtivo(Long funcionarioId) {

        Funcionario funcionario = funcionarioRepository.findById(funcionarioId).orElseThrow(() ->
        new RecursoNaoEncontradoException("Funcionário autenticado não encontrado"));

        if (funcionario.getStatus() != StatusFuncionario.ATIVO) {
            throw new UsuarioInativoException("Somente funcionários ativos podem criar solicitações");
        }

        return funcionario;
    }

    private void validarRequest(Long funcionarioId,SolicitacaoCreateRequest request) {

        switch (request.tipo()) {

            case CORRECAO_PONTO -> validarCorrecaoPonto(funcionarioId,request);

            case JUSTIFICATIVA_FALTA -> validarJustificativaFalta(funcionarioId,request);

            case SOLICITACAO_FERIAS -> validarFerias(request);

            case CORRECAO_CADASTRO -> validarCorrecaoCadastro(request);
        }
    }

    private void validarCorrecaoPonto(Long funcionarioId,SolicitacaoCreateRequest request) {

        validarDataReferenciaEObrigatoria(request.dataReferencia());

        validarPrazo48Horas(request.dataReferencia());

        boolean nenhumHorarioInformado = request.entradaSolicitada() == null 
        && request.inicioIntervaloSolicitado() == null 
        && request.fimIntervaloSolicitado() == null && request.saidaSolicitada() == null;

        if (nenhumHorarioInformado) {
            throw new IllegalArgumentException("Informe ao menos um horário para a correção de ponto");
        }

        validarDuplicidade(funcionarioId,request);
    }

    private void validarJustificativaFalta(Long funcionarioId,SolicitacaoCreateRequest request) {

        validarDataReferenciaEObrigatoria(request.dataReferencia());

        validarPrazo48Horas(request.dataReferencia());

        validarDuplicidade(funcionarioId,request);
    }

    private void validarFerias(SolicitacaoCreateRequest request) {

        if (request.dataInicio() == null || request.dataFim() == null) {
            throw new IllegalArgumentException("As datas inicial e final das férias são obrigatórias");
        }

        if (request.dataInicio().isBefore(LocalDate.now())) {
            throw new IllegalArgumentException("A data inicial das férias não pode estar no passado");
        }

        if (request.dataFim().isBefore(request.dataInicio())) {
            throw new IllegalArgumentException("A data final das férias não pode ser anterior à data inicial");
        }
    }

    private void validarCorrecaoCadastro(SolicitacaoCreateRequest request) {
        if (request.campoCadastro() == null || request.campoCadastro().isBlank()) {
            throw new IllegalArgumentException("O campo cadastral que será alterado é obrigatório");
        }

        if (request.novoValor() == null || request.novoValor().isBlank()) {
            throw new IllegalArgumentException("O novo valor do campo é obrigatório");
        }

        String campoNormalizado = normalizarTexto(request.campoCadastro());

        if (campoNormalizado.equals("matricula")) {
            throw new IllegalArgumentException("A matrícula não pode ser alterada");
        }
    }

    private void validarDataReferenciaEObrigatoria(
            LocalDate dataReferencia
    ) {
        if (dataReferencia == null) {
            throw new IllegalArgumentException(
                    "A data de referência é obrigatória"
            );
        }

        if (dataReferencia.isAfter(LocalDate.now())) {
            throw new IllegalArgumentException(
                    "A data de referência não pode estar no futuro"
            );
        }
    }

    private void validarPrazo48Horas(
            LocalDate dataReferencia
    ) {
        LocalDateTime prazo =
                dataReferencia
                        .atTime(HORARIO_REFERENCIA)
                        .plusHours(48);

        if (!LocalDateTime.now().isBefore(prazo)) {
            throw new IllegalArgumentException(
                    "O prazo de 48 horas para esta solicitação foi encerrado"
            );
        }
    }

    private void validarDuplicidade(
            Long funcionarioId,
            SolicitacaoCreateRequest request
    ) {
        boolean possuiSolicitacaoPendente =
                solicitacaoRepository
                        .existsByFuncionario_IdAndTipoAndDataReferenciaAndStatus(
                                funcionarioId,
                                request.tipo(),
                                request.dataReferencia(),
                                StatusSolicitacao.PENDENTE
                        );

        if (possuiSolicitacaoPendente) {
            throw new ConflitoDeDadosException(
                    "Já existe uma solicitação pendente deste tipo para a data informada"
            );
        }
    }

    private void preencherDadosEspecificos(
            Solicitacao solicitacao,
            Long funcionarioId,
            SolicitacaoCreateRequest request
    ) {
        switch (request.tipo()) {
            case CORRECAO_PONTO -> {
                solicitacao.setDataReferencia(
                        request.dataReferencia()
                );

                solicitacao.setEntradaSolicitada(
                        request.entradaSolicitada()
                );

                solicitacao.setInicioIntervaloSolicitado(
                        request.inicioIntervaloSolicitado()
                );

                solicitacao.setFimIntervaloSolicitado(
                        request.fimIntervaloSolicitado()
                );

                solicitacao.setSaidaSolicitada(
                        request.saidaSolicitada()
                );

                solicitacao.setNomeAnexo(
                        request.nomeAnexo()
                );

                vincularRegistroPonto(
                        solicitacao,
                        funcionarioId,
                        request.dataReferencia()
                );
            }

            case JUSTIFICATIVA_FALTA -> {
                solicitacao.setDataReferencia(
                        request.dataReferencia()
                );

                solicitacao.setNomeAnexo(
                        request.nomeAnexo()
                );

                vincularRegistroPonto(
                        solicitacao,
                        funcionarioId,
                        request.dataReferencia()
                );
            }

            case SOLICITACAO_FERIAS -> {
                solicitacao.setDataInicio(
                        request.dataInicio()
                );

                solicitacao.setDataFim(
                        request.dataFim()
                );
            }

            case CORRECAO_CADASTRO -> {
                solicitacao.setCampoCadastro(
                        request.campoCadastro().trim()
                );

                solicitacao.setNovoValor(
                        request.novoValor().trim()
                );
            }
        }
    }

    private void vincularRegistroPonto(
            Solicitacao solicitacao,
            Long funcionarioId,
            LocalDate dataReferencia
    ) {
        RegistroPonto registroPonto =
                registroPontoRepository
                        .findByFuncionario_IdAndDataRegistro(
                                funcionarioId,
                                dataReferencia
                        )
                        .orElse(null);

        solicitacao.setRegistroPonto(registroPonto);
    }

    private String normalizarTexto(
            String valor
    ) {
        return Normalizer
                .normalize(valor, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .toLowerCase()
                .trim();
    }
}