package br.com.senac.sistema_gestao_absenteismo.ponto.repository;

import br.com.senac.sistema_gestao_absenteismo.ponto.model.RegistroPonto;
import br.com.senac.sistema_gestao_absenteismo.ponto.model.StatusJornada;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface RegistroPontoRepository extends JpaRepository<RegistroPonto, Long> {

    Optional<RegistroPonto> findByFuncionario_IdAndDataRegistro(Long funcionarioId, LocalDate dataRegistro);

    List<RegistroPonto> findByFuncionario_IdOrderByDataRegistroDesc(Long funcionarioId);

    List<RegistroPonto> findByFuncionario_IdAndDataRegistroBetweenOrderByDataRegistroDesc(Long funcionarioId,LocalDate inicio, LocalDate fim);

    @Query("""
        SELECT registro
        FROM RegistroPonto registro
        WHERE registro.dataRegistro BETWEEN :inicio AND :fim
          AND (:status IS NULL OR registro.status = :status)
          AND (:funcionarioId IS NULL OR registro.funcionario.id = :funcionarioId)
        ORDER BY registro.dataRegistro DESC, registro.entrada DESC
        """)
    List<RegistroPonto> buscarRegistrosGerenciais(@Param("inicio") LocalDate inicio,@Param("fim") LocalDate fim,@Param("status") StatusJornada status,@Param("funcionarioId") Long funcionarioId);

    List<RegistroPonto> findByStatusOrderByDataRegistroAsc(StatusJornada status);
    
}