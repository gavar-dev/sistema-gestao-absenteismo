package br.com.senac.sistema_gestao_absenteismo.arquivo.service;

import br.com.senac.sistema_gestao_absenteismo.arquivo.dto.ArquivoArmazenado;
import br.com.senac.sistema_gestao_absenteismo.arquivo.dto.ArquivoDownload;
import br.com.senac.sistema_gestao_absenteismo.funcionario.documento.dto.FuncionarioDocumentoResponse;
import br.com.senac.sistema_gestao_absenteismo.funcionario.documento.model.FuncionarioDocumento;
import br.com.senac.sistema_gestao_absenteismo.funcionario.documento.repository.FuncionarioDocumentoRepository;
import br.com.senac.sistema_gestao_absenteismo.funcionario.model.Funcionario;
import br.com.senac.sistema_gestao_absenteismo.funcionario.repository.FuncionarioRepository;
import br.com.senac.sistema_gestao_absenteismo.shared.exception.RecursoNaoEncontradoException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class FuncionarioArquivoService {

    private static final long TAMANHO_MAXIMO_FOTO =
            2L * 1024 * 1024;

    private static final long TAMANHO_MAXIMO_DOCUMENTO =
            5L * 1024 * 1024;

    private static final int LIMITE_DOCUMENTOS = 10;

    private static final Set<String> TIPOS_FOTO_PERMITIDOS =
            Set.of(
                    "image/jpeg",
                    "image/png"
            );

    private static final Set<String> TIPOS_DOCUMENTO_PERMITIDOS =
            Set.of(
                    "application/pdf",
                    "image/jpeg",
                    "image/png"
            );

    private final ArmazenamentoArquivoService
            armazenamentoArquivoService;

    private final FuncionarioDocumentoRepository
            funcionarioDocumentoRepository;

    private final FuncionarioRepository
            funcionarioRepository;

    public void salvarFoto(
            Funcionario funcionario,
            MultipartFile foto
    ) {
        if (
                foto == null ||
                foto.isEmpty()
        ) {
            return;
        }

        String diretorio =
                "funcionarios/"
                        + funcionario.getId()
                        + "/foto";

        ArquivoArmazenado arquivoArmazenado =
                armazenamentoArquivoService.salvar(
                        foto,
                        diretorio,
                        TIPOS_FOTO_PERMITIDOS,
                        TAMANHO_MAXIMO_FOTO
                );

        String fotoAnterior =
                funcionario.getFotoCaminhoRelativo();

        funcionario.setFotoNomeOriginal(
                arquivoArmazenado.nomeOriginal()
        );

        funcionario.setFotoNomeArmazenado(
                arquivoArmazenado.nomeArmazenado()
        );

        funcionario.setFotoContentType(
                arquivoArmazenado.contentType()
        );

        funcionario.setFotoTamanho(
                arquivoArmazenado.tamanho()
        );

        funcionario.setFotoCaminhoRelativo(
                arquivoArmazenado.caminhoRelativo()
        );

        if (
                fotoAnterior != null &&
                !fotoAnterior.isBlank()
        ) {
            armazenamentoArquivoService.excluir(
                    fotoAnterior
            );
        }
    }

    @Transactional
    public List<FuncionarioDocumento> salvarDocumentos(
            Funcionario funcionario,
            List<MultipartFile> documentos
    ) {
        if (
                documentos == null ||
                documentos.isEmpty()
        ) {
            return List.of();
        }

        List<MultipartFile> documentosValidos =
                documentos.stream()
                        .filter(
                                documento ->
                                        documento != null &&
                                        !documento.isEmpty()
                        )
                        .toList();

        if (documentosValidos.isEmpty()) {
            return List.of();
        }

        long quantidadeAtual =
                funcionarioDocumentoRepository
                        .countByFuncionarioId(
                                funcionario.getId()
                        );

        if (
                quantidadeAtual +
                documentosValidos.size() >
                LIMITE_DOCUMENTOS
        ) {
            throw new IllegalArgumentException(
                    "O funcionário pode possuir no máximo "
                            + LIMITE_DOCUMENTOS
                            + " documentos"
            );
        }

        String diretorio =
                "funcionarios/"
                        + funcionario.getId()
                        + "/documentos";

        List<FuncionarioDocumento> documentosParaSalvar =
                new ArrayList<>();

        List<String> arquivosCriados =
                new ArrayList<>();

        try {
            for (
                    MultipartFile documento :
                    documentosValidos
            ) {
                ArquivoArmazenado arquivoArmazenado =
                        armazenamentoArquivoService.salvar(
                                documento,
                                diretorio,
                                TIPOS_DOCUMENTO_PERMITIDOS,
                                TAMANHO_MAXIMO_DOCUMENTO
                        );

                arquivosCriados.add(
                        arquivoArmazenado.caminhoRelativo()
                );

                FuncionarioDocumento funcionarioDocumento =
                        FuncionarioDocumento.builder()
                                .funcionario(funcionario)
                                .nomeOriginal(
                                        arquivoArmazenado
                                                .nomeOriginal()
                                )
                                .nomeArmazenado(
                                        arquivoArmazenado
                                                .nomeArmazenado()
                                )
                                .contentType(
                                        arquivoArmazenado
                                                .contentType()
                                )
                                .tamanho(
                                        arquivoArmazenado
                                                .tamanho()
                                )
                                .caminhoRelativo(
                                        arquivoArmazenado
                                                .caminhoRelativo()
                                )
                                .build();

                documentosParaSalvar.add(
                        funcionarioDocumento
                );
            }

            return funcionarioDocumentoRepository
                    .saveAll(documentosParaSalvar);

        } catch (RuntimeException exception) {
            for (String caminho : arquivosCriados) {
                armazenamentoArquivoService.excluir(
                        caminho
                );
            }

            throw exception;
        }
    }

    @Transactional(readOnly = true)
    public ArquivoDownload carregarFoto(
            Long funcionarioId
    ) {
        Funcionario funcionario =
                buscarFuncionario(funcionarioId);

        if (
                funcionario.getFotoCaminhoRelativo() == null ||
                funcionario.getFotoCaminhoRelativo().isBlank()
        ) {
            throw new RecursoNaoEncontradoException(
                    "O funcionário não possui foto cadastrada"
            );
        }

        return new ArquivoDownload(
                armazenamentoArquivoService.carregar(
                        funcionario.getFotoCaminhoRelativo()
                ),
                funcionario.getFotoNomeOriginal(),
                funcionario.getFotoContentType(),
                funcionario.getFotoTamanho()
        );
    }

    @Transactional(readOnly = true)
    public List<FuncionarioDocumentoResponse>
            listarDocumentos(
                    Long funcionarioId
            ) {
        buscarFuncionario(funcionarioId);

        return funcionarioDocumentoRepository
                .findByFuncionarioIdOrderByCriadoEmDesc(
                        funcionarioId
                )
                .stream()
                .map(
                        FuncionarioDocumentoResponse::from
                )
                .toList();
    }

    @Transactional(readOnly = true)
    public ArquivoDownload carregarDocumento(
            Long funcionarioId,
            Long documentoId
    ) {
        FuncionarioDocumento documento =
                buscarDocumento(
                        funcionarioId,
                        documentoId
                );

        return new ArquivoDownload(
                armazenamentoArquivoService.carregar(
                        documento.getCaminhoRelativo()
                ),
                documento.getNomeOriginal(),
                documento.getContentType(),
                documento.getTamanho()
        );
    }

    @Transactional
    public void excluirDocumento(
            Long funcionarioId,
            Long documentoId
    ) {
        FuncionarioDocumento documento =
                buscarDocumento(
                        funcionarioId,
                        documentoId
                );

        armazenamentoArquivoService.excluir(
                documento.getCaminhoRelativo()
        );

        funcionarioDocumentoRepository.delete(
                documento
        );
    }

    private Funcionario buscarFuncionario(
            Long funcionarioId
    ) {
        return funcionarioRepository
                .findById(funcionarioId)
                .orElseThrow(
                        () ->
                                new RecursoNaoEncontradoException(
                                        "Funcionário não encontrado com o id "
                                                + funcionarioId
                                )
                );
    }

    private FuncionarioDocumento buscarDocumento(
            Long funcionarioId,
            Long documentoId
    ) {
        return funcionarioDocumentoRepository
                .findByIdAndFuncionarioId(
                        documentoId,
                        funcionarioId
                )
                .orElseThrow(
                        () ->
                                new RecursoNaoEncontradoException(
                                        "Documento não encontrado para o funcionário informado"
                                )
                );
    }
}