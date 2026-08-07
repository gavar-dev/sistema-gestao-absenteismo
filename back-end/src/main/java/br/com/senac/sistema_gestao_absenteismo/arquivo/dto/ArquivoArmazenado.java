package br.com.senac.sistema_gestao_absenteismo.arquivo.dto;

public record ArquivoArmazenado(
        String nomeOriginal,
        String nomeArmazenado,
        String contentType,
        long tamanho,
        String caminhoRelativo
) {
}