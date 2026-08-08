package br.com.senac.sistema_gestao_absenteismo.arquivo.service;

import br.com.senac.sistema_gestao_absenteismo.arquivo.dto.ArquivoArmazenado;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

@Service
public class ArmazenamentoArquivoService {

        private final Path diretorioBase;

        public ArmazenamentoArquivoService(@Value("${app.upload.diretorio}") String diretorioBase) {
                this.diretorioBase = Path.of(diretorioBase).toAbsolutePath().normalize();
        }

        public ArquivoArmazenado salvar(MultipartFile arquivo, String subdiretorio, Set<String> tiposPermitidos,
                        long tamanhoMaximoBytes) {
                validarArquivo(arquivo, tiposPermitidos, tamanhoMaximoBytes);

                String nomeOriginal = obterNomeOriginalSeguro(arquivo);

                String extensao = obterExtensao(nomeOriginal);

                String nomeArmazenado = UUID.randomUUID().toString() + extensao;

                Path diretorioDestino = resolverSubdiretorioSeguro(subdiretorio);

                Path arquivoDestino = diretorioDestino.resolve(nomeArmazenado).normalize();

                validarCaminhoDentroDoDiretorio(arquivoDestino, diretorioDestino);

                try {

                        Files.createDirectories(diretorioDestino);

                        try (InputStream inputStream = arquivo.getInputStream()) {
                                Files.copy(inputStream, arquivoDestino, StandardCopyOption.REPLACE_EXISTING);
                        }

                } catch (IOException exception) {
                        throw new IllegalStateException("Não foi possível armazenar o arquivo", exception);
                }

                String caminhoRelativo = diretorioBase.relativize(arquivoDestino).toString().replace('\\', '/');

                return new ArquivoArmazenado(nomeOriginal, nomeArmazenado,
                                arquivo.getContentType(), arquivo.getSize(), caminhoRelativo);
        }

        public Resource carregar(String caminhoRelativo) {

                Path caminhoCompleto = diretorioBase.resolve(caminhoRelativo).normalize();

                validarCaminhoDentroDoDiretorio(caminhoCompleto, diretorioBase);

                try {

                        Resource recurso = new UrlResource(caminhoCompleto.toUri());

                        if (!recurso.exists() || !recurso.isReadable()) {
                                throw new IllegalArgumentException("Arquivo não encontrado");
                        }

                        return recurso;

                } catch (MalformedURLException exception) {
                        throw new IllegalStateException("Não foi possível carregar o arquivo", exception);
                }
        }

        public void excluir(String caminhoRelativo) {

                if (caminhoRelativo == null || caminhoRelativo.isBlank()) {
                        return;
                }

                Path caminhoCompleto = diretorioBase.resolve(caminhoRelativo).normalize();

                validarCaminhoDentroDoDiretorio(caminhoCompleto, diretorioBase);

                try {

                        Files.deleteIfExists(caminhoCompleto);

                } catch (IOException exception) {

                        throw new IllegalStateException("Não foi possível excluir o arquivo", exception);
                }
        }

        private void validarArquivo(MultipartFile arquivo, Set<String> tiposPermitidos, long tamanhoMaximoBytes) {

                if (arquivo == null || arquivo.isEmpty()) {
                        throw new IllegalArgumentException("O arquivo está vazio");
                }

                if (arquivo.getSize() > tamanhoMaximoBytes) {
                        throw new IllegalArgumentException("O arquivo excede o tamanho máximo permitido");
                }

                String contentType = arquivo.getContentType();

                if (contentType == null || !tiposPermitidos.contains(contentType.toLowerCase(Locale.ROOT))) {
                        throw new IllegalArgumentException("Formato de arquivo não permitido");
                }
        }

        private String obterNomeOriginalSeguro(MultipartFile arquivo) {

                String nomeOriginal = arquivo.getOriginalFilename();

                if (nomeOriginal == null || nomeOriginal.isBlank()) {
                        return "arquivo";
                }

                return Path.of(nomeOriginal).getFileName().toString();
        }

        private String obterExtensao(String nomeArquivo) {

                int ultimoPonto = nomeArquivo.lastIndexOf('.');

                if (ultimoPonto < 0 || ultimoPonto == nomeArquivo.length() - 1) {
                        return "";
                }

                return nomeArquivo.substring(ultimoPonto).toLowerCase(Locale.ROOT);
        }

        private Path resolverSubdiretorioSeguro(String subdiretorio) {

                Path diretorioDestino = diretorioBase.resolve(subdiretorio).normalize();

                validarCaminhoDentroDoDiretorio(diretorioDestino, diretorioBase);

                return diretorioDestino;
        }

        private void validarCaminhoDentroDoDiretorio(Path caminho, Path diretorioPermitido) {

                if (!caminho.startsWith(diretorioPermitido)) {
                        throw new IllegalArgumentException("Caminho de arquivo inválido");
                }
        }
}