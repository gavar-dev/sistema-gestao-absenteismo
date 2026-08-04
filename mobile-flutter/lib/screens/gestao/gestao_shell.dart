import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../services/mock_data_service.dart';
import 'funcionarios_screen.dart';
import 'home_gestao_screen.dart';
import 'solicitacoes_gestao_screen.dart';

/// Casca de navegação do gestor/RH: equivalente às rotas `/gestao/inicio`,
/// `/gestao/funcionarios` e `/gestao/solicitacoes` do Angular.
class GestaoShell extends StatefulWidget {
  const GestaoShell({super.key});

  @override
  State<GestaoShell> createState() => _GestaoShellState();
}

class _GestaoShellState extends State<GestaoShell> {
  int _indiceAtual = 0;

  void irParaAba(int indice) => setState(() => _indiceAtual = indice);

  @override
  Widget build(BuildContext context) {
    final pendentes = context.watch<MockDataService>().solicitacoesPendentes;

    final telas = [
      HomeGestaoScreen(aoNavegar: irParaAba),
      const FuncionariosScreen(),
      const SolicitacoesGestaoScreen(),
    ];

    return Scaffold(
      body: IndexedStack(index: _indiceAtual, children: telas),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _indiceAtual,
        onDestinationSelected: irParaAba,
        destinations: [
          const NavigationDestination(
            icon: Icon(Icons.dashboard_outlined),
            selectedIcon: Icon(Icons.dashboard),
            label: 'Início',
          ),
          const NavigationDestination(
            icon: Icon(Icons.groups_outlined),
            selectedIcon: Icon(Icons.groups),
            label: 'Funcionários',
          ),
          NavigationDestination(
            icon: Badge(
              isLabelVisible: pendentes > 0,
              label: Text('$pendentes'),
              child: const Icon(Icons.assignment_outlined),
            ),
            label: 'Solicitações',
          ),
        ],
      ),
    );
  }
}
