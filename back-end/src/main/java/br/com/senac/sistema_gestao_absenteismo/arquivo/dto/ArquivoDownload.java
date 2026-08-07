package br.com.senac.sistema_gestao_absenteismo.arquivo.dto;

import org.springframework.core.io.Resource;

public record ArquivoDownload(
        Resource recurso,
        String nomeOriginal,
        String contentType,
        long tamanho
) {
}