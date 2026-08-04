import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../models/solicitacao.dart';
import '../../services/mock_data_service.dart';
import '../../theme/app_theme.dart';
import '../../widgets/status_chip.dart';

/// Equivalente à `solicitacoes-component` (área admin-rh) do Angular:
/// permite ao RH/gestor aprovar ou negar as solicitações enviadas pelos
/// funcionários.
class SolicitacoesGestaoScreen extends StatelessWidget {
  const SolicitacoesGestaoScreen({super.key});

  Color _corStatus(StatusSolicitacao status) {
    switch (status) {
      case StatusSolicitacao.pendente:
        return StatusColors.atencao;
      case StatusSolicitacao.aprovada:
        return StatusColors.positivo;
      case StatusSolicitacao.concluida:
        return StatusColors.info;
      case StatusSolicitacao.negada:
        return StatusColors.perigo;
    }
  }

  @override
  Widget build(BuildContext context) {
    final dados = context.watch<MockDataService>();
    final pendentes = dados.solicitacoes
        .where((s) => s.status == StatusSolicitacao.pendente)
        .toList();
    final resolvidas = dados.solicitacoes
        .where((s) => s.status != StatusSolicitacao.pendente)
        .toList();

    return Scaffold(
      appBar: AppBar(title: const Text('Solicitações')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Text('Pendentes (${pendentes.length})',
              style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
          const SizedBox(height: 12),
          if (pendentes.isEmpty)
            const Text('Nenhuma solicitação pendente. Tudo em dia! ✅'),
          ...pendentes.map((solicitacao) => Card(
                child: Padding(
                  padding: const EdgeInsets.all(14),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(solicitacao.tipo.titulo,
                                    style: const TextStyle(fontWeight: FontWeight.bold)),
                                Text('${solicitacao.funcionario} · ${solicitacao.codigo}'),
                              ],
                            ),
                          ),
                          StatusChip(
                            texto: solicitacao.status.label,
                            cor: _corStatus(solicitacao.status),
                          ),
                        ],
                      ),
                      if (solicitacao.descricao.isNotEmpty) ...[
                        const SizedBox(height: 8),
                        Text(solicitacao.descricao,
                            style: TextStyle(color: Colors.grey.shade700)),
                      ],
                      const SizedBox(height: 12),
                      Row(
                        children: [
                          Expanded(
                            child: OutlinedButton.icon(
                              icon: const Icon(Icons.close, size: 18),
                              label: const Text('Negar'),
                              onPressed: () => context
                                  .read<MockDataService>()
                                  .atualizarStatusSolicitacao(
                                      solicitacao, StatusSolicitacao.negada),
                            ),
                          ),
                          const SizedBox(width: 8),
                          Expanded(
                            child: ElevatedButton.icon(
                              icon: const Icon(Icons.check, size: 18),
                              label: const Text('Aprovar'),
                              onPressed: () => context
                                  .read<MockDataService>()
                                  .atualizarStatusSolicitacao(
                                      solicitacao, StatusSolicitacao.aprovada),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              )),
          const SizedBox(height: 24),
          Text('Histórico (${resolvidas.length})',
              style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
          const SizedBox(height: 12),
          ...resolvidas.map((solicitacao) => Card(
                child: ListTile(
                  title: Text(solicitacao.tipo.titulo),
                  subtitle: Text('${solicitacao.funcionario} · ${solicitacao.data}'),
                  trailing: StatusChip(
                    texto: solicitacao.status.label,
                    cor: _corStatus(solicitacao.status),
                  ),
                ),
              )),
        ],
      ),
    );
  }
}
