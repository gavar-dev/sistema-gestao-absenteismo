package br.com.senac.sistema_gestao_absenteismo.ponto.dto;

import java.time.LocalDate;

public record IndicadorDiaResponse(
        LocalDate data,
        long totalRegistros,
        long atrasos,
        long faltas,
        long pendencias
) {
}