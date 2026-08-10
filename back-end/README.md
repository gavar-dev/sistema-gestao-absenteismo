# Backend — Sistema de Gestão de Absenteísmo

API REST do **Sistema de Gestão de Absenteísmo**, desenvolvida como parte do Projeto Integrador do curso Full Stack do Senac.

O backend centraliza autenticação, autorização por perfil, cadastro de funcionários, registro e gestão de ponto, solicitações, anexos, avisos internos e indicadores gerenciais.

## Visão geral

A aplicação utiliza autenticação stateless com JWT e possui três perfis de acesso:

| Perfil | Responsabilidade principal |
|---|---|
| `funcionario` | Registrar ponto, consultar dados próprios, acompanhar histórico, criar solicitações e visualizar avisos destinados a ele |
| `gestor` | Consultar funcionários, pontos, indicadores, solicitações e avisos gerenciais |
| `rh` | Administração completa de funcionários, análise de solicitações, processamento de pendências/faltas e gestão de avisos |

## Tecnologias

| Tecnologia | Uso |
|---|---|
| Java 21 | Linguagem principal |
| Spring Boot 4.1.0 | Framework da aplicação |
| Spring Web MVC | API REST |
| Spring Data JPA | Persistência e acesso ao banco |
| Spring Security | Autenticação e autorização |
| OAuth2 Resource Server | Validação de Bearer Token JWT |
| JWT HS256 | Autenticação stateless |
| Bean Validation | Validação dos DTOs de entrada |
| BCrypt | Hash das senhas |
| MySQL | Banco de dados relacional |
| Lombok | Redução de código repetitivo |
| Springdoc OpenAPI 3.0.3 | Swagger / documentação da API |
| Maven | Gerenciamento de dependências e build |

## Funcionalidades implementadas

### Autenticação e segurança

- Login com e-mail corporativo e senha.
- Senhas armazenadas com BCrypt.
- Geração de JWT com expiração configurável.
- Claims do token: `funcionarioId`, `nome`, `matricula`, `tipoAcesso` e `primeiroAcesso`.
- Controle de acesso por roles `FUNCIONARIO`, `GESTOR` e `RH`.
- Fluxo obrigatório de troca da senha provisória no primeiro acesso.
- Alteração de senha.
- Recuperação de senha por dados cadastrais, sem envio de e-mail.
- API stateless, sem sessão HTTP.
- CORS configurado para os frontends locais do projeto.

### Funcionários

- Cadastro por JSON.
- Cadastro multipart com foto opcional.
- Consulta do próprio perfil pelo JWT.
- Listagem e consulta por ID para RH/Gestor.
- Filtro por status.
- Atualização cadastral pelo RH.
- Alteração de status pelo RH.
- Desativação lógica do funcionário.
- Validação de duplicidade de e-mail, CPF e matrícula.
- Retorno do CPF formatado na resposta da API.
- Foto armazenada no sistema de arquivos.
- Fotos aceitas: JPG e PNG, até **2 MB**.

Status disponíveis:

```text
Ativo
Férias
Afastado
Inativo
```

Tipos de vínculo:

```text
CLT
PJ
Estágio
Temporário
Aprendiz
```

### Registro de ponto

Marcações disponíveis:

```text
ENTRADA
INICIO_INTERVALO
FIM_INTERVALO
SAIDA
```

Status possíveis da jornada:

```text
EM_ANDAMENTO
CONCLUIDA
PENDENTE
ATRASO
FALTA
JUSTIFICADA
```

Regras implementadas:

- Somente funcionários com status `ATIVO` podem registrar ponto.
- A entrada só pode ser registrada a partir das **08:00**.
- Existe tolerância até **08:30**.
- Entradas após 08:30 são registradas como atraso, calculado a partir das 08:00.
- A sequência da jornada é validada: entrada → início do intervalo → fim do intervalo → saída.
- Não é permitido registrar a mesma etapa duas vezes.
- A saída calcula o total trabalhado desconsiderando o intervalo.
- Jornadas sem registro ou incompletas podem ser processadas como `PENDENTE`.
- Sábados e domingos não são processados como dias úteis.
- Férias aprovadas são ignoradas no processamento de pendências.
- Pendências vencidas são convertidas em `FALTA` após **48 horas**, considerando 08:00 da data do registro como referência.

O módulo também disponibiliza histórico, resumo gerencial, indicadores por status, dia e setor, além de ranking de atrasos.

### Solicitações

Tipos disponíveis:

```text
CORRECAO_PONTO
JUSTIFICATIVA_FALTA
SOLICITACAO_FERIAS
CORRECAO_CADASTRO
```

Status:

```text
PENDENTE
APROVADA
REJEITADA
```

Prioridades:

```text
NORMAL
ALTA
```

Regras principais:

- Somente funcionário `ATIVO` pode criar solicitações.
- Correção de ponto exige uma data de referência e pelo menos um horário solicitado.
- Correção de ponto possui prazo de **48 horas** a partir das 08:00 da data de referência.
- Justificativa de falta também possui prazo de 48 horas.
- Justificativa só pode ser aberta para registros com status `FALTA` ou `PENDENTE`.
- Solicitação de férias exige data inicial e final válidas.
- A data inicial das férias não pode estar no passado.
- A data final não pode ser anterior à inicial.
- A aprovação de férias verifica sobreposição com outro período já aprovado.
- Correção cadastral não permite alteração da matrícula.
- Campos cadastrais suportados incluem nome, e-mail corporativo, CPF, telefone, data de nascimento, estado civil, nacionalidade, naturalidade e local de trabalho.
- Solicitações pendentes não podem ser analisadas mais de uma vez.
- A aprovação aplica o efeito correspondente ao tipo da solicitação no registro de ponto ou cadastro do funcionário.

#### Anexos de solicitações

Anexos são permitidos somente em:

- `CORRECAO_PONTO`
- `JUSTIFICATIVA_FALTA`

Formatos aceitos:

```text
PDF
JPG / JPEG
PNG
```

Limite por anexo: **5 MB**.

O RH pode visualizar o arquivo inline ou fazer o download.

### Avisos internos

O módulo de avisos permite ao RH:

- criar;
- atualizar;
- excluir;
- fixar/desafixar;
- definir publicação e expiração;
- escolher nível e público-alvo.

Níveis disponíveis:

```text
INFORMATIVO
SUCESSO
ALERTA
URGENTE
```

Destinos disponíveis:

```text
TODOS
TIPO_ACESSO
SETOR
```

O funcionário recebe apenas avisos compatíveis com seu perfil/setor e com as regras de publicação do aviso.

## Estrutura principal

```text
src/main/java/br/com/senac/sistema_gestao_absenteismo/
├── arquivo/
│   ├── dto/
│   └── service/
├── auth/
│   ├── controller/
│   ├── dto/
│   ├── security/
│   └── service/
├── aviso/
│   ├── controller/
│   ├── dto/
│   ├── model/
│   ├── repository/
│   └── service/
├── config/
├── funcionario/
│   ├── controller/
│   ├── documento/
│   ├── dto/
│   ├── model/
│   ├── repository/
│   └── service/
├── ponto/
│   ├── controller/
│   ├── dto/
│   ├── model/
│   ├── repository/
│   └── service/
├── shared/
│   └── exception/
└── solicitacao/
    ├── controller/
    ├── dto/
    ├── model/
    ├── repository/
    └── service/
```

## Pré-requisitos

- Java 21
- Maven
- MySQL 8+

Confira as versões instaladas:

```bash
java -version
mvn -version
mysql --version
```

## Banco de dados

A configuração atual utiliza MySQL local:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/sistema_gestao_absenteismo?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=America/Sao_Paulo
spring.datasource.username=root
spring.datasource.password=
```

Como a URL possui `createDatabaseIfNotExist=true`, o MySQL pode criar o banco automaticamente desde que o usuário configurado tenha permissão para isso.

Também está configurado:

```properties
spring.jpa.hibernate.ddl-auto=update
```

Assim, durante o desenvolvimento, o Hibernate atualiza o schema com base nas entidades da aplicação.

Para criar o banco manualmente:

```sql
CREATE DATABASE sistema_gestao_absenteismo
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;
```

## Configuração JWT

O projeto usa JWT assinado com **HS256**.

Por segurança, a chave não deve ser versionada diretamente no `application.properties`. Mantenha a propriedade exatamente desta forma:

```properties
security.jwt.secret=${JWT_SECRET}
```

Configurações utilizadas pela aplicação:

```properties
security.jwt.issuer=sistema-gestao-absenteismo
security.jwt.expiration-minutes=60
security.jwt.secret=${JWT_SECRET}
```

No Linux, uma chave pode ser definida para a sessão atual com:

```bash
export JWT_SECRET="$(openssl rand -base64 32)"
```

Para conferir:

```bash
echo "$JWT_SECRET"
```

> Nunca faça commit da chave JWT real no repositório.

## Upload de arquivos

Diretório base:

```properties
app.upload.diretorio=uploads
```

Limites globais do multipart:

```properties
spring.servlet.multipart.max-file-size=5MB
spring.servlet.multipart.max-request-size=55MB
```

Regras específicas da aplicação:

| Arquivo | Formatos | Limite |
|---|---|---:|
| Foto do funcionário | JPG, PNG | 2 MB |
| Anexo de solicitação | PDF, JPG, PNG | 5 MB |

Os arquivos são armazenados fora do banco. A aplicação persiste no banco apenas os metadados e o caminho relativo do arquivo.

## Porta da aplicação

O backend está configurado para:

```properties
server.port=8081
```

URL base:

```text
http://localhost:8081
```

## Executar o backend

Dentro da pasta `back-end`:

```bash
mvn spring-boot:run
```

A partir da raiz do repositório:

```bash
mvn -f back-end/pom.xml spring-boot:run
```

Após a inicialização:

```text
API:     http://localhost:8081
Swagger: http://localhost:8081/swagger-ui/index.html
OpenAPI: http://localhost:8081/v3/api-docs
```

## Autenticação

### Login

```http
POST /api/auth/login
Content-Type: application/json
```

Exemplo:

```json
{
  "email": "usuario@empresa.com",
  "senha": "Senha@123"
}
```

A resposta inclui o JWT:

```json
{
  "id": 1,
  "nomeCompleto": "Usuário Exemplo",
  "emailCorporativo": "usuario@empresa.com",
  "matricula": "1001",
  "tipoAcesso": "funcionario",
  "primeiroAcesso": false,
  "token": "<jwt>",
  "tipoToken": "Bearer",
  "expiraEm": "2026-08-10T16:00:00Z"
}
```

Nas rotas protegidas, envie:

```http
Authorization: Bearer <token>
```

### Primeiro acesso

Quando `primeiroAcesso=true`, o filtro de segurança bloqueia o acesso às demais funcionalidades até a senha provisória ser substituída.

```http
PATCH /api/auth/primeiro-acesso
Authorization: Bearer <token>
Content-Type: application/json
```

```json
{
  "novaSenha": "NovaSenha@123",
  "confirmacaoSenha": "NovaSenha@123"
}
```

### Recuperação de senha

```http
PATCH /api/auth/recuperar-senha
Content-Type: application/json
```

```json
{
  "email": "usuario@empresa.com",
  "cpf": "11122233396",
  "matricula": "1001",
  "dataNascimento": "1998-05-20",
  "novaSenha": "NovaSenha@123",
  "confirmacaoSenha": "NovaSenha@123"
}
```

Resposta de sucesso: `204 No Content`.

## Endpoints

### Autenticação

| Método | Endpoint | Acesso | Descrição |
|---|---|---|---|
| `POST` | `/api/auth/login` | Público | Login e geração do JWT |
| `PATCH` | `/api/auth/primeiro-acesso` | Autenticado | Substitui a senha provisória |
| `PATCH` | `/api/auth/alterar-senha` | Público na configuração atual | Valida e-mail/senha atual e altera a senha |
| `PATCH` | `/api/auth/recuperar-senha` | Público | Recuperação por dados cadastrais |

### Funcionários

| Método | Endpoint | Acesso | Descrição |
|---|---|---|---|
| `POST` | `/api/funcionarios` | RH | Cadastra por JSON |
| `POST` | `/api/funcionarios` | RH | Cadastra por multipart (`dados` + `foto`) |
| `GET` | `/api/funcionarios/me` | Autenticado | Perfil do usuário logado |
| `GET` | `/api/funcionarios` | RH / Gestor | Lista funcionários; aceita `?status=` |
| `GET` | `/api/funcionarios/{id}` | RH / Gestor | Consulta por ID |
| `GET` | `/api/funcionarios/{id}/foto` | RH / Gestor | Retorna a foto |
| `PUT` | `/api/funcionarios/{id}` | RH | Atualiza os dados |
| `PATCH` | `/api/funcionarios/{id}/status` | RH | Altera status |
| `DELETE` | `/api/funcionarios/{id}` | RH | Desativa logicamente |

### Pontos

| Método | Endpoint | Acesso | Descrição |
|---|---|---|---|
| `POST` | `/api/pontos/marcar` | Autenticado | Registra entrada, intervalo ou saída |
| `GET` | `/api/pontos/hoje` | Autenticado | Registro do dia atual |
| `GET` | `/api/pontos/meu-historico` | Autenticado | Histórico próprio |
| `GET` | `/api/pontos/funcionarios/{funcionarioId}` | RH / Gestor | Histórico por funcionário e período |
| `GET` | `/api/pontos` | RH / Gestor | Registros gerenciais com filtros |
| `GET` | `/api/pontos/resumo` | RH / Gestor | Resumo agregado |
| `GET` | `/api/pontos/indicadores/status` | RH / Gestor | Indicadores por status |
| `GET` | `/api/pontos/indicadores/por-dia` | RH / Gestor | Indicadores diários |
| `GET` | `/api/pontos/indicadores/por-setor` | RH / Gestor | Indicadores por setor |
| `GET` | `/api/pontos/indicadores/ranking-atrasos` | RH / Gestor | Ranking de atrasos |
| `POST` | `/api/pontos/processamento/pendencias?data=AAAA-MM-DD` | RH | Processa pendências de um dia útil anterior |
| `POST` | `/api/pontos/processamento/faltas` | RH | Converte pendências vencidas em faltas |

Exemplo de marcação:

```json
{
  "tipo": "ENTRADA"
}
```

### Solicitações

| Método | Endpoint | Acesso | Descrição |
|---|---|---|---|
| `POST` | `/api/solicitacoes` | Autenticado | Cria solicitação por JSON |
| `POST` | `/api/solicitacoes` | Autenticado | Cria multipart (`dados` + `anexo`) |
| `GET` | `/api/solicitacoes/minhas` | Autenticado | Solicitações do usuário logado |
| `GET` | `/api/solicitacoes` | RH / Gestor | Lista geral; aceita `?status=` |
| `GET` | `/api/solicitacoes/{id}` | RH / Gestor | Detalhes da solicitação |
| `GET` | `/api/solicitacoes/{id}/anexo/visualizar` | RH | Visualiza anexo inline |
| `GET` | `/api/solicitacoes/{id}/anexo/download` | RH | Baixa o anexo |
| `PATCH` | `/api/solicitacoes/{id}/aprovar` | RH | Aprova e aplica a regra correspondente |
| `PATCH` | `/api/solicitacoes/{id}/rejeitar` | RH | Rejeita e registra parecer |

Exemplo de correção de ponto:

```json
{
  "tipo": "CORRECAO_PONTO",
  "prioridade": "NORMAL",
  "dataReferencia": "2026-08-09",
  "entradaSolicitada": "08:00:00",
  "inicioIntervaloSolicitado": "12:00:00",
  "fimIntervaloSolicitado": "13:00:00",
  "saidaSolicitada": "17:00:00",
  "justificativa": "Solicito a correção dos horários registrados no dia informado."
}
```

### Avisos

| Método | Endpoint | Acesso | Descrição |
|---|---|---|---|
| `POST` | `/api/avisos` | RH | Cria aviso |
| `GET` | `/api/avisos/meus` | Autenticado | Avisos destinados ao usuário |
| `GET` | `/api/avisos` | RH / Gestor | Lista gerencial; aceita `?ativo=` |
| `GET` | `/api/avisos/{id}` | RH / Gestor | Consulta aviso |
| `PUT` | `/api/avisos/{id}` | RH | Atualiza aviso |
| `PATCH` | `/api/avisos/{id}/fixar` | RH | Alterna fixado/desafixado |
| `DELETE` | `/api/avisos/{id}` | RH | Exclui aviso |

## Swagger / OpenAPI

A API possui documentação interativa com Springdoc.

Acesse:

```text
http://localhost:8081/swagger-ui/index.html
```

Para testar endpoints protegidos:

1. Faça login em `POST /api/auth/login`.
2. Copie o valor de `token`.
3. Clique em **Authorize** no Swagger.
4. Informe o JWT no esquema Bearer.
5. Execute os endpoints compatíveis com o perfil do usuário autenticado.

O JSON OpenAPI está disponível em:

```text
http://localhost:8081/v3/api-docs
```

## CORS

Origens liberadas na configuração atual:

```text
http://localhost:4200
http://127.0.0.1:4200
http://localhost:5000
http://127.0.0.1:5000
```

Métodos permitidos:

```text
GET, POST, PUT, PATCH, DELETE, OPTIONS
```

Cabeçalhos permitidos:

```text
Authorization, Content-Type, Accept
```

## Tratamento de erros

A API utiliza tratamento global de exceções e devolve erros em formato padronizado.

Exemplo:

```json
{
  "timestamp": "2026-08-10T12:00:00",
  "status": 400,
  "erro": "Bad Request",
  "mensagem": "Existem campos inválidos na requisição",
  "caminho": "/api/funcionarios",
  "campos": {
    "emailCorporativo": "Informe um e-mail válido"
  }
}
```

Principais códigos utilizados:

| HTTP | Uso |
|---:|---|
| `200` | Consulta ou alteração realizada com sucesso |
| `201` | Recurso criado |
| `204` | Operação concluída sem corpo de resposta |
| `400` | Dados inválidos ou regra de negócio não atendida |
| `401` | Credenciais/dados de identificação inválidos |
| `403` | Usuário sem permissão ou status sem acesso |
| `404` | Recurso não encontrado |
| `409` | Conflito de dados ou operação duplicada |

## DataSeeder

Existe um `DataSeeder` para facilitar o ambiente de desenvolvimento.

Ele é executado somente quando a tabela de funcionários está vazia e cria usuários de demonstração com diferentes perfis/status. A senha provisória definida no código atual é:

```text
Teste@123
```

> O seeder é destinado somente ao desenvolvimento/testes e deve ser revisado ou desabilitado antes de qualquer ambiente real.

## Teste rápido com cURL

Login:

```bash
curl -i -X POST http://localhost:8081/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email":"usuario@empresa.com",
    "senha":"Senha@123"
  }'
```

Consultar o próprio perfil:

```bash
curl -i http://localhost:8081/api/funcionarios/me \
  -H "Authorization: Bearer SEU_TOKEN"
```

## Build

Compilar o projeto:

```bash
mvn clean package
```

Executar testes:

```bash
mvn test
```

Executar o JAR gerado:

```bash
java -jar target/sistema-gestao-absenteismo-0.0.1-SNAPSHOT.jar
```

## Observações de segurança

- Não versionar a chave JWT.
- Não usar credenciais do `DataSeeder` fora do ambiente de desenvolvimento.
- Em produção, configurar usuário e senha próprios para o MySQL.
- Evitar executar a aplicação com o usuário `root` do banco em ambiente real.
- Restringir as origens CORS aos domínios efetivamente utilizados.
- O diretório `uploads` deve ter permissões de acesso controladas e não deve ser exposto diretamente por servidor web.

## Projeto Integrador — Senac

Backend desenvolvido para integração com as interfaces web e mobile do Sistema de Gestão de Absenteísmo.
