package br.com.senac.sistema_gestao_absenteismo.ponto.dto;

import br.com.senac.sistema_gestao_absenteismo.ponto.model.TipoMarcacao;
import jakarta.validation.constraints.NotNull;

public record MarcacaoPontoRequest(@NotNull(message = "O tipo da marcação é obrigatório") TipoMarcacao tipo) {
}