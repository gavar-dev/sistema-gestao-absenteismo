package br.com.senac.sistema_gestao_absenteismo.funcionario.documento.model;

import br.com.senac.sistema_gestao_absenteismo.funcionario.model.Funcionario;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "funcionario_documentos")
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class FuncionarioDocumento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(
            fetch = FetchType.LAZY,
            optional = false
    )
    @JoinColumn(
            name = "funcionario_id",
            nullable = false
    )
    private Funcionario funcionario;

    @Column(
            nullable = false,
            length = 255
    )
    private String nomeOriginal;

    @Column(
            nullable = false,
            unique = true,
            length = 255
    )
    private String nomeArmazenado;

    @Column(
            nullable = false,
            length = 100
    )
    private String contentType;

    @Column(nullable = false)
    private Long tamanho;

    @Column(
            nullable = false,
            unique = true,
            length = 500
    )
    private String caminhoRelativo;

    @Column(
            nullable = false,
            updatable = false
    )
    private LocalDateTime criadoEm;

    @PrePersist
    void aoCriar() {
        criadoEm = LocalDateTime.now();
    }
}