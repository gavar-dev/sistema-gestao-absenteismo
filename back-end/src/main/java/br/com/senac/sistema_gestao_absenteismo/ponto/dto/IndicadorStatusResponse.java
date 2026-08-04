package br.com.senac.sistema_gestao_absenteismo.ponto.dto;

import br.com.senac.sistema_gestao_absenteismo.ponto.model.StatusJornada;

public record IndicadorStatusResponse(
        StatusJornada status,
        long quantidade
) {
}