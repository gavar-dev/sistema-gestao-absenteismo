/// Espelha o enum `NivelAviso` do back-end (INFORMATIVO, SUCESSO, ALERTA, URGENTE).
enum TipoAviso { info, atencao, sucesso, urgente }

extension TipoAvisoJson on TipoAviso {
  static TipoAviso fromJson(String valor) {
    switch (valor) {
      case 'SUCESSO':
        return TipoAviso.sucesso;
      case 'ALERTA':
        return TipoAviso.atencao;
      case 'URGENTE':
        return TipoAviso.urgente;
      case 'INFORMATIVO':
      default:
        return TipoAviso.info;
    }
  }
}

/// Aviso enviado pelo RH (equivalente a `AvisoResponse` do back-end).
/// Diferente do mock antigo, o back-end não guarda "lido/não lido" por
/// funcionário — avisos são broadcast (para todos, um tipo de acesso ou
/// um setor), então esse controle não existe aqui.
class Aviso {
  final int id;
  final String titulo;
  final String descricao;
  final DateTime publicadoEm;
  final TipoAviso tipo;
  final String categoria; // usamos o nome de quem criou o aviso como "categoria"

  /// Quando true, o aviso fica sempre no topo da lista para todo mundo.
  /// Só o RH pode alternar isso (PATCH /avisos/{id}/fixar).
  bool fixado;

  /// Controle de "lido" é só local (em memória) — o back-end não guarda
  /// leitura por funcionário, já que avisos são broadcast. Reseta a cada
  /// novo login.
  bool lido;

  Aviso({
    required this.id,
    required this.titulo,
    required this.descricao,
    required this.publicadoEm,
    required this.tipo,
    required this.categoria,
    this.fixado = false,
    this.lido = false,
  });

  factory Aviso.fromJson(Map<String, dynamic> json) {
    return Aviso(
      id: json['id'] as int,
      titulo: json['titulo'] as String,
      descricao: json['mensagem'] as String,
      publicadoEm: DateTime.parse(json['publicadoEm'] as String),
      tipo: TipoAvisoJson.fromJson(json['nivel'] as String),
      categoria: 'RH',
      fixado: json['fixado'] as bool? ?? false,
    );
  }
}