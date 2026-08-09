package br.com.senac.sistema_gestao_absenteismo.auth.dto;

import java.time.LocalDate;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record RecuperarSenhaRequest(

        @NotBlank(message = "O e-mail é obrigatório") 
        @Email(message = "Informe um e-mail válido") 
        @Size(max = 150, message = "O e-mail deve ter no máximo 150 caracteres") 
        String email,

        @NotBlank(message = "O CPF é obrigatório") String cpf,

        @NotBlank(message = "A matrícula é obrigatória") @Size(max = 30, message = "A matrícula deve ter no máximo 30 caracteres") String matricula,

        @NotNull(message = "A data de nascimento é obrigatória") LocalDate dataNascimento,

        @NotBlank(message = "A nova senha é obrigatória") @Size(min = 8, max = 72, message = "A nova senha deve ter entre 8 e 72 caracteres") String novaSenha,

        @NotBlank(message = "A confirmação da senha é obrigatória") @Size(min = 8, max = 72, message = "A confirmação da senha deve ter entre 8 e 72 caracteres") String confirmacaoSenha

) {
}