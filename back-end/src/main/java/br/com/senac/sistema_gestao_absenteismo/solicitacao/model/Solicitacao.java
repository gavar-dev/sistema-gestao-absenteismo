package br.com.senac.sistema_gestao_absenteismo.solicitacao.model;

import br.com.senac.sistema_gestao_absenteismo.funcionario.model.Funcionario;
import br.com.senac.sistema_gestao_absenteismo.ponto.model.RegistroPonto;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "solicitacoes")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class Solicitacao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /*
     * Funcionário que criou a solicitação.
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "funcionario_id", nullable = false)
    private Funcionario funcionario;

    /*
     * Registro de ponto relacionado à solicitação.
     *
     * Pode ser nulo, pois pode ainda não existir registro para
     * a data informada.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "registro_ponto_id")
    private RegistroPonto registroPonto;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private TipoSolicitacao tipo;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private StatusSolicitacao status;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private PrioridadeSolicitacao prioridade;

    /*
     * Data relacionada à correção de ponto, falta
     * ou correção cadastral.
     */
    private LocalDate dataReferencia;

    /*
     * Campos utilizados por solicitações de férias.
     */
    private LocalDate dataInicio;

    private LocalDate dataFim;

    /*
     * Horários sugeridos pelo funcionário para uma
     * correção de ponto.
     */
    private LocalTime entradaSolicitada;

    private LocalTime inicioIntervaloSolicitado;

    private LocalTime fimIntervaloSolicitado;

    private LocalTime saidaSolicitada;

    /*
     * Campos utilizados por correção cadastral.
     *
     * Exemplo:
     * campoCadastro = "telefone"
     * novoValor = "(21) 99999-9999"
     */
    @Column(length = 80)
    private String campoCadastro;

    @Column(length = 255)
    private String novoValor;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String justificativa;

    /*
     * Nesta versão guardaremos somente o nome do arquivo.
     * Não haverá upload real de anexos.
     */
    @Column(length = 255)
    private String nomeAnexo;

    @Column(columnDefinition = "TEXT")
    private String observacaoAnalise;

    /*
     * RH responsável pela aprovação ou rejeição.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "analisado_por_id")
    private Funcionario analisadoPor;

    @Column(nullable = false, updatable = false)
    private LocalDateTime criadoEm;

    @Column(nullable = false)
    private LocalDateTime atualizadoEm;

    private LocalDateTime analisadoEm;

    @PrePersist
    void aoCriar() {
        LocalDateTime agora = LocalDateTime.now();

        criadoEm = agora;
        atualizadoEm = agora;

        if (status == null) {
            status = StatusSolicitacao.PENDENTE;
        }

        if (prioridade == null) {
            prioridade = PrioridadeSolicitacao.NORMAL;
        }
    }

    @PreUpdate
    void aoAtualizar() {
        atualizadoEm = LocalDateTime.now();
    }
}