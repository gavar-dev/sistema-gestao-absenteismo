package br.com.senac.sistema_gestao_absenteismo.auth.dto;

import java.time.Instant;

public record TokenGerado(
        String token,
        Instant expiraEm) {
}