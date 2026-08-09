package br.com.senac.sistema_gestao_absenteismo.config;

import br.com.senac.sistema_gestao_absenteismo.funcionario.model.Funcionario;
import br.com.senac.sistema_gestao_absenteismo.funcionario.model.StatusFuncionario;
import br.com.senac.sistema_gestao_absenteismo.funcionario.model.TipoUsuario;
import br.com.senac.sistema_gestao_absenteismo.funcionario.model.TipoVinculo;
import br.com.senac.sistema_gestao_absenteismo.funcionario.repository.FuncionarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

/**
 * Bootstrap do sistema: como o cadastro de funcionario (POST /api/funcionarios)
 * exige ROLE_RH, sem isso ninguem consegue logar na primeira execucao.
 * Este seeder roda so uma vez (se a tabela estiver vazia) e cria um usuario
 * RH e alguns funcionarios de teste. Senha de todos: "Teste@123".
 *
 * Pode ser removido/desabilitado depois que voce ja tiver usuarios reais
 * cadastrados em producao.
 */
@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final FuncionarioRepository funcionarioRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (funcionarioRepository.count() > 0) return;

        String senhaHash = passwordEncoder.encode("Teste@123");

        funcionarioRepository.save(Funcionario.builder()
                .nomeCompleto("Renata Souza")
                .emailCorporativo("rh.corporativo@gmail.com")
                .cpf("11122233344")
                .telefone("(21) 99999-0001")
                .dataNascimento(LocalDate.of(1990, 4, 12))
                .nacionalidade("Brasileira")
                .matricula("1000")
                .cargo("Analista de RH")
                .setor("Recursos Humanos")
                .dataAdmissao(LocalDate.of(2022, 1, 10))
                .tipoVinculo(TipoVinculo.CLT)
                .cargaHorariaSemanal(40)
                .tipoAcesso(TipoUsuario.RH)
                .status(StatusFuncionario.ATIVO)
                .senhaHash(senhaHash)
                .build());

        funcionarioRepository.save(Funcionario.builder()
                .nomeCompleto("Carla Mendes")
                .emailCorporativo("gestor.corporativo@gmail.com")
                .cpf("22233344455")
                .telefone("(21) 99999-0002")
                .dataNascimento(LocalDate.of(1988, 7, 25))
                .nacionalidade("Brasileira")
                .matricula("1001")
                .cargo("Gestora de RH")
                .setor("Gestão de Pessoas")
                .dataAdmissao(LocalDate.of(2021, 3, 1))
                .tipoVinculo(TipoVinculo.CLT)
                .cargaHorariaSemanal(40)
                .tipoAcesso(TipoUsuario.GESTOR)
                .status(StatusFuncionario.ATIVO)
                .senhaHash(senhaHash)
                .build());

        funcionarioRepository.save(Funcionario.builder()
                .nomeCompleto("Maria Silva")
                .emailCorporativo("funcionario@gmail.com")
                .cpf("33344455566")
                .telefone("(21) 99999-0003")
                .dataNascimento(LocalDate.of(1996, 11, 3))
                .nacionalidade("Brasileira")
                .matricula("1002")
                .cargo("Analista de Vendas")
                .setor("Comercial")
                .dataAdmissao(LocalDate.of(2024, 3, 12))
                .tipoVinculo(TipoVinculo.CLT)
                .cargaHorariaSemanal(44)
                .tipoAcesso(TipoUsuario.FUNCIONARIO)
                .status(StatusFuncionario.ATIVO)
                .senhaHash(senhaHash)
                .build());

        funcionarioRepository.save(Funcionario.builder()
                .nomeCompleto("Pedro Santos")
                .emailCorporativo("pedro.santos@gmail.com")
                .cpf("44455566677")
                .telefone("(21) 99999-0004")
                .dataNascimento(LocalDate.of(1999, 2, 18))
                .nacionalidade("Brasileira")
                .matricula("1003")
                .cargo("Desenvolvedor Jr.")
                .setor("Tecnologia")
                .dataAdmissao(LocalDate.of(2024, 6, 1))
                .tipoVinculo(TipoVinculo.CLT)
                .cargaHorariaSemanal(40)
                .tipoAcesso(TipoUsuario.FUNCIONARIO)
                .status(StatusFuncionario.ATIVO)
                .senhaHash(senhaHash)
                .build());

        System.out.println(">> Usuarios de teste criados (senha para todos: Teste@123):");
        System.out.println(">>   RH:          rh.corporativo@gmail.com");
        System.out.println(">>   Gestor:      gestor.corporativo@gmail.com");
        System.out.println(">>   Funcionario: funcionario@gmail.com");
        System.out.println(">>   Funcionario: pedro.santos@gmail.com");
    }
}
