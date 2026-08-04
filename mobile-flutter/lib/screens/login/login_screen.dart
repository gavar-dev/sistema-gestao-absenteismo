import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../models/usuario.dart';
import '../../services/auth_service.dart';
import '../funcionario/funcionario_shell.dart';
import '../gestao/gestao_shell.dart';

/// Tela de login. Não existe back-end de autenticação: assim como no
/// `login-component.ts` do Angular, o "tipo de usuário" é decidido a
/// partir do e-mail digitado (veja `AuthService.entrar`).
class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _emailController = TextEditingController(text: 'funcionario@gmail.com');
  final _senhaController = TextEditingController(text: '••••••••');
  bool _senhaVisivel = false;

  @override
  void dispose() {
    _emailController.dispose();
    _senhaController.dispose();
    super.dispose();
  }

  void _entrar() {
    final auth = context.read<AuthService>();
    auth.entrar(_emailController.text);

    final usuario = auth.usuarioLogado!;
    final destino = usuario.tipo.ehGestorOuRh
        ? const GestaoShell()
        : const FuncionarioShell();

    Navigator.of(context).pushReplacement(
      MaterialPageRoute(builder: (_) => destino),
    );
  }

  void _preencherAtalho(String email) {
    setState(() => _emailController.text = email);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(Icons.groups_rounded, size: 72, color: Color(0xFF3949AB)),
                const SizedBox(height: 12),
                Text(
                  'Gestão de Pessoas',
                  style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                ),
                const SizedBox(height: 4),
                Text(
                  'Ponto, absenteísmo e solicitações em um só lugar',
                  style: TextStyle(color: Colors.grey.shade600),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 32),
                TextField(
                  controller: _emailController,
                  keyboardType: TextInputType.emailAddress,
                  decoration: const InputDecoration(
                    labelText: 'E-mail corporativo',
                    prefixIcon: Icon(Icons.email_outlined),
                  ),
                ),
                const SizedBox(height: 16),
                TextField(
                  controller: _senhaController,
                  obscureText: !_senhaVisivel,
                  decoration: InputDecoration(
                    labelText: 'Senha',
                    prefixIcon: const Icon(Icons.lock_outline),
                    suffixIcon: IconButton(
                      icon: Icon(_senhaVisivel
                          ? Icons.visibility_off_outlined
                          : Icons.visibility_outlined),
                      onPressed: () =>
                          setState(() => _senhaVisivel = !_senhaVisivel),
                    ),
                  ),
                ),
                const SizedBox(height: 24),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton.icon(
                    onPressed: _entrar,
                    icon: const Icon(Icons.login),
                    label: const Text('Entrar'),
                  ),
                ),
                const SizedBox(height: 28),
                Text(
                  'Login de demonstração (sem back-end) — escolha o perfil:',
                  style: TextStyle(fontSize: 12, color: Colors.grey.shade600),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 10),
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  alignment: WrapAlignment.center,
                  children: [
                    _AtalhoPerfil(
                      label: TipoUsuario.funcionario.label,
                      icone: Icons.badge_outlined,
                      onTap: () => _preencherAtalho('funcionario@gmail.com'),
                    ),

                    _AtalhoPerfil(
                      label: TipoUsuario.rh.label,
                      icone: Icons.admin_panel_settings_outlined,
                      onTap: () => _preencherAtalho('rh.corporativo@gmail.com'),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _AtalhoPerfil extends StatelessWidget {
  final String label;
  final IconData icone;
  final VoidCallback onTap;

  const _AtalhoPerfil({
    required this.label,
    required this.icone,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return ActionChip(
      avatar: Icon(icone, size: 18),
      label: Text(label),
      onPressed: onTap,
    );
  }
}
