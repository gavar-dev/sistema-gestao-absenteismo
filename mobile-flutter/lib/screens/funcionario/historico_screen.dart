import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../models/registro_ponto.dart';
import '../../services/mock_data_service.dart';
import '../../theme/app_theme.dart';
import '../../widgets/status_chip.dart';

/// Equivalente à `historico-componente` do Angular: lista os registros de
/// ponto anteriores, com filtro por status e busca por texto.
class HistoricoScreen extends StatefulWidget {
  const HistoricoScreen({super.key});

  @override
  State<HistoricoScreen> createState() => _HistoricoScreenState();
}

class _HistoricoScreenState extends State<HistoricoScreen> {
  StatusDia? _filtroStatus;
  final _buscaController = TextEditingController();

  @override
  void dispose() {
    _buscaController.dispose();
    super.dispose();
  }

  Color _corStatus(StatusDia status) {
    switch (status) {
      case StatusDia.completo:
        return StatusColors.positivo;
      case StatusDia.incompleto:
      case StatusDia.atraso:
        return StatusColors.atencao;
      case StatusDia.faltaJustificada:
        return StatusColors.info;
      case StatusDia.falta:
        return StatusColors.perigo;
    }
  }

  @override
  Widget build(BuildContext context) {
    final dados = context.watch<MockDataService>();
    final busca = _buscaController.text.trim().toLowerCase();

    final registrosFiltrados = dados.historico.where((registro) {
      final statusConfere = _filtroStatus == null || registro.status == _filtroStatus;
      final buscaConfere = busca.isEmpty ||
          registro.data.toLowerCase().contains(busca) ||
          registro.diaSemana.toLowerCase().contains(busca) ||
          registro.observacao.toLowerCase().contains(busca);
      return statusConfere && buscaConfere;
    }).toList();

    return Scaffold(
      appBar: AppBar(title: const Text('Histórico')),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
            child: Column(
              children: [
                TextField(
                  controller: _buscaController,
                  onChanged: (_) => setState(() {}),
                  decoration: const InputDecoration(
                    hintText: 'Buscar por data, dia ou observação',
                    prefixIcon: Icon(Icons.search),
                  ),
                ),
                const SizedBox(height: 10),
                SizedBox(
                  height: 40,
                  child: ListView(
                    scrollDirection: Axis.horizontal,
                    children: [
                      _FiltroChip(
                        label: 'Todos',
                        selecionado: _filtroStatus == null,
                        onTap: () => setState(() => _filtroStatus = null),
                      ),
                      ...StatusDia.values.map(
                        (status) => _FiltroChip(
                          label: status.label,
                          selecionado: _filtroStatus == status,
                          onTap: () => setState(() => _filtroStatus = status),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          Expanded(
            child: registrosFiltrados.isEmpty
                ? const Center(child: Text('Nenhum registro encontrado.'))
                : ListView.builder(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    itemCount: registrosFiltrados.length,
                    itemBuilder: (context, index) {
                      final registro = registrosFiltrados[index];
                      return Card(
                        child: Padding(
                          padding: const EdgeInsets.all(14),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(registro.data,
                                          style: const TextStyle(fontWeight: FontWeight.bold)),
                                      Text(registro.diaSemana,
                                          style: TextStyle(color: Colors.grey.shade600, fontSize: 12)),
                                    ],
                                  ),
                                  StatusChip(
                                    texto: registro.status.label,
                                    cor: _corStatus(registro.status),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 10),
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  _horarioMini('Entrada', registro.entrada),
                                  _horarioMini('Almoço', registro.almoco),
                                  _horarioMini('Retorno', registro.retorno),
                                  _horarioMini('Saída', registro.saida),
                                ],
                              ),
                              const SizedBox(height: 8),
                              Text('Total: ${registro.horas}',
                                  style: const TextStyle(fontWeight: FontWeight.w600)),
                              const SizedBox(height: 4),
                              Text(registro.observacao,
                                  style: TextStyle(color: Colors.grey.shade600, fontSize: 12)),
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

  Widget _horarioMini(String rotulo, String horario) {
    return Column(
      children: [
        Text(rotulo, style: TextStyle(fontSize: 11, color: Colors.grey.shade600)),
        Text(horario, style: const TextStyle(fontWeight: FontWeight.w600)),
      ],
    );
  }
}

class _FiltroChip extends StatelessWidget {
  final String label;
  final bool selecionado;
  final VoidCallback onTap;

  const _FiltroChip({
    required this.label,
    required this.selecionado,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(right: 8),
      child: ChoiceChip(
        label: Text(label),
        selected: selecionado,
        onSelected: (_) => onTap(),
      ),
    );
  }
}
