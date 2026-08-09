/// URL base da API. Ajuste conforme onde o app estiver rodando:
///
/// - Emulador Android:      http://10.0.2.2:8081/api
/// - Simulador iOS:         http://localhost:8081/api
/// - Dispositivo físico:    http://SEU_IP_NA_REDE_LOCAL:8081/api  (ex.: 192.168.0.10)
/// - Flutter Web (debug):   http://localhost:8081/api  (precisa liberar a origem no CorsConfig do back-end)
///
/// O back-end (`back-end/`) roda por padrão na porta 8081.
class AppConfig {
  static const String baseUrl = 'http://localhost:8081/api';
}
