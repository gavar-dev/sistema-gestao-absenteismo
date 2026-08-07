package br.com.senac.sistema_gestao_absenteismo.solicitacao.service;

import br.com.senac.sistema_gestao_absenteismo.arquivo.dto.ArquivoArmazenado;
import br.com.senac.sistema_gestao_absenteismo.arquivo.dto.ArquivoDownload;
import br.com.senac.sistema_gestao_absenteismo.arquivo.service.ArmazenamentoArquivoService;
import br.com.senac.sistema_gestao_absenteismo.shared.exception.RecursoNaoEncontradoException;
import br.com.senac.sistema_gestao_absenteismo.solicitacao.dto.SolicitacaoCreateRequest;
import br.com.senac.sistema_gestao_absenteismo.solicitacao.dto.SolicitacaoResponse;
import br.com.senac.sistema_gestao_absenteismo.solicitacao.model.Solicitacao;
import br.com.senac.sistema_gestao_absenteismo.solicitacao.model.TipoSolicitacao;
import br.com.senac.sistema_gestao_absenteismo.solicitacao.repository.SolicitacaoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.Set;

@Service
@RequiredArgsConstructor
public class SolicitacaoArquivoService {

    private static final long TAMANHO_MAXIMO_ANEXO =
            5L * 1024 * 1024;

    private static final Set<String>
            TIPOS_ANEXO_PERMITIDOS =
            Set.of(
                    "application/pdf",
                    "image/jpeg",
                    "image/png"
            );

    private final ArmazenamentoArquivoService
            armazenamentoArquivoService;

    private final SolicitacaoRepository
            solicitacaoRepository;

    private final SolicitacaoService
            solicitacaoService;

    /*
     * Cria a solicitação dentro da mesma transação
     * usada para associar o arquivo.
     */
    @Transactional
    public SolicitacaoResponse criarComAnexo(
            Long funcionarioId,
            SolicitacaoCreateRequest request,
            MultipartFile anexo
    ) {
        validarTipoQuePermiteAnexo(
                request.tipo(),
                anexo
        );

        SolicitacaoResponse criada =
                solicitacaoService.criar(
                        funcionarioId,
                        request
                );

        if (
                anexo == null ||
                anexo.isEmpty()
        ) {
            return criada;
        }

        Solicitacao solicitacao =
                buscarSolicitacao(
                        criada.id()
                );

        String diretorio =
                "solicitacoes/"
                        + solicitacao.getId()
                        + "/anexo";

        ArquivoArmazenado arquivo =
                armazenamentoArquivoService.salvar(
                        anexo,
                        diretorio,
                        TIPOS_ANEXO_PERMITIDOS,
                        TAMANHO_MAXIMO_ANEXO
                );

        try {
            solicitacao.setNomeAnexo(
                    arquivo.nomeOriginal()
            );

            solicitacao.setAnexoNomeArmazenado(
                    arquivo.nomeArmazenado()
            );

            solicitacao.setAnexoContentType(
                    arquivo.contentType()
            );

            solicitacao.setAnexoTamanho(
                    arquivo.tamanho()
            );

            solicitacao.setAnexoCaminhoRelativo(
                    arquivo.caminhoRelativo()
            );

            Solicitacao salva =
                    solicitacaoRepository
                            .saveAndFlush(
                                    solicitacao
                            );

            return SolicitacaoResponse.from(
                    salva
            );

        } catch (RuntimeException exception) {
            armazenamentoArquivoService.excluir(
                    arquivo.caminhoRelativo()
            );

            throw exception;
        }
    }

    @Transactional(readOnly = true)
    public ArquivoDownload carregarAnexo(
            Long solicitacaoId
    ) {
        Solicitacao solicitacao =
                buscarSolicitacao(
                        solicitacaoId
                );

        if (
                solicitacao
                        .getAnexoCaminhoRelativo()
                        == null ||
                solicitacao
                        .getAnexoCaminhoRelativo()
                        .isBlank()
        ) {
            throw new RecursoNaoEncontradoException(
                    "A solicitação não possui anexo"
            );
        }

        return new ArquivoDownload(
                armazenamentoArquivoService
                        .carregar(
                                solicitacao
                                        .getAnexoCaminhoRelativo()
                        ),
                solicitacao.getNomeAnexo(),
                solicitacao.getAnexoContentType(),
                solicitacao.getAnexoTamanho()
        );
    }

    private void validarTipoQuePermiteAnexo(
            TipoSolicitacao tipo,
            MultipartFile anexo
    ) {
        if (
                anexo == null ||
                anexo.isEmpty()
        ) {
            return;
        }

        boolean permitido =
                tipo ==
                        TipoSolicitacao
                                .JUSTIFICATIVA_FALTA ||
                tipo ==
                        TipoSolicitacao
                                .CORRECAO_PONTO;

        if (!permitido) {
            throw new IllegalArgumentException(
                    "Anexos são permitidos somente em "
                            + "justificativas de falta ou "
                            + "correções de ponto"
            );
        }
    }

    private Solicitacao buscarSolicitacao(
            Long solicitacaoId
    ) {
        return solicitacaoRepository
                .findById(
                        solicitacaoId
                )
                .orElseThrow(
                        () ->
                                new RecursoNaoEncontradoException(
                                        "Solicitação não encontrada com o id "
                                                + solicitacaoId
                                )
                );
    }
}