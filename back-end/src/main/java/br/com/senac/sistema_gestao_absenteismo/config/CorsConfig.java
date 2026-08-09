package br.com.senac.sistema_gestao_absenteismo.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
public class CorsConfig {

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        configuration.setAllowedOrigins(List.of(
            "http://localhost:4200",
            "http://127.0.0.1:4200",
            "http://localhost:5000",
            "http://127.0.0.1:5000"
        ));

        configuration.setAllowedMethods(List.of("GET","POST","PUT","PATCH","DELETE","OPTIONS"));

        configuration.setAllowedHeaders(List.of("Authorization","Content-Type","Accept"));

        configuration.setExposedHeaders(List.of("Location"));

        /*
         * Estamos usando JWT no header Authorization,
         * e não cookies de sessão.
         */
        configuration.setAllowCredentials(false);

        /*
         * Permite que o navegador reutilize a resposta
         * do preflight por uma hora.
         */
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration("/api/**",configuration);

        return source;
    }
}