package br.com.senac.sistema_gestao_absenteismo.solicitacao.dto;

import br.com.senac.sistema_gestao_absenteismo.solicitacao.model.PrioridadeSolicitacao;
import br.com.senac.sistema_gestao_absenteismo.solicitacao.model.TipoSolicitacao;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.time.LocalTime;

public record SolicitacaoCreateRequest(

        @NotNull(message = "O tipo da solicitação é obrigatório")
        TipoSolicitacao tipo,

        PrioridadeSolicitacao prioridade,

        LocalDate dataReferencia,

        LocalDate dataInicio,

        LocalDate dataFim,

        LocalTime entradaSolicitada,

        LocalTime inicioIntervaloSolicitado,

        LocalTime fimIntervaloSolicitado,

        LocalTime saidaSolicitada,

        @Size(max = 80, message = "O campo cadastral deve possuir no máximo 80 caracteres")
        String campoCadastro,

        @Size(max = 255, message = "O novo valor deve possuir no máximo 255 caracteres")
        String novoValor,

        @NotBlank(message = "A justificativa é obrigatória")
        @Size(min = 10,max = 2000,message = "A justificativa deve possuir entre 10 e 2000 caracteres")
        String justificativa,

        @Size(max = 255, message = "O nome do anexo deve possuir no máximo 255 caracteres")
        String nomeAnexo

) {
}