import '../../models/usuario.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../services/api_client.dart';
import '../../services/auth_service.dart';
import '../../services/mock_data_service.dart';
import '../funcionario/funcionario_shell.dart';
import '../gestao/gestao_shell.dart';

/// Tela de login real: autentica contra `POST /api/auth/login` (JWT) e,
/// se der certo, carrega os dados do perfil antes de navegar.
///
/// Os atalhos abaixo do formulário só preenchem o e-mail dos usuários de
/// teste criados pelo `DataSeeder` do back-end (senha: Teste@123) — não
/// pulam a autenticação de verdade.
class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController(text: 'funcionario@gmail.com');
  final _senhaController = TextEditingController();
  bool _senhaVisivel = false;
  bool _entrando = false;
  String? _erro;

  @override
  void dispose() {
    _emailController.dispose();
    _senhaController.dispose();
    super.dispose();
  }

  Future<void> _entrar() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() {
      _entrando = true;
      _erro = null;
    });

    final auth = context.read<AuthService>();

    try {
      await auth.entrar(_emailController.text, _senhaController.text);
      final usuario = auth.usuarioLogado!;

      // Busca avisos, ponto de hoje, histórico e (se RH/gestor) funcionários
      // e solicitações antes de entrar no app.
      await context.read<MockDataService>().carregarDados(usuario);

      if (!mounted) return;

      final destino = usuario.tipo.ehGestorOuRh ? const GestaoShell() : const FuncionarioShell();
      Navigator.of(context).pushReplacement(MaterialPageRoute(builder: (_) => destino));
    } on ApiException catch (e) {
      setState(() => _erro = e.mensagem);
    } catch (e, stack) {
      // ignore: avoid_print
      print('ERRO REAL: $e\n$stack');
      setState(() => _erro = 'Não foi possível conectar ao servidor. Verifique se o back-end está rodando.');
    } finally {
      if (mounted) setState(() => _entrando = false);
    }
  }

  void _preencherAtalho(String email) {
    setState(() {
      _emailController.text = email;
      _senhaController.text = 'Teste@123';
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24),
            child: Form(
              key: _formKey,
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
                  if (_erro != null) ...[
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: Colors.red.withValues(alpha: 0.08),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: Colors.red.withValues(alpha: 0.3)),
                      ),
                      child: Row(
                        children: [
                          const Icon(Icons.error_outline, color: Colors.red, size: 20),
                          const SizedBox(width: 8),
                          Expanded(child: Text(_erro!, style: const TextStyle(color: Colors.red))),
                        ],
                      ),
                    ),
                    const SizedBox(height: 16),
                  ],
                  TextFormField(
                    controller: _emailController,
                    keyboardType: TextInputType.emailAddress,
                    decoration: const InputDecoration(
                      labelText: 'E-mail corporativo',
                      prefixIcon: Icon(Icons.email_outlined),
                    ),
                    validator: (valor) =>
                        (valor == null || valor.trim().isEmpty) ? 'Informe o e-mail' : null,
                  ),
                  const SizedBox(height: 16),
                  TextFormField(
                    controller: _senhaController,
                    obscureText: !_senhaVisivel,
                    decoration: InputDecoration(
                      labelText: 'Senha',
                      prefixIcon: const Icon(Icons.lock_outline),
                      suffixIcon: IconButton(
                        icon: Icon(_senhaVisivel
                            ? Icons.visibility_off_outlined
                            : Icons.visibility_outlined),
                        onPressed: () => setState(() => _senhaVisivel = !_senhaVisivel),
                      ),
                    ),
                    onFieldSubmitted: (_) => _entrar(),
                    validator: (valor) =>
                        (valor == null || valor.isEmpty) ? 'Informe a senha' : null,
                  ),
                  const SizedBox(height: 24),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton.icon(
                      onPressed: _entrando ? null : _entrar,
                      icon: _entrando
                          ? const SizedBox(
                              width: 18,
                              height: 18,
                              child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                            )
                          : const Icon(Icons.login),
                      label: Text(_entrando ? 'Entrando...' : 'Entrar'),
                    ),
                  ),
                  const SizedBox(height: 28),
                  Text(
                    'Usuários de teste (criados pelo DataSeeder do back-end):',
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
                        label: 'Funcionário',
                        icone: Icons.badge_outlined,
                        onTap: () => _preencherAtalho('funcionario@gmail.com'),
                      ),
                      _AtalhoPerfil(
                        label: 'RH',
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
