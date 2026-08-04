import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import '../../models/registro_ponto.dart';
import '../../services/mock_data_service.dart';
import '../../widgets/status_chip.dart';
import '../../theme/app_theme.dart';

/// Equivalente à `meu-ponto-componente` do Angular: mostra a jornada de
/// hoje e permite registrar a próxima marcação (entrada/almoço/retorno/
/// saída), sempre na ordem correta.
class MeuPontoScreen extends StatelessWidget {
  const MeuPontoScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final dados = context.watch<MockDataService>();
    final proxima = dados.proximaMarcacao;
    final hoje = DateFormat("EEEE, d 'de' MMMM", 'pt_BR').format(DateTime.now());

    return Scaffold(
      appBar: AppBar(title: const Text('Meu Ponto')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Text(hoje[0].toUpperCase() + hoje.substring(1),
              style: TextStyle(color: Colors.grey.shade600)),
          const SizedBox(height: 16),

          Card(
            child: Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                children: [
                  Text(
                    proxima == null ? 'Jornada finalizada 🎉' : 'Próxima ação',
                    style: const TextStyle(fontWeight: FontWeight.w600),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    proxima?.label ?? 'Todos os registros de hoje foram concluídos',
                    style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 16),
                  ClipRRect(
                    borderRadius: BorderRadius.circular(8),
                    child: LinearProgressIndicator(
                      value: dados.percentualJornada,
                      minHeight: 8,
                    ),
                  ),
                  const SizedBox(height: 20),
                  if (proxima != null)
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton.icon(
                        icon: const Icon(Icons.fingerprint),
                        label: Text('Registrar ${proxima.label.toLowerCase()}'),
                        onPressed: () => dados.registrarPonto(proxima),
                      ),
                    ),
                ],
              ),
            ),
          ),

          const SizedBox(height: 24),
          const Text('Marcações do dia',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
          const SizedBox(height: 12),
          ...TipoMarcacao.values.map((tipo) {
            final registrado = dados.jaRegistrado(tipo);
            final horario = dados.horarioDe(tipo);
            return Card(
              child: ListTile(
                leading: CircleAvatar(
                  backgroundColor: registrado
                      ? StatusColors.positivo.withValues(alpha: 0.15)
                      : Colors.grey.shade200,
                  child: Icon(
                    _iconePara(tipo),
                    color: registrado ? StatusColors.positivo : Colors.grey,
                  ),
                ),
                title: Text(tipo.label),
                subtitle: Text(tipo.descricao),
                trailing: StatusChip(
                  texto: registrado ? horario! : 'Pendente',
                  cor: registrado ? StatusColors.positivo : StatusColors.neutro,
                ),
              ),
            );
          }),
        ],
      ),
    );
  }

  IconData _iconePara(TipoMarcacao tipo) {
    switch (tipo) {
      case TipoMarcacao.entrada:
        return Icons.login;
      case TipoMarcacao.almoco:
        return Icons.lunch_dining_outlined;
      case TipoMarcacao.retorno:
        return Icons.keyboard_return;
      case TipoMarcacao.saida:
        return Icons.logout;
    }
  }
}
