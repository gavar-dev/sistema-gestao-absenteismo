package br.com.senac.sistema_gestao_absenteismo.funcionario.model;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

import java.text.Normalizer;
import java.util.Locale;

public enum StatusFuncionario {
    ATIVO("Ativo"),
    FERIAS("Férias"),
    AFASTADO("Afastado"),
    INATIVO("Inativo");

    private final String descricao;

    StatusFuncionario(String descricao) {
        this.descricao = descricao;
    }

    @JsonValue
    public String getDescricao() {
        return descricao;
    }

    @JsonCreator
    public static StatusFuncionario fromValue(String valor) {
        String normalizado = normalizar(valor);

        return switch (normalizado) {
            case "ativo" -> ATIVO;
            case "ferias" -> FERIAS;
            case "afastado" -> AFASTADO;
            case "inativo" -> INATIVO;
            default -> throw new IllegalArgumentException("Status inválido: " + valor);
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
