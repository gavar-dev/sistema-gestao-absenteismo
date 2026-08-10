# Frontend — Sistema de Gestão de Absenteísmo

Interface web do **Sistema de Gestão de Absenteísmo**, desenvolvida em Angular para atender funcionários, gestores e RH em fluxos de autenticação, registro de ponto, solicitações, avisos e gestão de funcionários.

O frontend consome a API REST do backend, controla a sessão por JWT e aplica navegação e permissões conforme o tipo de usuário autenticado.

## Tecnologias

- Angular 21.2
- TypeScript 5.9
- RxJS 7.8
- Bootstrap 5.3.8
- Bootstrap Icons 1.13.1
- Angular Router
- Angular Forms e Reactive Forms
- Vitest 4
- jsdom 28
- Prettier 3
- npm 10.9.2

## Principais funcionalidades

### Autenticação e sessão

- Login com e-mail e senha.
- Autenticação baseada em JWT.
- Armazenamento do token e da data de expiração no `localStorage`.
- Inclusão automática do token nas chamadas à API por interceptor HTTP.
- Redirecionamento conforme o perfil do usuário.
- Fluxo obrigatório de troca de senha no primeiro acesso.
- Alteração de senha.
- Recuperação de senha por dados cadastrais.
- Tratamento de credenciais inválidas, usuário sem acesso, indisponibilidade da API e timeout.
- Logout com limpeza dos dados locais da sessão.

### Área do funcionário

- Dashboard inicial com resumo da jornada, pendências, solicitações, avisos e atalhos rápidos.
- Registro de ponto com fluxo de:
  - entrada;
  - início do intervalo;
  - fim do intervalo;
  - saída.
- Consulta do ponto do dia.
- Histórico de registros de ponto.
- Indicadores e informações consolidadas do histórico.
- Criação e acompanhamento de solicitações.
- Consulta dos próprios dados pessoais e profissionais.
- Solicitação de correção de dados cadastrais.
- Consulta de avisos direcionados ao usuário.
- Controle local de avisos lidos.

### Solicitações

O funcionário pode abrir os seguintes tipos de solicitação:

- Correção de ponto.
- Justificativa de falta.
- Solicitação de férias.
- Correção de cadastro.

Para solicitações compatíveis, é possível anexar arquivos nos formatos:

- PDF;
- JPG/JPEG;
- PNG.

O limite aplicado no frontend para anexos de solicitação é de **5 MB**.

A área de gestão permite:

- listar solicitações;
- pesquisar por funcionário, protocolo, matrícula, setor ou tipo;
- filtrar por status, tipo e setor;
- abrir detalhes;
- visualizar e baixar anexos;
- aprovar solicitações;
- rejeitar solicitações com observação.

### Gestão de funcionários

A área de gestão oferece:

- listagem de funcionários;
- filtros por busca, status, setor e tipo de acesso;
- visualização dos dados completos;
- edição de funcionário;
- alteração de status;
- desativação lógica de funcionário;
- indicadores de atrasos, faltas e pendências;
- cadastro de novo funcionário pelo RH;
- geração de senha provisória;
- upload opcional de foto;
- exibição de avatar com foto ou iniciais como fallback.

No cadastro, a foto aceita **JPG ou PNG** e possui limite de **2 MB** no frontend.

O CPF utiliza um validador reutilizável que verifica os dígitos verificadores e rejeita sequências inválidas.

### Painel de gestão

O dashboard de Gestor/RH consolida informações provenientes dos serviços de funcionários, ponto e solicitações, incluindo:

- quantidade de funcionários cadastrados e ativos;
- presentes no dia;
- atrasos no mês;
- faltas e pendências;
- solicitações pendentes;
- distribuição de funcionários por status;
- indicadores por setor;
- funcionários que exigem acompanhamento;
- solicitações recentes;
- alertas de gestão.

### Avisos

Funcionários podem consultar avisos recebidos e marcar avisos como lidos localmente.

A área de gestão permite consultar avisos e aplicar filtros por busca, nível, destino e situação. Usuários do RH podem criar, editar e excluir avisos com:

- título e mensagem;
- nível: informativo, sucesso, alerta ou urgente;
- destino para todos, tipo de acesso ou setor;
- data de publicação;
- data de expiração.

### Tema e layout

- Tema claro e escuro.
- Preferência de tema persistida em `localStorage`.
- Sidebar específica para funcionário.
- Sidebar específica para Gestor/RH.
- Header e footer compartilhados.
- Componentes standalone.
- Layout responsivo com Bootstrap.

## Perfis de acesso

O frontend trabalha com três tipos de usuário:

| Tipo | Identificador | Acesso principal |
|---|---|---|
| Funcionário | `funcionario` | Ponto, solicitações, histórico, dados e avisos |
| Gestor | `gestor` | Área de gestão, indicadores, funcionários, solicitações e avisos |
| RH | `rh` | Área de gestão e operações administrativas, incluindo cadastro de funcionário |

A autorização definitiva também deve ser aplicada pelo backend. Os guards do Angular são usados para navegação e experiência do usuário, não como substitutos da segurança da API.

## Rotas

### Autenticação

| Rota | Página |
|---|---|
| `/login` | Login |
| `/esqueci-senha` | Recuperação de senha |
| `/alterar-senha` | Alteração de senha |

### Funcionário

| Rota | Página |
|---|---|
| `/` | Início |
| `/meus-pontos` | Registro de ponto |
| `/solicitacao` | Solicitações |
| `/historico` | Histórico de ponto |
| `/meus-dados` | Dados do funcionário |
| `/avisos` | Avisos |

Essas rotas utilizam `authGuard` e `funcionarioGuard`.

### Gestor e RH

| Rota | Página |
|---|---|
| `/gestao/inicio` | Dashboard gerencial |
| `/gestao/funcionarios` | Gestão de funcionários |
| `/gestao/solicitacoes` | Gestão de solicitações |
| `/gestao/avisos` | Gestão de avisos |
| `/gestao/cadastro` | Cadastro de funcionário |
| `/gestao/meu-ponto` | Registro de ponto do usuário da gestão |
| `/gestao/meus-dados` | Dados do usuário da gestão |

A árvore `/gestao` utiliza `authGuard` e `gestaoGuard`.

Rotas inexistentes são redirecionadas para `/login`.

## Guards

O projeto possui quatro guards funcionais:

### `authGuard`

Verifica se existe JWT válido e sessão de usuário. Também impede o acesso normal às páginas enquanto o primeiro acesso ainda estiver pendente.

### `funcionarioGuard`

Permite as rotas exclusivas de funcionário somente para o perfil `funcionario`. Gestor e RH são redirecionados para a área de gestão.

### `gestaoGuard`

Permite a área `/gestao` para os perfis `gestor` e `rh`. Funcionários são redirecionados para a área do funcionário.

### `loginGuard`

Controla o acesso às páginas de autenticação. Usuários já autenticados são redirecionados para sua rota inicial, enquanto usuários em primeiro acesso permanecem no fluxo obrigatório de definição da nova senha.

## Interceptor JWT

O `jwtInterceptor` adiciona automaticamente o cabeçalho:

```http
Authorization: Bearer <token>
```

nas requisições destinadas à API configurada no ambiente.

A requisição de login não recebe o token.

## Serviços

A comunicação com o backend está centralizada nos serviços em `src/app/core/services`.

### `AuthService`

Responsável por:

- login;
- primeiro acesso;
- alteração de senha;
- recuperação de senha;
- logout e consulta do estado de autenticação.

### `FuncionarioService`

Responsável por:

- perfil do usuário autenticado;
- listagem e consulta de funcionários;
- cadastro;
- edição;
- alteração de status;
- desativação;
- carregamento de foto;
- cache de imagens de funcionário.

### `PontoService`

Responsável por:

- ponto do dia;
- marcação de ponto;
- histórico do funcionário;
- registros gerenciais;
- resumo gerencial;
- indicadores por setor.

### `SolicitacaoService`

Responsável por:

- criação de solicitação;
- envio de anexo;
- listagem das solicitações do funcionário;
- listagem gerencial;
- detalhes;
- aprovação;
- rejeição;
- visualização e download de anexo.

### `AvisoService`

Responsável por:

- avisos destinados ao usuário;
- listagem gerencial;
- consulta individual;
- criação;
- atualização;
- exclusão.

### `TokenStorageService`

Gerencia JWT, expiração e leitura de claims usados no primeiro acesso.

### `UsuarioLogadoService`

Mantém os dados básicos do usuário em sessão, resolve o perfil e determina a rota inicial após o login.

## Estrutura principal

```text
src/
├── app/
│   ├── core/
│   │   ├── guards/
│   │   ├── interceptors/
│   │   └── services/
│   ├── models/
│   ├── pages/
│   │   ├── admin-rh/
│   │   ├── funcionario/
│   │   ├── alterar-senha-component/
│   │   ├── esqueci-senha-component/
│   │   └── login-component/
│   ├── shared/
│   │   ├── footer-component/
│   │   ├── funcionario-avatar/
│   │   ├── header-component/
│   │   ├── sidebar/
│   │   ├── sidebar-admin/
│   │   └── validators/
│   ├── app.config.ts
│   ├── app.routes.ts
│   └── app.ts
├── environments/
│   └── environment.ts
├── index.html
├── main.ts
└── styles.css
```

## Configuração da API

O endereço da API está configurado em:

```text
src/environments/environment.ts
```

Configuração atual de desenvolvimento:

```ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8081/api',
};
```

Portanto, para desenvolvimento local, o backend deve estar disponível em:

```text
http://localhost:8081
```

Caso a porta ou endereço do backend seja alterado, atualize `apiUrl` antes de iniciar o frontend.

## Pré-requisitos

- Node.js compatível com Angular 21.
- npm.
- Backend do Sistema de Gestão de Absenteísmo em execução para os fluxos integrados.

O projeto declara o gerenciador:

```text
npm@10.9.2
```

## Instalação

Na pasta do frontend:

```bash
npm install
```

## Executar em desenvolvimento

```bash
npm start
```

O script executa:

```bash
ng serve
```

Por padrão, a aplicação Angular fica disponível em:

```text
http://localhost:4200
```

## Build

Para gerar o build da aplicação:

```bash
npm run build
```

Os artefatos de produção são gerados pelo Angular conforme a configuração do workspace.

## Build em modo watch

```bash
npm run watch
```

Esse comando executa o build de desenvolvimento em modo contínuo.

## Testes

```bash
npm test
```

O projeto possui dependências de teste com Vitest e jsdom.

## Integração local completa

Para utilizar o sistema integrado em desenvolvimento, mantenha:

```text
Frontend: http://localhost:4200
Backend:  http://localhost:8081
API:      http://localhost:8081/api
```

O backend precisa permitir a origem do frontend via CORS.

## Armazenamento local

O frontend utiliza `localStorage` para dados como:

- JWT;
- expiração do JWT;
- informações básicas do usuário autenticado;
- preferência de tema;
- estado local de leitura de avisos e outros dados auxiliares de interface.

Não devem ser armazenadas senhas no navegador.

## Observações de segurança

- O frontend não deve conter a chave secreta utilizada para assinar JWTs.
- O token recebido do backend é utilizado apenas para autenticar chamadas à API.
- Guards e controles de interface não substituem autorização no servidor.
- Operações sensíveis devem ser validadas novamente pelo backend.
- Senhas nunca devem ser persistidas no `localStorage`.

## Scripts disponíveis

| Comando | Função |
|---|---|
| `npm start` | Inicia o servidor de desenvolvimento |
| `npm run build` | Gera o build da aplicação |
| `npm run watch` | Build de desenvolvimento em modo watch |
| `npm test` | Executa os testes |
| `npm run ng -- <comando>` | Executa comandos do Angular CLI pelo script `ng` |

## Resumo da arquitetura

O frontend segue uma organização por responsabilidade:

- **pages**: telas e fluxos de negócio;
- **shared**: componentes reutilizáveis e validadores;
- **core/services**: acesso à API e gerenciamento de sessão;
- **core/guards**: proteção e redirecionamento de rotas;
- **core/interceptors**: configuração transversal das requisições HTTP;
- **models**: contratos TypeScript usados na comunicação com o backend;
- **environments**: configuração do endereço da API.

A aplicação utiliza componentes standalone e é inicializada com `bootstrapApplication`, sem depender de um `AppModule` tradicional.
