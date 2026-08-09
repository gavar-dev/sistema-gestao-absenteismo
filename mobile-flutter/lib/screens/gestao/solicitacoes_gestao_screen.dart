import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../models/solicitacao.dart';
import '../../services/mock_data_service.dart';
import '../../theme/app_theme.dart';
import '../../widgets/status_chip.dart';

/// Equivalente à `solicitacoes-component` (área admin-rh) do Angular:
/// permite ao RH/gestor aprovar ou rejeitar as solicitações enviadas
/// pelos funcionários (PATCH /api/solicitacoes/{id}/aprovar ou /rejeitar).
class SolicitacoesGestaoScreen extends StatefulWidget {
  const SolicitacoesGestaoScreen({super.key});

  @override
  State<SolicitacoesGestaoScreen> createState() => _SolicitacoesGestaoScreenState();
}

class _SolicitacoesGestaoScreenState extends State<SolicitacoesGestaoScreen> {
  int? _processandoId;

  Color _corStatus(StatusSolicitacao status) {
    switch (status) {
      case StatusSolicitacao.pendente:
        return StatusColors.atencao;
      case StatusSolicitacao.aprovada:
        return StatusColors.positivo;
      case StatusSolicitacao.rejeitada:
        return StatusColors.perigo;
    }
  }

  Future<void> _aprovar(Solicitacao solicitacao) async {
    setState(() => _processandoId = solicitacao.id);
    try {
      await context.read<MockDataService>().aprovarSolicitacao(solicitacao);
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.toString())));
      }
    } finally {
      if (mounted) setState(() => _processandoId = null);
    }
  }

  Future<void> _rejeitar(Solicitacao solicitacao) async {
    final motivo = await _pedirMotivoRejeicao();
    if (motivo == null || motivo.trim().isEmpty) return;

    setState(() => _processandoId = solicitacao.id);
    try {
      await context.read<MockDataService>().rejeitarSolicitacao(solicitacao, motivo.trim());
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.toString())));
      }
    } finally {
      if (mounted) setState(() => _processandoId = null);
    }
  }

  /// O back-end exige um motivo com pelo menos 5 caracteres para rejeitar.
  Future<String?> _pedirMotivoRejeicao() {
    final controller = TextEditingController();
    final formKey = GlobalKey<FormState>();

    return showDialog<String>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Motivo da rejeição'),
        content: Form(
          key: formKey,
          child: TextFormField(
            controller: controller,
            autofocus: true,
            maxLines: 3,
            decoration: const InputDecoration(
              hintText: 'Explique por que a solicitação está sendo rejeitada',
            ),
            validator: (valor) => (valor == null || valor.trim().length < 5)
                ? 'Escreva pelo menos 5 caracteres'
                : null,
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Cancelar'),
          ),
          FilledButton(
            onPressed: () {
              if (formKey.currentState!.validate()) {
                Navigator.of(context).pop(controller.text);
              }
            },
            child: const Text('Rejeitar'),
          ),
        ],
      ),
    );
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
          ...pendentes.map((solicitacao) {
            final processando = _processandoId == solicitacao.id;
            return Card(
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
                            label: const Text('Rejeitar'),
                            onPressed: processando ? null : () => _rejeitar(solicitacao),
                          ),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: ElevatedButton.icon(
                            icon: processando
                                ? const SizedBox(
                                    width: 16,
                                    height: 16,
                                    child: CircularProgressIndicator(strokeWidth: 2),
                                  )
                                : const Icon(Icons.check, size: 18),
                            label: const Text('Aprovar'),
                            onPressed: processando ? null : () => _aprovar(solicitacao),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            );
          }),
          const SizedBox(height: 24),
          Text('Histórico (${resolvidas.length})',
              style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
          const SizedBox(height: 12),
          ...resolvidas.map((solicitacao) => Card(
                child: ListTile(
                  title: Text(solicitacao.tipo.titulo),
                  subtitle: Text('${solicitacao.funcionario} · ${solicitacao.codigo}'),
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
