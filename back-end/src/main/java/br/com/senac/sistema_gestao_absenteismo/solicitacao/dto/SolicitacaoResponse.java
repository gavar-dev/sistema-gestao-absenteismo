package br.com.senac.sistema_gestao_absenteismo.solicitacao.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

import br.com.senac.sistema_gestao_absenteismo.solicitacao.model.PrioridadeSolicitacao;
import br.com.senac.sistema_gestao_absenteismo.solicitacao.model.Solicitacao;
import br.com.senac.sistema_gestao_absenteismo.solicitacao.model.StatusSolicitacao;
import br.com.senac.sistema_gestao_absenteismo.solicitacao.model.TipoSolicitacao;

public record SolicitacaoResponse(

        Long id,
        String protocolo,

        Long funcionarioId,
        String nomeFuncionario,
        String matricula,
        String setor,
        String cargo,

        TipoSolicitacao tipo,
        StatusSolicitacao status,
        PrioridadeSolicitacao prioridade,

        Long registroPontoId,

        LocalDate dataReferencia,
        LocalDate dataInicio,
        LocalDate dataFim,

        LocalTime entradaSolicitada,
        LocalTime inicioIntervaloSolicitado,
        LocalTime fimIntervaloSolicitado,
        LocalTime saidaSolicitada,

        String campoCadastro,
        String novoValor,

        String justificativa,
        String nomeAnexo,

        String observacaoAnalise,

        Long analisadoPorId,
        String nomeAnalisadoPor,

        LocalDateTime criadoEm,
        LocalDateTime atualizadoEm,
        LocalDateTime analisadoEm

) {

    public static SolicitacaoResponse from(Solicitacao solicitacao) {

        Long registroPontoId = solicitacao.getRegistroPonto() == null ? null : solicitacao.getRegistroPonto().getId();

        Long analisadoPorId = solicitacao.getAnalisadoPor() == null ? null : solicitacao.getAnalisadoPor().getId();

        String nomeAnalisadoPor = solicitacao.getAnalisadoPor() == null ? null : solicitacao.getAnalisadoPor().getNomeCompleto();

        return new SolicitacaoResponse(
                solicitacao.getId(),
                String.format("#SOL-%04d", solicitacao.getId()),

                solicitacao.getFuncionario().getId(),
                solicitacao.getFuncionario().getNomeCompleto(),
                solicitacao.getFuncionario().getMatricula(),
                solicitacao.getFuncionario().getSetor(),
                solicitacao.getFuncionario().getCargo(),

                solicitacao.getTipo(),
                solicitacao.getStatus(),
                solicitacao.getPrioridade(),

                registroPontoId,

                solicitacao.getDataReferencia(),
                solicitacao.getDataInicio(),
                solicitacao.getDataFim(),

                solicitacao.getEntradaSolicitada(),
                solicitacao.getInicioIntervaloSolicitado(),
                solicitacao.getFimIntervaloSolicitado(),
                solicitacao.getSaidaSolicitada(),

                solicitacao.getCampoCadastro(),
                solicitacao.getNovoValor(),

                solicitacao.getJustificativa(),
                solicitacao.getNomeAnexo(),

                solicitacao.getObservacaoAnalise(),

                analisadoPorId,
                nomeAnalisadoPor,

                solicitacao.getCriadoEm(),
                solicitacao.getAtualizadoEm(),
                solicitacao.getAnalisadoEm()
        );
    }
}