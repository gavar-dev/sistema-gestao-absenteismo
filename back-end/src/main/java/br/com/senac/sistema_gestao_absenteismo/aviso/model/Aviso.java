package br.com.senac.sistema_gestao_absenteismo.aviso.model;

import br.com.senac.sistema_gestao_absenteismo.funcionario.model.Funcionario;
import br.com.senac.sistema_gestao_absenteismo.funcionario.model.TipoUsuario;
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

import java.time.LocalDateTime;

@Entity
@Table(name = "avisos")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class Aviso {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false,length = 150)
    private String titulo;

    @Column(nullable = false,columnDefinition = "TEXT")
    private String mensagem;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false,length = 20)
    private NivelAviso nivel;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false,length = 30)
    private DestinoAviso destino;
    /*
     * Preenchido somente quando destino = TIPO_ACESSO.
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_acesso_alvo",length = 20)
    private TipoUsuario tipoAcessoAlvo;

    /*
     * Preenchido somente quando destino = SETOR.
     */
    @Column(name = "setor_alvo",length = 100)
    private String setorAlvo;

    @Column(nullable = false)
    private Boolean ativo;

    /*
     * Momento a partir do qual o aviso será exibido.
     *
     * Quando não informado, será usada a data atual.
     */
    @Column(nullable = false)
    private LocalDateTime publicadoEm;

    /*
     * Pode ser nulo quando o aviso não tiver expiração.
     */
    private LocalDateTime expiraEm;

    /*
     * RH responsável pela criação do aviso.
     */
    @ManyToOne(fetch = FetchType.LAZY,optional = false)
    @JoinColumn(name = "criado_por_id",nullable = false)
    private Funcionario criadoPor;

    @Column(nullable = false,updatable = false)
    private LocalDateTime criadoEm;

    @Column(nullable = false)
    private LocalDateTime atualizadoEm;

    @PrePersist
    void aoCriar() {
        LocalDateTime agora = LocalDateTime.now().withNano(0);

        criadoEm = agora;
        atualizadoEm = agora;

        if (publicadoEm == null) {
            publicadoEm = agora;
        }

        if (ativo == null) {
            ativo = true;
        }
    }

    @PreUpdate
    void aoAtualizar() {
        atualizadoEm = LocalDateTime.now().withNano(0);
    }
}
