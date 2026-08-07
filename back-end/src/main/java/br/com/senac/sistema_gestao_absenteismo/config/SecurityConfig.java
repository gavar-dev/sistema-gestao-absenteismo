package br.com.senac.sistema_gestao_absenteismo.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            JwtAuthenticationConverter jwtAuthenticationConverter
    ) throws Exception {

        http.csrf(csrf -> csrf.disable()).cors(Customizer.withDefaults()).sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(authorize -> authorize
                        // Requisições de preflight do Angular
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        // Login público
                        .requestMatchers(HttpMethod.POST, "/api/auth/login").permitAll()
                        .requestMatchers(HttpMethod.PATCH,"/api/auth/alterar-senha").permitAll()
                        // Qualquer usuário autenticado consulta os próprios dados
                        .requestMatchers(HttpMethod.GET,"/api/funcionarios/me").authenticated()
                        // RH e gestor podem consultar funcionários
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/funcionarios",
                                "/api/funcionarios/**").hasAnyRole("RH", "GESTOR")
                        // Apenas RH pode cadastrar
                        .requestMatchers(HttpMethod.POST,"/api/funcionarios").hasRole("RH")
                        // Apenas RH pode atualizar
                        .requestMatchers(
                                HttpMethod.PUT,
                                "/api/funcionarios/**").hasRole("RH")
                        // Apenas RH pode alterar status
                        .requestMatchers(
                                HttpMethod.PATCH,
                                "/api/funcionarios/**").hasRole("RH")
                        // Apenas RH pode desativar
                        .requestMatchers(
                                HttpMethod.DELETE,
                                "/api/funcionarios/**").hasRole("RH")
                        // Apenas RH pode processar pendências de ponto
                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/pontos/processamento/**").hasRole("RH")
                        // RH e gestor podem consultar pontos de funcionários
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/pontos",
                                "/api/pontos/resumo",
                                "/api/pontos/indicadores/**",
                                "/api/pontos/funcionarios/**").hasAnyRole("RH", "GESTOR")
                        // Apenas RH pode analisar solicitações
                        .requestMatchers(
                                HttpMethod.PATCH,
                                "/api/solicitacoes/**").hasRole("RH")
                                // Usuário autenticado consulta as próprias solicitações
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/solicitacoes/minhas",
                                "/api/solicitacoes/minhas/**").authenticated()
                        // RH e gestor consultam todas as solicitações
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/solicitacoes",
                                "/api/solicitacoes/**").hasAnyRole("RH", "GESTOR")
                                // Qualquer usuário autenticado consulta seus avisos
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/avisos/meus").authenticated()
                        // RH e gestor consultam todos os avisos
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/avisos",
                                "/api/avisos/**").hasAnyRole("RH", "GESTOR")
                        // Apenas RH cria avisos
                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/avisos").hasRole("RH")
                        // Apenas RH atualiza avisos
                        .requestMatchers(
                                HttpMethod.PUT,
                                "/api/avisos/**").hasRole("RH")
                        // Apenas RH remove avisos
                        .requestMatchers(
                                HttpMethod.DELETE,
                                "/api/avisos/**").hasRole("RH")
                        // Demais endpoints exigem login
                        .anyRequest()
                        .authenticated()
                ).oauth2ResourceServer(oauth2 -> oauth2.jwt(jwt -> jwt.jwtAuthenticationConverter(jwtAuthenticationConverter)));

        return http.build();

    }

    @Bean
    public JwtAuthenticationConverter jwtAuthenticationConverter() {
        
        JwtGrantedAuthoritiesConverter authoritiesConverter = new JwtGrantedAuthoritiesConverter();

        authoritiesConverter.setAuthoritiesClaimName("tipoAcesso");
        authoritiesConverter.setAuthorityPrefix("ROLE_");

        JwtAuthenticationConverter authenticationConverter = new JwtAuthenticationConverter();

        authenticationConverter.setJwtGrantedAuthoritiesConverter(authoritiesConverter);

        return authenticationConverter;
    }
}