package br.com.senac.sistema_gestao_absenteismo.auth.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

public class PrimeiroAcessoFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request,
        HttpServletResponse response,
        FilterChain filterChain) throws ServletException, IOException {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication != null && authentication.isAuthenticated() && authentication.getPrincipal() instanceof Jwt jwt) {

            Boolean primeiroAcesso = jwt.getClaim("primeiroAcesso");

            if (Boolean.TRUE.equals(primeiroAcesso) && !rotaPermitida(request)) {

                response.setStatus(HttpServletResponse.SC_FORBIDDEN);

                response.setCharacterEncoding("UTF-8");

                response.setContentType("application/json");

                response.getWriter().write(
                    """
                        {
                            "status": 403,
                            "erro": "Forbidden",
                            "mensagem": "É necessário alterar a senha provisória antes de acessar o sistema."
                        }
                    """);

                return;
            }
        }

        filterChain.doFilter(request,response);
    }

    private boolean rotaPermitida(HttpServletRequest request) {

        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            return true;
        }

        String uri = request.getRequestURI();

        return uri.equals("/api/auth/primeiro-acesso") || uri.equals("/api/auth/alterar-senha");
    }
}