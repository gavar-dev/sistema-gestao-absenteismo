import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../models/solicitacao.dart';
import '../../services/api_client.dart';
import '../../services/auth_service.dart';
import '../../services/mock_data_service.dart';
import '../../theme/app_theme.dart';
import '../../widgets/status_chip.dart';

/// Equivalente à `solicitacao-componente` do Angular: escolher um tipo de
/// pedido (correção de ponto, justificativa de falta, férias, correção de
/// cadastro), preencher os campos exigidos por esse tipo e enviar para o
/// RH analisar. Cada tipo tem campos obrigatórios diferentes no back-end:
/// - Correção de ponto: data de referência + pelo menos 1 horário
/// - Justificativa de falta: data de referência
/// - Férias: data inicial e final
/// - Correção de cadastro: campo a alterar + novo valor
class SolicitacaoScreen extends StatefulWidget {
  const SolicitacaoScreen({super.key});

  @override
  State<SolicitacaoScreen> createState() => _SolicitacaoScreenState();
}

class _SolicitacaoScreenState extends State<SolicitacaoScreen> {
  TipoSolicitacao _tipoSelecionado = TipoSolicitacao.correcaoPonto;
  final _descricaoController = TextEditingController();
  final _campoCadastroController = TextEditingController();
  final _novoValorController = TextEditingController();
  final _formKey = GlobalKey<FormState>();

  DateTime? _dataReferencia;
  DateTime? _dataInicio;
  DateTime? _dataFim;
  TimeOfDay? _entrada;
  TimeOfDay? _inicioIntervalo;
  TimeOfDay? _fimIntervalo;
  TimeOfDay? _saida;

  bool _enviando = false;
  String? _erroExtra;

  @override
  void dispose() {
    _descricaoController.dispose();
    _campoCadastroController.dispose();
    _novoValorController.dispose();
    super.dispose();
  }

  void _trocarTipo(TipoSolicitacao tipo) {
    setState(() {
      _tipoSelecionado = tipo;
      _dataReferencia = null;
      _dataInicio = null;
      _dataFim = null;
      _entrada = null;
      _inicioIntervalo = null;
      _fimIntervalo = null;
      _saida = null;
      _campoCadastroController.clear();
      _novoValorController.clear();
      _erroExtra = null;
    });
  }

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

  Future<DateTime?> _abrirSeletorData({DateTime? minimo}) {
    final agora = DateTime.now();
    return showDatePicker(
      context: context,
      initialDate: minimo ?? agora,
      firstDate: DateTime(agora.year - 1),
      lastDate: DateTime(agora.year + 2),
    );
  }

  Future<TimeOfDay?> _abrirSeletorHora() {
    return showTimePicker(context: context, initialTime: TimeOfDay.now());
  }

  String _formatarData(DateTime data) =>
      '${data.day.toString().padLeft(2, '0')}/${data.month.toString().padLeft(2, '0')}/${data.year}';

  String _formatarHora(TimeOfDay hora) =>
      '${hora.hour.toString().padLeft(2, '0')}:${hora.minute.toString().padLeft(2, '0')}';

  String _horaParaIso(TimeOfDay hora) =>
      '${hora.hour.toString().padLeft(2, '0')}:${hora.minute.toString().padLeft(2, '0')}:00';

  /// Validações específicas por tipo, além do que o `Form` já cobre
  /// (a justificativa). Retorna uma mensagem de erro, ou null se ok.
  String? _validarCamposExtras() {
    switch (_tipoSelecionado) {
      case TipoSolicitacao.correcaoPonto:
        if (_dataReferencia == null) return 'Selecione a data do registro a corrigir';
        final semHorario = _entrada == null &&
            _inicioIntervalo == null &&
            _fimIntervalo == null &&
            _saida == null;
        if (semHorario) return 'Informe ao menos um horário para a correção';
        return null;
      case TipoSolicitacao.justificativaFalta:
        if (_dataReferencia == null) return 'Selecione a data da falta a justificar';
        return null;
      case TipoSolicitacao.solicitacaoFerias:
        if (_dataInicio == null || _dataFim == null) {
          return 'Selecione as datas inicial e final das férias';
        }
        if (_dataFim!.isBefore(_dataInicio!)) {
          return 'A data final não pode ser anterior à data inicial';
        }
        return null;
      case TipoSolicitacao.correcaoCadastro:
        if (_campoCadastroController.text.trim().isEmpty) return 'Informe o campo a corrigir';
        if (_novoValorController.text.trim().isEmpty) return 'Informe o novo valor';
        return null;
    }
  }

  Future<void> _enviarSolicitacao() async {
    if (!_formKey.currentState!.validate()) return;

    final erroExtra = _validarCamposExtras();
    setState(() => _erroExtra = erroExtra);
    if (erroExtra != null) return;

    setState(() => _enviando = true);

    final usuario = context.read<AuthService>().usuarioLogado!;
    try {
      await context.read<MockDataService>().criarSolicitacao(
            funcionario: usuario.nome,
            tipo: _tipoSelecionado,
            descricao: _descricaoController.text.trim(),
            dataReferencia: _dataReferencia,
            dataInicio: _dataInicio,
            dataFim: _dataFim,
            entradaSolicitada: _entrada == null ? null : _horaParaIso(_entrada!),
            inicioIntervaloSolicitado: _inicioIntervalo == null ? null : _horaParaIso(_inicioIntervalo!),
            fimIntervaloSolicitado: _fimIntervalo == null ? null : _horaParaIso(_fimIntervalo!),
            saidaSolicitada: _saida == null ? null : _horaParaIso(_saida!),
            campoCadastro: _campoCadastroController.text.trim().isEmpty ? null : _campoCadastroController.text.trim(),
            novoValor: _novoValorController.text.trim().isEmpty ? null : _novoValorController.text.trim(),
          );

      _descricaoController.clear();
      _trocarTipo(_tipoSelecionado);
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            'Solicitação de ${_tipoSelecionado.titulo.toLowerCase()} enviada para o RH.',
          ),
        ),
      );
    } on ApiException catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.mensagem)));
    } catch (e, stack) {
      // ignore: avoid_print
      print('ERRO SOLICITACAO: $e\n$stack');
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.toString())));
    } finally {
      if (mounted) setState(() => _enviando = false);
    }
  }

  Widget _campoData(String rotulo, DateTime? valor, VoidCallback aoSelecionar) {
    return OutlinedButton.icon(
      onPressed: aoSelecionar,
      icon: const Icon(Icons.calendar_today_outlined, size: 16),
      label: Text(valor == null ? rotulo : '$rotulo: ${_formatarData(valor)}'),
    );
  }

  Widget _campoHora(String rotulo, TimeOfDay? valor, VoidCallback aoSelecionar) {
    return OutlinedButton.icon(
      onPressed: aoSelecionar,
      icon: const Icon(Icons.access_time_outlined, size: 16),
      label: Text(valor == null ? rotulo : '$rotulo: ${_formatarHora(valor)}'),
    );
  }

  Widget _camposPorTipo() {
    switch (_tipoSelecionado) {
      case TipoSolicitacao.correcaoPonto:
        return Wrap(
          spacing: 8,
          runSpacing: 8,
          children: [
            _campoData('Data do registro', _dataReferencia, () async {
              final data = await _abrirSeletorData();
              if (data != null) setState(() => _dataReferencia = data);
            }),
            _campoHora('Entrada', _entrada, () async {
              final hora = await _abrirSeletorHora();
              if (hora != null) setState(() => _entrada = hora);
            }),
            _campoHora('Início intervalo', _inicioIntervalo, () async {
              final hora = await _abrirSeletorHora();
              if (hora != null) setState(() => _inicioIntervalo = hora);
            }),
            _campoHora('Fim intervalo', _fimIntervalo, () async {
              final hora = await _abrirSeletorHora();
              if (hora != null) setState(() => _fimIntervalo = hora);
            }),
            _campoHora('Saída', _saida, () async {
              final hora = await _abrirSeletorHora();
              if (hora != null) setState(() => _saida = hora);
            }),
          ],
        );
      case TipoSolicitacao.justificativaFalta:
        return _campoData('Data da falta', _dataReferencia, () async {
          final data = await _abrirSeletorData();
          if (data != null) setState(() => _dataReferencia = data);
        });
      case TipoSolicitacao.solicitacaoFerias:
        return Wrap(
          spacing: 8,
          runSpacing: 8,
          children: [
            _campoData('Data inicial', _dataInicio, () async {
              final data = await _abrirSeletorData();
              if (data != null) setState(() => _dataInicio = data);
            }),
            _campoData('Data final', _dataFim, () async {
              final data = await _abrirSeletorData(minimo: _dataInicio);
              if (data != null) setState(() => _dataFim = data);
            }),
          ],
        );
      case TipoSolicitacao.correcaoCadastro:
        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            TextField(
              controller: _campoCadastroController,
              decoration: const InputDecoration(
                labelText: 'Campo a corrigir (ex.: telefone, email)',
              ),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: _novoValorController,
              decoration: const InputDecoration(
                labelText: 'Novo valor',
              ),
            ),
          ],
        );
    }
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
                onSelected: (_) => _trocarTipo(tipo),
              );
            }).toList(),
          ),
          const SizedBox(height: 8),
          Text(_tipoSelecionado.descricao,
              style: TextStyle(color: Colors.grey.shade600, fontSize: 13)),
          const SizedBox(height: 16),
          _camposPorTipo(),
          if (_erroExtra != null) ...[
            const SizedBox(height: 8),
            Text(_erroExtra!, style: const TextStyle(color: Colors.red, fontSize: 13)),
          ],
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
              validator: (valor) {
                if (valor == null || valor.trim().isEmpty) {
                  return 'Descreva o motivo da solicitação';
                }
                if (valor.trim().length < 10) {
                  return 'Escreva pelo menos 10 caracteres';
                }
                return null;
              },
            ),
          ),
          const SizedBox(height: 16),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton.icon(
              icon: const Icon(Icons.send_outlined),
              label: Text(_enviando ? 'Enviando...' : 'Enviar solicitação'),
              onPressed: _enviando ? null : _enviarSolicitacao,
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