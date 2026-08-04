import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../models/funcionario.dart';
import '../../services/mock_data_service.dart';
import '../../theme/app_theme.dart';
import '../../widgets/status_chip.dart';

/// Equivalente à `gestao-component` do Angular: lista de funcionários
/// cadastrados, com busca por nome/setor e um FAB para abrir o cadastro
/// (equivalente à rota `/gestao/funcionarios/novo`).
class FuncionariosScreen extends StatefulWidget {
  const FuncionariosScreen({super.key});

  @override
  State<FuncionariosScreen> createState() => _FuncionariosScreenState();
}

class _FuncionariosScreenState extends State<FuncionariosScreen> {
  final _buscaController = TextEditingController();

  @override
  void dispose() {
    _buscaController.dispose();
    super.dispose();
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

  @override
  Widget build(BuildContext context) {
    final dados = context.watch<MockDataService>();
    final busca = _buscaController.text.trim().toLowerCase();

    final lista = dados.funcionarios.where((f) {
      return busca.isEmpty ||
          f.nome.toLowerCase().contains(busca) ||
          f.setor.toLowerCase().contains(busca) ||
          f.cargo.toLowerCase().contains(busca);
    }).toList();

    return Scaffold(
      appBar: AppBar(title: const Text('Funcionários')),
      
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16),
            child: TextField(
              controller: _buscaController,
              onChanged: (_) => setState(() {}),
              decoration: const InputDecoration(
                hintText: 'Buscar por nome, setor ou cargo',
                prefixIcon: Icon(Icons.search),
              ),
            ),
          ),
          Expanded(
            child: lista.isEmpty
                ? const Center(child: Text('Nenhum funcionário encontrado.'))
                : ListView.builder(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    itemCount: lista.length,
                    itemBuilder: (context, index) {
                      final f = lista[index];
                      return Card(
                        child: ListTile(
                          leading: CircleAvatar(child: Text(f.nome.substring(0, 1))),
                          title: Text(f.nome),
                          subtitle: Text('${f.setor} · ${f.cargo}'),
                          trailing: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            crossAxisAlignment: CrossAxisAlignment.end,
                            children: [
                              StatusChip(texto: f.status.label, cor: _corStatus(f.status)),
                              const SizedBox(height: 4),
                              Text(
                                '${f.atrasos} atraso(s) · ${f.faltas} falta(s)',
                                style: TextStyle(fontSize: 11, color: Colors.grey.shade600),
                              ),
                            ],
                          ),
                        ),
                      );
                    },
                  ),
          ),
        ],
      ),
    );
  }
}
