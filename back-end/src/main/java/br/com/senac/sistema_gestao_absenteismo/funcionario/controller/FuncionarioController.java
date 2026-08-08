package br.com.senac.sistema_gestao_absenteismo.funcionario.controller;

import br.com.senac.sistema_gestao_absenteismo.arquivo.dto.ArquivoDownload;
import br.com.senac.sistema_gestao_absenteismo.arquivo.service.FuncionarioArquivoService;
import br.com.senac.sistema_gestao_absenteismo.funcionario.dto.FuncionarioCreateRequest;
import br.com.senac.sistema_gestao_absenteismo.funcionario.dto.FuncionarioResponse;
import br.com.senac.sistema_gestao_absenteismo.funcionario.dto.FuncionarioStatusRequest;
import br.com.senac.sistema_gestao_absenteismo.funcionario.dto.FuncionarioUpdateRequest;
import br.com.senac.sistema_gestao_absenteismo.funcionario.model.StatusFuncionario;
import br.com.senac.sistema_gestao_absenteismo.funcionario.service.FuncionarioService;
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
import org.springframework.core.io.Resource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
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
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.util.List;

@RestController
@RequestMapping("/api/funcionarios")
@RequiredArgsConstructor
@Tag(name = "Funcionários", description = "Cadastro, consulta, atualização, status e foto dos funcionários")
public class FuncionarioController {

        private final FuncionarioService funcionarioService;
        private final FuncionarioArquivoService funcionarioArquivoService;

        @Operation(summary = "Cadastrar funcionário", description = "Cadastra um funcionário usando JSON. Operação restrita ao RH.")
        @ApiResponses({
                @ApiResponse(responseCode = "201", description = "Funcionário cadastrado com sucesso", content = @Content(schema = @Schema(implementation = FuncionarioResponse.class))),
                @ApiResponse(responseCode = "400", description = "Dados inválidos", content = @Content(schema = @Schema(implementation = ApiError.class))),
                @ApiResponse(responseCode = "409", description = "Conflito com dados já cadastrados", content = @Content(schema = @Schema(implementation = ApiError.class)))
        })
        @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
        public ResponseEntity<FuncionarioResponse> criar(@Valid @RequestBody FuncionarioCreateRequest request) {
                return respostaCriacao(funcionarioService.criar(request));
        }

        @Operation(summary = "Cadastrar funcionário com foto", description = "Cadastra um funcionário por multipart/form-data. O campo 'dados' contém o JSON e 'foto' é opcional. Operação restrita ao RH.")
        @ApiResponses({
                @ApiResponse(responseCode = "201", description = "Funcionário cadastrado com sucesso", content = @Content(schema = @Schema(implementation = FuncionarioResponse.class))),
                @ApiResponse(responseCode = "400", description = "Dados ou arquivo inválidos", content = @Content(schema = @Schema(implementation = ApiError.class))),
                @ApiResponse(responseCode = "409", description = "Conflito com dados já cadastrados", content = @Content(schema = @Schema(implementation = ApiError.class)))
        })
        @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
        public ResponseEntity<FuncionarioResponse> criarComFoto(@Valid @RequestPart("dados") FuncionarioCreateRequest request,@Parameter(description = "Foto do funcionário") @RequestPart(value = "foto", required = false) MultipartFile foto) {
                return respostaCriacao(funcionarioService.criar(request, foto));
        }

        @Operation(summary = "Listar funcionários", description = "Lista funcionários e permite filtrar pelo status. Disponível para RH e gestor.")
        @ApiResponse(responseCode = "200", description = "Funcionários encontrados", content = @Content(array = @ArraySchema(schema = @Schema(implementation = FuncionarioResponse.class))))
        @GetMapping
        public List<FuncionarioResponse> listar(@Parameter(description = "Status do funcionário", example = "ATIVO") @RequestParam(required = false) String status) {
                StatusFuncionario statusConvertido = status == null ? null : StatusFuncionario.fromValue(status);
                return funcionarioService.listar(statusConvertido);
        }

        @Operation(summary = "Consultar meu perfil", description = "Retorna os dados do funcionário autenticado a partir do JWT.")
        @ApiResponses({
                @ApiResponse(responseCode = "200", description = "Perfil encontrado", content = @Content(schema = @Schema(implementation = FuncionarioResponse.class))),
                @ApiResponse(responseCode = "401", description = "Usuário não autenticado")
        })
        @GetMapping("/me")
        public FuncionarioResponse buscarUsuarioLogado(@AuthenticationPrincipal Jwt jwt) {
                return funcionarioService.buscarPorId(extrairFuncionarioId(jwt));
        }

        @Operation(summary = "Consultar funcionário por ID", description = "Retorna os dados de um funcionário específico. Disponível para RH e gestor.")
        @ApiResponses({
                @ApiResponse(responseCode = "200", description = "Funcionário encontrado", content = @Content(schema = @Schema(implementation = FuncionarioResponse.class))),
                @ApiResponse(responseCode = "404", description = "Funcionário não encontrado", content = @Content(schema = @Schema(implementation = ApiError.class)))
        })
        @GetMapping("/{id}")
        public FuncionarioResponse buscarPorId(@Parameter(description = "ID do funcionário", example = "2") @PathVariable Long id) {
                return funcionarioService.buscarPorId(id);
        }

        @Operation(summary = "Visualizar foto do funcionário", description = "Retorna a foto cadastrada do funcionário como conteúdo binário.")
        @ApiResponses({
                @ApiResponse(responseCode = "200", description = "Foto encontrada", content = @Content(mediaType = "application/octet-stream", schema = @Schema(type = "string", format = "binary"))),
                @ApiResponse(responseCode = "404", description = "Foto ou funcionário não encontrado", content = @Content(schema = @Schema(implementation = ApiError.class)))
        })
        @GetMapping("/{id}/foto")
        public ResponseEntity<Resource> carregarFoto(@Parameter(description = "ID do funcionário", example = "2") @PathVariable Long id) {
                return montarRespostaFoto(funcionarioArquivoService.carregarFoto(id));
        }

        @Operation(summary = "Atualizar funcionário", description = "Atualiza os dados cadastrais do funcionário. Operação restrita ao RH.")
        @ApiResponses({
                @ApiResponse(responseCode = "200", description = "Funcionário atualizado", content = @Content(schema = @Schema(implementation = FuncionarioResponse.class))),
                @ApiResponse(responseCode = "400", description = "Dados inválidos", content = @Content(schema = @Schema(implementation = ApiError.class))),
                @ApiResponse(responseCode = "404", description = "Funcionário não encontrado", content = @Content(schema = @Schema(implementation = ApiError.class))),
                @ApiResponse(responseCode = "409", description = "Conflito com dados já existentes", content = @Content(schema = @Schema(implementation = ApiError.class)))
        })
        @PutMapping("/{id}")
        public FuncionarioResponse atualizar(@Parameter(description = "ID do funcionário", example = "2") @PathVariable Long id,@Valid @RequestBody FuncionarioUpdateRequest request) {
                return funcionarioService.atualizar(id, request);
        }

        @Operation(summary = "Alterar status do funcionário", description = "Altera o status de acesso do funcionário. Operação restrita ao RH.")
        @ApiResponses({
                @ApiResponse(responseCode = "200", description = "Status alterado", content = @Content(schema = @Schema(implementation = FuncionarioResponse.class))),
                @ApiResponse(responseCode = "400", description = "Status inválido", content = @Content(schema = @Schema(implementation = ApiError.class))),
                @ApiResponse(responseCode = "404", description = "Funcionário não encontrado", content = @Content(schema = @Schema(implementation = ApiError.class)))
        })
        @PatchMapping("/{id}/status")
        public FuncionarioResponse alterarStatus(@Parameter(description = "ID do funcionário", example = "2") @PathVariable Long id,@Valid @RequestBody FuncionarioStatusRequest request) {
                return funcionarioService.alterarStatus(id, request.status());
        }

        @Operation(summary = "Desativar funcionário", description = "Desativa o funcionário informado. Operação restrita ao RH.")
        @ApiResponses({
                @ApiResponse(responseCode = "204", description = "Funcionário desativado"),
                @ApiResponse(responseCode = "404", description = "Funcionário não encontrado", content = @Content(schema = @Schema(implementation = ApiError.class)))
        })
        @DeleteMapping("/{id}")
        @ResponseStatus(HttpStatus.NO_CONTENT)
        public void desativar(@Parameter(description = "ID do funcionário", example = "2") @PathVariable Long id) {
                funcionarioService.desativar(id);
        }

        private ResponseEntity<FuncionarioResponse> respostaCriacao(FuncionarioResponse funcionario) {
                return ResponseEntity.created(URI.create("/api/funcionarios/" + funcionario.id())).body(funcionario);
        }

        private ResponseEntity<Resource> montarRespostaFoto(ArquivoDownload arquivo) {
                MediaType mediaType = MediaType.parseMediaType(arquivo.contentType());

                ContentDisposition disposicao = ContentDisposition.inline().filename(arquivo.nomeOriginal(), StandardCharsets.UTF_8).build();

                return ResponseEntity.ok()
                .contentType(mediaType).contentLength(arquivo.tamanho())
                .header(HttpHeaders.CONTENT_DISPOSITION,disposicao.toString()).body(arquivo.recurso());
        }

        private Long extrairFuncionarioId(Jwt jwt) {
                Object valor = jwt.getClaim("funcionarioId");

                if (valor instanceof Number numero) {
                        return numero.longValue();
                }

                throw new IllegalArgumentException("O token não contém o identificador do funcionário");
        }
}
