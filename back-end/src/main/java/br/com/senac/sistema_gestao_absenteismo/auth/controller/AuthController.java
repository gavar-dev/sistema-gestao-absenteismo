package br.com.senac.sistema_gestao_absenteismo.auth.controller;

import br.com.senac.sistema_gestao_absenteismo.auth.dto.AlterarSenhaRequest;
import br.com.senac.sistema_gestao_absenteismo.auth.dto.LoginRequest;
import br.com.senac.sistema_gestao_absenteismo.auth.dto.LoginResponse;
import br.com.senac.sistema_gestao_absenteismo.auth.service.AuthService;
import br.com.senac.sistema_gestao_absenteismo.shared.exception.ApiError;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirements;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
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
@Tag(name = "Autenticação", description = "Login e alteração de senha dos usuários do sistema")
public class AuthController {

    private final AuthService authService;

    @Operation(summary = "Realizar login", description = "Autentica o usuário pelo e-mail corporativo e senha e retorna um token JWT.")
    @SecurityRequirements
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Login realizado com sucesso", content = @Content(schema = @Schema(implementation = LoginResponse.class))),
        @ApiResponse(responseCode = "400", description = "Dados da requisição inválidos", content = @Content(schema = @Schema(implementation = ApiError.class))),
        @ApiResponse(responseCode = "401", description = "E-mail ou senha inválidos", content = @Content(schema = @Schema(implementation = ApiError.class))),
        @ApiResponse(responseCode = "403", description = "Usuário inativo ou sem acesso", content = @Content(schema = @Schema(implementation = ApiError.class)))
    })
    @PostMapping("/login")
    public LoginResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @Operation(summary = "Alterar senha", description = "Altera a senha após validar o e-mail e a senha atual.")
    @SecurityRequirements
    @ApiResponses({
        @ApiResponse(responseCode = "204", description = "Senha alterada com sucesso"),
        @ApiResponse(responseCode = "400", description = "Dados inválidos ou nova senha igual à atual", content = @Content(schema = @Schema(implementation = ApiError.class))),
        @ApiResponse(responseCode = "401", description = "E-mail ou senha atual inválidos", content = @Content(schema = @Schema(implementation = ApiError.class))),
        @ApiResponse(responseCode = "403", description = "Usuário inativo", content = @Content(schema = @Schema(implementation = ApiError.class)))
    })
    @PatchMapping("/alterar-senha")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void alterarSenha(@Valid @RequestBody AlterarSenhaRequest request) {
        authService.alterarSenha(request);
    }
}
