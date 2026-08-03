package br.com.senac.sistema_gestao_absenteismo.funcionario.dto;

import br.com.senac.sistema_gestao_absenteismo.funcionario.model.Funcionario;
import br.com.senac.sistema_gestao_absenteismo.funcionario.model.StatusFuncionario;
import br.com.senac.sistema_gestao_absenteismo.funcionario.model.TipoUsuario;
import br.com.senac.sistema_gestao_absenteismo.funcionario.model.TipoVinculo;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record FuncionarioResponse(
        Long id,
        String nomeCompleto,
        String emailCorporativo,
        String cpf,
        String telefone,
        LocalDate dataNascimento,
        String estadoCivil,
        String nacionalidade,
        String naturalidade,
        String matricula,
        String cargo,
        String setor,
        LocalDate dataAdmissao,
        TipoVinculo tipoVinculo,
        Integer cargaHorariaSemanal,
        String gestorImediato,
        String localTrabalho,
        TipoUsuario tipoAcesso,
        StatusFuncionario status,
        LocalDateTime criadoEm,
        LocalDateTime atualizadoEm
) {
    public static FuncionarioResponse from(Funcionario funcionario) {
        return new FuncionarioResponse(
                funcionario.getId(),
                funcionario.getNomeCompleto(),
                funcionario.getEmailCorporativo(),
                formatarCpf(funcionario.getCpf()),
                funcionario.getTelefone(),
                funcionario.getDataNascimento(),
                funcionario.getEstadoCivil(),
                funcionario.getNacionalidade(),
                funcionario.getNaturalidade(),
                funcionario.getMatricula(),
                funcionario.getCargo(),
                funcionario.getSetor(),
                funcionario.getDataAdmissao(),
                funcionario.getTipoVinculo(),
                funcionario.getCargaHorariaSemanal(),
                funcionario.getGestorImediato(),
                funcionario.getLocalTrabalho(),
                funcionario.getTipoAcesso(),
                funcionario.getStatus(),
                funcionario.getCriadoEm(),
                funcionario.getAtualizadoEm()
        );
    }

    private static String formatarCpf(String cpf) {
        if (cpf == null || cpf.length() != 11) {
            return cpf;
        }

        return cpf.substring(0, 3) + "."
                + cpf.substring(3, 6) + "."
                + cpf.substring(6, 9) + "-"
                + cpf.substring(9);
    }
}
