import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../services/auth_service.dart';

/// Equivalente à `meus-dados-componente` do Angular: exibe os dados
/// cadastrais do funcionário, vindos de verdade do back-end
/// (GET /api/funcionarios/me). Campos sensíveis (matrícula, CPF) ficam
/// bloqueados — a edição real ocorreria via uma solicitação para o RH
/// (fluxo já coberto pela tela de Solicitações).
class MeusDadosScreen extends StatelessWidget {
  const MeusDadosScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final usuario = context.watch<AuthService>().usuarioLogado!;

    final campos = [
      ('Nome', usuario.nome, Icons.person_outline, false),
      ('Matrícula', usuario.matricula, Icons.badge_outlined, true),
      ('CPF', usuario.cpf, Icons.badge_outlined, true),
      ('Setor', usuario.setor, Icons.account_tree_outlined, false),
      ('Cargo', usuario.cargo, Icons.work_outline, false),
      ('E-mail corporativo', usuario.email, Icons.email_outlined, false),
      ('Telefone', usuario.telefone, Icons.phone_outlined, false),
      ('Data de admissão', usuario.dataAdmissao, Icons.calendar_month_outlined, false),
    ];

    return Scaffold(
      appBar: AppBar(title: const Text('Meus Dados')),
      body: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: campos.length,
        itemBuilder: (context, index) {
          final (label, valor, icone, bloqueado) = campos[index];
          return Card(
            child: ListTile(
              leading: Icon(icone),
              title: Text(label),
              subtitle: Text(valor.isEmpty ? '--' : valor),
              trailing: bloqueado
                  ? Tooltip(
                      message: 'Campo controlado pelo RH',
                      child: Icon(Icons.lock_outline, color: Colors.grey.shade400),
                    )
                  : null,
            ),
          );
        },
      ),
    );
  }
}
