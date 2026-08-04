# Gestão de Pessoas — App Mobile (Flutter)

App mobile de **gestão de pessoas, ponto e absenteísmo**, criado seguindo a
mesma estrutura simples do projeto [Flutter-Rock-in-rio](https://github.com/nsdasilva19-sys/Flutter-Rock-in-rio)
(um `MaterialApp`, telas com `Scaffold`, listas com `ListView.builder`, tema
centralizado), mas com as **regras de negócio** do
[sistema-gestao-absenteismo](https://github.com/gavar-dev/sistema-gestao-absenteismo)
(sistema Angular de RH: ponto, absenteísmo, solicitações e dashboards).

Não há back-end: todos os dados são **mock** (fictícios), guardados em
memória via `ChangeNotifier` + `provider` — igual ao protótipo Angular
original, que também usa dados fixos e `localStorage` para simular o login.

## Como testar no Android Studio

1. Instale o **plugin Flutter** no Android Studio (se ainda não tiver):
   `Settings/Preferences → Plugins → busque "Flutter" → Install` (o plugin
   Dart é instalado junto).
2. Abra este projeto: `File → Open...` e selecione a pasta
   `gestao_pessoas_app`.
3. Deixe o Android Studio indexar o projeto. Se pedir, clique em
   **"Get dependencies"** (ou rode manualmente no terminal, dentro da
   pasta do projeto):
   ```bash
   flutter pub get
   ```
4. Crie ou abra um **emulador Android** (`Device Manager` no Android
   Studio) — ou conecte um celular físico com a depuração USB ativada.
5. Clique em **Run ▶** (ou rode `flutter run` no terminal).

Se for a primeira vez usando Flutter na máquina, rode `flutter doctor` no
terminal para conferir se falta alguma dependência (Android SDK, licenças
etc.).

## Login de demonstração

Não existe autenticação real. Na tela de login, digite qualquer senha e
um dos e-mails abaixo (ou toque nos atalhos de perfil da própria tela):

| Perfil       | E-mail                              |
|--------------|--------------------------------------|
| Funcionário  | `funcionario@gmail.com` (ou qualquer outro e-mail) |
| Gestor       | `gestor.corporativo@gmail.com`       |
| RH           | `rh.corporativo@gmail.com`           |

## Estrutura do projeto

```
lib/
├── main.dart                 # ponto de entrada, MultiProvider + MaterialApp
├── models/                   # classes de dados (equivalentes às interfaces do Angular)
│   ├── usuario.dart
│   ├── funcionario.dart
│   ├── registro_ponto.dart
│   ├── solicitacao.dart
│   └── aviso.dart
├── services/                 # estado + regras de negócio (ChangeNotifier)
│   ├── auth_service.dart      # login mock, usuário logado
│   └── mock_data_service.dart # ponto, histórico, avisos, solicitações, funcionários
├── theme/
│   └── app_theme.dart        # ThemeData e cores de status centralizadas
├── widgets/                   # componentes reutilizáveis
│   ├── resumo_card.dart       # card de indicador (dashboard)
│   └── status_chip.dart       # badge colorido de status
└── screens/
    ├── login/
    │   └── login_screen.dart
    ├── funcionario/            # área do funcionário
    │   ├── funcionario_shell.dart      # bottom navigation
    │   ├── home_funcionario_screen.dart
    │   ├── meu_ponto_screen.dart
    │   ├── historico_screen.dart
    │   ├── solicitacao_screen.dart
    │   ├── avisos_screen.dart
    │   └── meus_dados_screen.dart
    └── gestao/                 # área do gestor/RH
        ├── gestao_shell.dart          # bottom navigation
        ├── home_gestao_screen.dart
        ├── funcionarios_screen.dart
        ├── cadastro_funcionario_screen.dart
        └── solicitacoes_gestao_screen.dart
```

### Por que essa organização?

- **models/**: um arquivo por entidade, igual às `interfaces`/`models` do
  Angular (`Funcionario`, `UsuarioLogado`, etc.), só que em Dart.
- **services/**: fazem o papel dos `@Injectable` Angular (`Ponto`,
  `Solicitacao`, `Aviso`, `UsuarioLogadoService`). Aqui usamos
  `ChangeNotifier` do `provider`, que é o gerenciador de estado mais comum
  para projetos Flutter desse tamanho.
- **screens/funcionario** e **screens/gestao**: mesma divisão de pastas do
  Angular (`pages/funcionario` e `pages/admin-rh`), cada perfil com sua
  própria navegação (`*_shell.dart` = bottom navigation, parecido com o
  `sidebar`/`sidebar-admin` do Angular).
- **widgets/**: componentes visuais repetidos em várias telas (cards de
  indicador, badges de status) — equivalente à pasta `shared/` do Angular.

## Principais funcionalidades

**Funcionário**
- Ver resumo do dia e acessar ações rápidas (Início)
- Bater ponto (entrada → almoço → retorno → saída), na ordem correta
- Consultar histórico de dias anteriores, com busca e filtro por status
- Abrir solicitações (correção de ponto, justificativa de falta, férias,
  correção de cadastro) e acompanhar o status
- Ver avisos/notificações e marcar como lidos
- Consultar os próprios dados cadastrais

**Gestor / RH**
- Dashboard com indicadores (funcionários ativos, atrasos, faltas,
  solicitações pendentes) e distribuição por status
- Listar e buscar funcionários
- Cadastrar novo funcionário (nome, e-mail, setor, cargo, tipo de acesso)
- Aprovar ou negar solicitações pendentes dos funcionários

## Próximos passos sugeridos

- Trocar `MockDataService` por chamadas HTTP reais a uma API (por exemplo,
  um back-end feito a partir do `sistema-gestao-absenteismo`), usando os
  pacotes `http` ou `dio`.
- Persistir a sessão do usuário com `shared_preferences` (hoje o login
  "esquece" ao fechar o app, assim como no protótipo Angular original que
  também não tem back-end real de autenticação).
- Adicionar testes de widget para as telas principais.
