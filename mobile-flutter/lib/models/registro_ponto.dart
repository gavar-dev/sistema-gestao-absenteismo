/// Um dos quatro tipos de marcação de jornada, na ordem em que acontecem.
enum TipoMarcacao { entrada, almoco, retorno, saida }

extension TipoMarcacaoLabel on TipoMarcacao {
  String get label {
    switch (this) {
      case TipoMarcacao.entrada:
        return 'Entrada';
      case TipoMarcacao.almoco:
        return 'Almoço';
      case TipoMarcacao.retorno:
        return 'Retorno';
      case TipoMarcacao.saida:
        return 'Saída';
    }
  }

  String get descricao {
    switch (this) {
      case TipoMarcacao.entrada:
        return 'Registrar início da jornada';
      case TipoMarcacao.almoco:
        return 'Registrar saída para intervalo';
      case TipoMarcacao.retorno:
        return 'Registrar volta do intervalo';
      case TipoMarcacao.saida:
        return 'Registrar encerramento da jornada';
    }
  }
}

/// Uma marcação de ponto já registrada (equivalente a `RegistroPonto`
/// no `meu-ponto-componente` do Angular).
class RegistroPonto {
  final TipoMarcacao tipo;
  final String horario;

  const RegistroPonto({required this.tipo, required this.horario});
}

/// Um dia inteiro de histórico de ponto (equivalente a `RegistroHistorico`).
enum StatusDia { completo, incompleto, atraso, faltaJustificada, falta }

extension StatusDiaLabel on StatusDia {
  String get label {
    switch (this) {
      case StatusDia.completo:
        return 'Completo';
      case StatusDia.incompleto:
        return 'Incompleto';
      case StatusDia.atraso:
        return 'Atraso';
      case StatusDia.faltaJustificada:
        return 'Falta justificada';
      case StatusDia.falta:
        return 'Falta';
    }
  }
}

class RegistroHistorico {
  final String data;
  final String diaSemana;
  final String entrada;
  final String almoco;
  final String retorno;
  final String saida;
  final String horas;
  final StatusDia status;
  final String observacao;

  const RegistroHistorico({
    required this.data,
    required this.diaSemana,
    required this.entrada,
    required this.almoco,
    required this.retorno,
    required this.saida,
    required this.horas,
    required this.status,
    required this.observacao,
  });
}
