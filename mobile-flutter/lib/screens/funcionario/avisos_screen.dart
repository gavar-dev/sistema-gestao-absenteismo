import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../models/aviso.dart';
import '../../services/mock_data_service.dart';
import '../../theme/app_theme.dart';

/// Equivalente à `aviso-componente` do Angular: lista de notificações do
/// funcionário, com opção de marcar como lidas.
class AvisosScreen extends StatelessWidget {
  const AvisosScreen({super.key});

  Color _corTipo(TipoAviso tipo) {
    switch (tipo) {
      case TipoAviso.info:
        return StatusColors.info;
      case TipoAviso.atencao:
        return StatusColors.atencao;
      case TipoAviso.sucesso:
        return StatusColors.positivo;
      case TipoAviso.urgente:
        return StatusColors.perigo;
    }
  }

  IconData _iconeTipo(TipoAviso tipo) {
    switch (tipo) {
      case TipoAviso.info:
        return Icons.info_outline;
      case TipoAviso.atencao:
        return Icons.warning_amber_outlined;
      case TipoAviso.sucesso:
        return Icons.check_circle_outline;
      case TipoAviso.urgente:
        return Icons.error_outline;
    }
  }

  @override
  Widget build(BuildContext context) {
    final dados = context.watch<MockDataService>();

    return Scaffold(
      appBar: AppBar(
        title: const Text('Avisos'),
        actions: [
          if (dados.avisosNaoLidos > 0)
            TextButton(
              onPressed: dados.marcarTodosAvisosComoLidos,
              child: const Text(
                'Marcar tudo como lido',
                style: TextStyle(color: Colors.white),
              ),
            ),
        ],
      ),
      body: dados.avisos.isEmpty
          ? const Center(child: Text('Nenhum aviso no momento.'))
          : ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: dados.avisos.length,
              itemBuilder: (context, index) {
                final aviso = dados.avisos[index];
                final cor = _corTipo(aviso.tipo);
                return Card(
                  color: cor.withValues(alpha: aviso.lido ? 0.05 : 0.1),
                  child: ListTile(
                    onTap: () => dados.marcarAvisoComoLido(aviso),
                    leading: CircleAvatar(
                      backgroundColor: cor.withValues(alpha: 0.15),
                      child: Icon(_iconeTipo(aviso.tipo), color: cor),
                    ),
                    title: Text(
                      aviso.titulo,
                      style: TextStyle(
                        fontWeight: aviso.lido ? FontWeight.normal : FontWeight.bold,
                      ),
                    ),
                    subtitle: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const SizedBox(height: 4),
                        Text(aviso.descricao),
                        const SizedBox(height: 4),
                        Text(
                          '${aviso.categoria} · ${aviso.data} às ${aviso.horario}',
                          style: TextStyle(fontSize: 11, color: Colors.grey.shade600),
                        ),
                      ],
                    ),
                    isThreeLine: true,
                    trailing: aviso.lido
                        ? null
                        : Container(
                            width: 10,
                            height: 10,
                            decoration: BoxDecoration(color: cor, shape: BoxShape.circle),
                          ),
                  ),
                );
              },
            ),
    );
  }
}
