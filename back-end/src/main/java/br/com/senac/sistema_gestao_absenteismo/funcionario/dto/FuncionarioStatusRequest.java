package br.com.senac.sistema_gestao_absenteismo.funcionario.dto;

import br.com.senac.sistema_gestao_absenteismo.funcionario.model.StatusFuncionario;
import jakarta.validation.constraints.NotNull;

public record FuncionarioStatusRequest(
        @NotNull(message = "O status é obrigatório")
        StatusFuncionario status
) {
}
