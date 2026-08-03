package br.com.senac.sistema_gestao_absenteismo.funcionario.model;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

import java.text.Normalizer;
import java.util.Locale;

public enum TipoVinculo {
    CLT("CLT"),
    PJ("PJ"),
    ESTAGIO("Estágio"),
    TEMPORARIO("Temporário"),
    APRENDIZ("Aprendiz");

    private final String descricao;

    TipoVinculo(String descricao) {
        this.descricao = descricao;
    }

    @JsonValue
    public String getDescricao() {
        return descricao;
    }

    @JsonCreator
    public static TipoVinculo fromValue(String valor) {
        String normalizado = normalizar(valor);

        return switch (normalizado) {
            case "clt" -> CLT;
            case "pj" -> PJ;
            case "estagio" -> ESTAGIO;
            case "temporario" -> TEMPORARIO;
            case "aprendiz" -> APRENDIZ;
            default -> throw new IllegalArgumentException("Tipo de vínculo inválido: " + valor);
        };
    }

    private static String normalizar(String valor) {
        if (valor == null) {
            return "";
        }

        return Normalizer.normalize(valor, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .trim()
                .toLowerCase(Locale.ROOT);
    }
}
