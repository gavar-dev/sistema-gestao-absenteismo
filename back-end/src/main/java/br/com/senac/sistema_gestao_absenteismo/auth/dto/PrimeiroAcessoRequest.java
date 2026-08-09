package br.com.senac.sistema_gestao_absenteismo.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record PrimeiroAcessoRequest(

    @NotBlank(message = "A nova senha é obrigatória") 
    @Size(min = 8, max = 72, message = "A nova senha deve ter entre 8 e 72 caracteres") 
    String novaSenha,

    @NotBlank(message = "A confirmação da senha é obrigatória") 
    @Size(min = 8, max = 72, message = "A confirmação da senha deve ter entre 8 e 72 caracteres") 
    String confirmacaoSenha) {

}