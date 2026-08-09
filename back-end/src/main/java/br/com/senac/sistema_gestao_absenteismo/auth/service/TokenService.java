package br.com.senac.sistema_gestao_absenteismo.auth.service;

import br.com.senac.sistema_gestao_absenteismo.auth.dto.TokenGerado;
import br.com.senac.sistema_gestao_absenteismo.funcionario.model.Funcionario;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

@Service
@RequiredArgsConstructor
public class TokenService {

    private final JwtEncoder jwtEncoder;

    @Value("${security.jwt.issuer}")
    private String issuer;

    @Value("${security.jwt.expiration-minutes}")
    private long expirationMinutes;

    public TokenGerado gerarToken(Funcionario funcionario) {

        Instant agora = Instant.now();
        
        Instant expiracao = agora.plus(expirationMinutes,ChronoUnit.MINUTES);

        JwtClaimsSet claims = JwtClaimsSet.builder()
        .issuer(issuer)
        .issuedAt(agora)
        .expiresAt(expiracao)
        .subject(funcionario.getEmailCorporativo())
        .claim("funcionarioId", funcionario.getId())
        .claim("nome", funcionario.getNomeCompleto())
        .claim("matricula", funcionario.getMatricula())
        .claim("tipoAcesso",funcionario.getTipoAcesso().name())
        .claim("primeiroAcesso",funcionario.isPrimeiroAcesso())
        .build();

        JwsHeader header = JwsHeader.with(MacAlgorithm.HS256).type("JWT").build();

        String token = jwtEncoder.encode(JwtEncoderParameters.from(header, claims)).getTokenValue();

        return new TokenGerado(token, expiracao);
    }
}