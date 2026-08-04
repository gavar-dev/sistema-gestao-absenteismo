import 'package:flutter/material.dart';
import '../theme/app_theme.dart';

enum TipoResumo { positivo, atencao, neutro, perigo }

Color corDoTipo(TipoResumo tipo) {
  switch (tipo) {
    case TipoResumo.positivo:
      return StatusColors.positivo;
    case TipoResumo.atencao:
      return StatusColors.atencao;
    case TipoResumo.neutro:
      return StatusColors.neutro;
    case TipoResumo.perigo:
      return StatusColors.perigo;
  }
}

/// Card compacto usado nos dashboards (Início do funcionário e Início da
/// gestão), equivalente ao `CardResumoFuncionario` / `IndicadorGestao` do
/// Angular.
class ResumoCard extends StatelessWidget {
  final String titulo;
  final String valor;
  final String detalhe;
  final IconData icone;
  final TipoResumo tipo;

  const ResumoCard({
    super.key,
    required this.titulo,
    required this.valor,
    required this.detalhe,
    required this.icone,
    this.tipo = TipoResumo.neutro,
  });

  @override
  Widget build(BuildContext context) {
    final cor = corDoTipo(tipo);
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final corFundo = isDark ? const Color(0xFF2A2D42) : Colors.white;

    return Container(
      width: 170,
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: corFundo,
        borderRadius: BorderRadius.circular(16),
        border: Border(left: BorderSide(color: cor, width: 4)),
        boxShadow: isDark
            ? []
            : [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.05),
            blurRadius: 6,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(icone, color: cor, size: 20),
          const SizedBox(height: 8),
          Text(
            valor,
            style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 2),
          Text(
            titulo,
            style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
          ),
          Text(
            detalhe,
            style: TextStyle(fontSize: 11, color: Colors.grey.shade600),
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }
}