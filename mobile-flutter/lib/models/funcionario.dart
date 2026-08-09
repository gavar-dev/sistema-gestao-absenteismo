enum StatusFuncionario { ativo, ferias, afastado, inativo }

extension StatusFuncionarioLabel on StatusFuncionario {
  String get label {
    switch (this) {
      case StatusFuncionario.ativo:
        return 'Ativo';
      case StatusFuncionario.ferias:
        return 'Férias';
      case StatusFuncionario.afastado:
        return 'Afastado';
      case StatusFuncionario.inativo:
        return 'Inativo';
    }
  }

  static StatusFuncionario fromJson(String valor) {
    // O back-end serializa como "Ativo", "Férias", "Afastado", "Inativo".
    switch (valor.toLowerCase()) {
      case 'férias':
      case 'ferias':
        return StatusFuncionario.ferias;
      case 'afastado':
        return StatusFuncionario.afastado;
      case 'inativo':
        return StatusFuncionario.inativo;
      default:
        return StatusFuncionario.ativo;
    }
  }
}

/// Equivalente a FuncionarioResponse do back-end - usado na tela de gestão
/// (FuncionariosScreen) e no dashboard do RH/gestor.
///
/// `atrasos` é preenchido à parte (via GET /api/pontos/indicadores/ranking-atrasos),
/// já que o cadastro do funcionário não guarda esse número.
class Funcionario {
  final int id;
  final String nome;
  final String email;
  final String matricula;
  final String setor;
  final String cargo;
  final StatusFuncionario status;
  int atrasos;
  int faltas;

  Funcionario({
    required this.id,
    required this.nome,
    required this.email,
    required this.matricula,
    required this.setor,
    required this.cargo,
    required this.status,
    this.atrasos = 0,
    this.faltas = 0,
  });

  factory Funcionario.fromJson(Map<String, dynamic> json) {
    return Funcionario(
      id: json['id'] as int,
      nome: json['nomeCompleto'] as String,
      email: json['emailCorporativo'] as String,
      matricula: json['matricula'] as String? ?? '',
      setor: json['setor'] as String? ?? '',
      cargo: json['cargo'] as String? ?? '',
      status: StatusFuncionarioLabel.fromJson(json['status'] as String? ?? 'Ativo'),
    );
  }
}
