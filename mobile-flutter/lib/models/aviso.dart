enum TipoAviso { info, atencao, sucesso, urgente }

/// Equivalente a `AvisoFuncionario` do Angular: notificações mostradas
/// para o funcionário (prazo de justificativa, ponto pendente, etc.).
class Aviso {
  final int id;
  final String titulo;
  final String descricao;
  final String data;
  final String horario;
  final TipoAviso tipo;
  final String categoria;
  bool lido;

  Aviso({
    required this.id,
    required this.titulo,
    required this.descricao,
    required this.data,
    required this.horario,
    required this.tipo,
    required this.categoria,
    this.lido = false,
  });
}
