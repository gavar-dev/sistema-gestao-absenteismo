package br.com.senac.sistema_gestao_absenteismo.ponto.controller;

import br.com.senac.sistema_gestao_absenteismo.ponto.dto.IndicadorDiaResponse;
import br.com.senac.sistema_gestao_absenteismo.ponto.dto.IndicadorSetorResponse;
import br.com.senac.sistema_gestao_absenteismo.ponto.dto.IndicadorStatusResponse;
import br.com.senac.sistema_gestao_absenteismo.ponto.dto.MarcacaoPontoRequest;
import br.com.senac.sistema_gestao_absenteismo.ponto.dto.RegistroPontoResponse;
import br.com.senac.sistema_gestao_absenteismo.ponto.dto.ResumoPontoResponse;
import br.com.senac.sistema_gestao_absenteismo.ponto.model.StatusJornada;
import br.com.senac.sistema_gestao_absenteismo.ponto.service.RegistroPontoService;
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
public class RegistroPontoController {

    private final RegistroPontoService registroPontoService;

    @PostMapping("/marcar")
    public RegistroPontoResponse marcar(@AuthenticationPrincipal Jwt jwt,@Valid @RequestBody MarcacaoPontoRequest request) {
        
        Long funcionarioId = extrairFuncionarioId(jwt);

        return registroPontoService.marcar(funcionarioId, request.tipo());
    }

    @GetMapping("/hoje")
    public ResponseEntity<RegistroPontoResponse> buscarHoje(@AuthenticationPrincipal Jwt jwt) {
        
        Long funcionarioId = extrairFuncionarioId(jwt);

        return registroPontoService.buscarHoje(funcionarioId).map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.noContent().build());
    }

    @GetMapping("/meu-historico")
    public List<RegistroPontoResponse> buscarMeuHistorico(@AuthenticationPrincipal Jwt jwt) {
        
        Long funcionarioId = extrairFuncionarioId(jwt);

        return registroPontoService.buscarMeuHistorico(funcionarioId);
    }

    private Long extrairFuncionarioId(Jwt jwt) {
        Object valor = jwt.getClaim("funcionarioId");

        if (valor instanceof Number numero) {
            return numero.longValue();
        }

        throw new IllegalArgumentException("O token não contém o identificador do funcionário");
    }

    @GetMapping("/funcionarios/{funcionarioId}")
    public List<RegistroPontoResponse> buscarHistoricoFuncionario(@PathVariable Long funcionarioId,@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate inicio,@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fim) {

        return registroPontoService.buscarHistoricoFuncionario(funcionarioId,inicio,fim);
        
    }

    @GetMapping
    public List<RegistroPontoResponse> buscarRegistrosGerenciais(
            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate inicio,

            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate fim,

            @RequestParam(required = false)
            StatusJornada status,

            @RequestParam(required = false)
            Long funcionarioId
    ) {
        return registroPontoService.buscarRegistrosGerenciais(inicio,fim,status,funcionarioId);
    }

    @GetMapping("/resumo")
    public ResumoPontoResponse buscarResumoGerencial(
            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate inicio,

            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate fim,

            @RequestParam(required = false)
            Long funcionarioId
    ) {
        return registroPontoService.buscarResumoGerencial(inicio,fim,funcionarioId);
    }


    @GetMapping("/indicadores/status")
    public List<IndicadorStatusResponse> buscarIndicadoresPorStatus(
            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate inicio,

            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate fim,

            @RequestParam(required = false)
            Long funcionarioId
    ) {
        return registroPontoService.buscarIndicadoresPorStatus(inicio,fim,funcionarioId);
    }

    @GetMapping("/indicadores/por-dia")
    public List<IndicadorDiaResponse> buscarIndicadoresPorDia(
            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate inicio,

            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate fim,

            @RequestParam(required = false)
            Long funcionarioId
    ) {
        return registroPontoService.buscarIndicadoresPorDia(
                inicio,
                fim,
                funcionarioId
        );
    }

    @GetMapping("/indicadores/por-setor")
    public List<IndicadorSetorResponse> buscarIndicadoresPorSetor(
            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate inicio,

            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate fim
    ) {
        return registroPontoService.buscarIndicadoresPorSetor(inicio,fim);
    }
}