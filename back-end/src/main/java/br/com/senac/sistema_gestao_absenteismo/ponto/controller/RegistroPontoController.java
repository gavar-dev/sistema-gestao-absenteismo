package br.com.senac.sistema_gestao_absenteismo.ponto.controller;

import br.com.senac.sistema_gestao_absenteismo.ponto.dto.IndicadorDiaResponse;
import br.com.senac.sistema_gestao_absenteismo.ponto.dto.IndicadorSetorResponse;
import br.com.senac.sistema_gestao_absenteismo.ponto.dto.IndicadorStatusResponse;
import br.com.senac.sistema_gestao_absenteismo.ponto.dto.MarcacaoPontoRequest;
import br.com.senac.sistema_gestao_absenteismo.ponto.dto.ProcessamentoFaltasResponse;
import br.com.senac.sistema_gestao_absenteismo.ponto.dto.ProcessamentoPendenciasResponse;
import br.com.senac.sistema_gestao_absenteismo.ponto.dto.RankingAtrasoResponse;
import br.com.senac.sistema_gestao_absenteismo.ponto.dto.RegistroPontoResponse;
import br.com.senac.sistema_gestao_absenteismo.ponto.dto.ResumoPontoResponse;
import br.com.senac.sistema_gestao_absenteismo.ponto.model.StatusJornada;
import br.com.senac.sistema_gestao_absenteismo.ponto.service.RegistroPontoService;
import br.com.senac.sistema_gestao_absenteismo.shared.exception.ApiError;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/pontos")
@RequiredArgsConstructor
@Tag(name = "Pontos", description = "Marcações de ponto, históricos, indicadores gerenciais e processamento de pendências")
public class RegistroPontoController {

    private final RegistroPontoService registroPontoService;

    @Operation(summary = "Registrar marcação de ponto", description = "Registra uma marcação para o funcionário autenticado, como entrada, início/fim de intervalo ou saída.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Marcação registrada", content = @Content(schema = @Schema(implementation = RegistroPontoResponse.class))),
        @ApiResponse(responseCode = "400", description = "Marcação inválida conforme as regras da jornada", content = @Content(schema = @Schema(implementation = ApiError.class)))
    })
    @PostMapping("/marcar")
    public RegistroPontoResponse marcar(@AuthenticationPrincipal Jwt jwt,@Valid @RequestBody MarcacaoPontoRequest request) {

        return registroPontoService.marcar(extrairFuncionarioId(jwt),request.tipo());
    }

    @Operation(summary = "Consultar ponto de hoje", description = "Retorna o registro do dia atual para o funcionário autenticado. Retorna 204 quando ainda não existe registro.")
@ApiResponses({
        @ApiResponse(responseCode = "200", description = "Registro de hoje encontrado", content = @Content(schema = @Schema(implementation = RegistroPontoResponse.class))),
        @ApiResponse(responseCode = "204", description = "Nenhum registro encontrado para hoje")
    })
    @GetMapping("/hoje")
    public ResponseEntity<RegistroPontoResponse> buscarHoje(@AuthenticationPrincipal Jwt jwt) {
        return registroPontoService.buscarHoje(extrairFuncionarioId(jwt)).map(ResponseEntity::ok)
        .orElseGet(() -> ResponseEntity.noContent().build());
    }

    @Operation(summary = "Consultar meu histórico de ponto", description = "Lista o histórico de ponto do funcionário autenticado.")
    @ApiResponse(responseCode = "200", description = "Histórico encontrado", content = @Content(array = @ArraySchema(schema = @Schema(implementation = RegistroPontoResponse.class))))
    @GetMapping("/meu-historico")
    public List<RegistroPontoResponse> buscarMeuHistorico(@AuthenticationPrincipal Jwt jwt) {
        return registroPontoService.buscarMeuHistorico(extrairFuncionarioId(jwt));
    }

    @Operation(summary = "Consultar histórico de um funcionário", description = "Consulta o histórico de ponto de um funcionário em um período. Disponível para RH e gestor.")
    @ApiResponse(responseCode = "200", description = "Registros encontrados", content = @Content(array = @ArraySchema(schema = @Schema(implementation = RegistroPontoResponse.class))))
    @GetMapping("/funcionarios/{funcionarioId}")
    public List<RegistroPontoResponse> buscarHistoricoFuncionario(@Parameter(description = "ID do funcionário", example = "1") @PathVariable Long funcionarioId,
    @Parameter(description = "Data inicial", example = "2026-08-01") @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate inicio,
    @Parameter(description = "Data final", example = "2026-08-08") @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fim) {

        return registroPontoService.buscarHistoricoFuncionario(funcionarioId,inicio,fim);
    }

    @Operation(summary = "Consultar registros gerenciais", description = "Lista registros de ponto por período, com filtros opcionais por status e funcionário.")
    @ApiResponse(responseCode = "200", description = "Registros encontrados", content = @Content(array = @ArraySchema(schema = @Schema(implementation = RegistroPontoResponse.class))))
    @GetMapping
    public List<RegistroPontoResponse> buscarRegistrosGerenciais(@Parameter(description = "Data inicial", example = "2026-08-01") @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate inicio,
    @Parameter(description = "Data final", example = "2026-08-08") @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fim,
    @Parameter(description = "Status da jornada") @RequestParam(required = false) StatusJornada status,
    @Parameter(description = "ID do funcionário", example = "1") @RequestParam(required = false) Long funcionarioId) {

        return registroPontoService.buscarRegistrosGerenciais(inicio,fim,status,funcionarioId);
    }

    @Operation(summary = "Consultar resumo gerencial", description = "Retorna um resumo agregado dos registros de ponto no período.")
    @ApiResponse(responseCode = "200", description = "Resumo calculado", content = @Content(schema = @Schema(implementation = ResumoPontoResponse.class)))
    @GetMapping("/resumo")
    public ResumoPontoResponse buscarResumoGerencial(@Parameter(description = "Data inicial", example = "2026-08-01") @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate inicio,
    @Parameter(description = "Data final", example = "2026-08-08") @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fim,
    @Parameter(description = "ID opcional do funcionário", example = "1") @RequestParam(required = false) Long funcionarioId) {

        return registroPontoService.buscarResumoGerencial(inicio,fim,funcionarioId);
    }

    @Operation(summary = "Indicadores por status", description = "Agrupa os registros do período pelo status da jornada.")
    @ApiResponse(responseCode = "200", description = "Indicadores calculados", content = @Content(array = @ArraySchema(schema = @Schema(implementation = IndicadorStatusResponse.class))))
    @GetMapping("/indicadores/status")
    public List<IndicadorStatusResponse> buscarIndicadoresPorStatus(@Parameter(description = "Data inicial", example = "2026-08-01") @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate inicio,
    @Parameter(description = "Data final", example = "2026-08-08") @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fim,
    @Parameter(description = "ID opcional do funcionário", example = "1") @RequestParam(required = false) Long funcionarioId) {

        return registroPontoService.buscarIndicadoresPorStatus(inicio,fim,funcionarioId);
    }

    @Operation(summary = "Indicadores por dia", description = "Retorna indicadores diários de ponto dentro do período informado.")
    @ApiResponse(responseCode = "200", description = "Indicadores calculados", content = @Content(array = @ArraySchema(schema = @Schema(implementation = IndicadorDiaResponse.class))))
    @GetMapping("/indicadores/por-dia")
    public List<IndicadorDiaResponse> buscarIndicadoresPorDia(@Parameter(description = "Data inicial", example = "2026-08-01") @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate inicio,
    @Parameter(description = "Data final", example = "2026-08-08") @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fim,
    @Parameter(description = "ID opcional do funcionário", example = "1") @RequestParam(required = false) Long funcionarioId) {

        return registroPontoService.buscarIndicadoresPorDia(inicio,fim,funcionarioId);
    }

    @Operation(summary = "Indicadores por setor", description = "Agrupa indicadores de ponto por setor no período informado.")
    @ApiResponse(responseCode = "200", description = "Indicadores calculados", content = @Content(array = @ArraySchema(schema = @Schema(implementation = IndicadorSetorResponse.class))))
    @GetMapping("/indicadores/por-setor")
    public List<IndicadorSetorResponse> buscarIndicadoresPorSetor(@Parameter(description = "Data inicial", example = "2026-08-01") @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate inicio,
    @Parameter(description = "Data final", example = "2026-08-08") @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fim) {

        return registroPontoService.buscarIndicadoresPorSetor(inicio, fim);
    }

    @Operation(summary = "Ranking de atrasos", description = "Retorna o ranking de funcionários com mais atrasos no período.")
    @ApiResponse(responseCode = "200", description = "Ranking calculado", content = @Content(array = @ArraySchema(schema = @Schema(implementation = RankingAtrasoResponse.class))))
    @GetMapping("/indicadores/ranking-atrasos")
    public List<RankingAtrasoResponse> buscarRankingAtrasos(@Parameter(description = "Data inicial", example = "2026-08-01") @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate inicio,
    @Parameter(description = "Data final", example = "2026-08-08") @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fim,
    @Parameter(description = "Quantidade máxima no ranking", example = "5") @RequestParam(defaultValue = "5") int limite) {

        return registroPontoService.buscarRankingAtrasos(inicio, fim, limite);
    }

    @Operation(summary = "Processar pendências", description = "Processa as pendências de ponto de uma data. Operação restrita ao RH.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Pendências processadas", content = @Content(schema = @Schema(implementation = ProcessamentoPendenciasResponse.class))),
        @ApiResponse(responseCode = "400", description = "Data inválida", content = @Content(schema = @Schema(implementation = ApiError.class)))
    })
    @PostMapping("/processamento/pendencias")
    public ProcessamentoPendenciasResponse processarPendencias(@Parameter(description = "Data que será processada", example = "2026-08-08") @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate data) {

        return registroPontoService.processarPendencias(data);
    }

    @Operation(summary = "Processar faltas", description = "Converte pendências vencidas em faltas conforme as regras do sistema. Operação restrita ao RH.")
    @ApiResponse(responseCode = "200", description = "Faltas processadas", content = @Content(schema = @Schema(implementation = ProcessamentoFaltasResponse.class)))
    @PostMapping("/processamento/faltas")
    public ProcessamentoFaltasResponse processarFaltas() {
        return registroPontoService.processarFaltas();
    }

    private Long extrairFuncionarioId(Jwt jwt) {
        Object valor = jwt.getClaim("funcionarioId");

        if (valor instanceof Number numero) {
            return numero.longValue();
        }

        throw new IllegalArgumentException("O token não contém o identificador do funcionário");
    }
}
