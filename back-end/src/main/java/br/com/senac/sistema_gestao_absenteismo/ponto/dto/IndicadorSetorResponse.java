package br.com.senac.sistema_gestao_absenteismo.ponto.dto;

public record IndicadorSetorResponse(
        String setor,
        long totalRegistros,
        long atrasos,
        long faltas,
        long pendencias
) {
    
}