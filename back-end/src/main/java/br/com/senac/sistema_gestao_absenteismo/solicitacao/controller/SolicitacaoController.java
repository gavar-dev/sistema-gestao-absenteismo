package br.com.senac.sistema_gestao_absenteismo.solicitacao.controller;

import br.com.senac.sistema_gestao_absenteismo.arquivo.dto.ArquivoDownload;
import br.com.senac.sistema_gestao_absenteismo.solicitacao.dto.SolicitacaoAprovacaoRequest;
import br.com.senac.sistema_gestao_absenteismo.solicitacao.dto.SolicitacaoCreateRequest;
import br.com.senac.sistema_gestao_absenteismo.solicitacao.dto.SolicitacaoRejeicaoRequest;
import br.com.senac.sistema_gestao_absenteismo.solicitacao.dto.SolicitacaoResponse;
import br.com.senac.sistema_gestao_absenteismo.solicitacao.model.StatusSolicitacao;
import br.com.senac.sistema_gestao_absenteismo.solicitacao.service.SolicitacaoArquivoService;
import br.com.senac.sistema_gestao_absenteismo.solicitacao.service.SolicitacaoService;
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
public class SolicitacaoController {

    private final SolicitacaoService
            solicitacaoService;

    private final SolicitacaoArquivoService
            solicitacaoArquivoService;

    /*
     * Mantido para solicitações sem arquivo,
     * como férias e correção cadastral.
     */
    @PostMapping(
            consumes =
                    MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<SolicitacaoResponse>
            criar(
                    @AuthenticationPrincipal
                    Jwt jwt,

                    @Valid
                    @RequestBody
                    SolicitacaoCreateRequest request
            ) {
        Long funcionarioId =
                extrairFuncionarioId(jwt);

        SolicitacaoResponse solicitacao =
                solicitacaoService.criar(
                        funcionarioId,
                        request
                );

        return respostaCriacao(
                solicitacao
        );
    }

    /*
     * Usado quando a solicitação pode carregar
     * um atestado ou outro comprovante.
     */
    @PostMapping(
            consumes =
                    MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<SolicitacaoResponse>
            criarComAnexo(
                    @AuthenticationPrincipal
                    Jwt jwt,

                    @Valid
                    @RequestPart("dados")
                    SolicitacaoCreateRequest request,

                    @RequestPart(
                            value = "anexo",
                            required = false
                    )
                    MultipartFile anexo
            ) {
        Long funcionarioId =
                extrairFuncionarioId(jwt);

        SolicitacaoResponse solicitacao =
                solicitacaoArquivoService
                        .criarComAnexo(
                                funcionarioId,
                                request,
                                anexo
                        );

        return respostaCriacao(
                solicitacao
        );
    }

    @GetMapping("/minhas")
    public List<SolicitacaoResponse>
            listarMinhas(
                    @AuthenticationPrincipal
                    Jwt jwt
            ) {
        Long funcionarioId =
                extrairFuncionarioId(jwt);

        return solicitacaoService
                .listarMinhas(
                        funcionarioId
                );
    }

    @GetMapping
    public List<SolicitacaoResponse>
            listarGerencial(
                    @RequestParam(required = false)
                    StatusSolicitacao status
            ) {
        return solicitacaoService
                .listarGerencial(
                        status
                );
    }

    @GetMapping("/{id}")
    public SolicitacaoResponse
            buscarPorIdGerencial(
                    @PathVariable
                    Long id
            ) {
        return solicitacaoService
                .buscarPorIdGerencial(
                        id
                );
    }

    @GetMapping(
            "/{id}/anexo/visualizar"
    )
    public ResponseEntity<Resource>
            visualizarAnexo(
                    @PathVariable
                    Long id
            ) {
        ArquivoDownload arquivo =
                solicitacaoArquivoService
                        .carregarAnexo(
                                id
                        );

        return montarRespostaArquivo(
                arquivo,
                false
        );
    }

    @GetMapping(
            "/{id}/anexo/download"
    )
    public ResponseEntity<Resource>
            baixarAnexo(
                    @PathVariable
                    Long id
            ) {
        ArquivoDownload arquivo =
                solicitacaoArquivoService
                        .carregarAnexo(
                                id
                        );

        return montarRespostaArquivo(
                arquivo,
                true
        );
    }

    @PatchMapping("/{id}/rejeitar")
    public SolicitacaoResponse rejeitar(
            @PathVariable
            Long id,

            @AuthenticationPrincipal
            Jwt jwt,

            @Valid
            @RequestBody
            SolicitacaoRejeicaoRequest request
    ) {
        Long analisadorId =
                extrairFuncionarioId(jwt);

        return solicitacaoService
                .rejeitar(
                        id,
                        analisadorId,
                        request
                );
    }

    @PatchMapping("/{id}/aprovar")
    public SolicitacaoResponse aprovar(
            @PathVariable
            Long id,

            @AuthenticationPrincipal
            Jwt jwt,

            @Valid
            @RequestBody
            SolicitacaoAprovacaoRequest request
    ) {
        Long analisadorId =
                extrairFuncionarioId(jwt);

        return solicitacaoService
                .aprovar(
                        id,
                        analisadorId,
                        request
                );
    }

    private ResponseEntity<SolicitacaoResponse>
            respostaCriacao(
                    SolicitacaoResponse solicitacao
            ) {
        return ResponseEntity
                .created(
                        URI.create(
                                "/api/solicitacoes/"
                                        + solicitacao.id()
                        )
                )
                .body(
                        solicitacao
                );
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
                .contentType(
                        mediaType
                )
                .contentLength(
                        arquivo.tamanho()
                )
                .header(
                        HttpHeaders
                                .CONTENT_DISPOSITION,
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
                jwt.getClaim(
                        "funcionarioId"
                );

        if (valor instanceof Number numero) {
            return numero.longValue();
        }

        throw new IllegalArgumentException(
                "O token não contém o identificador do funcionário"
        );
    }
}