package br.com.senac.sistema_gestao_absenteismo.ponto.dto;

public record ResumoPontoResponse(
        long totalRegistros,
        long jornadasFinalizadas,
        long jornadasEmAndamento,
        long quantidadeAtrasos,
        long quantidadeFaltas,
        long quantidadePendencias,
        long totalMinutosAtraso,
        double mediaMinutosAtraso,
        long totalMinutosTrabalhados
) {
}