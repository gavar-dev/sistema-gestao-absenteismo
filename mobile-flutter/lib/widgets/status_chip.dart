import 'package:flutter/material.dart';

/// Pequeno "badge" colorido de status (Ativo, Pendente, Atraso, etc.),
/// equivalente visual das classes `text-bg-success/warning/danger` do
/// Bootstrap usadas no front-end Angular.
class StatusChip extends StatelessWidget {
  final String texto;
  final Color cor;

  const StatusChip({super.key, required this.texto, required this.cor});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: cor.withValues(alpha: 0.15),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Text(
        texto,
        style: TextStyle(
          color: cor,
          fontSize: 12,
          fontWeight: FontWeight.w700,
        ),
      ),
    );
  }
}
