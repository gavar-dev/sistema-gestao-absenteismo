import 'package:flutter/material.dart';
import '../models/usuario.dart';

/// Login "mock", sem back-end: identifica o tipo de usuário pelo e-mail
/// digitado, exatamente como o `login-component.ts` do projeto Angular
/// (sistema-gestao-absenteismo) faz com `usuariosMock`.
///
/// Em uma próxima etapa, `entrar()` pode ser trocado por uma chamada HTTP
/// real (ex.: usando `http` ou `dio`) para uma API de autenticação.
class AuthService extends ChangeNotifier {
  Usuario? _usuarioLogado;

  Usuario? get usuarioLogado => _usuarioLogado;
  bool get estaLogado => _usuarioLogado != null;

  static const Map<String, TipoUsuario> _usuariosMock = {
    'rh.corporativo@gmail.com': TipoUsuario.rh,
    'gestor.corporativo@gmail.com': TipoUsuario.gestor,
  };

  /// Tenta autenticar com base no e-mail informado (qualquer senha é aceita
  /// no mock, assim como no protótipo Angular).
  void entrar(String email) {
    final emailNormalizado = email.trim().toLowerCase();
    final tipo = _usuariosMock[emailNormalizado] ?? TipoUsuario.funcionario;
    _usuarioLogado = _criarUsuarioMock(tipo, emailNormalizado);
    notifyListeners();
  }

  void sair() {
    _usuarioLogado = null;
    notifyListeners();
  }

  Usuario _criarUsuarioMock(TipoUsuario tipo, String email) {
    switch (tipo) {
      case TipoUsuario.rh:
        return const Usuario(
          nome: 'Renata Souza',
          email: 'rh.corporativo@gmail.com',
          cargo: 'Analista de RH',
          setor: 'Recursos Humanos',
          iniciais: 'RS',
          tipo: TipoUsuario.rh,
        );
      case TipoUsuario.gestor:
        return const Usuario(
          nome: 'Carla Mendes',
          email: 'gestor.corporativo@gmail.com',
          cargo: 'Gestora de RH',
          setor: 'Gestão de Pessoas',
          iniciais: 'CM',
          tipo: TipoUsuario.gestor,
        );
      case TipoUsuario.funcionario:
        return Usuario(
          nome: 'Maria Silva',
          email: email.isEmpty ? 'funcionario@gmail.com' : email,
          cargo: 'Analista de Vendas',
          setor: 'Comercial',
          iniciais: 'MS',
          tipo: TipoUsuario.funcionario,
        );
    }
  }
}
