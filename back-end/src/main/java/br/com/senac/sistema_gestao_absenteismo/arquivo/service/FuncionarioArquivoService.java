package br.com.senac.sistema_gestao_absenteismo.arquivo.service;

import br.com.senac.sistema_gestao_absenteismo.arquivo.dto.ArquivoArmazenado;
import br.com.senac.sistema_gestao_absenteismo.arquivo.dto.ArquivoDownload;
import br.com.senac.sistema_gestao_absenteismo.funcionario.model.Funcionario;
import br.com.senac.sistema_gestao_absenteismo.funcionario.repository.FuncionarioRepository;
import br.com.senac.sistema_gestao_absenteismo.shared.exception.RecursoNaoEncontradoException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.Set;

@Service
@RequiredArgsConstructor
public class FuncionarioArquivoService {

        private static final long TAMANHO_MAXIMO_FOTO = 2L * 1024 * 1024;

        private static final Set<String> TIPOS_FOTO_PERMITIDOS = Set.of(
                        "image/jpeg",
                        "image/png");

        private final ArmazenamentoArquivoService armazenamentoArquivoService;

        private final FuncionarioRepository funcionarioRepository;

        public void salvarFoto(
                        Funcionario funcionario,
                        MultipartFile foto) {
                if (foto == null ||
                                foto.isEmpty()) {
                        return;
                }

                String diretorio = "funcionarios/"
                                + funcionario.getId()
                                + "/foto";

                ArquivoArmazenado arquivoArmazenado = armazenamentoArquivoService.salvar(
                                foto,
                                diretorio,
                                TIPOS_FOTO_PERMITIDOS,
                                TAMANHO_MAXIMO_FOTO);

                String fotoAnterior = funcionario
                                .getFotoCaminhoRelativo();

                funcionario.setFotoNomeOriginal(
                                arquivoArmazenado.nomeOriginal());

                funcionario.setFotoNomeArmazenado(
                                arquivoArmazenado.nomeArmazenado());

                funcionario.setFotoContentType(
                                arquivoArmazenado.contentType());

                funcionario.setFotoTamanho(
                                arquivoArmazenado.tamanho());

                funcionario.setFotoCaminhoRelativo(
                                arquivoArmazenado.caminhoRelativo());

                if (fotoAnterior != null &&
                                !fotoAnterior.isBlank()) {
                        armazenamentoArquivoService.excluir(
                                        fotoAnterior);
                }
        }

        @Transactional(readOnly = true)
        public ArquivoDownload carregarFoto(
                        Long funcionarioId) {
                Funcionario funcionario = buscarFuncionario(
                                funcionarioId);

                if (funcionario
                                .getFotoCaminhoRelativo() == null ||
                                funcionario
                                                .getFotoCaminhoRelativo()
                                                .isBlank()) {
                        throw new RecursoNaoEncontradoException(
                                        "O funcionário não possui foto cadastrada");
                }

                return new ArquivoDownload(
                                armazenamentoArquivoService.carregar(
                                                funcionario
                                                                .getFotoCaminhoRelativo()),
                                funcionario.getFotoNomeOriginal(),
                                funcionario.getFotoContentType(),
                                funcionario.getFotoTamanho());
        }

        private Funcionario buscarFuncionario(
                        Long funcionarioId) {
                return funcionarioRepository
                                .findById(
                                                funcionarioId)
                                .orElseThrow(
                                                () -> new RecursoNaoEncontradoException(
                                                                "Funcionário não encontrado com o id "
                                                                                + funcionarioId));
        }
}