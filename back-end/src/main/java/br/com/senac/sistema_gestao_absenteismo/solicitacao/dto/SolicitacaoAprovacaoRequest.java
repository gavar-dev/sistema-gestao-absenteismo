package br.com.senac.sistema_gestao_absenteismo.solicitacao.dto;

import jakarta.validation.constraints.Size;

public record SolicitacaoAprovacaoRequest(
    @Size(max = 2000,message = "A observação deve possuir no máximo 2000 caracteres")
    String observacao) {
}