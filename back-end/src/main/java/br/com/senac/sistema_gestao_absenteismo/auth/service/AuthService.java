package br.com.senac.sistema_gestao_absenteismo.auth.service;

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
        public LoginResponse login(LoginRequest request) {
                String email = request.email()
                                .trim()
                                .toLowerCase(Locale.ROOT);

                Funcionario funcionario = funcionarioRepository
                                .findByEmailCorporativoIgnoreCase(email)
                                .orElseThrow(() -> new CredenciaisInvalidasException(
                                                "E-mail ou senha inválidos"));

                boolean senhaCorreta = passwordEncoder.matches(
                                request.senha(),
                                funcionario.getSenhaHash());

                if (!senhaCorreta) {
                        throw new CredenciaisInvalidasException(
                                        "E-mail ou senha inválidos");
                }

                if (funcionario.getStatus() != StatusFuncionario.ATIVO) {
                        throw new UsuarioInativoException(
                                        "Usuário sem acesso. Status atual: "
                                                        + funcionario.getStatus().getDescricao());
                }
                        
                TokenGerado tokenGerado = tokenService.gerarToken(funcionario);

                return LoginResponse.from(funcionario, tokenGerado);
        }
}