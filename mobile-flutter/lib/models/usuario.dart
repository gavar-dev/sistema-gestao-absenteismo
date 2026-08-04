/// Tipos de acesso do sistema, iguais ao `TipoUsuario` do projeto Angular
/// (sistema-gestao-absenteismo): funcionario, gestor ou rh.
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

  bool get ehGestorOuRh =>
      this == TipoUsuario.gestor || this == TipoUsuario.rh;
}

/// Representa o usuário autenticado no app (equivalente à interface
/// `UsuarioLogado` do front-end Angular).
class Usuario {
  final String nome;
  final String email;
  final String cargo;
  final String setor;
  final String iniciais;
  final TipoUsuario tipo;

  const Usuario({
    required this.nome,
    required this.email,
    required this.cargo,
    required this.setor,
    required this.iniciais,
    required this.tipo,
  });
}
