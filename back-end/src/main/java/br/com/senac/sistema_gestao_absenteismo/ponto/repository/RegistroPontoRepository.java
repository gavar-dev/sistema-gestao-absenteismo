package br.com.senac.sistema_gestao_absenteismo.ponto.repository;

import br.com.senac.sistema_gestao_absenteismo.ponto.model.RegistroPonto;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface RegistroPontoRepository extends JpaRepository<RegistroPonto, Long> {

    Optional<RegistroPonto> findByFuncionario_IdAndDataRegistro(Long funcionarioId, LocalDate dataRegistro);

    List<RegistroPonto> findByFuncionario_IdOrderByDataRegistroDesc(Long funcionarioId);
}