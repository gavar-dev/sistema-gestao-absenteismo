import '../../services/theme_service.dart'; // adicionar no topo, junto aos outros imports
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../models/funcionario.dart';
import '../../models/usuario.dart';
import '../../services/auth_service.dart';
import '../../services/mock_data_service.dart';
import '../../theme/app_theme.dart';
import '../../widgets/resumo_card.dart';
import '../funcionario/meus_dados_screen.dart';
import '../login/login_screen.dart';

/// Equivalente à `inicio-component` (área admin-rh) do Angular: indicadores
/// gerais de absenteísmo, distribuição de status dos funcionários e
/// alertas de atenção para o RH/gestor.
class HomeGestaoScreen extends StatelessWidget {
  final void Function(int indiceAba) aoNavegar;

  const HomeGestaoScreen({super.key, required this.aoNavegar});

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthService>();
    final dados = context.watch<MockDataService>();
    final usuario = auth.usuarioLogado!;

    final total = dados.funcionarios.length;
    final ativos = dados.funcionarios.where((f) => f.status == StatusFuncionario.ativo).length;
    final totalAtrasos = dados.funcionarios.fold<int>(0, (soma, f) => soma + f.atrasos);
    final totalFaltas = dados.funcionarios.fold<int>(0, (soma, f) => soma + f.faltas);

    final porStatus = <StatusFuncionario, int>{};
    for (final f in dados.funcionarios) {
      porStatus[f.status] = (porStatus[f.status] ?? 0) + 1;
    }

    final maisCriticos = [...dados.funcionarios]
      ..sort((a, b) => (b.atrasos + b.faltas).compareTo(a.atrasos + a.faltas));

    return Scaffold(
      appBar: AppBar(
        title: Text('Gestão · ${usuario.tipo.label}'),
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
            onPressed: () async {
              context.read<MockDataService>().limpar();
              await auth.sair();
              if (context.mounted) {
                Navigator.of(context).pushAndRemoveUntil(
                  MaterialPageRoute(builder: (_) => const LoginScreen()),
                      (route) => false,
                );
              }
            },
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Text('Olá, ${usuario.nome.split(' ').first} 👋',
              style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
          Text('Visão geral de ponto e absenteísmo da equipe',
              style: TextStyle(color: Colors.grey.shade600)),
          const SizedBox(height: 20),

          SizedBox(
            height: 150,
            child: ListView(
              scrollDirection: Axis.horizontal,
              children: [
                ResumoCard(
                  titulo: 'Funcionários',
                  valor: '$total',
                  detalhe: '$ativos ativos no momento',
                  icone: Icons.groups_outlined,
                  tipo: TipoResumo.positivo,
                ),
                const SizedBox(width: 12),
                ResumoCard(
                  titulo: 'Atrasos no mês',
                  valor: '$totalAtrasos',
                  detalhe: 'Somando todos os setores',
                  icone: Icons.alarm,
                  tipo: TipoResumo.atencao,
                ),
                const SizedBox(width: 12),
                ResumoCard(
                  titulo: 'Faltas no mês',
                  valor: '$totalFaltas',
                  detalhe: 'Revisar pendências',
                  icone: Icons.event_busy_outlined,
                  tipo: TipoResumo.perigo,
                ),
                const SizedBox(width: 12),
                ResumoCard(
                  titulo: 'Solicitações',
                  valor: '${dados.solicitacoesPendentes}',
                  detalhe: 'Aguardando análise',
                  icone: Icons.assignment_outlined,
                  tipo: dados.solicitacoesPendentes > 0
                      ? TipoResumo.atencao
                      : TipoResumo.positivo,
                ),
              ],
            ),
          ),

          const SizedBox(height: 24),
          const Text('Distribuição por status',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
          const SizedBox(height: 12),
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                children: StatusFuncionario.values.map((status) {
                  final quantidade = porStatus[status] ?? 0;
                  final percentual = total == 0 ? 0.0 : quantidade / total;
                  return Padding(
                    padding: const EdgeInsets.symmetric(vertical: 6),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(status.label),
                            Text('$quantidade · ${(percentual * 100).round()}%'),
                          ],
                        ),
                        const SizedBox(height: 4),
                        ClipRRect(
                          borderRadius: BorderRadius.circular(6),
                          child: LinearProgressIndicator(
                            value: percentual,
                            minHeight: 8,
                            color: _corStatus(status),
                            backgroundColor: Colors.grey.shade200,
                          ),
                        ),
                      ],
                    ),
                  );
                }).toList(),
              ),
            ),
          ),

          const SizedBox(height: 24),
          const Text('Funcionários que exigem atenção',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
          const SizedBox(height: 12),
          ...maisCriticos.take(3).map((f) => Card(
            child: ListTile(
              leading: CircleAvatar(child: Text(f.nome.substring(0, 1))),
              title: Text(f.nome),
              subtitle: Text('${f.setor} · ${f.cargo}'),
              trailing: Text(
                '${f.atrasos} atraso(s)\n${f.faltas} falta(s)',
                textAlign: TextAlign.right,
                style: const TextStyle(fontSize: 12),
              ),
              onTap: () => aoNavegar(1),
            ),
          )),

          const SizedBox(height: 12),
          OutlinedButton.icon(
            onPressed: () => aoNavegar(1),
            icon: const Icon(Icons.groups_outlined),
            label: const Text('Ver todos os funcionários'),
          ),
        ],
      ),
    );
  }

  Color _corStatus(StatusFuncionario status) {
    switch (status) {
      case StatusFuncionario.ativo:
        return StatusColors.positivo;
      case StatusFuncionario.ferias:
        return StatusColors.atencao;
      case StatusFuncionario.afastado:
        return StatusColors.info;
      case StatusFuncionario.inativo:
        return StatusColors.neutro;
    }
  }
}