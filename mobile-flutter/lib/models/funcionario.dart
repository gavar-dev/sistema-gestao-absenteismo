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
}

/// Equivalente ao registro usado na tela `gestao-component` do Angular:
/// lista de funcionários gerenciados pelo RH/gestor.
class Funcionario {
  final String nome;
  final String setor;
  final String cargo;
  final StatusFuncionario status;
  final int atrasos;
  final int faltas;

  const Funcionario({
    required this.nome,
    required this.setor,
    required this.cargo,
    required this.status,
    required this.atrasos,
    required this.faltas,
  });
}
