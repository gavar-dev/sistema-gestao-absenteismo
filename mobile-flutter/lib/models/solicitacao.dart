enum StatusSolicitacao { pendente, aprovada, concluida, negada }

extension StatusSolicitacaoLabel on StatusSolicitacao {
  String get label {
    switch (this) {
      case StatusSolicitacao.pendente:
        return 'Pendente';
      case StatusSolicitacao.aprovada:
        return 'Aprovada';
      case StatusSolicitacao.concluida:
        return 'Concluída';
      case StatusSolicitacao.negada:
        return 'Negada';
    }
  }
}

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
}

/// Equivalente a `SolicitacaoRecente` / `SolicitacaoHistorico` do Angular.
class Solicitacao {
  final String codigo;
  final String funcionario;
  final TipoSolicitacao tipo;
  final String data;
  StatusSolicitacao status;
  final String descricao;

  Solicitacao({
    required this.codigo,
    required this.funcionario,
    required this.tipo,
    required this.data,
    required this.status,
    this.descricao = '',
  });
}
