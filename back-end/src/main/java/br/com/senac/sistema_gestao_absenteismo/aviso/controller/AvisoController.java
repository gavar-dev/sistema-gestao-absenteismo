package br.com.senac.sistema_gestao_absenteismo.aviso.controller;

import br.com.senac.sistema_gestao_absenteismo.aviso.dto.AvisoRequest;
import br.com.senac.sistema_gestao_absenteismo.aviso.dto.AvisoResponse;
import br.com.senac.sistema_gestao_absenteismo.aviso.service.AvisoService;
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
@RequestMapping("/api/avisos")
@RequiredArgsConstructor
@Tag(name = "Avisos", description = "Publicação e consulta de avisos internos")
public class AvisoController {

    private final AvisoService avisoService;

    @Operation(summary = "Criar aviso", description = "Cria um novo aviso interno. Operação restrita ao RH.")
    @ApiResponses({
        @ApiResponse(responseCode = "201", description = "Aviso criado", content = @Content(schema = @Schema(implementation = AvisoResponse.class))),
        @ApiResponse(responseCode = "400", description = "Dados inválidos", content = @Content(schema = @Schema(implementation = ApiError.class)))
    })
    @PostMapping
    public ResponseEntity<AvisoResponse> criar(@AuthenticationPrincipal Jwt jwt,@Valid @RequestBody AvisoRequest request) {

        Long criadorId = extrairFuncionarioId(jwt);
        AvisoResponse aviso = avisoService.criar(criadorId, request);

        return ResponseEntity.created(URI.create("/api/avisos/" + aviso.id())).body(aviso);
    }

    @Operation(summary = "Listar avisos para gestão", description = "Lista avisos e permite filtrar pelo status ativo. Disponível para RH e gestor.")
    @ApiResponse(responseCode = "200", description = "Avisos encontrados", content = @Content(array = @ArraySchema(schema = @Schema(implementation = AvisoResponse.class))))
    @GetMapping
    public List<AvisoResponse> listarGerencial(@Parameter(description = "Filtra avisos ativos ou inativos", example = "true") @RequestParam(required = false) Boolean ativo) {
        return avisoService.listarGerencial(ativo);
    }

    @Operation(summary = "Listar meus avisos", description = "Retorna os avisos disponíveis para o funcionário autenticado.")
    @ApiResponse(responseCode = "200", description = "Avisos do funcionário", content = @Content(array = @ArraySchema(schema = @Schema(implementation = AvisoResponse.class))))
    @GetMapping("/meus")
    public List<AvisoResponse> listarMeus(@AuthenticationPrincipal Jwt jwt) {
        return avisoService.listarMeus(extrairFuncionarioId(jwt));
    }

    @Operation(summary = "Consultar aviso por ID", description = "Consulta os detalhes de um aviso. Disponível para RH e gestor.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Aviso encontrado", content = @Content(schema = @Schema(implementation = AvisoResponse.class))),
        @ApiResponse(responseCode = "404", description = "Aviso não encontrado", content = @Content(schema = @Schema(implementation = ApiError.class)))
    })
    @GetMapping("/{id}")
    public AvisoResponse buscarPorId(@Parameter(description = "ID do aviso", example = "1") @PathVariable Long id) {        
        return avisoService.buscarPorIdGerencial(id);
    }

    @Operation(summary = "Atualizar aviso", description = "Atualiza um aviso existente. Operação restrita ao RH.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Aviso atualizado", content = @Content(schema = @Schema(implementation = AvisoResponse.class))),
        @ApiResponse(responseCode = "400", description = "Dados inválidos", content = @Content(schema = @Schema(implementation = ApiError.class))),
        @ApiResponse(responseCode = "404", description = "Aviso não encontrado", content = @Content(schema = @Schema(implementation = ApiError.class)))
    })
    @PutMapping("/{id}")
    public AvisoResponse atualizar(    @Parameter(description = "ID do aviso", example = "1") @PathVariable Long id,@Valid @RequestBody AvisoRequest request) {
        return avisoService.atualizar(id, request);
    }

    @Operation(summary = "Fixar/desafixar aviso", description = "Alterna se o aviso fica fixado no topo da lista para todos. Operação restrita ao RH.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Aviso atualizado", content = @Content(schema = @Schema(implementation = AvisoResponse.class))),
        @ApiResponse(responseCode = "404", description = "Aviso não encontrado", content = @Content(schema = @Schema(implementation = ApiError.class)))
    })
    @PatchMapping("/{id}/fixar")
    public AvisoResponse alternarFixado(@Parameter(description = "ID do aviso", example = "1") @PathVariable Long id) {
        return avisoService.alternarFixado(id);
    }

    @Operation(summary = "Excluir aviso", description = "Remove um aviso. Operação restrita ao RH.")
    @ApiResponses({
        @ApiResponse(responseCode = "204", description = "Aviso excluído"),
        @ApiResponse(responseCode = "404", description = "Aviso não encontrado", content = @Content(schema = @Schema(implementation = ApiError.class)))
    })
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void excluir(@Parameter(description = "ID do aviso", example = "1") @PathVariable Long id) {        
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