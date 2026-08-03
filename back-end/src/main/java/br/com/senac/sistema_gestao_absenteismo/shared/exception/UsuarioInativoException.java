package br.com.senac.sistema_gestao_absenteismo.shared.exception;

public class UsuarioInativoException extends RuntimeException {

    public UsuarioInativoException(String mensagem) {
        super(mensagem);
    }
}