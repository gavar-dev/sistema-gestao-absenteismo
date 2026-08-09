import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../models/aviso.dart';
import '../models/funcionario.dart';
import '../models/registro_ponto.dart';
import '../models/solicitacao.dart';
import '../models/usuario.dart';
import 'api_client.dart';

/// Antes era só uma lista em memória (dados fake). Agora busca tudo da API
/// real do back-end (`back-end/`). Mantivemos o nome `MockDataService` para
/// não precisar tocar nos imports/Provider das telas — mas não é mais mock.
///
/// Fluxo: depois do login, chame [carregarDados] passando o usuário logado;
/// isso popula todas as listas abaixo de uma vez, de acordo com o perfil
/// (funcionário só vê os próprios dados; RH/gestor vê os dados de gestão).
class MockDataService extends ChangeNotifier {
  final ApiClient _api = ApiClient.instancia;

  bool carregando = false;
  String? erroCarregamento;

  // ---------------------------------------------------------------------
  // PONTO DO DIA + HISTÓRICO
  // ---------------------------------------------------------------------
  RegistroPontoDia _hoje = RegistroPontoDia(
    data: DateTime.now(),
    status: StatusDia.pendente,
    proximaMarcacao: TipoMarcacao.entrada,
  );

  List<RegistroHistorico> historico = [];

  TipoMarcacao? get proximaMarcacao => _hoje.proximaMarcacao;
  bool jaRegistrado(TipoMarcacao tipo) => _hoje.jaRegistrado(tipo);
  String? horarioDe(TipoMarcacao tipo) => _hoje.horarioDe(tipo);
  double get percentualJornada => _hoje.percentualJornada;

  /// Registra a marcação no back-end (usa o horário do servidor).
  /// Lança [ApiException] se der erro (ex.: marcação fora de ordem).
  Future<void> registrarPonto(TipoMarcacao tipo) async {
    final json = await _api.post('/pontos/marcar', corpo: {'tipo': tipo.valorJson}) as Map<String, dynamic>;
    _hoje = RegistroPontoDia.fromJson(json);
    notifyListeners();
  }

  // ---------------------------------------------------------------------
  // AVISOS
  // ---------------------------------------------------------------------
  List<Aviso> avisos = [];

  int get avisosNaoLidos => avisos.where((a) => !a.lido).length;

  /// Só altera o estado local (o back-end não guarda leitura por
  /// funcionário) — some ao trocar de sessão.
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

  /// Fixa/desafixa um aviso (PATCH /avisos/{id}/fixar). Só o RH pode
  /// chamar isso de verdade — o back-end rejeita com 403 se não for RH.
  /// Depois de fixar, reordena a lista trazendo os fixados para o topo.
  Future<void> fixarAviso(Aviso aviso) async {
    final json = await _api.patch('/avisos/${aviso.id}/fixar') as Map<String, dynamic>;
    final atualizado = Aviso.fromJson(json);

    final indice = avisos.indexWhere((a) => a.id == aviso.id);
    if (indice != -1) {
      atualizado.lido = avisos[indice].lido;
      avisos[indice] = atualizado;
    }

    avisos.sort((a, b) {
      if (a.fixado != b.fixado) return a.fixado ? -1 : 1;
      return b.publicadoEm.compareTo(a.publicadoEm);
    });

    notifyListeners();
  }

  // ---------------------------------------------------------------------
  // SOLICITAÇÕES
  // ---------------------------------------------------------------------
  /// Para funcionário: só as próprias. Para RH/gestor: todas (gerencial).
  List<Solicitacao> solicitacoes = [];

  int get solicitacoesPendentes =>
      solicitacoes.where((s) => s.status == StatusSolicitacao.pendente).length;

  /// Cria uma solicitação em nome do usuário logado (o back-end identifica
  /// quem está criando pelo token, então [funcionario] é só exibido na UI).
  /// Os campos extras (datas, horários, campo de cadastro) são obrigatórios
  /// ou não dependendo de [tipo] — quem decide isso é a tela que chama.
  Future<void> criarSolicitacao({
    required String funcionario,
    required TipoSolicitacao tipo,
    required String descricao,
    DateTime? dataReferencia,
    DateTime? dataInicio,
    DateTime? dataFim,
    String? entradaSolicitada,
    String? inicioIntervaloSolicitado,
    String? fimIntervaloSolicitado,
    String? saidaSolicitada,
    String? campoCadastro,
    String? novoValor,
  }) async {
    String? dataIso(DateTime? data) => data == null
        ? null
        : '${data.year.toString().padLeft(4, '0')}-${data.month.toString().padLeft(2, '0')}-${data.day.toString().padLeft(2, '0')}';

    final json = await _api.post('/solicitacoes', corpo: {
      'tipo': tipo.valorJson,
      'justificativa': descricao,
      'dataReferencia': dataIso(dataReferencia),
      'dataInicio': dataIso(dataInicio),
      'dataFim': dataIso(dataFim),
      'entradaSolicitada': entradaSolicitada,
      'inicioIntervaloSolicitado': inicioIntervaloSolicitado,
      'fimIntervaloSolicitado': fimIntervaloSolicitado,
      'saidaSolicitada': saidaSolicitada,
      'campoCadastro': campoCadastro,
      'novoValor': novoValor,
    }) as Map<String, dynamic>;

    solicitacoes.insert(0, Solicitacao.fromJson(json));
    notifyListeners();
  }

  /// Usado pela tela de gestão/RH para aprovar um pedido.
  Future<void> aprovarSolicitacao(Solicitacao solicitacao, {String? observacao}) async {
    final json = await _api.patch(
      '/solicitacoes/${solicitacao.id}/aprovar',
      corpo: {'observacao': observacao},
    ) as Map<String, dynamic>;

    _substituirSolicitacao(Solicitacao.fromJson(json));
  }

  /// Usado pela tela de gestão/RH para rejeitar um pedido. O back-end
  /// exige um motivo com pelo menos 5 caracteres.
  Future<void> rejeitarSolicitacao(Solicitacao solicitacao, String motivo) async {
    final json = await _api.patch(
      '/solicitacoes/${solicitacao.id}/rejeitar',
      corpo: {'observacao': motivo},
    ) as Map<String, dynamic>;

    _substituirSolicitacao(Solicitacao.fromJson(json));
  }

  void _substituirSolicitacao(Solicitacao atualizada) {
    final indice = solicitacoes.indexWhere((s) => s.id == atualizada.id);
    if (indice != -1) {
      solicitacoes[indice] = atualizada;
    }
    notifyListeners();
  }

  // ---------------------------------------------------------------------
  // GESTÃO DE FUNCIONÁRIOS (só para RH/gestor)
  // ---------------------------------------------------------------------
  List<Funcionario> funcionarios = [];

  // ---------------------------------------------------------------------
  // CARREGAMENTO GERAL — chamar logo após o login
  // ---------------------------------------------------------------------

  /// Busca tudo que a tela do perfil logado precisa. Funcionário: ponto de
  /// hoje, histórico, avisos e as próprias solicitações. RH/gestor: além
  /// disso, a lista de funcionários, todas as solicitações e um ranking de
  /// atrasos (últimos 30 dias) para preencher a coluna "atrasos" da tela de
  /// gestão.
  Future<void> carregarDados(Usuario usuario) async {
    carregando = true;
    erroCarregamento = null;
    notifyListeners();

    try {
      final hojeJson = await _api.get('/pontos/hoje');
      _hoje = hojeJson == null
          ? RegistroPontoDia(data: DateTime.now(), status: StatusDia.pendente, proximaMarcacao: TipoMarcacao.entrada)
          : RegistroPontoDia.fromJson(hojeJson as Map<String, dynamic>);

      final historicoJson = await _api.get('/pontos/meu-historico') as List<dynamic>;
      historico = historicoJson
          .map((j) => RegistroPontoDia.fromJson(j as Map<String, dynamic>))
          .map(_paraHistoricoExibicao)
          .toList();

      final avisosJson = await _api.get('/avisos/meus') as List<dynamic>;
      avisos = avisosJson.map((j) => Aviso.fromJson(j as Map<String, dynamic>)).toList();

      if (usuario.tipo.ehGestorOuRh) {
        final funcionariosJson = await _api.get('/funcionarios') as List<dynamic>;
        funcionarios = funcionariosJson.map((j) => Funcionario.fromJson(j as Map<String, dynamic>)).toList();

        final solicitacoesJson = await _api.get('/solicitacoes') as List<dynamic>;
        solicitacoes = solicitacoesJson.map((j) => Solicitacao.fromJson(j as Map<String, dynamic>)).toList();

        await _carregarRankingAtrasos();
      } else {
        final minhasJson = await _api.get('/solicitacoes/minhas') as List<dynamic>;
        solicitacoes = minhasJson.map((j) => Solicitacao.fromJson(j as Map<String, dynamic>)).toList();
      }
    } catch (e) {
      erroCarregamento = e.toString();
      rethrow;
    } finally {
      carregando = false;
      notifyListeners();
    }
  }

  Future<void> _carregarRankingAtrasos() async {
    final fim = DateTime.now();
    final inicio = fim.subtract(const Duration(days: 30));
    final formato = DateFormat('yyyy-MM-dd');

    try {
      final ranking = await _api.get('/pontos/indicadores/ranking-atrasos', query: {
        'inicio': formato.format(inicio),
        'fim': formato.format(fim),
        'limite': '${funcionarios.length}',
      }) as List<dynamic>;

      for (final item in ranking) {
        final funcionarioId = item['funcionarioId'] as int;
        final quantidade = item['quantidadeAtrasos'] as int;
        final funcionario = funcionarios.where((f) => f.id == funcionarioId).firstOrNull;
        funcionario?.atrasos = quantidade;
      }
    } catch (_) {
      // Indicadores são um "extra" no dashboard - se falhar, a tela
      // continua funcionando só sem esse número.
    }
  }

  RegistroHistorico _paraHistoricoExibicao(RegistroPontoDia dia) {
    final data = DateFormat('dd/MM/yyyy').format(dia.data);
    var diaSemana = DateFormat('EEEE', 'pt_BR').format(dia.data);
    diaSemana = diaSemana.isEmpty ? diaSemana : diaSemana[0].toUpperCase() + diaSemana.substring(1);

    String observacao;
    switch (dia.status) {
      case StatusDia.concluido:
        observacao = 'Jornada normal';
        break;
      case StatusDia.atraso:
        observacao = dia.atrasoMinutos != null
            ? 'Atraso de ${dia.atrasoMinutos} minuto(s)'
            : 'Entrada acima da tolerância';
        break;
      case StatusDia.faltaJustificada:
        observacao = 'Falta justificada';
        break;
      case StatusDia.falta:
        observacao = 'Nenhuma marcação registrada';
        break;
      case StatusDia.emAndamento:
      case StatusDia.pendente:
        observacao = 'Uma ou mais marcações não foram registradas';
        break;
    }

    return RegistroHistorico(
      data: data,
      diaSemana: diaSemana,
      entrada: dia.entrada ?? '--:--',
      almoco: dia.inicioIntervalo ?? '--:--',
      retorno: dia.fimIntervalo ?? '--:--',
      saida: dia.saida ?? '--:--',
      horas: dia.horasFormatadas,
      status: dia.status,
      observacao: observacao,
    );
  }

  /// Limpa tudo (chamar no logout, pra não vazar dados de uma sessão para
  /// a próxima nesse mesmo Provider).
  void limpar() {
    _hoje = RegistroPontoDia(data: DateTime.now(), status: StatusDia.pendente, proximaMarcacao: TipoMarcacao.entrada);
    historico = [];
    avisos = [];
    solicitacoes = [];
    funcionarios = [];
    notifyListeners();
  }
}

extension _FirstOrNull<T> on Iterable<T> {
  T? get firstOrNull => isEmpty ? null : first;
}