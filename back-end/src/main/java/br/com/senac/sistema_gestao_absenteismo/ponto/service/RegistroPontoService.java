package br.com.senac.sistema_gestao_absenteismo.ponto.service;

import br.com.senac.sistema_gestao_absenteismo.funcionario.model.Funcionario;
import br.com.senac.sistema_gestao_absenteismo.funcionario.model.StatusFuncionario;
import br.com.senac.sistema_gestao_absenteismo.funcionario.repository.FuncionarioRepository;
import br.com.senac.sistema_gestao_absenteismo.ponto.dto.IndicadorDiaResponse;
import br.com.senac.sistema_gestao_absenteismo.ponto.dto.IndicadorSetorResponse;
import br.com.senac.sistema_gestao_absenteismo.ponto.dto.IndicadorStatusResponse;
import br.com.senac.sistema_gestao_absenteismo.ponto.dto.ProcessamentoFaltasResponse;
import br.com.senac.sistema_gestao_absenteismo.ponto.dto.ProcessamentoPendenciasResponse;
import br.com.senac.sistema_gestao_absenteismo.ponto.dto.RankingAtrasoResponse;
import br.com.senac.sistema_gestao_absenteismo.ponto.dto.RegistroPontoResponse;
import br.com.senac.sistema_gestao_absenteismo.ponto.dto.ResumoPontoResponse;
import br.com.senac.sistema_gestao_absenteismo.ponto.model.RegistroPonto;
import br.com.senac.sistema_gestao_absenteismo.ponto.model.StatusJornada;
import br.com.senac.sistema_gestao_absenteismo.ponto.model.TipoMarcacao;
import br.com.senac.sistema_gestao_absenteismo.ponto.repository.RegistroPontoRepository;
import br.com.senac.sistema_gestao_absenteismo.shared.exception.ConflitoDeDadosException;
import br.com.senac.sistema_gestao_absenteismo.shared.exception.RecursoNaoEncontradoException;
import br.com.senac.sistema_gestao_absenteismo.shared.exception.UsuarioInativoException;
import br.com.senac.sistema_gestao_absenteismo.solicitacao.model.StatusSolicitacao;
import br.com.senac.sistema_gestao_absenteismo.solicitacao.model.TipoSolicitacao;
import br.com.senac.sistema_gestao_absenteismo.solicitacao.repository.SolicitacaoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Arrays;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RegistroPontoService {

    private static final LocalTime HORARIO_ENTRADA = LocalTime.of(8, 0);

    private static final LocalTime LIMITE_TOLERANCIA = LocalTime.of(8, 30);

    private final RegistroPontoRepository registroPontoRepository;
    private final FuncionarioRepository funcionarioRepository;
    private final SolicitacaoRepository solicitacaoRepository;

    private RegistroPonto registrarEntrada(Funcionario funcionario, Optional<RegistroPonto> registroDoDia,
            LocalDate dataAtual, LocalTime horaAtual) {
        if (registroDoDia.isPresent()) {
            throw new ConflitoDeDadosException("A entrada de hoje já foi registrada");
        }

        if (horaAtual.isBefore(HORARIO_ENTRADA)) {
            throw new IllegalArgumentException("O registro de entrada só é permitido a partir das 08:00");
        }

        int atrasoMinutos = calcularAtraso(horaAtual);

        StatusJornada status = atrasoMinutos > 0 ? StatusJornada.ATRASO : StatusJornada.EM_ANDAMENTO;

        return RegistroPonto.builder()
                .funcionario(funcionario)
                .dataRegistro(dataAtual)
                .entrada(horaAtual)
                .status(status)
                .atrasoMinutos(atrasoMinutos)
                .totalTrabalhadoMinutos(0)
                .build();
    }

    private RegistroPonto registrarInicioIntervalo(RegistroPonto registro, LocalTime horaAtual) {
        if (registro.getSaida() != null) {
            throw new ConflitoDeDadosException("A jornada de hoje já foi finalizada");
        }

        if (registro.getInicioIntervalo() != null) {
            throw new ConflitoDeDadosException("O início do intervalo já foi registrado");
        }

        registro.setInicioIntervalo(horaAtual);

        return registro;
    }

    private RegistroPonto registrarFimIntervalo(RegistroPonto registro, LocalTime horaAtual) {
        if (registro.getInicioIntervalo() == null) {
            throw new ConflitoDeDadosException("Registre o início do intervalo primeiro");
        }

        if (registro.getFimIntervalo() != null) {
            throw new ConflitoDeDadosException("O fim do intervalo já foi registrado");
        }

        if (registro.getSaida() != null) {
            throw new ConflitoDeDadosException("A jornada de hoje já foi finalizada");
        }

        registro.setFimIntervalo(horaAtual);

        return registro;
    }

    private RegistroPonto registrarSaida(RegistroPonto registro, LocalTime horaAtual) {
        if (registro.getSaida() != null) {
            throw new ConflitoDeDadosException("A saída de hoje já foi registrada");
        }

        if (registro.getInicioIntervalo() == null) {
            throw new ConflitoDeDadosException("Registre o início do intervalo antes da saída");
        }

        if (registro.getFimIntervalo() == null) {
            throw new ConflitoDeDadosException("Registre o fim do intervalo antes da saída");
        }

        registro.setSaida(horaAtual);
        registro.setTotalTrabalhadoMinutos(calcularTotalTrabalhado(registro));

        registro.setStatus(registro.getAtrasoMinutos() > 0 ? StatusJornada.ATRASO : StatusJornada.CONCLUIDA);

        return registro;
    }

    private int calcularAtraso(LocalTime horaEntrada) {
        if (!horaEntrada.isAfter(LIMITE_TOLERANCIA)) {
            return 0;
        }

        long minutos = Duration.between(HORARIO_ENTRADA, horaEntrada).toMinutes();

        return Math.toIntExact(minutos);
    }

    private int calcularTotalTrabalhado(RegistroPonto registro) {
        long antesDoIntervalo = Duration.between(registro.getEntrada(), registro.getInicioIntervalo()).toMinutes();

        long depoisDoIntervalo = Duration.between(registro.getFimIntervalo(), registro.getSaida()).toMinutes();

        long total = antesDoIntervalo + depoisDoIntervalo;

        if (total < 0) {
            throw new IllegalArgumentException("Os horários da jornada estão inconsistentes");
        }

        return Math.toIntExact(total);
    }

    private RegistroPonto exigirRegistroDoDia(Optional<RegistroPonto> registroDoDia) {
        return registroDoDia
                .orElseThrow(() -> new ConflitoDeDadosException("Registre a entrada antes das demais marcações"));
    }

    private Funcionario buscarFuncionarioAtivo(Long funcionarioId) {
        Funcionario funcionario = funcionarioRepository.findById(funcionarioId)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Funcionário autenticado não encontrado"));

        if (funcionario.getStatus() != StatusFuncionario.ATIVO) {
            throw new UsuarioInativoException("Somente funcionários ativos podem registrar ponto");
        }

        return funcionario;
    }

    private void validarPeriodo(LocalDate inicio, LocalDate fim) {
        if (inicio.isAfter(fim)) {
            throw new IllegalArgumentException("A data inicial não pode ser posterior à data final");
        }
    }

    private void validarDataProcessamento(LocalDate data) {
        LocalDate hoje = LocalDate.now();

        if (!data.isBefore(hoje)) {
            throw new IllegalArgumentException("Somente datas anteriores ao dia atual podem ser processadas");
        }

        DayOfWeek diaDaSemana = data.getDayOfWeek();

        if (diaDaSemana == DayOfWeek.SATURDAY || diaDaSemana == DayOfWeek.SUNDAY) {
            throw new IllegalArgumentException("Sábados e domingos não podem ser processados como dias úteis");
        }
    }

    @Transactional
    public RegistroPontoResponse marcar(Long funcionarioId, TipoMarcacao tipo) {
        
        Funcionario funcionario = buscarFuncionarioAtivo(funcionarioId);

        LocalDateTime agora = LocalDateTime.now().withNano(0);
        LocalDate dataAtual = agora.toLocalDate();
        LocalTime horaAtual = agora.toLocalTime();

        Optional<RegistroPonto> registroDoDia = registroPontoRepository
                .findByFuncionario_IdAndDataRegistro(funcionarioId, dataAtual);

        RegistroPonto registro = switch (tipo) {
            case ENTRADA -> registrarEntrada(funcionario, registroDoDia, dataAtual, horaAtual);

            case INICIO_INTERVALO -> registrarInicioIntervalo(exigirRegistroDoDia(registroDoDia), horaAtual);

            case FIM_INTERVALO -> registrarFimIntervalo(exigirRegistroDoDia(registroDoDia), horaAtual);

            case SAIDA -> registrarSaida(exigirRegistroDoDia(registroDoDia), horaAtual);
        };

        RegistroPonto salvo = registroPontoRepository.save(registro);

        return RegistroPontoResponse.from(salvo);
    }
 
    @Transactional(readOnly = true)
    public Optional<RegistroPontoResponse> buscarHoje(Long funcionarioId) {

        buscarFuncionarioAtivo(funcionarioId);

        return registroPontoRepository.findByFuncionario_IdAndDataRegistro(funcionarioId, LocalDate.now())
                .map(RegistroPontoResponse::from);
    }

    @Transactional(readOnly = true)
    public List<RegistroPontoResponse> buscarMeuHistorico(Long funcionarioId) {
        buscarFuncionarioAtivo(funcionarioId);

        return registroPontoRepository.findByFuncionario_IdOrderByDataRegistroDesc(funcionarioId).stream()
                .map(RegistroPontoResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public List<RegistroPontoResponse> buscarHistoricoFuncionario(Long funcionarioId, LocalDate inicio, LocalDate fim) {

        validarPeriodo(inicio, fim);

        funcionarioRepository.findById(funcionarioId).orElseThrow(() -> new RecursoNaoEncontradoException("Funcionário não encontrado com o id " + funcionarioId));

        return registroPontoRepository.findByFuncionario_IdAndDataRegistroBetweenOrderByDataRegistroDesc(funcionarioId, inicio, fim).stream()
            .map(RegistroPontoResponse::from).toList();
    }


    @Transactional(readOnly = true)
    public List<RegistroPontoResponse> buscarRegistrosGerenciais(LocalDate inicio,LocalDate fim,StatusJornada status,Long funcionarioId) {

        validarPeriodo(inicio, fim);

        if (funcionarioId != null && !funcionarioRepository.existsById(funcionarioId)) {
            throw new RecursoNaoEncontradoException("Funcionário não encontrado com o id "+ funcionarioId);
        }

        return registroPontoRepository.buscarRegistrosGerenciais(inicio,fim,status,funcionarioId).stream().map(RegistroPontoResponse::from).toList();
    }


    @Transactional(readOnly = true)
    public ResumoPontoResponse buscarResumoGerencial(LocalDate inicio,LocalDate fim,Long funcionarioId) {

        validarPeriodo(inicio, fim);

        if (funcionarioId != null && !funcionarioRepository.existsById(funcionarioId)) {

            throw new RecursoNaoEncontradoException("Funcionário não encontrado com o id "+ funcionarioId);
        }

        List<RegistroPonto> registros = registroPontoRepository.buscarRegistrosGerenciais(inicio,fim,null,funcionarioId);

        long totalRegistros = registros.size();

        long jornadasFinalizadas = registros.stream().filter(registro -> registro.getSaida() != null).count();

        long jornadasEmAndamento = registros.stream().filter(registro -> registro.getSaida() == null).filter(registro ->
        registro.getStatus() == StatusJornada.EM_ANDAMENTO || registro.getStatus() == StatusJornada.ATRASO).count();

        long quantidadeAtrasos = registros.stream().filter(registro ->registro.getStatus() == StatusJornada.ATRASO).count();

        long quantidadeFaltas = registros.stream().filter(registro ->registro.getStatus() == StatusJornada.FALTA).count();

        long quantidadePendencias = registros.stream().filter(registro ->registro.getStatus() == StatusJornada.PENDENTE).count();

        long totalMinutosAtraso = registros.stream().map(RegistroPonto::getAtrasoMinutos).filter(Objects::nonNull).mapToLong(Integer::longValue).sum();

        double mediaMinutosAtraso = quantidadeAtrasos == 0 ? 0.0 : (double) totalMinutosAtraso / quantidadeAtrasos;

        long totalMinutosTrabalhados = registros.stream().map(RegistroPonto::getTotalTrabalhadoMinutos).filter(Objects::nonNull).mapToLong(Integer::longValue).sum();

        return new ResumoPontoResponse(totalRegistros,jornadasFinalizadas,jornadasEmAndamento,quantidadeAtrasos,quantidadeFaltas,quantidadePendencias,totalMinutosAtraso,
        mediaMinutosAtraso,totalMinutosTrabalhados);
    }

    @Transactional(readOnly = true)
    public List<IndicadorStatusResponse> buscarIndicadoresPorStatus(LocalDate inicio,LocalDate fim,Long funcionarioId) {

        validarPeriodo(inicio, fim);

        if (funcionarioId != null && !funcionarioRepository.existsById(funcionarioId)) {

            throw new RecursoNaoEncontradoException("Funcionário não encontrado com o id "+ funcionarioId);
        }

        List<RegistroPonto> registros = registroPontoRepository.buscarRegistrosGerenciais(inicio,fim,null,funcionarioId);

        Map<StatusJornada, Long> quantidades = registros.stream().collect(Collectors.groupingBy(RegistroPonto::getStatus,Collectors.counting()));

        return Arrays.stream(StatusJornada.values()).map(status -> new IndicadorStatusResponse(status,quantidades.getOrDefault(status, 0L))).toList();
    }


    @Transactional(readOnly = true)
    public List<IndicadorDiaResponse> buscarIndicadoresPorDia(LocalDate inicio,LocalDate fim,Long funcionarioId) {

        validarPeriodo(inicio, fim);

        if (funcionarioId != null && !funcionarioRepository.existsById(funcionarioId)) {

            throw new RecursoNaoEncontradoException("Funcionário não encontrado com o id "+ funcionarioId);
        }

        List<RegistroPonto> registros = registroPontoRepository.buscarRegistrosGerenciais(inicio,fim,null,funcionarioId);

        Map<LocalDate, List<RegistroPonto>> registrosPorData = registros.stream().collect(Collectors.groupingBy(RegistroPonto::getDataRegistro));

        return inicio.datesUntil(fim.plusDays(1)).map(data -> {
            
            List<RegistroPonto> registrosDoDia = registrosPorData.getOrDefault(data,List.of());
            
            long atrasos = registrosDoDia.stream().filter(registro ->registro.getStatus()== StatusJornada.ATRASO).count();
            
            long faltas = registrosDoDia.stream().filter(registro ->registro.getStatus()== StatusJornada.FALTA).count();
            
            long pendencias = registrosDoDia.stream().filter(registro ->registro.getStatus()== StatusJornada.PENDENTE).count();
            
            return new IndicadorDiaResponse(data,registrosDoDia.size(),atrasos,faltas,pendencias);
            
        }).toList();
    }

    @Transactional(readOnly = true)
    public List<IndicadorSetorResponse> buscarIndicadoresPorSetor(LocalDate inicio,LocalDate fim) {

        validarPeriodo(inicio, fim);

        List<RegistroPonto> registros = registroPontoRepository.buscarRegistrosGerenciais(inicio,fim,null,null);

        Map<String, List<RegistroPonto>> registrosPorSetor = registros.stream().collect(Collectors.groupingBy(registro ->registro.getFuncionario().getSetor()));

        return registrosPorSetor.entrySet().stream().map(entry -> {
            String setor = entry.getKey();
            List<RegistroPonto> registrosDoSetor = entry.getValue();

            long atrasos = registrosDoSetor.stream().filter(registro ->registro.getStatus()== StatusJornada.ATRASO).count();

            long faltas = registrosDoSetor.stream().filter(registro ->registro.getStatus()== StatusJornada.FALTA).count();

            long pendencias = registrosDoSetor.stream().filter(registro ->registro.getStatus()== StatusJornada.PENDENTE).count();

            return new IndicadorSetorResponse(setor,registrosDoSetor.size(),atrasos,faltas,pendencias);
        }).sorted(Comparator.comparing(IndicadorSetorResponse::setor,String.CASE_INSENSITIVE_ORDER)).toList();
    }

    @Transactional(readOnly = true)
    public List<RankingAtrasoResponse> buscarRankingAtrasos(LocalDate inicio,LocalDate fim,int limite) {

        validarPeriodo(inicio, fim);

        if (limite < 1 || limite > 100) {
            throw new IllegalArgumentException("O limite deve estar entre 1 e 100");
        }

        List<RegistroPonto> atrasos = registroPontoRepository.buscarRegistrosGerenciais(inicio,fim,StatusJornada.ATRASO,null);

        Map<Long, List<RegistroPonto>> atrasosPorFuncionario = atrasos.stream().collect(Collectors.groupingBy(registro ->registro.getFuncionario().getId()));

        return atrasosPorFuncionario.values().stream().map(registrosFuncionario -> {
            Funcionario funcionario = registrosFuncionario.getFirst().getFuncionario();

            long quantidadeAtrasos = registrosFuncionario.size();

            long totalMinutosAtraso = registrosFuncionario.stream().map(RegistroPonto::getAtrasoMinutos).filter(Objects::nonNull).mapToLong(Integer::longValue).sum();

            double mediaMinutosAtraso = quantidadeAtrasos == 0 ? 0.0 : (double) totalMinutosAtraso/ quantidadeAtrasos;

            return new RankingAtrasoResponse(funcionario.getId(),funcionario.getNomeCompleto(),funcionario.getSetor(),quantidadeAtrasos,totalMinutosAtraso,mediaMinutosAtraso);
        }).sorted(Comparator.comparingLong(RankingAtrasoResponse::totalMinutosAtraso).reversed()
            .thenComparing(RankingAtrasoResponse::nomeFuncionario,String.CASE_INSENSITIVE_ORDER)).limit(limite).toList();
    }

    @Transactional
    public ProcessamentoPendenciasResponse processarPendencias(LocalDate data) {

        validarDataProcessamento(data);

        List<Funcionario> funcionariosAtivos = funcionarioRepository.findByStatusOrderByNomeCompletoAsc(StatusFuncionario.ATIVO)
        .stream().filter(funcionario -> !funcionario.getDataAdmissao().isAfter(data)).toList();

        int pendenciasCriadas = 0;
        int jornadasIncompletasMarcadas = 0;
        int registrosMantidos = 0;
        int feriasIgnoradas = 0;

        for (Funcionario funcionario : funcionariosAtivos) {

            boolean funcionarioEstaDeFerias = solicitacaoRepository.existsByFuncionario_IdAndTipoAndStatusAndDataInicioLessThanEqualAndDataFimGreaterThanEqual(
                funcionario.getId(),TipoSolicitacao.SOLICITACAO_FERIAS,StatusSolicitacao.APROVADA,data,data);

            if (funcionarioEstaDeFerias) {
                feriasIgnoradas++;
                continue;
            }

            Optional<RegistroPonto> registroExistente = registroPontoRepository.findByFuncionario_IdAndDataRegistro(funcionario.getId(),data);

            if (registroExistente.isEmpty()) {

                RegistroPonto pendencia = RegistroPonto.builder()
                .funcionario(funcionario).dataRegistro(data).status(StatusJornada.PENDENTE)
                .atrasoMinutos(0).totalTrabalhadoMinutos(0).build();

                registroPontoRepository.save(pendencia);
                pendenciasCriadas++;
                continue;
            }

            RegistroPonto registro = registroExistente.get();

            if (registro.getStatus() == StatusJornada.PENDENTE || registro.getStatus() == StatusJornada.FALTA || registro.getStatus() == StatusJornada.JUSTIFICADA) {

                registrosMantidos++;
                continue;
            }

            if (registro.getSaida() == null) {

                registro.setStatus(StatusJornada.PENDENTE);
                registroPontoRepository.save(registro);

                jornadasIncompletasMarcadas++;
                continue;
            }

            registrosMantidos++;
        }

        return new ProcessamentoPendenciasResponse(data,funcionariosAtivos.size(),pendenciasCriadas,jornadasIncompletasMarcadas,registrosMantidos,feriasIgnoradas);
    }

    @Transactional
    public ProcessamentoFaltasResponse processarFaltas() {
        LocalDateTime agora = LocalDateTime.now().withNano(0);

        List<RegistroPonto> pendencias = registroPontoRepository.findByStatusOrderByDataRegistroAsc(StatusJornada.PENDENTE);

        List<RegistroPonto> pendenciasVencidas = pendencias.stream().filter(registro -> {
            LocalDateTime prazoCorrecao = registro.getDataRegistro().atTime(HORARIO_ENTRADA)
            .plusHours(48);

            return !agora.isBefore(prazoCorrecao);
        }).toList();

        pendenciasVencidas.forEach(registro ->registro.setStatus(StatusJornada.FALTA));

        registroPontoRepository.saveAll(pendenciasVencidas);

        int pendenciasDentroDoPrazo = pendencias.size() - pendenciasVencidas.size();

        return new ProcessamentoFaltasResponse(agora,pendencias.size(),pendenciasVencidas.size(),
        pendenciasDentroDoPrazo);
    }
}