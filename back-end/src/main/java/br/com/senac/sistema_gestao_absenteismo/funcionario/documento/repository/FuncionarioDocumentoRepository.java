package br.com.senac.sistema_gestao_absenteismo.funcionario.documento.repository;

import br.com.senac.sistema_gestao_absenteismo.funcionario.documento.model.FuncionarioDocumento;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface FuncionarioDocumentoRepository
        extends JpaRepository<FuncionarioDocumento, Long> {

    List<FuncionarioDocumento>
            findByFuncionarioIdOrderByCriadoEmDesc(
                    Long funcionarioId
            );

    Optional<FuncionarioDocumento>
            findByIdAndFuncionarioId(
                    Long documentoId,
                    Long funcionarioId
            );

    long countByFuncionarioId(
            Long funcionarioId
    );
}