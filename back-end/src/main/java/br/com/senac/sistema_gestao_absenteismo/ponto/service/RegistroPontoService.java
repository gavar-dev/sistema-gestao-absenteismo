package br.com.senac.sistema_gestao_absenteismo.ponto.service;

import br.com.senac.sistema_gestao_absenteismo.funcionario.model.Funcionario;
import br.com.senac.sistema_gestao_absenteismo.funcionario.model.StatusFuncionario;
import br.com.senac.sistema_gestao_absenteismo.funcionario.repository.FuncionarioRepository;
import br.com.senac.sistema_gestao_absenteismo.ponto.dto.IndicadorDiaResponse;
import br.com.senac.sistema_gestao_absenteismo.ponto.dto.IndicadorStatusResponse;
import br.com.senac.sistema_gestao_absenteismo.ponto.dto.RegistroPontoResponse;
import br.com.senac.sistema_gestao_absenteismo.ponto.dto.ResumoPontoResponse;
import br.com.senac.sistema_gestao_absenteismo.ponto.model.RegistroPonto;
import br.com.senac.sistema_gestao_absenteismo.ponto.model.StatusJornada;
import br.com.senac.sistema_gestao_absenteismo.ponto.model.TipoMarcacao;
import br.com.senac.sistema_gestao_absenteismo.ponto.repository.RegistroPontoRepository;
import br.com.senac.sistema_gestao_absenteismo.shared.exception.ConflitoDeDadosException;
import br.com.senac.sistema_gestao_absenteismo.shared.exception.RecursoNaoEncontradoException;
import br.com.senac.sistema_gestao_absenteismo.shared.exception.UsuarioInativoException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Arrays;
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


}