package br.com.senac.sistema_gestao_absenteismo.ponto.dto;

import java.time.LocalDate;

public record ProcessamentoPendenciasResponse(

        LocalDate data,
        int funcionariosAvaliados,
        int pendenciasCriadas,
        int jornadasIncompletasMarcadas,
        int registrosMantidos,
        int feriasIgnoradas) {
}