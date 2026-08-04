import 'package:flutter/material.dart';

/// Cores usadas para os "chips" de status (Ativo, Pendente, Atraso, etc.),
/// no mesmo espírito das classes `text-bg-*` do Bootstrap usadas no
/// projeto Angular original.
class StatusColors {
  static const positivo = Color(0xFF2E7D32);
  static const atencao = Color(0xFFF9A825);
  static const neutro = Color(0xFF546E7A);
  static const perigo = Color(0xFFC62828);
  static const info = Color(0xFF1565C0);
}

class AppTheme {
  static ThemeData get tema {
    const corPrimaria = Color(0xFF3949AB); // indigo - "gestão de pessoas"

    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.light,
      scaffoldBackgroundColor: const Color(0xFFF4F5F9),
      colorScheme: ColorScheme.fromSeed(seedColor: corPrimaria),
      appBarTheme: const AppBarTheme(
        centerTitle: true,
        backgroundColor: corPrimaria,
        foregroundColor: Colors.white,
        elevation: 0,
      ),
      cardTheme: CardThemeData(
        elevation: 2,
        margin: const EdgeInsets.symmetric(vertical: 8),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: Colors.white,
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          padding: const EdgeInsets.symmetric(vertical: 14),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        ),
      ),
    );
  }
  static ThemeData get temaEscuro {
    const corPrimaria = Color(0xFF7986CB);
    const fundo = Color(0xFF1E2130);       // era 0xFF121212 (bem mais escuro)
    const superficie = Color(0xFF2A2D42);  // cor dos cards e inputs

    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      scaffoldBackgroundColor: fundo,
      colorScheme: ColorScheme.fromSeed(
        seedColor: corPrimaria,
        brightness: Brightness.dark,
        surface: superficie,
      ),
      appBarTheme: const AppBarTheme(
        centerTitle: true,
        backgroundColor: superficie,
        foregroundColor: Colors.white,
        elevation: 0,
      ),
      cardTheme: CardThemeData(
        color: superficie,
        elevation: 2,
        margin: const EdgeInsets.symmetric(vertical: 8),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: superficie,
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          padding: const EdgeInsets.symmetric(vertical: 14),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        ),
      ),
    );
  }
  }

