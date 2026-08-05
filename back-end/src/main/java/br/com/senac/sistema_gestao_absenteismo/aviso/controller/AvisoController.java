package br.com.senac.sistema_gestao_absenteismo.aviso.controller;

import br.com.senac.sistema_gestao_absenteismo.aviso.dto.AvisoRequest;
import br.com.senac.sistema_gestao_absenteismo.aviso.dto.AvisoResponse;
import br.com.senac.sistema_gestao_absenteismo.aviso.service.AvisoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/avisos")
@RequiredArgsConstructor
public class AvisoController {

    private final AvisoService avisoService;

    @PostMapping
    public ResponseEntity<AvisoResponse> criar(@AuthenticationPrincipal Jwt jwt,@Valid @RequestBody AvisoRequest request) {

        Long criadorId = extrairFuncionarioId(jwt);

        AvisoResponse aviso = avisoService.criar(criadorId,request);

        return ResponseEntity.created(URI.create("/api/avisos/" + aviso.id())).body(aviso);

    }

    @GetMapping
    public List<AvisoResponse> listarGerencial(@RequestParam(required = false)Boolean ativo) {
        return avisoService.listarGerencial(ativo);
    }

    @GetMapping("/meus")
    public List<AvisoResponse> listarMeus(@AuthenticationPrincipal Jwt jwt) {

        Long funcionarioId = extrairFuncionarioId(jwt);

        return avisoService.listarMeus(funcionarioId);

    }

    @GetMapping("/{id}")
    public AvisoResponse buscarPorId(@PathVariable Long id) {

        return avisoService.buscarPorIdGerencial(id);
    }

    @PutMapping("/{id}")
    public AvisoResponse atualizar(@PathVariable Long id,@Valid @RequestBody AvisoRequest request) {

        return avisoService.atualizar(id,request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void excluir(@PathVariable Long id) {
        avisoService.excluir(id);
    }

    private Long extrairFuncionarioId(Jwt jwt) {

        Object valor = jwt.getClaim("funcionarioId");

        if (valor instanceof Number numero) {
            return numero.longValue();
        }

        throw new IllegalArgumentException("O token não contém o identificador do funcionário");
    }
}
