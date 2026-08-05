package br.com.senac.sistema_gestao_absenteismo.ponto.dto;

public record RankingAtrasoResponse(
        Long funcionarioId,
        String nomeFuncionario,
        String setor,
        long quantidadeAtrasos,
        long totalMinutosAtraso,
        double mediaMinutosAtraso
) {
}