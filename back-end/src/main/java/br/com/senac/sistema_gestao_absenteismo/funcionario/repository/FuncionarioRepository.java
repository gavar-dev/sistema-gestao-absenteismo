package br.com.senac.sistema_gestao_absenteismo.funcionario.repository;

import br.com.senac.sistema_gestao_absenteismo.funcionario.model.Funcionario;
import br.com.senac.sistema_gestao_absenteismo.funcionario.model.StatusFuncionario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface FuncionarioRepository extends JpaRepository<Funcionario, Long> {
    
    Optional<Funcionario> findByEmailCorporativoIgnoreCase(String emailCorporativo);
    
    boolean existsByEmailCorporativoIgnoreCase(String emailCorporativo);

    boolean existsByEmailCorporativoIgnoreCaseAndIdNot(String emailCorporativo, Long id);

    boolean existsByCpf(String cpf);

    boolean existsByCpfAndIdNot(String cpf, Long id);

    boolean existsByMatriculaIgnoreCase(String matricula);

    boolean existsByMatriculaIgnoreCaseAndIdNot(String matricula, Long id);

    List<Funcionario> findAllByOrderByNomeCompletoAsc();

    List<Funcionario> findByStatusOrderByNomeCompletoAsc(StatusFuncionario status);
    
}
