import 'package:flutter/material.dart';

/// Guarda a preferência de tema (claro/escuro) escolhida pelo usuário,
/// igual ao AuthService e MockDataService — um ChangeNotifier simples.
class ThemeService extends ChangeNotifier {
  ThemeMode _themeMode = ThemeMode.system;

  ThemeMode get themeMode => _themeMode;
  bool get isEscuro => _themeMode == ThemeMode.dark;

  /// Alterna entre claro e escuro (usado no botão de sol/lua).
  void alternarTema() {
    _themeMode = _themeMode == ThemeMode.dark ? ThemeMode.light : ThemeMode.dark;
    notifyListeners();
  }
}