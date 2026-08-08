package br.com.senac.sistema_gestao_absenteismo.auth.controller;

import br.com.senac.sistema_gestao_absenteismo.auth.dto.AlterarSenhaRequest;
import br.com.senac.sistema_gestao_absenteismo.auth.dto.LoginRequest;
import br.com.senac.sistema_gestao_absenteismo.auth.dto.LoginResponse;
import br.com.senac.sistema_gestao_absenteismo.auth.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.security.SecurityRequirements;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Autenticação",description = "Endpoints responsáveis pela autenticação dos usuários")
public class AuthController {

    private final AuthService authService;

    @Operation(summary = "Realizar login",description = "Autentica o usuário e retorna um token JWT")
    @SecurityRequirements
    @PostMapping("/login")
    public LoginResponse login(
            @Valid @RequestBody LoginRequest request
    ) {
        return authService.login(request);
    }

    @Operation(summary = "Alterar senha",description = "Altera a senha do funcionário")
    @SecurityRequirements
    @PatchMapping("/alterar-senha")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void alterarSenha(
            @Valid @RequestBody AlterarSenhaRequest request
    ) {
        authService.alterarSenha(request);
    }
}