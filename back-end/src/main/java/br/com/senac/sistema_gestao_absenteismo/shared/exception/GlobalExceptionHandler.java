package br.com.senac.sistema_gestao_absenteismo.shared.exception;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

        @ExceptionHandler(RecursoNaoEncontradoException.class)
        ResponseEntity<ApiError> tratarNaoEncontrado(
                RecursoNaoEncontradoException exception,
                HttpServletRequest request
        ) {
                return resposta(HttpStatus.NOT_FOUND, exception.getMessage(), request.getRequestURI(), Map.of());
        }

        @ExceptionHandler(ConflitoDeDadosException.class)
        ResponseEntity<ApiError> tratarConflito(
                ConflitoDeDadosException exception,
                HttpServletRequest request
        ) {
                return resposta(HttpStatus.CONFLICT, exception.getMessage(), request.getRequestURI(), Map.of());
        }

        @ExceptionHandler(CredenciaisInvalidasException.class)
        ResponseEntity<ApiError> tratarCredenciaisInvalidas(
                CredenciaisInvalidasException exception,
                HttpServletRequest request
        ) {
        return resposta(
                HttpStatus.UNAUTHORIZED,
                exception.getMessage(),
                request.getRequestURI(),
                Map.of()
        );
        }

        @ExceptionHandler(UsuarioInativoException.class)
        ResponseEntity<ApiError> tratarUsuarioInativo(
                UsuarioInativoException exception,
                HttpServletRequest request
        ) {
        return resposta(
                HttpStatus.FORBIDDEN,
                exception.getMessage(),
                request.getRequestURI(),
                Map.of()
        );
        }

        @ExceptionHandler(MethodArgumentNotValidException.class)
        ResponseEntity<ApiError> tratarValidacao(
                MethodArgumentNotValidException exception,
                HttpServletRequest request
        ) {
                Map<String, String> campos = new LinkedHashMap<>();
                exception.getBindingResult().getFieldErrors().forEach(error ->
                        campos.putIfAbsent(error.getField(), error.getDefaultMessage())
                );

                return resposta(
                        HttpStatus.BAD_REQUEST,
                        "Existem campos inválidos na requisição",
                        request.getRequestURI(),
                        campos
                );
        }


        @ExceptionHandler(IllegalArgumentException.class)
        ResponseEntity<ApiError> tratarValorInvalido(
                IllegalArgumentException exception,
                HttpServletRequest request
        ) {
                return resposta(
                        HttpStatus.BAD_REQUEST,
                        exception.getMessage(),
                        request.getRequestURI(),
                        Map.of()
                );
        }

        @ExceptionHandler(HttpMessageNotReadableException.class)
        ResponseEntity<ApiError> tratarJsonInvalido(
                HttpMessageNotReadableException exception,
                HttpServletRequest request
        ) {
                return resposta(
                        HttpStatus.BAD_REQUEST,
                        "O corpo da requisição está inválido ou contém um valor não reconhecido",
                        request.getRequestURI(),
                        Map.of()
                );
        }

        private ResponseEntity<ApiError> resposta(
                HttpStatus status,
                String mensagem,
                String caminho,
                Map<String, String> campos
        ) {
                ApiError erro = new ApiError(
                        LocalDateTime.now(),
                        status.value(),
                        status.getReasonPhrase(),
                        mensagem,
                        caminho,
                        campos
                );

                return ResponseEntity.status(status).body(erro);
        }
}
