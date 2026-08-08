package br.com.senac.sistema_gestao_absenteismo.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.info.Contact;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.info.License;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;

import org.springframework.context.annotation.Configuration;

@Configuration

@OpenAPIDefinition(
        info = @Info(
                title = "Sistema de Gestão de Absenteísmo API",
                version = "1.0",
                description = """
                        API REST responsável pelo Sistema de Gestão de Absenteísmo.

                        Funcionalidades principais:
                        - autenticação;
                        - funcionários;
                        - registros de ponto;
                        - solicitações;
                        - anexos;
                        - avisos;
                        - gestão pelo RH e gestor.
                        """,
                contact = @Contact(
                        name = "Projeto Integrador - Senac"
                ),
                license = @License(
                        name = "Uso acadêmico"
                )
        ),

        security = {
                @SecurityRequirement(
                        name = "bearerAuth"
                )
        }
)

@SecurityScheme(
        name = "bearerAuth",
        description = "Informe o token JWT obtido no endpoint de login",
        scheme = "bearer",
        type = SecuritySchemeType.HTTP,
        bearerFormat = "JWT"
)
public class OpenApiConfig {
}