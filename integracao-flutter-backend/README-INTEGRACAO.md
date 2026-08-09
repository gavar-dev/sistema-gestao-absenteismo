# Integração Flutter ↔ Back-end real — o que mudou e como rodar

Este pacote contém as mudanças para o seu `mobile-flutter` deixar de usar
dados mockados e passar a consumir o back-end Spring Boot que já existe em
`back-end/` no seu repositório.

## 1. Onde colocar cada coisa

```
seu-repo/
├── back-end/
│   └── src/main/java/br/com/senac/sistema_gestao_absenteismo/
│       └── config/
│           └── DataSeeder.java   ← ADICIONE este arquivo (está em back-end-DataSeeder/ neste zip)
│
└── mobile-flutter/                ← SUBSTITUA sua pasta inteira por esta
```

- **`back-end-DataSeeder/DataSeeder.java`**: copie para
  `back-end/src/main/java/br/com/senac/sistema_gestao_absenteismo/config/DataSeeder.java`
  no seu repositório. É o único arquivo novo no back-end.
- **`mobile-flutter/`**: substitui a pasta inteira do seu projeto Flutter.
  Nada na estrutura de pastas mudou, só o conteúdo de alguns arquivos (veja
  a lista completa lá embaixo).

## 2. Por que o `DataSeeder`?

Sem ele, ninguém consegue logar na primeira execução: cadastrar funcionário
exige `ROLE_RH`, mas não existe nenhum usuário ainda — problema do ovo e da
galinha. O seeder roda uma única vez (só se a tabela `funcionarios` estiver
vazia) e cria 4 usuários de teste, todos com senha **`Teste@123`**:

| Perfil | E-mail |
|---|---|
| RH | rh.corporativo@gmail.com |
| Gestor | gestor.corporativo@gmail.com |
| Funcionário | funcionario@gmail.com |
| Funcionário | pedro.santos@gmail.com |

Você pode apagar esse arquivo depois que já tiver usuários reais cadastrados
em produção.

## 3. Rodando o back-end

O `application.properties` do seu back-end já está assim:

```properties
security.jwt.secret=${JWT_SECRET}
server.port=8081
```

Ou seja, **é obrigatório setar a variável de ambiente `JWT_SECRET`** antes
de rodar — sem ela o Spring nem sobe. Precisa ser uma string Base64 de pelo
menos 32 bytes. Gere a sua com:

```bash
# Linux/Mac
openssl rand -base64 48

# ou Python, se não tiver openssl à mão
python3 -c "import secrets, base64; print(base64.b64encode(secrets.token_bytes(48)).decode())"
```

Exemplo de valor válido (troque pelo seu, não reuse este em produção):
```
ogBOSbd5XfSQkGQfLCLsV2HlUNMdBVb/eGt86vBjeiNYMqYJWNpLegBt5Oab2sLW
```

No VS Code, configure a variável antes de rodar (terminal integrado):

```bash
# Linux/Mac
export JWT_SECRET="ogBOSbd5XfSQkGQfLCLsV2HlUNMdBVb/eGt86vBjeiNYMqYJWNpLegBt5Oab2sLW"
cd back-end
./mvnw spring-boot:run
```

```powershell
# Windows (PowerShell)
$env:JWT_SECRET="ogBOSbd5XfSQkGQfLCLsV2HlUNMdBVb/eGt86vBjeiNYMqYJWNpLegBt5Oab2sLW"
cd back-end
./mvnw spring-boot:run
```

Ou, se preferir algo persistente, crie um "Run Configuration" no VS Code
(`.vscode/launch.json`) com essa variável em `"env"`. Confirme no console que
apareceu a mensagem do seeder (`>> Usuarios de teste criados...`) e que a
API subiu em `http://localhost:8081`.

Teste rápido:
```bash
curl -X POST http://localhost:8081/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"funcionario@gmail.com","senha":"Teste@123"}'
```

## 4. Rodando o Flutter

1. Copie a pasta `mobile-flutter/` deste zip por cima da sua (ou faça o
   merge manual, se tiver mudanças locais que eu não vi).
2. Abra `mobile-flutter/lib/config/app_config.dart` e confirme a URL:

   ```dart
   static const String baseUrl = 'http://10.0.2.2:8081/api';
   ```

   - **Emulador Android**: `10.0.2.2` já é o padrão (é como o emulador
     enxerga o `localhost` da sua máquina) — não precisa mudar nada.
   - **Simulador iOS**: troque para `http://localhost:8081/api`.
   - **Celular físico**: troque `10.0.2.2` pelo IP da sua máquina na rede
     Wi-Fi (ex.: `192.168.0.15`), e libere a porta 8081 no firewall.
3. No terminal, dentro de `mobile-flutter/`:
   ```bash
   flutter pub get
   flutter run
   ```

Na tela de login, os três chips (Funcionário/RH/Gestor) só preenchem o
e-mail e a senha de teste — o login continua sendo autenticação de verdade
contra a API.

## 5. O que foi alterado (para revisão / merge)

**Novo:**
- `lib/config/app_config.dart`
- `lib/services/api_client.dart`

**Reescritos por completo:**
- `lib/services/auth_service.dart`
- `lib/services/mock_data_service.dart` (nome mantido, mas não é mais mock)
- `lib/models/usuario.dart`, `funcionario.dart`, `registro_ponto.dart`,
  `aviso.dart`, `solicitacao.dart`
- `lib/screens/login/login_screen.dart`
- `lib/screens/funcionario/meus_dados_screen.dart`
- `lib/screens/gestao/solicitacoes_gestao_screen.dart`

**Ajustes pontuais** (nomes de enum mudaram, ou tratamento de erro/loading
foi adicionado):
- `lib/screens/funcionario/meu_ponto_screen.dart`
- `lib/screens/funcionario/historico_screen.dart`
- `lib/screens/funcionario/solicitacao_screen.dart`
- `lib/screens/funcionario/home_funcionario_screen.dart` (só o logout)
- `lib/screens/gestao/home_gestao_screen.dart` (logout + botão "Meus dados")
- `pubspec.yaml` (dependências `http` e `flutter_secure_storage`)
- `android/app/src/main/AndroidManifest.xml` (permissão de internet +
  tráfego HTTP em desenvolvimento)
- `ios/Runner/Info.plist` (App Transport Security, mesma razão)

## 6. Como cada tela mapeia pro que você pediu

- **Login** → autentica de verdade, guarda o token com
  `flutter_secure_storage`, e direciona pro shell certo conforme
  `tipoAcesso` (funcionário vs RH/gestor).
- **Funcionário**: Início (resumo do dia + avisos não lidos), Meu Ponto
  (bater ponto de verdade), Histórico (dados reais dos últimos registros),
  Solicitações (criar e ver as próprias), Meus Dados (perfil real vindo de
  `GET /api/funcionarios/me`).
- **RH/Gestor**: Dashboard com números reais (funcionários ativos, atrasos
  do mês vindo de `GET /api/pontos/indicadores/ranking-atrasos`,
  solicitações pendentes), lista de Funcionários, Solicitações com
  **aprovar/rejeitar de verdade** (rejeitar abre um diálogo pedindo o
  motivo, porque o back-end exige isso), e o mesmo botão de "Meus Dados"
  que o funcionário tem.

## 7. Limitações conhecidas (por design do back-end atual)

- **Avisos "lido/não lido"**: o back-end não guarda leitura por
  funcionário (avisos são broadcast: todos, um tipo de acesso, ou um
  setor). O app controla isso só localmente, em memória — reseta a cada
  login. Se quiser persistir de verdade, precisaria de uma tabela
  `aviso_leitura (funcionario_id, aviso_id)` nova no back-end.
- **"Faltas" na tela de Funcionários (RH)**: hoje só populamos a coluna de
  **atrasos** (via `/pontos/indicadores/ranking-atrasos`). Não existe um
  endpoint agregado de faltas por funcionário — dá pra calcular iterando
  `/pontos/funcionarios/{id}` por empregado, mas fica caro com muitos
  funcionários; por ora o campo fica em 0.
- **Cadastro de novo funcionário pelo RH**: não implementei essa tela
  (você não pediu — só listar/ver, aprovar/rejeitar e dashboard). Se
  precisar, o endpoint já existe (`POST /api/funcionarios`, exige
  `ROLE_RH`) e dá pra plugar um formulário depois.
