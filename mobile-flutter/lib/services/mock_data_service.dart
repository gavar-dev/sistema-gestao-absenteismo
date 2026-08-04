import 'package:flutter/material.dart';
import '../models/aviso.dart';
import '../models/funcionario.dart';
import '../models/registro_ponto.dart';
import '../models/solicitacao.dart';

/// Guarda, em memória, todos os dados usados pelo app: registros de ponto,
/// histórico, avisos, solicitações e a lista de funcionários da gestão.
///
/// É o equivalente mobile dos services `Ponto`, `Solicitacao`, `Aviso` e
/// `Funcionario` do projeto Angular — só que, como lá, ainda sem back-end:
/// os dados vivem apenas na memória do app (reiniciam ao fechar o app).
/// O próximo passo natural seria trocar essas listas por chamadas a uma
/// API REST (com `http`/`dio`) apontando para o back-end de
/// sistema-gestao-absenteismo.
class MockDataService extends ChangeNotifier {
  // ---------------------------------------------------------------------
  // PONTO DO DIA (tela "Meu Ponto")
  // ---------------------------------------------------------------------
  final List<RegistroPonto> registrosHoje = [
    const RegistroPonto(tipo: TipoMarcacao.entrada, horario: '08:03'),
    const RegistroPonto(tipo: TipoMarcacao.almoco, horario: '12:05'),
  ];

  TipoMarcacao? get proximaMarcacao {
    for (final tipo in TipoMarcacao.values) {
      if (!registrosHoje.any((r) => r.tipo == tipo)) return tipo;
    }
    return null;
  }

  bool jaRegistrado(TipoMarcacao tipo) =>
      registrosHoje.any((r) => r.tipo == tipo);

  String? horarioDe(TipoMarcacao tipo) {
    final registro = registrosHoje.where((r) => r.tipo == tipo).toList();
    return registro.isEmpty ? null : registro.first.horario;
  }

  /// Registra a marcação de ponto informada com o horário atual do
  /// dispositivo (equivalente a `registrarPonto()` no Angular).
  void registrarPonto(TipoMarcacao tipo) {
    if (jaRegistrado(tipo)) return;
    final agora = TimeOfDay.now();
    final horario =
        '${agora.hour.toString().padLeft(2, '0')}:${agora.minute.toString().padLeft(2, '0')}';
    registrosHoje.add(RegistroPonto(tipo: tipo, horario: horario));
    notifyListeners();
  }

  double get percentualJornada =>
      registrosHoje.length / TipoMarcacao.values.length;

  // ---------------------------------------------------------------------
  // HISTÓRICO DE PONTO
  // ---------------------------------------------------------------------
  final List<RegistroHistorico> historico = const [
    RegistroHistorico(
      data: '08/07/2026',
      diaSemana: 'Quarta-feira',
      entrada: '08:03',
      almoco: '12:05',
      retorno: '13:00',
      saida: '17:04',
      horas: '08h01',
      status: StatusDia.completo,
      observacao: 'Jornada normal',
    ),
    RegistroHistorico(
      data: '07/07/2026',
      diaSemana: 'Terça-feira',
      entrada: '08:41',
      almoco: '12:10',
      retorno: '13:08',
      saida: '17:30',
      horas: '07h51',
      status: StatusDia.atraso,
      observacao: 'Entrada acima da tolerância',
    ),
    RegistroHistorico(
      data: '03/07/2026',
      diaSemana: 'Sexta-feira',
      entrada: '08:05',
      almoco: '12:03',
      retorno: '--:--',
      saida: '17:02',
      horas: '07h59',
      status: StatusDia.incompleto,
      observacao: 'Retorno do almoço não registrado',
    ),
    RegistroHistorico(
      data: '02/07/2026',
      diaSemana: 'Quinta-feira',
      entrada: '--:--',
      almoco: '--:--',
      retorno: '--:--',
      saida: '--:--',
      horas: '00h00',
      status: StatusDia.faltaJustificada,
      observacao: 'Atestado enviado para análise',
    ),
    RegistroHistorico(
      data: '01/07/2026',
      diaSemana: 'Quarta-feira',
      entrada: '08:08',
      almoco: '12:04',
      retorno: '13:02',
      saida: '17:06',
      horas: '07h58',
      status: StatusDia.completo,
      observacao: 'Jornada normal',
    ),
  ];

  // ---------------------------------------------------------------------
  // AVISOS (notificações do funcionário)
  // ---------------------------------------------------------------------
  final List<Aviso> avisos = [
    Aviso(
      id: 1,
      titulo: 'Prazo para justificar falta termina amanhã',
      descricao:
          'A falta do dia 29/07 ainda precisa de justificativa. Envie a solicitação em até 48 horas.',
      data: '31/07/2026',
      horario: '08:10',
      tipo: TipoAviso.urgente,
      categoria: 'Ponto',
      lido: false,
    ),
    Aviso(
      id: 2,
      titulo: 'Retorno do almoço ainda não registrado',
      descricao:
          'O sistema não encontrou o registro de retorno do almoço de hoje.',
      data: '31/07/2026',
      horario: '13:18',
      tipo: TipoAviso.atencao,
      categoria: 'Ponto',
      lido: false,
    ),
    Aviso(
      id: 3,
      titulo: 'Correção cadastral concluída',
      descricao:
          'A solicitação de atualização do telefone foi aprovada pelo RH.',
      data: '30/07/2026',
      horario: '16:42',
      tipo: TipoAviso.sucesso,
      categoria: 'Cadastro',
      lido: true,
    ),
    Aviso(
      id: 4,
      titulo: 'Solicitação de correção em análise',
      descricao: 'O RH iniciou a análise do protocolo #SOL-1024.',
      data: '30/07/2026',
      horario: '10:05',
      tipo: TipoAviso.info,
      categoria: 'Solicitação',
      lido: false,
    ),
  ];

  int get avisosNaoLidos => avisos.where((a) => !a.lido).length;

  void marcarAvisoComoLido(Aviso aviso) {
    aviso.lido = true;
    notifyListeners();
  }

  void marcarTodosAvisosComoLidos() {
    for (final aviso in avisos) {
      aviso.lido = true;
    }
    notifyListeners();
  }

  // ---------------------------------------------------------------------
  // SOLICITAÇÕES (usado tanto pelo funcionário quanto pela gestão/RH)
  // ---------------------------------------------------------------------
  final List<Solicitacao> solicitacoes = [
    Solicitacao(
      codigo: '#SOL-1024',
      funcionario: 'Maria Silva',
      tipo: TipoSolicitacao.correcaoPonto,
      data: '27/07/2026',
      status: StatusSolicitacao.pendente,
      descricao: 'Retorno do almoço do dia 03/07 não registrado.',
    ),
    Solicitacao(
      codigo: '#SOL-1018',
      funcionario: 'Pedro Santos',
      tipo: TipoSolicitacao.justificativaFalta,
      data: '21/07/2026',
      status: StatusSolicitacao.pendente,
      descricao: 'Atestado médico referente ao dia 20/07.',
    ),
    Solicitacao(
      codigo: '#SOL-1009',
      funcionario: 'Camila Rocha',
      tipo: TipoSolicitacao.solicitacaoFerias,
      data: '14/07/2026',
      status: StatusSolicitacao.concluida,
    ),
    Solicitacao(
      codigo: '#SOL-1004',
      funcionario: 'João Pereira',
      tipo: TipoSolicitacao.correcaoCadastro,
      data: '08/07/2026',
      status: StatusSolicitacao.negada,
    ),
  ];

  int get solicitacoesPendentes =>
      solicitacoes.where((s) => s.status == StatusSolicitacao.pendente).length;

  /// Cria uma nova solicitação enviada pelo funcionário logado
  /// (equivalente a `criarSolicitacao()` no Angular).
  void criarSolicitacao({
    required String funcionario,
    required TipoSolicitacao tipo,
    required String descricao,
  }) {
    final numero = 1025 + solicitacoes.length;
    solicitacoes.insert(
      0,
      Solicitacao(
        codigo: '#SOL-$numero',
        funcionario: funcionario,
        tipo: tipo,
        data: _dataDeHoje(),
        status: StatusSolicitacao.pendente,
        descricao: descricao,
      ),
    );
    notifyListeners();
  }

  /// Usado pela tela de gestão/RH para aprovar ou negar um pedido.
  void atualizarStatusSolicitacao(Solicitacao solicitacao, StatusSolicitacao novoStatus) {
    solicitacao.status = novoStatus;
    notifyListeners();
  }

  // ---------------------------------------------------------------------
  // GESTÃO DE FUNCIONÁRIOS (telas do gestor/RH)
  // ---------------------------------------------------------------------
  final List<Funcionario> funcionarios = [
    const Funcionario(
      nome: 'Maria Silva',
      setor: 'Comercial',
      cargo: 'Analista de Vendas',
      status: StatusFuncionario.ativo,
      atrasos: 2,
      faltas: 0,
    ),
    const Funcionario(
      nome: 'João Pereira',
      setor: 'Operações',
      cargo: 'Auxiliar Operacional',
      status: StatusFuncionario.ativo,
      atrasos: 5,
      faltas: 1,
    ),
    const Funcionario(
      nome: 'Camila Rocha',
      setor: 'Administrativo',
      cargo: 'Assistente Administrativo',
      status: StatusFuncionario.ferias,
      atrasos: 0,
      faltas: 0,
    ),
    const Funcionario(
      nome: 'Pedro Santos',
      setor: 'Tecnologia',
      cargo: 'Desenvolvedor Jr.',
      status: StatusFuncionario.ativo,
      atrasos: 1,
      faltas: 0,
    ),
    const Funcionario(
      nome: 'Bruna Lima',
      setor: 'Operações',
      cargo: 'Supervisora',
      status: StatusFuncionario.inativo,
      atrasos: 0,
      faltas: 2,
    ),
  ];

  /// Cadastra um novo funcionário (equivalente ao `salvar()` do
  /// `cadastro-funcionario-component.ts`).
  void cadastrarFuncionario(Funcionario funcionario) {
    funcionarios.add(funcionario);
    notifyListeners();
  }

  String _dataDeHoje() {
    final agora = DateTime.now();
    return '${agora.day.toString().padLeft(2, '0')}/'
        '${agora.month.toString().padLeft(2, '0')}/${agora.year}';
  }
}
