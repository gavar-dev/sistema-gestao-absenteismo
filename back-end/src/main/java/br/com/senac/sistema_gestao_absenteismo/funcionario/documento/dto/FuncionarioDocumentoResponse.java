package br.com.senac.sistema_gestao_absenteismo.funcionario.documento.dto;

import br.com.senac.sistema_gestao_absenteismo.funcionario.documento.model.FuncionarioDocumento;

import java.time.LocalDateTime;

public record FuncionarioDocumentoResponse(
        Long id,
        Long funcionarioId,
        String nomeOriginal,
        String contentType,
        Long tamanho,
        LocalDateTime criadoEm
) {

    public static FuncionarioDocumentoResponse from(
            FuncionarioDocumento documento
    ) {
        return new FuncionarioDocumentoResponse(
                documento.getId(),
                documento
                        .getFuncionario()
                        .getId(),
                documento.getNomeOriginal(),
                documento.getContentType(),
                documento.getTamanho(),
                documento.getCriadoEm()
        );
    }
}