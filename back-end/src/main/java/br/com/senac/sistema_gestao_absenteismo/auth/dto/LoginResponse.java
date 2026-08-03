package br.com.senac.sistema_gestao_absenteismo.auth.dto;

import br.com.senac.sistema_gestao_absenteismo.funcionario.model.Funcionario;
import br.com.senac.sistema_gestao_absenteismo.funcionario.model.TipoUsuario;

public record LoginResponse(
        Long id,
        String nomeCompleto,
        String emailCorporativo,
        String matricula,
        TipoUsuario tipoAcesso
) {

    public static LoginResponse from(Funcionario funcionario) {
        return new LoginResponse(
                funcionario.getId(),
                funcionario.getNomeCompleto(),
                funcionario.getEmailCorporativo(),
                funcionario.getMatricula(),
                funcionario.getTipoAcesso()
        );
    }
}