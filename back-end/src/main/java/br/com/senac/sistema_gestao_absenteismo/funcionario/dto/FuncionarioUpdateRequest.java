package br.com.senac.sistema_gestao_absenteismo.funcionario.dto;

import java.time.LocalDate;

import org.hibernate.validator.constraints.br.CPF;

import br.com.senac.sistema_gestao_absenteismo.funcionario.model.StatusFuncionario;
import br.com.senac.sistema_gestao_absenteismo.funcionario.model.TipoUsuario;
import br.com.senac.sistema_gestao_absenteismo.funcionario.model.TipoVinculo;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Size;

public record FuncionarioUpdateRequest(
                @NotBlank(message = "O nome completo é obrigatório") @Size(max = 150, message = "O nome deve ter no máximo 150 caracteres") String nomeCompleto,

                @NotBlank(message = "O e-mail corporativo é obrigatório") @Email(message = "Informe um e-mail válido") @Size(max = 150, message = "O e-mail deve ter no máximo 150 caracteres") String emailCorporativo,

                @NotBlank(message = "O CPF é obrigatório") @CPF(message = "Informe um CPF válido") String cpf,

                @NotBlank(message = "O telefone é obrigatório") @Size(max = 20, message = "O telefone deve ter no máximo 20 caracteres") String telefone,

                @NotNull(message = "A data de nascimento é obrigatória") @Past(message = "A data de nascimento deve estar no passado") LocalDate dataNascimento,

                @Size(max = 40, message = "O estado civil deve ter no máximo 40 caracteres") String estadoCivil,

                @NotBlank(message = "A nacionalidade é obrigatória") @Size(max = 60, message = "A nacionalidade deve ter no máximo 60 caracteres") String nacionalidade,

                @Size(max = 80, message = "A naturalidade deve ter no máximo 80 caracteres") String naturalidade,

                @NotBlank(message = "A matrícula é obrigatória") @Size(max = 30, message = "A matrícula deve ter no máximo 30 caracteres") String matricula,

                @NotBlank(message = "O cargo é obrigatório") @Size(max = 100, message = "O cargo deve ter no máximo 100 caracteres") String cargo,

                @NotBlank(message = "O setor é obrigatório") @Size(max = 100, message = "O setor deve ter no máximo 100 caracteres") String setor,

                @NotNull(message = "A data de admissão é obrigatória") @PastOrPresent(message = "A data de admissão não pode estar no futuro") LocalDate dataAdmissao,

                @NotNull(message = "O tipo de vínculo é obrigatório") TipoVinculo tipoVinculo,

                @Min(value = 1, message = "A carga horária deve ser maior que zero") @Max(value = 60, message = "A carga horária deve ser de no máximo 60 horas") Integer cargaHorariaSemanal,

                @Size(max = 150, message = "O gestor deve ter no máximo 150 caracteres") String gestorImediato,

                @Size(max = 120, message = "O local de trabalho deve ter no máximo 120 caracteres") String localTrabalho,

                @NotNull(message = "O tipo de acesso é obrigatório") TipoUsuario tipoAcesso,

                @NotNull(message = "O status é obrigatório") StatusFuncionario status) {
}
