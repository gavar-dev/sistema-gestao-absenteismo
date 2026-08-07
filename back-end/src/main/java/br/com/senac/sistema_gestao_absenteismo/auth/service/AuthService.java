package br.com.senac.sistema_gestao_absenteismo.auth.service;

import br.com.senac.sistema_gestao_absenteismo.auth.dto.AlterarSenhaRequest;
import br.com.senac.sistema_gestao_absenteismo.auth.dto.LoginRequest;
import br.com.senac.sistema_gestao_absenteismo.auth.dto.LoginResponse;
import br.com.senac.sistema_gestao_absenteismo.auth.dto.TokenGerado;
import br.com.senac.sistema_gestao_absenteismo.funcionario.model.Funcionario;
import br.com.senac.sistema_gestao_absenteismo.funcionario.model.StatusFuncionario;
import br.com.senac.sistema_gestao_absenteismo.funcionario.repository.FuncionarioRepository;
import br.com.senac.sistema_gestao_absenteismo.shared.exception.CredenciaisInvalidasException;
import br.com.senac.sistema_gestao_absenteismo.shared.exception.UsuarioInativoException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final FuncionarioRepository funcionarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final TokenService tokenService;

    @Transactional(readOnly = true)
    public LoginResponse login(
            LoginRequest request
    ) {
        String email = normalizarEmail(
                request.email()
        );

        Funcionario funcionario =
                buscarPorEmailParaAutenticacao(
                        email
                );

        boolean senhaCorreta =
                passwordEncoder.matches(
                        request.senha(),
                        funcionario.getSenhaHash()
                );

        if (!senhaCorreta) {
            throw new CredenciaisInvalidasException(
                    "E-mail ou senha inválidos"
            );
        }

        validarUsuarioAtivo(funcionario);

        TokenGerado tokenGerado =
                tokenService.gerarToken(
                        funcionario
                );

        return LoginResponse.from(
                funcionario,
                tokenGerado
        );
    }

    @Transactional
    public void alterarSenha(
            AlterarSenhaRequest request
    ) {
        String email = normalizarEmail(
                request.email()
        );

        Funcionario funcionario =
                funcionarioRepository
                        .findByEmailCorporativoIgnoreCase(
                                email
                        )
                        .orElseThrow(
                                () ->
                                        new CredenciaisInvalidasException(
                                                "E-mail ou senha atual inválidos"
                                        )
                        );

        boolean senhaAtualCorreta =
                passwordEncoder.matches(
                        request.senhaAtual(),
                        funcionario.getSenhaHash()
                );

        if (!senhaAtualCorreta) {
            throw new CredenciaisInvalidasException(
                    "E-mail ou senha atual inválidos"
            );
        }

        validarUsuarioAtivo(funcionario);

        if (
                request.senhaAtual()
                        .equals(request.novaSenha())
        ) {
            throw new IllegalArgumentException(
                    "A nova senha deve ser diferente da senha atual"
            );
        }

        funcionario.setSenhaHash(
                passwordEncoder.encode(
                        request.novaSenha()
                )
        );

        funcionarioRepository.save(
                funcionario
        );
    }

    private Funcionario buscarPorEmailParaAutenticacao(
            String email
    ) {
        return funcionarioRepository
                .findByEmailCorporativoIgnoreCase(
                        email
                )
                .orElseThrow(
                        () ->
                                new CredenciaisInvalidasException(
                                        "E-mail ou senha inválidos"
                                )
                );
    }

    private void validarUsuarioAtivo(
            Funcionario funcionario
    ) {
        if (
                funcionario.getStatus() !=
                StatusFuncionario.ATIVO
        ) {
            throw new UsuarioInativoException(
                    "Usuário sem acesso. Status atual: "
                            + funcionario
                                    .getStatus()
                                    .getDescricao()
            );
        }
    }

    private String normalizarEmail(
            String email
    ) {
        return email
                .trim()
                .toLowerCase(Locale.ROOT);
    }
}