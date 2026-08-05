package br.com.senac.sistema_gestao_absenteismo.funcionario.controller;

import br.com.senac.sistema_gestao_absenteismo.funcionario.dto.FuncionarioCreateRequest;
import br.com.senac.sistema_gestao_absenteismo.funcionario.dto.FuncionarioResponse;
import br.com.senac.sistema_gestao_absenteismo.funcionario.dto.FuncionarioStatusRequest;
import br.com.senac.sistema_gestao_absenteismo.funcionario.dto.FuncionarioUpdateRequest;
import br.com.senac.sistema_gestao_absenteismo.funcionario.model.StatusFuncionario;
import br.com.senac.sistema_gestao_absenteismo.funcionario.service.FuncionarioService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
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
@RequestMapping("/api/funcionarios")
@RequiredArgsConstructor
public class FuncionarioController {

    private final FuncionarioService funcionarioService;

    private Long extrairFuncionarioId(Jwt jwt) {
        Object valor = jwt.getClaim("funcionarioId");

        if (valor instanceof Number numero) {
            return numero.longValue();
        }

        throw new IllegalArgumentException("O token não contém o identificador do funcionário");
    }

    @PostMapping
    ResponseEntity<FuncionarioResponse> criar(@Valid @RequestBody FuncionarioCreateRequest request) {
        FuncionarioResponse funcionario = funcionarioService.criar(request);
        return ResponseEntity
                .created(URI.create("/api/funcionarios/" + funcionario.id()))
                .body(funcionario);
    }

    @GetMapping
    List<FuncionarioResponse> listar(
            @RequestParam(required = false) String status
    ) {
        StatusFuncionario statusConvertido = status == null
                ? null
                : StatusFuncionario.fromValue(status);
        return funcionarioService.listar(statusConvertido);
    }

    @GetMapping("/{id}")
    FuncionarioResponse buscarPorId(@PathVariable Long id) {
        return funcionarioService.buscarPorId(id);
    }

    @PutMapping("/{id}")
    FuncionarioResponse atualizar(
            @PathVariable Long id,
            @Valid @RequestBody FuncionarioUpdateRequest request
    ) {
        return funcionarioService.atualizar(id, request);
    }

    @PatchMapping("/{id}/status")
    FuncionarioResponse alterarStatus(
            @PathVariable Long id,
            @Valid @RequestBody FuncionarioStatusRequest request
    ) {
        return funcionarioService.alterarStatus(id, request.status());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    void desativar(@PathVariable Long id) {
        funcionarioService.desativar(id);
    }

    @GetMapping("/me")
    FuncionarioResponse buscarUsuarioLogado(@AuthenticationPrincipal Jwt jwt) {

        Long funcionarioId = extrairFuncionarioId(jwt);

        return funcionarioService.buscarPorId(funcionarioId);
    }
}
