import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../services/mock_data_service.dart';
import 'avisos_screen.dart';
import 'historico_screen.dart';
import 'home_funcionario_screen.dart';
import 'meu_ponto_screen.dart';
import 'solicitacao_screen.dart';

/// Casca de navegação do funcionário: uma `BottomNavigationBar` com as
/// 5 áreas equivalentes às rotas `/`, `/meus-pontos`, `/historico`,
/// `/solicitacao` e `/avisos` do Angular. "Meus dados" fica acessível
/// a partir da tela de Início.
class FuncionarioShell extends StatefulWidget {
  const FuncionarioShell({super.key});

  @override
  State<FuncionarioShell> createState() => _FuncionarioShellState();
}

class _FuncionarioShellState extends State<FuncionarioShell> {
  int _indiceAtual = 0;

  void irParaAba(int indice) => setState(() => _indiceAtual = indice);

  @override
  Widget build(BuildContext context) {
    final avisosNaoLidos = context.watch<MockDataService>().avisosNaoLidos;

    final telas = [
      HomeFuncionarioScreen(aoNavegar: irParaAba),
      const MeuPontoScreen(),
      const HistoricoScreen(),
      const SolicitacaoScreen(),
      const AvisosScreen(),
    ];

    return Scaffold(
      body: IndexedStack(index: _indiceAtual, children: telas),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _indiceAtual,
        onDestinationSelected: irParaAba,
        destinations: [
          const NavigationDestination(
            icon: Icon(Icons.home_outlined),
            selectedIcon: Icon(Icons.home),
            label: 'Início',
          ),
          const NavigationDestination(
            icon: Icon(Icons.fingerprint),
            label: 'Ponto',
          ),
          const NavigationDestination(
            icon: Icon(Icons.history),
            label: 'Histórico',
          ),
          const NavigationDestination(
            icon: Icon(Icons.edit_note_outlined),
            label: 'Solicitar',
          ),
          NavigationDestination(
            icon: Badge(
              isLabelVisible: avisosNaoLidos > 0,
              label: Text('$avisosNaoLidos'),
              child: const Icon(Icons.notifications_outlined),
            ),
            label: 'Avisos',
          ),
        ],
      ),
    );
  }
}
