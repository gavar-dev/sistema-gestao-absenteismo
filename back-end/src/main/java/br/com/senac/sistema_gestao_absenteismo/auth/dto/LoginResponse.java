package br.com.senac.sistema_gestao_absenteismo.auth.dto;

import br.com.senac.sistema_gestao_absenteismo.funcionario.model.Funcionario;
import br.com.senac.sistema_gestao_absenteismo.funcionario.model.TipoUsuario;

import java.time.Instant;

public record LoginResponse(
        Long id,
        String nomeCompleto,
        String emailCorporativo,
        String matricula,
        TipoUsuario tipoAcesso,
        boolean primeiroAcesso,
        String token,
        String tipoToken,
        Instant expiraEm) {

        public static LoginResponse from(Funcionario funcionario, TokenGerado tokenGerado) {

                return new LoginResponse(
                        funcionario.getId(),
                        funcionario.getNomeCompleto(),
                        funcionario.getEmailCorporativo(),
                        funcionario.getMatricula(),
                        funcionario.getTipoAcesso(),
                        funcionario.isPrimeiroAcesso(),
                        tokenGerado.token(),
                        "Bearer",
                        tokenGerado.expiraEm()
                );
        }
}