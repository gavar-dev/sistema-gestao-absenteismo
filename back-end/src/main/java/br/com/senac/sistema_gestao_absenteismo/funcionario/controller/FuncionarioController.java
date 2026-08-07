package br.com.senac.sistema_gestao_absenteismo.funcionario.controller;

import br.com.senac.sistema_gestao_absenteismo.arquivo.dto.ArquivoDownload;
import br.com.senac.sistema_gestao_absenteismo.arquivo.service.FuncionarioArquivoService;
import br.com.senac.sistema_gestao_absenteismo.funcionario.documento.dto.FuncionarioDocumentoResponse;
import br.com.senac.sistema_gestao_absenteismo.funcionario.dto.FuncionarioCreateRequest;
import br.com.senac.sistema_gestao_absenteismo.funcionario.dto.FuncionarioResponse;
import br.com.senac.sistema_gestao_absenteismo.funcionario.dto.FuncionarioStatusRequest;
import br.com.senac.sistema_gestao_absenteismo.funcionario.dto.FuncionarioUpdateRequest;
import br.com.senac.sistema_gestao_absenteismo.funcionario.model.StatusFuncionario;
import br.com.senac.sistema_gestao_absenteismo.funcionario.service.FuncionarioService;
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
public class FuncionarioController {

    private final FuncionarioService funcionarioService;
    private final FuncionarioArquivoService funcionarioArquivoService;

    @PostMapping(
            consumes = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<FuncionarioResponse> criar(
            @Valid
            @RequestBody
            FuncionarioCreateRequest request
    ) {
        FuncionarioResponse funcionario =
                funcionarioService.criar(request);

        return ResponseEntity
                .created(
                        URI.create(
                                "/api/funcionarios/"
                                        + funcionario.id()
                        )
                )
                .body(funcionario);
    }

    @PostMapping(
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<FuncionarioResponse>
            criarComArquivos(
                    @Valid
                    @RequestPart("dados")
                    FuncionarioCreateRequest request,

                    @RequestPart(
                            value = "foto",
                            required = false
                    )
                    MultipartFile foto,

                    @RequestPart(
                            value = "documentos",
                            required = false
                    )
                    List<MultipartFile> documentos
            ) {
        FuncionarioResponse funcionario =
                funcionarioService.criar(
                        request,
                        foto,
                        documentos == null
                                ? List.of()
                                : documentos
                );

        return ResponseEntity
                .created(
                        URI.create(
                                "/api/funcionarios/"
                                        + funcionario.id()
                        )
                )
                .body(funcionario);
    }

    @GetMapping
    public List<FuncionarioResponse> listar(
            @RequestParam(required = false)
            String status
    ) {
        StatusFuncionario statusConvertido =
                status == null
                        ? null
                        : StatusFuncionario.fromValue(
                                status
                        );

        return funcionarioService.listar(
                statusConvertido
        );
    }

    @GetMapping("/me")
    public FuncionarioResponse buscarUsuarioLogado(
            @AuthenticationPrincipal
            Jwt jwt
    ) {
        Long funcionarioId =
                extrairFuncionarioId(jwt);

        return funcionarioService.buscarPorId(
                funcionarioId
        );
    }

    @GetMapping("/{id}")
    public FuncionarioResponse buscarPorId(
            @PathVariable
            Long id
    ) {
        return funcionarioService.buscarPorId(id);
    }

    @GetMapping("/{id}/foto")
    public ResponseEntity<Resource> carregarFoto(
            @PathVariable
            Long id
    ) {
        ArquivoDownload arquivo =
                funcionarioArquivoService
                        .carregarFoto(id);

        return montarRespostaArquivo(
                arquivo,
                false
        );
    }

    @GetMapping("/{id}/documentos")
    public List<FuncionarioDocumentoResponse>
            listarDocumentos(
                    @PathVariable
                    Long id
            ) {
        return funcionarioArquivoService
                .listarDocumentos(id);
    }

    @GetMapping(
            "/{id}/documentos/{documentoId}"
    )
    public ResponseEntity<Resource>
            carregarDocumento(
                    @PathVariable
                    Long id,

                    @PathVariable
                    Long documentoId
            ) {
        ArquivoDownload arquivo =
                funcionarioArquivoService
                        .carregarDocumento(
                                id,
                                documentoId
                        );

        return montarRespostaArquivo(
                arquivo,
                true
        );
    }

    @DeleteMapping(
            "/{id}/documentos/{documentoId}"
    )
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void excluirDocumento(
            @PathVariable
            Long id,

            @PathVariable
            Long documentoId
    ) {
        funcionarioArquivoService
                .excluirDocumento(
                        id,
                        documentoId
                );
    }

    @PutMapping("/{id}")
    public FuncionarioResponse atualizar(
            @PathVariable
            Long id,

            @Valid
            @RequestBody
            FuncionarioUpdateRequest request
    ) {
        return funcionarioService.atualizar(
                id,
                request
        );
    }

    @PatchMapping("/{id}/status")
    public FuncionarioResponse alterarStatus(
            @PathVariable
            Long id,

            @Valid
            @RequestBody
            FuncionarioStatusRequest request
    ) {
        return funcionarioService.alterarStatus(
                id,
                request.status()
        );
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void desativar(
            @PathVariable
            Long id
    ) {
        funcionarioService.desativar(id);
    }

    private ResponseEntity<Resource>
            montarRespostaArquivo(
                    ArquivoDownload arquivo,
                    boolean baixar
            ) {
        MediaType mediaType =
                MediaType.parseMediaType(
                        arquivo.contentType()
                );

        ContentDisposition disposicao =
                baixar
                        ? ContentDisposition
                                .attachment()
                                .filename(
                                        arquivo.nomeOriginal(),
                                        StandardCharsets.UTF_8
                                )
                                .build()
                        : ContentDisposition
                                .inline()
                                .filename(
                                        arquivo.nomeOriginal(),
                                        StandardCharsets.UTF_8
                                )
                                .build();

        return ResponseEntity.ok()
                .contentType(mediaType)
                .contentLength(
                        arquivo.tamanho()
                )
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        disposicao.toString()
                )
                .body(
                        arquivo.recurso()
                );
    }

    private Long extrairFuncionarioId(
            Jwt jwt
    ) {
        Object valor =
                jwt.getClaim("funcionarioId");

        if (valor instanceof Number numero) {
            return numero.longValue();
        }

        throw new IllegalArgumentException(
                "O token não contém o identificador do funcionário"
        );
    }
}