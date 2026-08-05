package br.com.senac.sistema_gestao_absenteismo.solicitacao.controller;

import br.com.senac.sistema_gestao_absenteismo.solicitacao.dto.SolicitacaoCreateRequest;
import br.com.senac.sistema_gestao_absenteismo.solicitacao.dto.SolicitacaoRejeicaoRequest;
import br.com.senac.sistema_gestao_absenteismo.solicitacao.dto.SolicitacaoResponse;
import br.com.senac.sistema_gestao_absenteismo.solicitacao.model.StatusSolicitacao;
import br.com.senac.sistema_gestao_absenteismo.solicitacao.service.SolicitacaoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/solicitacoes")
@RequiredArgsConstructor
public class SolicitacaoController {

    private final SolicitacaoService solicitacaoService;

    @PostMapping
    public ResponseEntity<SolicitacaoResponse> criar(
        @AuthenticationPrincipal Jwt jwt,
        @Valid @RequestBody SolicitacaoCreateRequest request) {
        Long funcionarioId = extrairFuncionarioId(jwt);

        SolicitacaoResponse solicitacao = solicitacaoService.criar(funcionarioId,request);

        return ResponseEntity.created(URI.create("/api/solicitacoes/"+ solicitacao.id())).body(solicitacao);
    }

    private Long extrairFuncionarioId(Jwt jwt) {

        Object valor = jwt.getClaim("funcionarioId");

        if (valor instanceof Number numero) {
            return numero.longValue();
        }

        throw new IllegalArgumentException("O token não contém o identificador do funcionário");
    }

    @GetMapping("/minhas")
    public List<SolicitacaoResponse> listarMinhas(
            @AuthenticationPrincipal Jwt jwt
    ) {
        Long funcionarioId = extrairFuncionarioId(jwt);

        return solicitacaoService.listarMinhas(funcionarioId);
    }

    @GetMapping
    public List<SolicitacaoResponse> listarGerencial(@RequestParam(required = false)StatusSolicitacao status) {
        return solicitacaoService.listarGerencial(status);
    }

    @GetMapping("/{id}")
    public SolicitacaoResponse buscarPorIdGerencial(@PathVariable Long id) {
        return solicitacaoService.buscarPorIdGerencial(id);
    }

    @PatchMapping("/{id}/rejeitar")
    public SolicitacaoResponse rejeitar(@PathVariable Long id,
        @AuthenticationPrincipal Jwt jwt,
        @Valid @RequestBody SolicitacaoRejeicaoRequest request) {
        
            Long analisadorId = extrairFuncionarioId(jwt);

        return solicitacaoService.rejeitar(id,analisadorId,request);
    }

}