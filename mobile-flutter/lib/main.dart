import 'package:flutter/material.dart';
import 'package:intl/date_symbol_data_local.dart';
import 'package:provider/provider.dart';
import 'screens/login/login_screen.dart';
import 'services/auth_service.dart';
import 'services/mock_data_service.dart';
import 'services/theme_service.dart';
import 'theme/app_theme.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await initializeDateFormatting('pt_BR', null);
  runApp(const GestaoPessoasApp());
}

class GestaoPessoasApp extends StatelessWidget {
  const GestaoPessoasApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthService()),
        ChangeNotifierProvider(create: (_) => MockDataService()),
        ChangeNotifierProvider(create: (_) => ThemeService()),
      ],
      child: Consumer<ThemeService>(
        builder: (context, themeService, _) {
          return MaterialApp(
            debugShowCheckedModeBanner: false,
            title: 'Gestão de Pessoas',
            theme: AppTheme.tema,
            darkTheme: AppTheme.temaEscuro,
            themeMode: themeService.themeMode,
            home: const LoginScreen(),
          );
        },
      ),
    );
  }
}