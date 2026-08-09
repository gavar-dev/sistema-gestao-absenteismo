/// Um dos quatro tipos de marcação de jornada, na ordem em que acontecem.
/// Os nomes/valores JSON batem com o enum `TipoMarcacao` do back-end
/// (ENTRADA, INICIO_INTERVALO, FIM_INTERVALO, SAIDA).
enum TipoMarcacao { entrada, inicioIntervalo, fimIntervalo, saida }

extension TipoMarcacaoLabel on TipoMarcacao {
  String get label {
    switch (this) {
      case TipoMarcacao.entrada:
        return 'Entrada';
      case TipoMarcacao.inicioIntervalo:
        return 'Almoço';
      case TipoMarcacao.fimIntervalo:
        return 'Retorno';
      case TipoMarcacao.saida:
        return 'Saída';
    }
  }

  String get descricao {
    switch (this) {
      case TipoMarcacao.entrada:
        return 'Registrar início da jornada';
      case TipoMarcacao.inicioIntervalo:
        return 'Registrar saída para intervalo';
      case TipoMarcacao.fimIntervalo:
        return 'Registrar volta do intervalo';
      case TipoMarcacao.saida:
        return 'Registrar encerramento da jornada';
    }
  }

  /// Valor exatamente como o back-end espera no corpo de
  /// POST /api/pontos/marcar.
  String get valorJson {
    switch (this) {
      case TipoMarcacao.entrada:
        return 'ENTRADA';
      case TipoMarcacao.inicioIntervalo:
        return 'INICIO_INTERVALO';
      case TipoMarcacao.fimIntervalo:
        return 'FIM_INTERVALO';
      case TipoMarcacao.saida:
        return 'SAIDA';
    }
  }

  static TipoMarcacao? fromJson(String? valor) {
    switch (valor) {
      case 'ENTRADA':
        return TipoMarcacao.entrada;
      case 'INICIO_INTERVALO':
        return TipoMarcacao.inicioIntervalo;
      case 'FIM_INTERVALO':
        return TipoMarcacao.fimIntervalo;
      case 'SAIDA':
        return TipoMarcacao.saida;
      default:
        return null;
    }
  }
}

/// Status da jornada do dia. Espelha o enum `StatusJornada` do back-end.
enum StatusDia { emAndamento, concluido, pendente, atraso, faltaJustificada, falta }

extension StatusDiaLabel on StatusDia {
  String get label {
    switch (this) {
      case StatusDia.emAndamento:
        return 'Em andamento';
      case StatusDia.concluido:
        return 'Completo';
      case StatusDia.pendente:
        return 'Pendente';
      case StatusDia.atraso:
        return 'Atraso';
      case StatusDia.faltaJustificada:
        return 'Falta justificada';
      case StatusDia.falta:
        return 'Falta';
    }
  }

  static StatusDia fromJson(String valor) {
    switch (valor) {
      case 'EM_ANDAMENTO':
        return StatusDia.emAndamento;
      case 'CONCLUIDA':
        return StatusDia.concluido;
      case 'ATRASO':
        return StatusDia.atraso;
      case 'JUSTIFICADA':
        return StatusDia.faltaJustificada;
      case 'FALTA':
        return StatusDia.falta;
      case 'PENDENTE':
      default:
        return StatusDia.pendente;
    }
  }
}

/// Um dia de jornada (equivalente a `RegistroPontoResponse` do back-end):
/// diferente do model antigo, aqui já vem UM registro por dia com todos os
/// horários — não uma marcação avulsa.
class RegistroPontoDia {
  final int? id;
  final DateTime data;
  final String? entrada;
  final String? inicioIntervalo;
  final String? fimIntervalo;
  final String? saida;
  final StatusDia status;
  final int? atrasoMinutos;
  final int? totalTrabalhadoMinutos;
  final TipoMarcacao? proximaMarcacao;

  const RegistroPontoDia({
    this.id,
    required this.data,
    this.entrada,
    this.inicioIntervalo,
    this.fimIntervalo,
    this.saida,
    required this.status,
    this.atrasoMinutos,
    this.totalTrabalhadoMinutos,
    this.proximaMarcacao,
  });

  String? horarioDe(TipoMarcacao tipo) {
    switch (tipo) {
      case TipoMarcacao.entrada:
        return entrada;
      case TipoMarcacao.inicioIntervalo:
        return inicioIntervalo;
      case TipoMarcacao.fimIntervalo:
        return fimIntervalo;
      case TipoMarcacao.saida:
        return saida;
    }
  }

  bool jaRegistrado(TipoMarcacao tipo) => horarioDe(tipo) != null;

  double get percentualJornada {
    final registrados = TipoMarcacao.values.where(jaRegistrado).length;
    return registrados / TipoMarcacao.values.length;
  }

  String get horasFormatadas {
    if (totalTrabalhadoMinutos == null) return '00h00';
    final h = totalTrabalhadoMinutos! ~/ 60;
    final m = totalTrabalhadoMinutos! % 60;
    return '${h.toString().padLeft(2, '0')}h${m.toString().padLeft(2, '0')}';
  }

  factory RegistroPontoDia.fromJson(Map<String, dynamic> json) {
    String? hhmm(String? valor) => valor == null ? null : valor.substring(0, 5);

    return RegistroPontoDia(
      id: json['id'] as int?,
      data: DateTime.parse(json['dataRegistro'] as String),
      entrada: hhmm(json['entrada'] as String?),
      inicioIntervalo: hhmm(json['inicioIntervalo'] as String?),
      fimIntervalo: hhmm(json['fimIntervalo'] as String?),
      saida: hhmm(json['saida'] as String?),
      status: StatusDiaLabel.fromJson(json['status'] as String? ?? 'PENDENTE'),
      atrasoMinutos: json['atrasoMinutos'] as int?,
      totalTrabalhadoMinutos: json['totalTrabalhadoMinutos'] as int?,
      proximaMarcacao: TipoMarcacaoLabel.fromJson(json['proximaMarcacao'] as String?),
    );
  }
}

/// Um dia de histórico já formatado para exibição (usado por HistoricoScreen).
/// Montado a partir de [RegistroPontoDia] no serviço, para manter a tela
/// exatamente como estava.
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
