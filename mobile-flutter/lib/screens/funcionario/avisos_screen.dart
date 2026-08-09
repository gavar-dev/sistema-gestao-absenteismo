import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../models/aviso.dart';
import '../../models/usuario.dart';
import '../../services/api_client.dart';
import '../../services/auth_service.dart';
import '../../services/mock_data_service.dart';
import '../../theme/app_theme.dart';

/// Equivalente à `aviso-componente` do Angular: lista de notificações do
/// funcionário, com opção de marcar como lidas. RH/gestor também podem
/// fixar um aviso, deixando ele sempre no topo para todo mundo.
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

  String _formatarData(DateTime data) {
    final dia = data.day.toString().padLeft(2, '0');
    final mes = data.month.toString().padLeft(2, '0');
    final hora = data.hour.toString().padLeft(2, '0');
    final minuto = data.minute.toString().padLeft(2, '0');
    return '$dia/$mes às $hora:$minuto';
  }

  Future<void> _alternarFixado(BuildContext context, Aviso aviso) async {
    try {
      await context.read<MockDataService>().fixarAviso(aviso);
    } on ApiException catch (e) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.mensagem)));
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final dados = context.watch<MockDataService>();
    final usuario = context.watch<AuthService>().usuarioLogado;
    final ehRh = usuario != null && usuario.tipo == TipoUsuario.rh;

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
                  shape: aviso.fixado
                      ? RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                          side: BorderSide(color: cor.withValues(alpha: 0.5), width: 1.2),
                        )
                      : null,
                  child: ListTile(
                    onTap: () => dados.marcarAvisoComoLido(aviso),
                    leading: CircleAvatar(
                      backgroundColor: cor.withValues(alpha: 0.15),
                      child: Icon(_iconeTipo(aviso.tipo), color: cor),
                    ),
                    title: Row(
                      children: [
                        if (aviso.fixado) ...[
                          Icon(Icons.push_pin, size: 15, color: cor),
                          const SizedBox(width: 4),
                        ],
                        Expanded(
                          child: Text(
                            aviso.titulo,
                            style: TextStyle(
                              fontWeight: aviso.lido ? FontWeight.normal : FontWeight.bold,
                            ),
                          ),
                        ),
                      ],
                    ),
                    subtitle: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const SizedBox(height: 4),
                        Text(aviso.descricao),
                        const SizedBox(height: 4),
                        Text(
                          '${aviso.categoria} · ${_formatarData(aviso.publicadoEm)}',
                          style: TextStyle(fontSize: 11, color: Colors.grey.shade600),
                        ),
                      ],
                    ),
                    isThreeLine: true,
                    trailing: ehRh
                        ? IconButton(
                            tooltip: aviso.fixado ? 'Desafixar aviso' : 'Fixar aviso',
                            icon: Icon(
                              aviso.fixado ? Icons.push_pin : Icons.push_pin_outlined,
                              color: aviso.fixado ? cor : Colors.grey.shade500,
                            ),
                            onPressed: () => _alternarFixado(context, aviso),
                          )
                        : (aviso.lido
                            ? null
                            : Container(
                                width: 10,
                                height: 10,
                                decoration: BoxDecoration(color: cor, shape: BoxShape.circle),
                              )),
                  ),
                );
              },
            ),
    );
  }
}