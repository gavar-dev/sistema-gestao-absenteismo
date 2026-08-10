# Sistema de Gestão de Absenteísmo

Projeto Integrador desenvolvido para centralizar o controle de **funcionários, ponto, absenteísmo, solicitações e comunicados internos** em uma única solução.

O projeto possui uma aplicação web completa, uma API REST e uma versão mobile em Flutter.

## Visão geral

A solução atende três perfis de acesso:

- **Funcionário** — registra ponto, consulta histórico, acompanha solicitações, avisos e dados pessoais.
- **Gestor** — acompanha informações da equipe, indicadores e solicitações.
- **RH** — possui acesso administrativo para gestão de funcionários, cadastros, alterações de status, solicitações e demais rotinas de RH.

## Tecnologias

### Frontend Web

- Angular 21
- TypeScript
- Bootstrap 5
- Bootstrap Icons
- RxJS

### Backend

- Java 21
- Spring Boot 4
- Spring Security
- JWT
- Spring Data JPA
- Bean Validation
- MySQL
- BCrypt
- Springdoc OpenAPI / Swagger

### Mobile

- Flutter
- Dart
- Provider / ChangeNotifier

> A versão mobile atual funciona como protótipo independente, utilizando dados mockados em memória. A integração com a API REST pode ser realizada em uma etapa posterior.

## Principais funcionalidades

### Autenticação e segurança

- Login com JWT
- Controle de acesso por perfil
- Primeiro acesso com troca obrigatória de senha
- Recuperação de senha por dados cadastrais
- Senhas armazenadas com BCrypt
- Validação completa de CPF
- Guards e interceptor JWT no Angular

### Gestão de funcionários

- Cadastro de funcionários
- Consulta e edição cadastral
- Alteração de status
- Perfis Funcionário, Gestor e RH
- Foto de perfil
- Validação de dados e duplicidades

### Controle de ponto

- Registro de entrada
- Início do intervalo
- Retorno do intervalo
- Registro de saída
- Histórico de ponto
- Controle de atrasos, faltas e pendências
- Indicadores para gestão

### Solicitações

O funcionário pode abrir solicitações relacionadas a:

- Correção de ponto
- Justificativa de falta
- Férias
- Alteração cadastral

Gestores e RH podem analisar, aprovar ou rejeitar solicitações.

O módulo também suporta anexos e documentos comprobatórios.

### Avisos

- Publicação de comunicados
- Listagem de avisos
- Controle de leitura
- Exibição direcionada aos usuários

## Estrutura geral

```text
sistema-gestao-absenteismo/
├── back-end/          # API REST Spring Boot
├── front-end/         # Aplicação web Angular
└── mobile-flutter/    # Aplicação mobile Flutter
```

Cada módulo possui sua própria documentação com detalhes de instalação, configuração e execução.

## Executando o projeto web

<!-- ### 1. Banco de dados

Crie o banco MySQL:

```sql
CREATE DATABASE sistema_gestao_absenteismo
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;
``` -->

### 1. Backend

Configure a variável de ambiente usada para assinatura dos tokens JWT:

```bash
export JWT_SECRET="sua-chave-secreta"
```

Execute:

```bash
mvn -f back-end/pom.xml spring-boot:run
```

Por padrão no ambiente atual do projeto, a API é utilizada em:

```text
http://localhost:8081
```

A documentação Swagger pode ser acessada em:

```text
http://localhost:8081/swagger-ui/index.html
```

### 3. Frontend

Entre na pasta:

```bash
cd front-end
```

Instale as dependências:

```bash
npm install
```

Execute:

```bash
npm start
```

A aplicação ficará disponível em:

```text
http://localhost:4200
```

## Executando o aplicativo Flutter

Entre na pasta do projeto mobile e instale as dependências:

```bash
flutter pub get
```

Depois execute:

```bash
flutter run
```

Também é possível abrir o projeto pelo Android Studio e executá-lo em um emulador ou dispositivo físico.

## Arquitetura

O sistema web segue uma arquitetura cliente-servidor:

```text
Angular
   │
   │ HTTP / JSON + JWT
   ▼
Spring Boot REST API
   │
   │ JPA / Hibernate
   ▼
MySQL
```

O backend concentra as regras de negócio, validações, autenticação e persistência. O Angular fornece a interface web e consome os endpoints da API.

O aplicativo Flutter mantém a mesma proposta funcional e organização por perfis, mas atualmente utiliza dados mockados.

## Objetivo do projeto

O objetivo é reduzir processos manuais relacionados à gestão de frequência e centralizar informações importantes para funcionários, gestores e RH.

A plataforma busca facilitar o acompanhamento da jornada de trabalho, reduzir inconsistências nos registros de ponto e tornar os processos de solicitação e análise mais organizados e rastreáveis.

## Documentação

Para informações técnicas detalhadas, consulte os READMEs específicos de cada módulo:

- `back-end/README.md`
- `front-end/README.md`
- documentação do aplicativo Flutter

---

**Projeto Integrador — Desenvolvimento Full Stack**
