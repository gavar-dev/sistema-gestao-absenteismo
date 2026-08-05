package br.com.senac.sistema_gestao_absenteismo.solicitacao.service;

import java.text.Normalizer;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.senac.sistema_gestao_absenteismo.funcionario.model.Funcionario;
import br.com.senac.sistema_gestao_absenteismo.funcionario.model.StatusFuncionario;
import br.com.senac.sistema_gestao_absenteismo.funcionario.repository.FuncionarioRepository;
import br.com.senac.sistema_gestao_absenteismo.ponto.model.RegistroPonto;
import br.com.senac.sistema_gestao_absenteismo.ponto.model.StatusJornada;
import br.com.senac.sistema_gestao_absenteismo.ponto.repository.RegistroPontoRepository;
import br.com.senac.sistema_gestao_absenteismo.shared.exception.ConflitoDeDadosException;
import br.com.senac.sistema_gestao_absenteismo.shared.exception.RecursoNaoEncontradoException;
import br.com.senac.sistema_gestao_absenteismo.shared.exception.UsuarioInativoException;
import br.com.senac.sistema_gestao_absenteismo.solicitacao.dto.SolicitacaoAprovacaoRequest;
import br.com.senac.sistema_gestao_absenteismo.solicitacao.dto.SolicitacaoCreateRequest;
import br.com.senac.sistema_gestao_absenteismo.solicitacao.dto.SolicitacaoRejeicaoRequest;
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

    private static final LocalTime LIMITE_TOLERANCIA = LocalTime.of(8, 30);

    private final SolicitacaoRepository solicitacaoRepository;
    private final FuncionarioRepository funcionarioRepository;
    private final RegistroPontoRepository registroPontoRepository;


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
            throw new IllegalArgumentException("A data de referência é obrigatória");
        }

        if (dataReferencia.isAfter(LocalDate.now())) {
            throw new IllegalArgumentException("A data de referência não pode estar no futuro");
        }
    }

    private void validarPrazo48Horas(LocalDate dataReferencia) {
        LocalDateTime prazo = dataReferencia.atTime(HORARIO_REFERENCIA).plusHours(48);

        if (!LocalDateTime.now().isBefore(prazo)) {
            throw new IllegalArgumentException("O prazo de 48 horas para esta solicitação foi encerrado");
        }
    }

    private void validarDuplicidade(Long funcionarioId,SolicitacaoCreateRequest request) {

        boolean possuiSolicitacaoPendente = solicitacaoRepository.existsByFuncionario_IdAndTipoAndDataReferenciaAndStatus(funcionarioId,
            request.tipo(),request.dataReferencia(),StatusSolicitacao.PENDENTE);

        if (possuiSolicitacaoPendente) {
            throw new ConflitoDeDadosException("Já existe uma solicitação pendente deste tipo para a data informada");
        }
    }

    private void preencherDadosEspecificos(Solicitacao solicitacao,Long funcionarioId,SolicitacaoCreateRequest request) {

        switch (request.tipo()) {

            case CORRECAO_PONTO -> {

                solicitacao.setDataReferencia(request.dataReferencia());

                solicitacao.setEntradaSolicitada(request.entradaSolicitada());

                solicitacao.setInicioIntervaloSolicitado(request.inicioIntervaloSolicitado());

                solicitacao.setFimIntervaloSolicitado(request.fimIntervaloSolicitado());

                solicitacao.setSaidaSolicitada(request.saidaSolicitada());

                solicitacao.setNomeAnexo(request.nomeAnexo());

                vincularRegistroPonto(solicitacao,funcionarioId,request.dataReferencia());
            }

            case JUSTIFICATIVA_FALTA -> {

                solicitacao.setDataReferencia(request.dataReferencia());

                solicitacao.setNomeAnexo(request.nomeAnexo());

                vincularRegistroPonto(solicitacao,funcionarioId,request.dataReferencia());
            }

            case SOLICITACAO_FERIAS -> {

                solicitacao.setDataInicio(request.dataInicio());

                solicitacao.setDataFim(request.dataFim());
            }

            case CORRECAO_CADASTRO -> {

                solicitacao.setCampoCadastro(request.campoCadastro().trim());

                solicitacao.setNovoValor(request.novoValor().trim());
            }
        }
    }

    private void vincularRegistroPonto(Solicitacao solicitacao,Long funcionarioId,LocalDate dataReferencia) {

        RegistroPonto registroPonto = registroPontoRepository.findByFuncionario_IdAndDataRegistro(funcionarioId,dataReferencia).orElse(null);

        solicitacao.setRegistroPonto(registroPonto);
    }

    private String normalizarTexto(String valor) {

        return Normalizer.normalize(valor, Normalizer.Form.NFD).replaceAll("\\p{M}", "").toLowerCase().trim();
    }

    private Solicitacao buscarSolicitacao(Long solicitacaoId) {

        return solicitacaoRepository.findById(solicitacaoId).orElseThrow(() ->
        new RecursoNaoEncontradoException("Solicitação não encontrada com o id "+ solicitacaoId));
    }

    private void validarSolicitacaoPendente(Solicitacao solicitacao) {

        if (solicitacao.getStatus()!= StatusSolicitacao.PENDENTE) {
            throw new ConflitoDeDadosException("Esta solicitação já foi analisada");
        }
    }

    private void aplicarCorrecaoPonto(Solicitacao solicitacao) {
        Long funcionarioId = solicitacao.getFuncionario().getId();

        LocalDate dataReferencia = solicitacao.getDataReferencia();

        RegistroPonto registro = localizarOuCriarRegistroPonto(solicitacao,funcionarioId,dataReferencia);

        LocalTime entrada = escolherHorario(solicitacao.getEntradaSolicitada(),registro.getEntrada());

        LocalTime inicioIntervalo = escolherHorario(solicitacao.getInicioIntervaloSolicitado(),registro.getInicioIntervalo());

        LocalTime fimIntervalo = escolherHorario(solicitacao.getFimIntervaloSolicitado(),registro.getFimIntervalo());

        LocalTime saida = escolherHorario(solicitacao.getSaidaSolicitada(),registro.getSaida());

        validarJornadaCompleta(entrada,inicioIntervalo,fimIntervalo,saida);

        registro.setEntrada(entrada);
        registro.setInicioIntervalo(inicioIntervalo);
        registro.setFimIntervalo(fimIntervalo);
        registro.setSaida(saida);

        int atrasoMinutos = calcularAtrasoCorrecao(entrada);

        int totalTrabalhadoMinutos = calcularTotalTrabalhadoCorrecao(entrada,inicioIntervalo,fimIntervalo,saida);

        registro.setAtrasoMinutos(atrasoMinutos);

        registro.setTotalTrabalhadoMinutos(totalTrabalhadoMinutos);

        registro.setStatus(atrasoMinutos > 0 ? StatusJornada.ATRASO : StatusJornada.CONCLUIDA);

        RegistroPonto registroSalvo = registroPontoRepository.saveAndFlush(registro);

        solicitacao.setRegistroPonto(registroSalvo);
    }

    private RegistroPonto localizarOuCriarRegistroPonto(Solicitacao solicitacao,Long funcionarioId,LocalDate dataReferencia) {

        if (solicitacao.getRegistroPonto() != null) {
            return solicitacao.getRegistroPonto();
        }

        return registroPontoRepository.findByFuncionario_IdAndDataRegistro(funcionarioId,dataReferencia).orElseGet(() -> RegistroPonto.builder()
        .funcionario(solicitacao.getFuncionario()).dataRegistro(dataReferencia).status(StatusJornada.PENDENTE).atrasoMinutos(0)
        .totalTrabalhadoMinutos(0).build());

    }

    private LocalTime escolherHorario(LocalTime horarioSolicitado,LocalTime horarioAtual) {

        return horarioSolicitado != null ? horarioSolicitado : horarioAtual;
    }

    private void validarJornadaCompleta(LocalTime entrada,LocalTime inicioIntervalo,LocalTime fimIntervalo,LocalTime saida) {

        if (entrada == null || inicioIntervalo == null|| fimIntervalo == null|| saida == null) {
            throw new IllegalArgumentException("Para aprovar a correção, a jornada precisa possuir entrada, início do intervalo, fim do intervalo e saída");
        }

        if (!entrada.isBefore(inicioIntervalo)) {
            throw new IllegalArgumentException("A entrada deve ser anterior ao início do intervalo");
        }

        if (!inicioIntervalo.isBefore(fimIntervalo)) {
            throw new IllegalArgumentException("O início do intervalo deve ser anterior ao fim do intervalo");
        }

        if (!fimIntervalo.isBefore(saida)) {
            throw new IllegalArgumentException("O fim do intervalo deve ser anterior à saída");
        }
    }

    private int calcularAtrasoCorrecao(LocalTime entrada) {

        if (!entrada.isAfter(LIMITE_TOLERANCIA)) {
            return 0;
        }

        long minutos = Duration.between(HORARIO_REFERENCIA,entrada).toMinutes();

        return Math.toIntExact(minutos);
    }

    private int calcularTotalTrabalhadoCorrecao(LocalTime entrada,LocalTime inicioIntervalo,LocalTime fimIntervalo,LocalTime saida) {
        
        long antesDoIntervalo = Duration.between(entrada,inicioIntervalo).toMinutes();

        long depoisDoIntervalo = Duration.between(fimIntervalo,saida).toMinutes();

        long total = antesDoIntervalo + depoisDoIntervalo;

        if (total <= 0) {
            throw new IllegalArgumentException("O total trabalhado deve ser maior que zero");
        }

        return Math.toIntExact(total);
    }

    private String definirObservacaoAprovacao(SolicitacaoAprovacaoRequest request) {
        if (request.observacao() == null || request.observacao().isBlank()) {
            return "Solicitação aprovada pelo RH.";
        }

        return request.observacao().trim();

    }

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

    @Transactional(readOnly = true)
    public List<SolicitacaoResponse> listarMinhas(Long funcionarioId) {
        buscarFuncionarioAtivo(funcionarioId);

        return solicitacaoRepository.findByFuncionario_IdOrderByCriadoEmDesc(funcionarioId)
        .stream().map(SolicitacaoResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public List<SolicitacaoResponse> listarGerencial(StatusSolicitacao status) {

        List<Solicitacao> solicitacoes = status == null ? solicitacaoRepository
        .findAllByOrderByCriadoEmDesc() : solicitacaoRepository.findByStatusOrderByCriadoEmDesc(status);

        return solicitacoes.stream().map(SolicitacaoResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public SolicitacaoResponse buscarPorIdGerencial(Long solicitacaoId) {

        Solicitacao solicitacao = buscarSolicitacao(solicitacaoId);

        return SolicitacaoResponse.from(solicitacao);
    }

    @Transactional
    public SolicitacaoResponse rejeitar(Long solicitacaoId,Long analisadorId,
        SolicitacaoRejeicaoRequest request) {

        Solicitacao solicitacao = buscarSolicitacao(solicitacaoId);

        validarSolicitacaoPendente(solicitacao);

        Funcionario analisador = buscarFuncionarioAtivo(analisadorId);

        solicitacao.setStatus(StatusSolicitacao.REJEITADA);

        solicitacao.setObservacaoAnalise(request.observacao().trim());

        solicitacao.setAnalisadoPor(analisador);

        solicitacao.setAnalisadoEm(LocalDateTime.now().withNano(0));

        Solicitacao salva = solicitacaoRepository.save(solicitacao);

        return SolicitacaoResponse.from(salva);
    }

    @Transactional
    public SolicitacaoResponse aprovar(Long solicitacaoId,Long analisadorId,SolicitacaoAprovacaoRequest request) {

        Solicitacao solicitacao = buscarSolicitacao(solicitacaoId);

        validarSolicitacaoPendente(solicitacao);

        Funcionario analisador = buscarFuncionarioAtivo(analisadorId);

        switch (solicitacao.getTipo()) {
            case CORRECAO_PONTO -> aplicarCorrecaoPonto(solicitacao);

            default -> throw new IllegalArgumentException("A aprovação do tipo "+ solicitacao.getTipo()+ " ainda não foi implementada");
        }

        solicitacao.setStatus(StatusSolicitacao.APROVADA);

        solicitacao.setObservacaoAnalise(definirObservacaoAprovacao(request));

        solicitacao.setAnalisadoPor(analisador);

        solicitacao.setAnalisadoEm(LocalDateTime.now().withNano(0));

        Solicitacao salva =solicitacaoRepository.saveAndFlush(solicitacao);

        return SolicitacaoResponse.from(salva);
    }


}