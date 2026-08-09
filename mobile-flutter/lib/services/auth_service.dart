import 'package:flutter/material.dart';
import '../models/usuario.dart';
import 'api_client.dart';

/// Login real contra `POST /api/auth/login` (JWT). Depois de autenticar,
/// busca o perfil completo em `GET /api/funcionarios/me`, já que o login
/// sozinho só devolve id/nome/e-mail/matrícula/tipo de acesso/token.
class AuthService extends ChangeNotifier {
  final ApiClient _api = ApiClient.instancia;

  Usuario? _usuarioLogado;
  bool _carregando = false;

  Usuario? get usuarioLogado => _usuarioLogado;
  bool get estaLogado => _usuarioLogado != null;
  bool get carregando => _carregando;

  /// Lança [ApiException] com uma mensagem pronta para mostrar ao usuário
  /// (ex.: "E-mail ou senha inválidos.") em caso de falha.
  Future<void> entrar(String email, String senha) async {
    _carregando = true;
    notifyListeners();

    try {
      final loginResp = await _api.post(
        '/auth/login',
        corpo: {'email': email.trim(), 'senha': senha},
        comAuth: false,
      ) as Map<String, dynamic>;

      await _api.salvarToken(loginResp['token'] as String);

      final perfilResp = await _api.get('/funcionarios/me') as Map<String, dynamic>;
      _usuarioLogado = Usuario.fromFuncionarioJson(perfilResp);
    } finally {
      _carregando = false;
      notifyListeners();
    }
  }

  Future<void> sair() async {
    await _api.limparToken();
    _usuarioLogado = null;
    notifyListeners();
  }
}
