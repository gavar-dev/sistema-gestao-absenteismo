package br.com.senac.sistema_gestao_absenteismo.aviso.dto;

import br.com.senac.sistema_gestao_absenteismo.aviso.model.Aviso;
import br.com.senac.sistema_gestao_absenteismo.aviso.model.DestinoAviso;
import br.com.senac.sistema_gestao_absenteismo.aviso.model.NivelAviso;
import br.com.senac.sistema_gestao_absenteismo.funcionario.model.TipoUsuario;

import java.time.LocalDateTime;

public record AvisoResponse(

    Long id,
    String titulo,
    String mensagem,
    NivelAviso nivel,
    DestinoAviso destino,
    TipoUsuario tipoAcessoAlvo,
    String setorAlvo,
    Boolean ativo,
    LocalDateTime publicadoEm,
    LocalDateTime expiraEm,
    Long criadoPorId,
    String nomeCriadoPor,
    LocalDateTime criadoEm,
    LocalDateTime atualizadoEm) {

    public static AvisoResponse from(Aviso aviso) {
        return new AvisoResponse(
            aviso.getId(),
            aviso.getTitulo(),
            aviso.getMensagem(),
            aviso.getNivel(),
            aviso.getDestino(),
            aviso.getTipoAcessoAlvo(),
            aviso.getSetorAlvo(),
            aviso.getAtivo(),
            aviso.getPublicadoEm(),
            aviso.getExpiraEm(),
            aviso.getCriadoPor().getId(),
            aviso.getCriadoPor().getNomeCompleto(),
            aviso.getCriadoEm(),
            aviso.getAtualizadoEm());
    }
}