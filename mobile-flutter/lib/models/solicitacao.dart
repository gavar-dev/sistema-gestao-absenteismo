/// Espelha `StatusSolicitacao` do back-end: só existem 3 estados
/// (PENDENTE, APROVADA, REJEITADA) — não existe "concluída".
enum StatusSolicitacao { pendente, aprovada, rejeitada }

extension StatusSolicitacaoLabel on StatusSolicitacao {
  String get label {
    switch (this) {
      case StatusSolicitacao.pendente:
        return 'Pendente';
      case StatusSolicitacao.aprovada:
        return 'Aprovada';
      case StatusSolicitacao.rejeitada:
        return 'Rejeitada';
    }
  }

  static StatusSolicitacao fromJson(String valor) {
    switch (valor) {
      case 'APROVADA':
        return StatusSolicitacao.aprovada;
      case 'REJEITADA':
        return StatusSolicitacao.rejeitada;
      default:
        return StatusSolicitacao.pendente;
    }
  }
}

/// Espelha `TipoSolicitacao` do back-end.
enum TipoSolicitacao {
  correcaoPonto,
  justificativaFalta,
  solicitacaoFerias,
  correcaoCadastro,
}

extension TipoSolicitacaoLabel on TipoSolicitacao {
  String get titulo {
    switch (this) {
      case TipoSolicitacao.correcaoPonto:
        return 'Correção de ponto';
      case TipoSolicitacao.justificativaFalta:
        return 'Justificativa de falta';
      case TipoSolicitacao.solicitacaoFerias:
        return 'Solicitação de férias';
      case TipoSolicitacao.correcaoCadastro:
        return 'Correção de cadastro';
    }
  }

  String get descricao {
    switch (this) {
      case TipoSolicitacao.correcaoPonto:
        return 'Entrada, almoço, retorno ou saída não registrada.';
      case TipoSolicitacao.justificativaFalta:
        return 'Envie o motivo da ausência e os comprovantes disponíveis.';
      case TipoSolicitacao.solicitacaoFerias:
        return 'Informe o período desejado para avaliação do setor.';
      case TipoSolicitacao.correcaoCadastro:
        return 'Solicite atualização de telefone, endereço ou dados pessoais.';
    }
  }

  String get valorJson {
    switch (this) {
      case TipoSolicitacao.correcaoPonto:
        return 'CORRECAO_PONTO';
      case TipoSolicitacao.justificativaFalta:
        return 'JUSTIFICATIVA_FALTA';
      case TipoSolicitacao.solicitacaoFerias:
        return 'SOLICITACAO_FERIAS';
      case TipoSolicitacao.correcaoCadastro:
        return 'CORRECAO_CADASTRO';
    }
  }

  static TipoSolicitacao fromJson(String valor) {
    switch (valor) {
      case 'JUSTIFICATIVA_FALTA':
        return TipoSolicitacao.justificativaFalta;
      case 'SOLICITACAO_FERIAS':
        return TipoSolicitacao.solicitacaoFerias;
      case 'CORRECAO_CADASTRO':
        return TipoSolicitacao.correcaoCadastro;
      default:
        return TipoSolicitacao.correcaoPonto;
    }
  }
}

/// Equivalente a `SolicitacaoResponse` do back-end.
class Solicitacao {
  final int id;
  final String codigo; // "protocolo", ex: #SOL-0001
  final int funcionarioId;
  final String funcionario; // nomeFuncionario
  final TipoSolicitacao tipo;
  final DateTime data; // criadoEm
  StatusSolicitacao status;
  final String descricao; // justificativa
  final String? observacaoAnalise;

  Solicitacao({
    required this.id,
    required this.codigo,
    required this.funcionarioId,
    required this.funcionario,
    required this.tipo,
    required this.data,
    required this.status,
    this.descricao = '',
    this.observacaoAnalise,
  });

  factory Solicitacao.fromJson(Map<String, dynamic> json) {
    return Solicitacao(
      id: json['id'] as int,
      codigo: json['protocolo'] as String,
      funcionarioId: json['funcionarioId'] as int,
      funcionario: json['nomeFuncionario'] as String,
      tipo: TipoSolicitacaoLabel.fromJson(json['tipo'] as String),
      data: DateTime.parse(json['criadoEm'] as String),
      status: StatusSolicitacaoLabel.fromJson(json['status'] as String),
      descricao: json['justificativa'] as String? ?? '',
      observacaoAnalise: json['observacaoAnalise'] as String?,
    );
  }
}
