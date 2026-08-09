import 'dart:convert';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:http/http.dart' as http;
import '../config/app_config.dart';

/// Exceção lançada quando a API responde com erro. `mensagem` já vem no
/// formato pronto para mostrar ao usuário (equivalente ao `ApiError.mensagem`
/// do back-end).
class ApiException implements Exception {
  final int status;
  final String mensagem;
  final Map<String, String>? campos;

  ApiException(this.status, this.mensagem, {this.campos});

  @override
  String toString() => mensagem;
}

/// Camada fina sobre o pacote `http`: resolve a URL, injeta o header
/// `Authorization: Bearer <token>` quando existe uma sessão salva, e
/// converte respostas de erro no formato `ApiError` do back-end em
/// [ApiException].
class ApiClient {
  ApiClient._();
  static final ApiClient instancia = ApiClient._();

  final _storage = const FlutterSecureStorage();
  static const _chaveToken = 'jwt_token';

  Future<void> salvarToken(String token) => _storage.write(key: _chaveToken, value: token);

  Future<String?> obterToken() => _storage.read(key: _chaveToken);

  Future<void> limparToken() => _storage.delete(key: _chaveToken);

  Uri _uri(String caminho, [Map<String, String>? query]) {
    return Uri.parse('${AppConfig.baseUrl}$caminho').replace(queryParameters: query);
  }

  Future<Map<String, String>> _headers({bool comAuth = true}) async {
    final headers = {'Content-Type': 'application/json'};
    if (comAuth) {
      final token = await obterToken();
      if (token != null) headers['Authorization'] = 'Bearer $token';
    }
    return headers;
  }

  Future<dynamic> get(String caminho, {Map<String, String>? query}) async {
    final resp = await http.get(_uri(caminho, query), headers: await _headers());
    return _tratar(resp);
  }

  Future<dynamic> post(String caminho, {Object? corpo, bool comAuth = true}) async {
    final resp = await http.post(
      _uri(caminho),
      headers: await _headers(comAuth: comAuth),
      body: corpo == null ? null : jsonEncode(corpo),
    );
    return _tratar(resp);
  }

  Future<dynamic> put(String caminho, {Object? corpo}) async {
    final resp = await http.put(
      _uri(caminho),
      headers: await _headers(),
      body: corpo == null ? null : jsonEncode(corpo),
    );
    return _tratar(resp);
  }

  Future<dynamic> patch(String caminho, {Object? corpo}) async {
    final resp = await http.patch(
      _uri(caminho),
      headers: await _headers(),
      body: corpo == null ? null : jsonEncode(corpo),
    );
    return _tratar(resp);
  }

  dynamic _tratar(http.Response resp) {
    final corpoTexto = resp.body.isEmpty ? null : utf8.decode(resp.bodyBytes);

    if (resp.statusCode >= 200 && resp.statusCode < 300) {
      if (corpoTexto == null || corpoTexto.isEmpty) return null;
      return jsonDecode(corpoTexto);
    }

    // Tenta decodificar o formato ApiError do back-end; se não conseguir,
    // cai para uma mensagem genérica.
    String mensagem = 'Ocorreu um erro inesperado (HTTP ${resp.statusCode}).';
    Map<String, String>? campos;

    if (corpoTexto != null) {
      try {
        final json = jsonDecode(corpoTexto);
        if (json is Map<String, dynamic>) {
          mensagem = json['mensagem']?.toString() ?? mensagem;
          if (json['campos'] is Map) {
            campos = (json['campos'] as Map).map((k, v) => MapEntry(k.toString(), v.toString()));
          }
        }
      } catch (_) {
        // corpo não era JSON (ex.: 401 sem corpo) - mantém mensagem genérica
        if (resp.statusCode == 401) mensagem = 'Sessão expirada. Faça login novamente.';
        if (resp.statusCode == 403) mensagem = 'Você não tem permissão para essa ação.';
      }
    } else {
      if (resp.statusCode == 401) mensagem = 'E-mail ou senha inválidos.';
      if (resp.statusCode == 403) mensagem = 'Você não tem permissão para essa ação.';
    }

    throw ApiException(resp.statusCode, mensagem, campos: campos);
  }
}
