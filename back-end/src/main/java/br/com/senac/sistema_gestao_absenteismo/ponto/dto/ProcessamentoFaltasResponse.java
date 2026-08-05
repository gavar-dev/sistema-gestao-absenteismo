package br.com.senac.sistema_gestao_absenteismo.ponto.dto;

import java.time.LocalDateTime;

public record ProcessamentoFaltasResponse(
        LocalDateTime processadoEm,
        int pendenciasAnalisadas,
        int faltasGeradas,
        int pendenciasDentroDoPrazo
) {
}