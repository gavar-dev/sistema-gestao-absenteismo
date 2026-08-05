package br.com.senac.sistema_gestao_absenteismo.aviso.repository;

import br.com.senac.sistema_gestao_absenteismo.aviso.model.Aviso;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AvisoRepository
        extends JpaRepository<Aviso, Long> {

    List<Aviso> findAllByOrderByPublicadoEmDesc();

    List<Aviso> findByAtivoTrueOrderByPublicadoEmDesc();

    List<Aviso> findByAtivoOrderByPublicadoEmDesc(Boolean ativo);
}