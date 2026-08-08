package br.com.senac.sistema_gestao_absenteismo.funcionario.model;

import java.time.LocalDate;
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "funcionarios")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class Funcionario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String nomeCompleto;

    @Column(nullable = false, unique = true, length = 150)
    private String emailCorporativo;

    @Column(nullable = false, unique = true, length = 11)
    private String cpf;

    @Column(nullable = false, length = 20)
    private String telefone;

    @Column(nullable = false)
    private LocalDate dataNascimento;

    @Column(length = 40)
    private String estadoCivil;

    @Column(nullable = false, length = 60)
    private String nacionalidade;

    @Column(length = 80)
    private String naturalidade;

    @Column(nullable = false, unique = true, length = 30)
    private String matricula;

    @Column(nullable = false, length = 100)
    private String cargo;

    @Column(nullable = false, length = 100)
    private String setor;

    @Column(nullable = false)
    private LocalDate dataAdmissao;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TipoVinculo tipoVinculo;

    private Integer cargaHorariaSemanal;

    @Column(length = 150)
    private String gestorImediato;

    @Column(length = 120)
    private String localTrabalho;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TipoUsuario tipoAcesso;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private StatusFuncionario status;

    @Column(nullable = false, length = 100)
    private String senhaHash;

    @Builder.Default
    @Column(nullable = false)
    private boolean primeiroAcesso = false;

    @Column(length = 255)
    private String fotoNomeOriginal;

    @Column(unique = true, length = 255)
    private String fotoNomeArmazenado;

    @Column(length = 100)
    private String fotoContentType;

    private Long fotoTamanho;

    @Column(unique = true, length = 500)
    private String fotoCaminhoRelativo;

    @Column(nullable = false, updatable = false)
    private LocalDateTime criadoEm;

    @Column(nullable = false)
    private LocalDateTime atualizadoEm;

    @PrePersist
    void aoCriar() {
        LocalDateTime agora = LocalDateTime.now();
        criadoEm = agora;
        atualizadoEm = agora;
    }

    @PreUpdate
    void aoAtualizar() {
        atualizadoEm = LocalDateTime.now();
    }
}
