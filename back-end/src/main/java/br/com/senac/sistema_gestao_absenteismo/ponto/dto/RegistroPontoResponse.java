package br.com.senac.sistema_gestao_absenteismo.ponto.dto;

import br.com.senac.sistema_gestao_absenteismo.ponto.model.RegistroPonto;
import br.com.senac.sistema_gestao_absenteismo.ponto.model.StatusJornada;
import br.com.senac.sistema_gestao_absenteismo.ponto.model.TipoMarcacao;

import java.time.LocalDate;
import java.time.LocalTime;

public record RegistroPontoResponse(
        Long id,
        Long funcionarioId,
        String nomeFuncionario,
        LocalDate dataRegistro,
        LocalTime entrada,
        LocalTime inicioIntervalo,
        LocalTime fimIntervalo,
        LocalTime saida,
        StatusJornada status,
        Integer atrasoMinutos,
        Integer totalTrabalhadoMinutos,
        TipoMarcacao proximaMarcacao) {

    public static RegistroPontoResponse from(RegistroPonto registro) {
        return new RegistroPontoResponse(
                registro.getId(),
                registro.getFuncionario().getId(),
                registro.getFuncionario().getNomeCompleto(),
                registro.getDataRegistro(),
                registro.getEntrada(),
                registro.getInicioIntervalo(),
                registro.getFimIntervalo(),
                registro.getSaida(),
                registro.getStatus(),
                registro.getAtrasoMinutos(),
                registro.getTotalTrabalhadoMinutos(),
                descobrirProximaMarcacao(registro));
    }

    private static TipoMarcacao descobrirProximaMarcacao(RegistroPonto registro) {
        
        if (registro.getStatus() == StatusJornada.PENDENTE || registro.getStatus() == StatusJornada.FALTA || registro.getStatus() == StatusJornada.CONCLUIDA) {
            return null;
        }

        if (registro.getEntrada() == null) {
            return TipoMarcacao.ENTRADA;
        }

        if (registro.getInicioIntervalo() == null) {
            return TipoMarcacao.INICIO_INTERVALO;
        }

        if (registro.getFimIntervalo() == null) {
            return TipoMarcacao.FIM_INTERVALO;
        }

        if (registro.getSaida() == null) {
            return TipoMarcacao.SAIDA;
        }

        return null;
    }
}