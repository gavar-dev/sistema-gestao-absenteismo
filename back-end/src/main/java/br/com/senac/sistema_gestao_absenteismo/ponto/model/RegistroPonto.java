package br.com.senac.sistema_gestao_absenteismo.ponto.model;

import br.com.senac.sistema_gestao_absenteismo.funcionario.model.Funcionario;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "registros_ponto", uniqueConstraints = {
        @UniqueConstraint(name = "uk_registro_ponto_funcionario_data", columnNames = { "funcionario_id",
                "data_registro" })
})
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class RegistroPonto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "funcionario_id", nullable = false)
    private Funcionario funcionario;

    @Column(name = "data_registro", nullable = false)
    private LocalDate dataRegistro;

    private LocalTime entrada;

    private LocalTime inicioIntervalo;

    private LocalTime fimIntervalo;

    private LocalTime saida;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private StatusJornada status;

    @Column(nullable = false)
    private Integer atrasoMinutos;

    @Column(nullable = false)
    private Integer totalTrabalhadoMinutos;

    @Column(nullable = false, updatable = false)
    private LocalDateTime criadoEm;

    @Column(nullable = false)
    private LocalDateTime atualizadoEm;

    @PrePersist
    void aoCriar() {
        LocalDateTime agora = LocalDateTime.now();

        criadoEm = agora;
        atualizadoEm = agora;

        if (dataRegistro == null) {
            dataRegistro = agora.toLocalDate();
        }

        if (status == null) {
            status = StatusJornada.EM_ANDAMENTO;
        }

        if (atrasoMinutos == null) {
            atrasoMinutos = 0;
        }

        if (totalTrabalhadoMinutos == null) {
            totalTrabalhadoMinutos = 0;
        }
    }

    @PreUpdate
    void aoAtualizar() {
        atualizadoEm = LocalDateTime.now();
    }
}