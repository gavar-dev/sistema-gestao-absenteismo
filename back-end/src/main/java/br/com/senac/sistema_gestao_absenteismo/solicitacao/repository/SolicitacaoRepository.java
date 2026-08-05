package br.com.senac.sistema_gestao_absenteismo.solicitacao.repository;

import br.com.senac.sistema_gestao_absenteismo.solicitacao.model.Solicitacao;
import br.com.senac.sistema_gestao_absenteismo.solicitacao.model.StatusSolicitacao;
import br.com.senac.sistema_gestao_absenteismo.solicitacao.model.TipoSolicitacao;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface SolicitacaoRepository extends JpaRepository<Solicitacao, Long> {

    List<Solicitacao> findByFuncionario_IdOrderByCriadoEmDesc(Long funcionarioId);

    List<Solicitacao> findAllByOrderByCriadoEmDesc();

    List<Solicitacao> findByStatusOrderByCriadoEmDesc(StatusSolicitacao status);

    boolean existsByFuncionario_IdAndTipoAndDataReferenciaAndStatus(Long funcionarioId,TipoSolicitacao tipo,
    LocalDate dataReferencia,StatusSolicitacao status);

    boolean existsByFuncionario_IdAndTipoAndStatusAndDataInicioLessThanEqualAndDataFimGreaterThanEqual(Long funcionarioId,TipoSolicitacao tipo,
        StatusSolicitacao status,LocalDate dataFim,LocalDate dataInicio);

    

}