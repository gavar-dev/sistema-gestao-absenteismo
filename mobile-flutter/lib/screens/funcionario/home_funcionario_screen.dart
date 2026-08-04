import '../../services/theme_service.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../models/registro_ponto.dart';
import '../../services/auth_service.dart';
import '../../services/mock_data_service.dart';
import '../../theme/app_theme.dart';
import '../../widgets/resumo_card.dart';
import '../../widgets/status_chip.dart';
import '../login/login_screen.dart';
import 'meus_dados_screen.dart';

/// Equivalente à `inicio-componente` do Angular: resumo do dia, ações
/// rápidas e os registros de ponto de hoje.
class HomeFuncionarioScreen extends StatelessWidget {
  final void Function(int indiceAba) aoNavegar;

  const HomeFuncionarioScreen({super.key, required this.aoNavegar});

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthService>();
    final dados = context.watch<MockDataService>();
    final usuario = auth.usuarioLogado!;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Início'),
        actions: [
          IconButton(
            tooltip: 'Meus dados',
            icon: CircleAvatar(
              radius: 14,
              backgroundColor: Colors.white24,
              child: Text(
                usuario.iniciais,
                style: const TextStyle(fontSize: 12, color: Colors.white),
              ),
            ),
            onPressed: () => Navigator.of(context).push(
              MaterialPageRoute(builder: (_) => const MeusDadosScreen()),
            ),
          ),
          IconButton(
            tooltip: 'Alternar tema',
            icon: Icon(context.watch<ThemeService>().isEscuro
                ? Icons.light_mode_outlined
                : Icons.dark_mode_outlined),
            onPressed: () => context.read<ThemeService>().alternarTema(),
          ),
          IconButton(
            tooltip: 'Sair',
            icon: const Icon(Icons.logout),
            onPressed: () {
              auth.sair();
              Navigator.of(context).pushAndRemoveUntil(
                MaterialPageRoute(builder: (_) => const LoginScreen()),
                    (route) => false,
              );
            },
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Text(
            'Olá, ${usuario.nome.split(' ').first} 👋',
            style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
          ),
          Text(
            '${usuario.cargo} · ${usuario.setor}',
            style: TextStyle(color: Colors.grey.shade600),
          ),
          const SizedBox(height: 20),

          SizedBox(
            height: 150,
            child: ListView(
              scrollDirection: Axis.horizontal,
              children: [
                ResumoCard(
                  titulo: 'Entrada de hoje',
                  valor: dados.horarioDe(TipoMarcacao.entrada) ?? '--:--',
                  detalhe: 'Dentro da tolerância',
                  icone: Icons.login,
                  tipo: TipoResumo.positivo,
                ),
                const SizedBox(width: 12),
                ResumoCard(
                  titulo: 'Jornada de hoje',
                  valor: '${(dados.percentualJornada * 100).round()}%',
                  detalhe: 'Marcações registradas',
                  icone: Icons.hourglass_bottom,
                  tipo: TipoResumo.neutro,
                ),
                const SizedBox(width: 12),
                ResumoCard(
                  titulo: 'Avisos',
                  valor: '${dados.avisosNaoLidos}',
                  detalhe: 'Não lidos no momento',
                  icone: Icons.notifications_active_outlined,
                  tipo: dados.avisosNaoLidos > 0
                      ? TipoResumo.atencao
                      : TipoResumo.positivo,
                ),
              ],
            ),
          ),

          const SizedBox(height: 24),
          const Text('Ações rápidas',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
          const SizedBox(height: 12),
          GridView.count(
            crossAxisCount: 2,
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            mainAxisSpacing: 12,
            crossAxisSpacing: 12,
            childAspectRatio: 1.5,
            children: [
              _AcaoRapida(
                titulo: 'Bater ponto',
                icone: Icons.fingerprint,
                destaque: true,
                onTap: () => aoNavegar(1),
              ),
              _AcaoRapida(
                titulo: 'Solicitar correção',
                icone: Icons.edit_note_outlined,
                onTap: () => aoNavegar(3),
              ),
              _AcaoRapida(
                titulo: 'Ver histórico',
                icone: Icons.history,
                onTap: () => aoNavegar(2),
              ),
              _AcaoRapida(
                titulo: 'Meus dados',
                icone: Icons.person_outline,
                onTap: () => Navigator.of(context).push(
                  MaterialPageRoute(builder: (_) => const MeusDadosScreen()),
                ),
              ),
            ],
          ),

          const SizedBox(height: 24),
          const Text('Registros de hoje',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
          const SizedBox(height: 12),
          ...TipoMarcacao.values.map((tipo) {
            final registrado = dados.jaRegistrado(tipo);
            final horario = dados.horarioDe(tipo);
            return Card(
              child: ListTile(
                leading: Icon(
                  registrado ? Icons.check_circle : Icons.radio_button_unchecked,
                  color: registrado ? StatusColors.positivo : Colors.grey,
                ),
                title: Text(tipo.label),
                subtitle: Text(registrado ? 'Registrado às $horario' : 'Ainda não registrado'),
                trailing: StatusChip(
                  texto: registrado ? 'Registrado' : 'Pendente',
                  cor: registrado ? StatusColors.positivo : StatusColors.atencao,
                ),
              ),
            );
          }),
        ],
      ),
    );
  }
}

class _AcaoRapida extends StatelessWidget {
  final String titulo;
  final IconData icone;
  final bool destaque;
  final VoidCallback onTap;

  const _AcaoRapida({
    required this.titulo,
    required this.icone,
    required this.onTap,
    this.destaque = false,
  });

  @override
  Widget build(BuildContext context) {
    final corPrimaria = Theme.of(context).colorScheme.primary;
    final corTexto = Theme.of(context).textTheme.bodyLarge?.color;
    return Card(
      color: destaque ? corPrimaria : null, // null = usa o cardTheme (claro ou escuro)
      child: InkWell(
        borderRadius: BorderRadius.circular(16),
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(icone, color: destaque ? Colors.white : corPrimaria),
              const SizedBox(height: 10),
              Text(
                titulo,
                style: TextStyle(
                  fontWeight: FontWeight.w600,
                  color: destaque ? Colors.white : corTexto,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}