package br.com.senac.sistema_gestao_absenteismo.auth.controller;

import br.com.senac.sistema_gestao_absenteismo.auth.dto.AlterarSenhaRequest;
import br.com.senac.sistema_gestao_absenteismo.auth.dto.LoginRequest;
import br.com.senac.sistema_gestao_absenteismo.auth.dto.LoginResponse;
import br.com.senac.sistema_gestao_absenteismo.auth.dto.PrimeiroAcessoRequest;
import br.com.senac.sistema_gestao_absenteismo.auth.dto.RecuperarSenhaRequest;
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
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
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

    @Operation(summary = "Concluir primeiro acesso", description = "Substitui a senha provisória pela senha definitiva e retorna um novo token JWT.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Primeiro acesso concluído", content = @Content(schema = @Schema(implementation = LoginResponse.class))),
            @ApiResponse(responseCode = "400", description = "Senhas inválidas ou primeiro acesso já concluído", content = @Content(schema = @Schema(implementation = ApiError.class))),
            @ApiResponse(responseCode = "401", description = "Token inválido ou ausente")
    })
    @PatchMapping("/primeiro-acesso")
    public LoginResponse concluirPrimeiroAcesso(@AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody PrimeiroAcessoRequest request) {

        Object valor = jwt.getClaim("funcionarioId");

        if (!(valor instanceof Number numero)) {
            throw new IllegalArgumentException("O token não contém o identificador do funcionário");
        }

        return authService.concluirPrimeiroAcesso(numero.longValue(), request);
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

    @Operation(summary = "Recuperar senha", description = """
            Redefine a senha do usuário após validar
            e-mail corporativo, CPF, matrícula e
            data de nascimento.
            """)
    @SecurityRequirements
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Senha redefinida com sucesso"),
            @ApiResponse(responseCode = "400", description = "Dados inválidos ou senhas incompatíveis", content = @Content(schema = @Schema(implementation = ApiError.class))),
            @ApiResponse(responseCode = "401", description = "Dados de identificação inválidos", content = @Content(schema = @Schema(implementation = ApiError.class))),
            @ApiResponse(responseCode = "403", description = "Usuário inativo", content = @Content(schema = @Schema(implementation = ApiError.class)))
    })
    @PatchMapping("/recuperar-senha")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void recuperarSenha(
            @Valid @RequestBody RecuperarSenhaRequest request) {
        authService.recuperarSenha(request);
    }
}
