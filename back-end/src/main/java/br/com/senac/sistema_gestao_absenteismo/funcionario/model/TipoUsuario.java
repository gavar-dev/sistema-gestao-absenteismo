package br.com.senac.sistema_gestao_absenteismo.funcionario.model;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

import java.text.Normalizer;
import java.util.Locale;

public enum TipoUsuario {
    FUNCIONARIO("funcionario"),
    GESTOR("gestor"),
    RH("rh");

    private final String valorJson;

    TipoUsuario(String valorJson) {
        this.valorJson = valorJson;
    }

    @JsonValue
    public String getValorJson() {
        return valorJson;
    }

    @JsonCreator
    public static TipoUsuario fromValue(String valor) {
        String normalizado = normalizar(valor);

        return switch (normalizado) {
            case "funcionario" -> FUNCIONARIO;
            case "gestor" -> GESTOR;
            case "rh", "rh administrador", "administrador" -> RH;
            default -> throw new IllegalArgumentException("Tipo de acesso inválido: " + valor);
        };
    }

    private static String normalizar(String valor) {
        if (valor == null) {
            return "";
        }

        return Normalizer.normalize(valor, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .replace("/", " ")
                .trim()
                .toLowerCase(Locale.ROOT)
                .replaceAll("\\s+", " ");
    }
}
