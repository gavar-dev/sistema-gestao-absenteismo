/// Tipos de acesso do sistema. Os valores bytes com o enum `TipoUsuario`
/// do back-end real (br.com.senac...funcionario.model.TipoUsuario).
enum TipoUsuario { funcionario, gestor, rh }

extension TipoUsuarioLabel on TipoUsuario {
  String get label {
    switch (this) {
      case TipoUsuario.funcionario:
        return 'Funcionário';
      case TipoUsuario.gestor:
        return 'Gestor';
      case TipoUsuario.rh:
        return 'RH';
    }
  }

  bool get ehGestorOuRh => this == TipoUsuario.gestor || this == TipoUsuario.rh;

  static TipoUsuario fromJson(String valor) {
    switch (valor.toUpperCase()) {
      case 'GESTOR':
        return TipoUsuario.gestor;
      case 'RH':
        return TipoUsuario.rh;
      default:
        return TipoUsuario.funcionario;
    }
  }
}

/// Usuário autenticado no app. Combina o que vem do `POST /api/auth/login`
/// (token + tipoAcesso) com o que vem de `GET /api/funcionarios/me`
/// (nome, cargo, setor etc.) — o login sozinho não traz o perfil completo.
class Usuario {
  final int id;
  final String nome;
  final String email;
  final String cargo;
  final String setor;
  final String matricula;
  final String cpf;
  final String telefone;
  final String dataAdmissao;
  final TipoUsuario tipo;

  const Usuario({
    required this.id,
    required this.nome,
    required this.email,
    required this.cargo,
    required this.setor,
    required this.matricula,
    required this.cpf,
    required this.telefone,
    required this.dataAdmissao,
    required this.tipo,
  });

  /// Iniciais calculadas a partir do nome (ex.: "Maria Silva" -> "MS"),
  /// já que o back-end não guarda esse campo separadamente.
  String get iniciais {
    final partes = nome.trim().split(RegExp(r'\s+'));
    final primeira = partes.isNotEmpty ? partes.first.substring(0, 1) : '';
    final ultima = partes.length > 1 ? partes.last.substring(0, 1) : '';
    return (primeira + ultima).toUpperCase();
  }

  factory Usuario.fromFuncionarioJson(Map<String, dynamic> json) {
    String dataFormatada(String? iso) {
      if (iso == null) return '--';
      final data = DateTime.tryParse(iso);
      if (data == null) return iso;
      return '${data.day.toString().padLeft(2, '0')}/${data.month.toString().padLeft(2, '0')}/${data.year}';
    }

    return Usuario(
      id: json['id'] as int,
      nome: json['nomeCompleto'] as String,
      email: json['emailCorporativo'] as String,
      cargo: json['cargo'] as String? ?? '',
      setor: json['setor'] as String? ?? '',
      matricula: json['matricula'] as String? ?? '',
      cpf: json['cpf'] as String? ?? '',
      telefone: json['telefone'] as String? ?? '',
      dataAdmissao: dataFormatada(json['dataAdmissao'] as String?),
      tipo: TipoUsuarioLabel.fromJson(json['tipoAcesso'] as String),
    );
  }
}
