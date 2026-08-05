package br.com.senac.sistema_gestao_absenteismo.aviso.dto;

import br.com.senac.sistema_gestao_absenteismo.aviso.model.DestinoAviso;
import br.com.senac.sistema_gestao_absenteismo.aviso.model.NivelAviso;
import br.com.senac.sistema_gestao_absenteismo.funcionario.model.TipoUsuario;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

public record AvisoRequest(

        @NotBlank(message = "O título do aviso é obrigatório")
        @Size(min = 3,max = 150,message = "O título deve possuir entre 3 e 150 caracteres")
        String titulo,

        @NotBlank(message = "A mensagem do aviso é obrigatória")
        @Size(min = 5,max = 3000,message = "A mensagem deve possuir entre 5 e 3000 caracteres")
        String mensagem,

        @NotNull(message = "O nível do aviso é obrigatório")
        NivelAviso nivel,

        @NotNull(message = "O destino do aviso é obrigatório")
        DestinoAviso destino,

        TipoUsuario tipoAcessoAlvo,

        @Size(max = 100,message = "O setor deve possuir no máximo 100 caracteres")
        String setorAlvo,

        LocalDateTime publicadoEm,

        LocalDateTime expiraEm) {
}