package br.com.senac.sistema_gestao_absenteismo.shared.exception;

public class ConflitoDeDadosException extends RuntimeException {

    public ConflitoDeDadosException(String mensagem) {
        super(mensagem);
    }
}
