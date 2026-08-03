# Backend — Sistema de Gestão de Absenteísmo

Primeira etapa da API REST, com conexão MySQL e cadastro de funcionários.

## Pré-requisitos

- Java 21
- MySQL 8
- Banco `sistema_gestao_absenteismo`

## Executar

```bash
./mvnw spring-boot:run
```

A API ficará disponível em `http://localhost:8080`.

## Endpoints iniciais

- `POST /api/funcionarios` — cadastrar
- `GET /api/funcionarios` — listar
- `GET /api/funcionarios?status=Ativo` — filtrar por status
- `GET /api/funcionarios/{id}` — consultar
- `PUT /api/funcionarios/{id}` — editar
- `PATCH /api/funcionarios/{id}/status` — alterar status
- `DELETE /api/funcionarios/{id}` — desativar (não remove fisicamente)

## Exemplo para cadastro

```json
{
  "nomeCompleto": "Maria Silva",
  "emailCorporativo": "maria.silva@empresa.com",
  "cpf": "123.456.789-09",
  "telefone": "(21) 99999-9999",
  "dataNascimento": "1998-05-20",
  "estadoCivil": "Solteiro(a)",
  "nacionalidade": "Brasileira",
  "naturalidade": "Rio de Janeiro",
  "matricula": "1001",
  "cargo": "Desenvolvedor(a)",
  "setor": "Tecnologia da Informação",
  "dataAdmissao": "2026-08-01",
  "tipoVinculo": "CLT",
  "cargaHorariaSemanal": 44,
  "gestorImediato": "Carla Menezes",
  "localTrabalho": "Filial - Rio de Janeiro",
  "tipoAcesso": "funcionario",
  "status": "Ativo",
  "senhaProvisoria": "Teste@123"
}
```

A senha provisória é armazenada somente como hash BCrypt.

## Configuração do banco

Os valores padrão estão no `application.properties`:

```properties
DB_URL=jdbc:mysql://localhost:3306/sistema_gestao_absenteismo
DB_USERNAME=root
DB_PASSWORD=
```

Eles podem ser substituídos por variáveis de ambiente quando necessário.
