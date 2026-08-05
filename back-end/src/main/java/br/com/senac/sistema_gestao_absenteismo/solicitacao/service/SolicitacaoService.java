package br.com.senac.sistema_gestao_absenteismo.solicitacao.service;

import java.text.Normalizer;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.Locale;

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

        RegistroPonto registro = registroPontoRepository.findByFuncionario_IdAndDataRegistro(funcionarioId,request.dataReferencia()).orElseThrow(() ->
        new ConflitoDeDadosException("Não existe falta ou pendência para a data informada"));

        boolean statusPermitido = registro.getStatus() == StatusJornada.FALTA || registro.getStatus() == StatusJornada.PENDENTE;

        if (!statusPermitido) {
            throw new ConflitoDeDadosException("A justificativa só pode ser criada para um registro com status FALTA ou PENDENTE");
        }

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

        String campo = normalizarTexto(request.campoCadastro());

        if (campo.equals("matricula")) {
            throw new IllegalArgumentException("A matrícula não pode ser alterada");
        }

        if (!campoCadastroPermitido(campo)) {
            throw new IllegalArgumentException("O campo informado não pode ser alterado por solicitação cadastral");
        }

        validarNovoValorCadastro(campo,request.novoValor());
    }

    private boolean campoCadastroPermitido(String campo) {
        return switch (campo) {

            case "nome","nome completo","email","email corporativo","cpf","telefone","data nascimento","data de nascimento",
                "estado civil","nacionalidade","naturalidade","local trabalho","local de trabalho" -> true;

            default -> false;
        };
    }

    private void validarNovoValorCadastro(String campo,String novoValor) {

        String valor = novoValor.trim();

        switch (campo) {
            case "nome","nome completo" -> validarTamanho(valor,3,150,"O nome completo");

            case "email","email corporativo" -> {validarTamanho(valor,5,150,"O e-mail corporativo");

                if (!valor.matches("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$")) {
                    throw new IllegalArgumentException("O novo e-mail corporativo é inválido");
                }
            }

            case "cpf" -> { String cpf = valor.replaceAll("\\D", "");

                if (cpf.length() != 11) {
                    throw new IllegalArgumentException("O CPF deve possuir 11 dígitos");
                }
            }

            case "telefone" -> validarTamanho(valor,8,20,"O telefone");

            case "data nascimento","data de nascimento" -> validarDataNascimento(valor);

            case "estado civil" -> validarTamanho(valor,2,40,"O estado civil");

            case "nacionalidade" -> validarTamanho(valor,2,60,"A nacionalidade");

            case "naturalidade" -> validarTamanho(valor,2,80,"A naturalidade");

            case "local trabalho","local de trabalho" -> validarTamanho(valor,2,120,"O local de trabalho");

            default -> throw new IllegalArgumentException("Campo cadastral inválido");
        }
    }

    private void validarTamanho(String valor,int minimo,int maximo,String nomeCampo) {

        if (valor.length() < minimo || valor.length() > maximo) {
            throw new IllegalArgumentException(nomeCampo + " deve possuir entre " + minimo + " e " + maximo + " caracteres");
        }
    }

    private void validarDataNascimento(String valor) {
        try {

            LocalDate data = LocalDate.parse(valor);

            if (!data.isBefore(LocalDate.now())) {
                throw new IllegalArgumentException("A data de nascimento deve ser anterior à data atual");
            }
        } catch (DateTimeParseException exception) {
            throw new IllegalArgumentException("A data de nascimento deve estar no formato AAAA-MM-DD");
        }
    }

    private void validarDataReferenciaEObrigatoria(LocalDate dataReferencia) {

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

        return Normalizer.normalize(valor, Normalizer.Form.NFD).replaceAll("\\p{M}", "").replace("_", " ").replace("-", " ").trim()
        .toLowerCase(Locale.ROOT).replaceAll("\\s+", " ");
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

    private void aplicarJustificativaFalta(Solicitacao solicitacao) {

        Long funcionarioId = solicitacao.getFuncionario().getId();

        LocalDate dataReferencia = solicitacao.getDataReferencia();

        RegistroPonto registro = registroPontoRepository.findByFuncionario_IdAndDataRegistro(funcionarioId,dataReferencia).orElseThrow(() ->
        new ConflitoDeDadosException("O registro de falta ou pendência não foi encontrado"));

        boolean statusPermitido = registro.getStatus() == StatusJornada.FALTA || registro.getStatus() == StatusJornada.PENDENTE;

        if (!statusPermitido) {
            throw new ConflitoDeDadosException("Somente registros com status FALTA ou PENDENTE podem ser justificados");
        }

        registro.setStatus(StatusJornada.JUSTIFICADA);

        registro.setAtrasoMinutos(0);
        registro.setTotalTrabalhadoMinutos(0);

        RegistroPonto salvo = registroPontoRepository.saveAndFlush(registro);

        solicitacao.setRegistroPonto(salvo);
    }

    private void aplicarCorrecaoCadastro(Solicitacao solicitacao) {

        Funcionario funcionario = solicitacao.getFuncionario();

        String campo = normalizarTexto(solicitacao.getCampoCadastro());

        String novoValor = solicitacao.getNovoValor().trim();

        validarNovoValorCadastro(campo,novoValor);

        switch (campo) {

            case "nome","nome completo" -> funcionario.setNomeCompleto(novoValor);

            case "email","email corporativo" -> alterarEmailCorporativo(funcionario,novoValor);

            case "cpf" -> alterarCpf(funcionario,novoValor);

            case "telefone" -> funcionario.setTelefone(novoValor);

            case "data nascimento","data de nascimento" -> funcionario.setDataNascimento(LocalDate.parse(novoValor));

            case "estado civil" -> funcionario.setEstadoCivil(novoValor);

            case "nacionalidade" -> funcionario.setNacionalidade(novoValor);

            case "naturalidade" -> funcionario.setNaturalidade(novoValor);

            case "local trabalho","local de trabalho" -> funcionario.setLocalTrabalho(novoValor);

            default -> throw new IllegalArgumentException("O campo cadastral não pode ser alterado");
        }

        funcionarioRepository.saveAndFlush(funcionario);
    }

    private void alterarEmailCorporativo(Funcionario funcionario,String novoEmail) {

        String emailNormalizado = novoEmail.trim().toLowerCase(Locale.ROOT);

        boolean emailEmUso = funcionarioRepository.existsByEmailCorporativoIgnoreCaseAndIdNot(emailNormalizado,funcionario.getId());

        if (emailEmUso) {
            throw new ConflitoDeDadosException("Já existe outro funcionário com este e-mail");
        }

        funcionario.setEmailCorporativo(emailNormalizado);
    }

    private void alterarCpf(Funcionario funcionario,String novoCpf) {

        String cpfNormalizado = novoCpf.replaceAll("\\D", "");

        boolean cpfEmUso = funcionarioRepository.existsByCpfAndIdNot(cpfNormalizado,funcionario.getId());

        if (cpfEmUso) {
            throw new ConflitoDeDadosException("Já existe outro funcionário com este CPF");
        }
        
        funcionario.setCpf(cpfNormalizado);
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

             case JUSTIFICATIVA_FALTA -> aplicarJustificativaFalta(solicitacao);

             case CORRECAO_CADASTRO -> aplicarCorrecaoCadastro(solicitacao);


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