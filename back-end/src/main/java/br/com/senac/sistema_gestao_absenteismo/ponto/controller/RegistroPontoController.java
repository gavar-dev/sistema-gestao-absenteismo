package br.com.senac.sistema_gestao_absenteismo.ponto.controller;

import br.com.senac.sistema_gestao_absenteismo.ponto.dto.MarcacaoPontoRequest;
import br.com.senac.sistema_gestao_absenteismo.ponto.dto.RegistroPontoResponse;
import br.com.senac.sistema_gestao_absenteismo.ponto.service.RegistroPontoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/pontos")
@RequiredArgsConstructor
public class RegistroPontoController {

    private final RegistroPontoService registroPontoService;

    @PostMapping("/marcar")
    public RegistroPontoResponse marcar(
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody MarcacaoPontoRequest request
    ) {
        Long funcionarioId = extrairFuncionarioId(jwt);

        return registroPontoService.marcar(
                funcionarioId,
                request.tipo()
        );
    }

    private Long extrairFuncionarioId(Jwt jwt) {
        Object valor = jwt.getClaim("funcionarioId");

        if (valor instanceof Number numero) {
            return numero.longValue();
        }

        throw new IllegalArgumentException(
                "O token não contém o identificador do funcionário"
        );
    }
}