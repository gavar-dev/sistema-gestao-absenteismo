import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../models/solicitacao.dart';
import '../../services/auth_service.dart';
import '../../services/mock_data_service.dart';
import '../../theme/app_theme.dart';
import '../../widgets/status_chip.dart';

/// Equivalente à `solicitacao-componente` do Angular: escolher um tipo de
/// pedido (correção de ponto, justificativa de falta, férias, correção de
/// cadastro), preencher uma descrição e enviar para o RH analisar.
class SolicitacaoScreen extends StatefulWidget {
  const SolicitacaoScreen({super.key});

  @override
  State<SolicitacaoScreen> createState() => _SolicitacaoScreenState();
}

class _SolicitacaoScreenState extends State<SolicitacaoScreen> {
  TipoSolicitacao _tipoSelecionado = TipoSolicitacao.correcaoPonto;
  final _descricaoController = TextEditingController();
  final _formKey = GlobalKey<FormState>();

  @override
  void dispose() {
    _descricaoController.dispose();
    super.dispose();
  }

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

  void _enviarSolicitacao() {
    if (!_formKey.currentState!.validate()) return;

    final usuario = context.read<AuthService>().usuarioLogado!;
    context.read<MockDataService>().criarSolicitacao(
          funcionario: usuario.nome,
          tipo: _tipoSelecionado,
          descricao: _descricaoController.text.trim(),
        );

    _descricaoController.clear();
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
          'Solicitação de ${_tipoSelecionado.titulo.toLowerCase()} enviada para o RH.',
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final usuario = context.watch<AuthService>().usuarioLogado!;
    final dados = context.watch<MockDataService>();
    final minhasSolicitacoes =
        dados.solicitacoes.where((s) => s.funcionario == usuario.nome).toList();

    return Scaffold(
      appBar: AppBar(title: const Text('Solicitações')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          const Text('Nova solicitação',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
          const SizedBox(height: 12),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: TipoSolicitacao.values.map((tipo) {
              final selecionado = tipo == _tipoSelecionado;
              return ChoiceChip(
                label: Text(tipo.titulo),
                selected: selecionado,
                onSelected: (_) => setState(() => _tipoSelecionado = tipo),
              );
            }).toList(),
          ),
          const SizedBox(height: 8),
          Text(_tipoSelecionado.descricao,
              style: TextStyle(color: Colors.grey.shade600, fontSize: 13)),
          const SizedBox(height: 16),
          Form(
            key: _formKey,
            child: TextFormField(
              controller: _descricaoController,
              maxLines: 4,
              decoration: const InputDecoration(
                labelText: 'Descreva os detalhes do pedido',
                alignLabelWithHint: true,
              ),
              validator: (valor) => (valor == null || valor.trim().isEmpty)
                  ? 'Descreva o motivo da solicitação'
                  : null,
            ),
          ),
          const SizedBox(height: 16),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton.icon(
              icon: const Icon(Icons.send_outlined),
              label: const Text('Enviar solicitação'),
              onPressed: _enviarSolicitacao,
            ),
          ),
          const SizedBox(height: 28),
          const Text('Minhas solicitações',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
          const SizedBox(height: 12),
          if (minhasSolicitacoes.isEmpty)
            const Text('Você ainda não enviou nenhuma solicitação.'),
          ...minhasSolicitacoes.map((solicitacao) => Card(
                child: ListTile(
                  title: Text(solicitacao.tipo.titulo),
                  subtitle: Text('${solicitacao.codigo} · ${solicitacao.data}'),
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
