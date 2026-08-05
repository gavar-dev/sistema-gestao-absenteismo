package br.com.senac.sistema_gestao_absenteismo.solicitacao.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record SolicitacaoRejeicaoRequest(

    @NotBlank(message = "O motivo da rejeição é obrigatório")
    @Size(min = 5,max = 2000,message = "O motivo da rejeição deve possuir entre 5 e 2000 caracteres")
    String observacao) {
}