package br.com.senac.sistema_gestao_absenteismo.solicitacao.controller;

import br.com.senac.sistema_gestao_absenteismo.arquivo.dto.ArquivoDownload;
import br.com.senac.sistema_gestao_absenteismo.shared.exception.ApiError;
import br.com.senac.sistema_gestao_absenteismo.solicitacao.dto.SolicitacaoAprovacaoRequest;
import br.com.senac.sistema_gestao_absenteismo.solicitacao.dto.SolicitacaoCreateRequest;
import br.com.senac.sistema_gestao_absenteismo.solicitacao.dto.SolicitacaoRejeicaoRequest;
import br.com.senac.sistema_gestao_absenteismo.solicitacao.dto.SolicitacaoResponse;
import br.com.senac.sistema_gestao_absenteismo.solicitacao.model.StatusSolicitacao;
import br.com.senac.sistema_gestao_absenteismo.solicitacao.service.SolicitacaoArquivoService;
import br.com.senac.sistema_gestao_absenteismo.solicitacao.service.SolicitacaoService;
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
import org.springframework.core.io.Resource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
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
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.util.List;

@RestController
@RequestMapping("/api/solicitacoes")
@RequiredArgsConstructor
@Tag(name = "Solicitações",
description = "Correção de ponto, justificativa de falta, férias, correção cadastral e anexos")
public class SolicitacaoController {

    private final SolicitacaoService solicitacaoService;
    private final SolicitacaoArquivoService solicitacaoArquivoService;

    @Operation(summary = "Criar solicitação sem anexo",
    description = "Cria uma solicitação usando JSON. Indicada para férias, correção cadastral ou pedidos sem comprovante.")
    @ApiResponses({
        @ApiResponse(responseCode = "201", description = "Solicitação criada",
        content = @Content(schema = @Schema(implementation = SolicitacaoResponse.class))),
        @ApiResponse(responseCode = "400", description = "Dados inválidos ou regra de negócio não atendida",
        content = @Content(schema = @Schema(implementation = ApiError.class)))
    })
    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<SolicitacaoResponse> criar(@AuthenticationPrincipal Jwt jwt,@Valid @RequestBody SolicitacaoCreateRequest request) {

        Long funcionarioId = extrairFuncionarioId(jwt);
        SolicitacaoResponse solicitacao = solicitacaoService.criar(funcionarioId, request);

        return respostaCriacao(solicitacao);
    }

    @Operation(summary = "Criar solicitação com anexo",
    description = "Cria uma solicitação por multipart/form-data. O campo 'dados' contém o JSON e 'anexo' recebe PDF, JPG ou PNG de até 5 MB.")
    @ApiResponses({
        @ApiResponse(responseCode = "201", description = "Solicitação criada com sucesso",
        content = @Content(schema = @Schema(implementation = SolicitacaoResponse.class))),
        @ApiResponse(responseCode = "400", description = "Dados, arquivo ou regra de negócio inválidos",
        content = @Content(schema = @Schema(implementation = ApiError.class)))
    })
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<SolicitacaoResponse> criarComAnexo(@AuthenticationPrincipal Jwt jwt,
        @Valid @RequestPart("dados") SolicitacaoCreateRequest request,
        @Parameter(description = "Comprovante em PDF, JPG ou PNG, com no máximo 5 MB")
        @RequestPart(value = "anexo", required = false) MultipartFile anexo) {

        Long funcionarioId = extrairFuncionarioId(jwt);
        SolicitacaoResponse solicitacao = solicitacaoArquivoService.criarComAnexo(funcionarioId, request, anexo);

        return respostaCriacao(solicitacao);
    }

    @Operation(summary = "Listar minhas solicitações",
    description = "Retorna somente as solicitações do funcionário autenticado.")
    @ApiResponse(responseCode = "200", description = "Solicitações encontradas",
    content = @Content(array = @ArraySchema(schema = @Schema(implementation = SolicitacaoResponse.class))))
    @GetMapping("/minhas")
    public List<SolicitacaoResponse> listarMinhas(@AuthenticationPrincipal Jwt jwt) {
        return solicitacaoService.listarMinhas(extrairFuncionarioId(jwt));
    }

    @Operation(summary = "Listar solicitações para gestão",
    description = "Lista todas as solicitações e permite filtrar por status. Disponível para RH e gestor.")
    @ApiResponse(responseCode = "200", description = "Solicitações encontradas",
    content = @Content(array = @ArraySchema(schema = @Schema(implementation = SolicitacaoResponse.class))))
    @GetMapping
    public List<SolicitacaoResponse> listarGerencial(@Parameter(description = "Status da solicitação", example = "PENDENTE") @RequestParam(required = false) StatusSolicitacao status) {
        return solicitacaoService.listarGerencial(status);
    }

    @Operation(summary = "Consultar solicitação por ID",
    description = "Consulta os detalhes de uma solicitação. Disponível para RH e gestor.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Solicitação encontrada",
        content = @Content(schema = @Schema(implementation = SolicitacaoResponse.class))),
        @ApiResponse(responseCode = "404", description = "Solicitação não encontrada",
        content = @Content(schema = @Schema(implementation = ApiError.class)))
    })
    @GetMapping("/{id}")
    public SolicitacaoResponse buscarPorIdGerencial(@Parameter(description = "ID da solicitação", example = "7") @PathVariable Long id) {
        return solicitacaoService.buscarPorIdGerencial(id);
    }

    @Operation(summary = "Visualizar anexo",
    description = "Retorna o anexo com Content-Disposition inline. Acesso restrito ao RH.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Anexo encontrado",
        content = @Content(mediaType = "application/octet-stream",
        schema = @Schema(type = "string", format = "binary"))),
        @ApiResponse(responseCode = "404", description = "Solicitação ou anexo não encontrado",
        content = @Content(schema = @Schema(implementation = ApiError.class)))
    })
    @GetMapping("/{id}/anexo/visualizar")
    public ResponseEntity<Resource> visualizarAnexo(@Parameter(description = "ID da solicitação", example = "7") @PathVariable Long id) {

        ArquivoDownload arquivo = solicitacaoArquivoService.carregarAnexo(id);
        return montarRespostaArquivo(arquivo, false);
    }

    @Operation(summary = "Baixar anexo",
    description = "Retorna o anexo com Content-Disposition attachment. Acesso restrito ao RH.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Anexo encontrado",
        content = @Content(mediaType = "application/octet-stream",
        schema = @Schema(type = "string", format = "binary"))),
        @ApiResponse(responseCode = "404", description = "Solicitação ou anexo não encontrado",
        content = @Content(schema = @Schema(implementation = ApiError.class)))
    })
    @GetMapping("/{id}/anexo/download")
    public ResponseEntity<Resource> baixarAnexo(@Parameter(description = "ID da solicitação", example = "7") @PathVariable Long id) {

        ArquivoDownload arquivo = solicitacaoArquivoService.carregarAnexo(id);
        return montarRespostaArquivo(arquivo, true);
    }

    @Operation(summary = "Rejeitar solicitação",
    description = "Rejeita uma solicitação pendente e registra o parecer do RH.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Solicitação rejeitada",
        content = @Content(schema = @Schema(implementation = SolicitacaoResponse.class))),
        @ApiResponse(responseCode = "400", description = "Solicitação não pode ser rejeitada ou observação inválida",
        content = @Content(schema = @Schema(implementation = ApiError.class))),
        @ApiResponse(responseCode = "404", description = "Solicitação não encontrada",
        content = @Content(schema = @Schema(implementation = ApiError.class)))
    })
    @PatchMapping("/{id}/rejeitar")
    public SolicitacaoResponse rejeitar(
        @Parameter(description = "ID da solicitação", example = "7")
        @PathVariable Long id,
        @AuthenticationPrincipal Jwt jwt,
        @Valid @RequestBody SolicitacaoRejeicaoRequest request) {

        return solicitacaoService.rejeitar(id,extrairFuncionarioId(jwt),request);
    }

    @Operation(summary = "Aprovar solicitação",
    description = "Aprova uma solicitação pendente e aplica os efeitos previstos pela regra de negócio.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Solicitação aprovada",
        content = @Content(schema = @Schema(implementation = SolicitacaoResponse.class))),
        @ApiResponse(responseCode = "400", description = "Solicitação não pode ser aprovada",
        content = @Content(schema = @Schema(implementation = ApiError.class))),
        @ApiResponse(responseCode = "404", description = "Solicitação não encontrada",
        content = @Content(schema = @Schema(implementation = ApiError.class)))
    })
    @PatchMapping("/{id}/aprovar")
    public SolicitacaoResponse aprovar(
        @Parameter(description = "ID da solicitação", example = "7")
        @PathVariable Long id,
        @AuthenticationPrincipal Jwt jwt,
        @Valid @RequestBody SolicitacaoAprovacaoRequest request) {

        return solicitacaoService.aprovar(id,extrairFuncionarioId(jwt),request);
    }

    private ResponseEntity<SolicitacaoResponse> respostaCriacao(SolicitacaoResponse solicitacao) {
        return ResponseEntity.created(URI.create("/api/solicitacoes/" + solicitacao.id())).body(solicitacao);
    }

    private ResponseEntity<Resource> montarRespostaArquivo(ArquivoDownload arquivo,boolean baixar) {

        MediaType mediaType = MediaType.parseMediaType(arquivo.contentType());

        ContentDisposition disposicao = baixar ? ContentDisposition.attachment()
        .filename(arquivo.nomeOriginal(), StandardCharsets.UTF_8).build() : ContentDisposition.inline()
        .filename(arquivo.nomeOriginal(), StandardCharsets.UTF_8).build();

        return ResponseEntity.ok().contentType(mediaType).contentLength(arquivo.tamanho())
        .header(HttpHeaders.CONTENT_DISPOSITION, disposicao.toString()).body(arquivo.recurso());
    }

    private Long extrairFuncionarioId(Jwt jwt) {

        Object valor = jwt.getClaim("funcionarioId");

        if (valor instanceof Number numero) {
            return numero.longValue();
        }

        throw new IllegalArgumentException("O token não contém o identificador do funcionário");
    }
}
