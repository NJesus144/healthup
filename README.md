# HealthUp API

Uma API de agendamento médico construída com Node.js e TypeScript, implementando boas práticas de desenvolvimento como TDD, SOLID, observabilidade, processamento de filas e pipe line para testes e padronização do codigo.

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-336791?style=for-the-badge&logo=postgresql&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Jest](https://img.shields.io/badge/Jest-C21325?style=for-the-badge&logo=jest&logoColor=white)
![ESLint](https://img.shields.io/badge/ESLint-4B32C3?style=for-the-badge&logo=eslint&logoColor=white)
![Prettier](https://img.shields.io/badge/Prettier-F7B93E?style=for-the-badge&logo=prettier&logoColor=black)
![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-2088FF?style=for-the-badge&logo=github-actions&logoColor=white)

### Observabilidade & Monitoramento
![Prometheus](https://img.shields.io/badge/Prometheus-E6522C?style=for-the-badge&logo=prometheus&logoColor=white)
![Grafana](https://img.shields.io/badge/Grafana-F46800?style=for-the-badge&logo=grafana&logoColor=white)
![Loki](https://img.shields.io/badge/Loki-F46800?style=for-the-badge&logo=grafana&logoColor=white)

### 🚀 Sobre o Projeto
O HealthUp é uma API completa para gerenciamento de consultas médicas que permite o cadastro de pacientes e médicos, agendamento de consultas e administração do sistema. O projeto foi desenvolvido com foco em boas práticas de engenharia de software e observabilidade, implementando tecnologias modernas mesmo em um contexto que não necessariamente as exigiria, com o objetivo de demonstrar conhecimentos técnicos avançados.

### Principais Funcionalidades
👥 Gestão de Usuários
- Cadastro Duplo: Usuários podem se registrar como pacientes ou médicos
- Sistema de Aprovação: Médicos ficam com status pendente até aprovação administrativa
- Especialidades Médicas: 6 especialidades disponíveis (Cardiologia, Dermatologia, Clínica Geral, Fisioterapia, Endocrinologia, Ortopedia)
- Autenticação JWT: Sistema completo com refresh token e controle de roles

📅 Agendamento Inteligente
- Range Dinâmico: Agendamentos disponíveis em uma janela de 3 meses
- Bloqueio de Datas: Médicos podem bloquear dias específicos
- Status de Consulta: Controle completo do ciclo de vida dos agendamentos

👨‍💼 Painel Administrativo
- Métricas do Sistema: Dashboards com dados de usuários, agendamentos e emails
- Gestão de Médicos: Aprovação/rejeição de cadastros médicos
- Controle Total: Visão completa das operações da plataforma
  

### 🔌 API Endpoints - Principais Exemplos

> 📋 **Documentação Completa**: Em desenvolvimento com Postman Collection (disponível em breve)


### 🛠️ Stack Tecnológica
**Core**
- **Node.js** v20.14.0
- **TypeScript** v5.0.0
- **PostgreSQL** 15 (Banco principal)
- **Prisma ORM** (Modelagem e migrações)

**Filas e Cache**
- **Redis** (Cache e filas)
- **BullMQ** (Processamento de filas para emails)
- **IORedis** v5.6.1

**Observabilidade**
 - **Prometheus** (Coleta de métricas)
 - **Grafana** (Visualização e dashboards)
 - **Loki** (Agregação de logs)
 - **Pino** (Logging estruturado)

**Qualidade e Testes**
- **Jest** (Testes unitários)
- **ESLint** (Linting)
- **Prettier** (Formatação)
- **TDD** (Desenvolvimento orientado a testes)

### CI/CD e Automação
- **GitHub Actions** (Pipeline de CI/CD)
- **Automated Testing** (Jest em pipeline)
- **Code Quality** (ESLint + Prettier automático)

### 🏗️ Arquitetura
O projeto segue o padrão MVC com separação por módulos, inspirado na arquitetura do NestJS:

```js
src/
├── modules/
│   ├── admin/           # Gestão administrativa
│   ├── appointment/     # Agendamentos
│   ├── authentication/ # Autenticação/Autorização
│   ├── doctors/         # Gestão de médicos
│   ├── notifications/   # Sistema de notificações
│   └── patients/        # Gestão de pacientes
│
└── shared/             # Recursos compartilhados
    ├── middlewares/
    ├── errors/
    ├── utils/
    └── helpers/
```

Cada módulo contém sua própria estrutura:
- Controllers: Camada de apresentação
- Services: Lógica de negócio
- Repositories: Acesso a dados
- DTOs: Objetos de transferência
- Validators: Validação de entrada
- Routes: Definição de endpoints

### 📊 Métricas e Observabilidade
- `http_requests_total`: Total de requisições HTTP
- `appointments_total`: Total de agendamentos criados
- `emails_sent_total`: Total de emails enviados
- `logins_total`: Total de logins realizados
- `future_appointments`: Consultas agendadas
- `users_total`: Total de usuários por role

**Logs Estruturados**
- Logs de autenticação e autorização
- Rastreamento de agendamentos
- Status de notificações

<img width="1568" height="611" alt="Captura de tela 2025-07-20 075253" src="https://github.com/user-attachments/assets/f588222c-62df-40a7-b869-43e6edc05b07" />

<table>
  <tr>
    <td>
      <img width="400" src="https://github.com/user-attachments/assets/036b9490-fbd9-4861-b8ee-db0465c24702" />
    </td>
    <td>
      <img width="400" src="https://github.com/user-attachments/assets/c10d13a0-25b1-41ac-8439-a4b8bcbab569" />
    </td>
  </tr>
</table>

<img width="1567" height="603" alt="Captura de tela 2025-07-20 074843" src="https://github.com/user-attachments/assets/66cea3bf-b562-4e38-a5e3-682270416d95" />
<img width="1587" height="782" alt="Captura de tela 2025-07-20 074729" src="https://github.com/user-attachments/assets/d315f600-1ed0-4ebe-a128-e96a6a89f6e6" />



### 📧 Sistema de Notificações
A API implementa um sistema robusto de notificações por email usando filas:
Tipos de Email

- Confirmação de Agendamento: Enviado após criar consulta
- Cancelamento: Notificação de consulta cancelada
- Cadastro de Médico: Aviso sobre aprovação pendente
- Aprovação de Médico: Confirmação de cadastro aceito/recusado



<table>
  <tr>
    <td>
      <img width="718" height="252" alt="Captura de tela 2025-07-20 125640" src="https://github.com/user-attachments/assets/7ce3c46f-380f-4c8a-a54c-8af478b8b0ab" />
    </td>
    <td>
      <img width="869" height="329" alt="Captura de tela 2025-07-20 124930" src="https://github.com/user-attachments/assets/5af3214e-ce08-4700-92ea-d61530c1699b" />
    </td>
  </tr>
</table>

<table>
  <tr>
    <td>
      <img width="852" height="307" alt="Captura de tela 2025-07-20 134246" src="https://github.com/user-attachments/assets/2fa2df62-813e-41e2-89c3-0310fafe27ed" />
    </td>
    <td>
    <img width="850" height="397" alt="Captura de tela 2025-07-20 134609" src="https://github.com/user-attachments/assets/46d0d6d2-182d-4c17-9f05-c17cbf7968a5" />
    </td>
  </tr>
</table>


### Processamento com Filas
- **BullMQ + Redis**: Processamento assíncrono
- **Retry Logic**: Reenvio automático em caso de falha
- **Rate Limiting**: Controle de envio
- **Status Tracking**: Monitoramento de entregas

### 🗄️ Modelo de Dados

**Principais Entidades**

- **User**: Pacientes, médicos e administradores
- **Appointment**: Consultas médicas
- **BlockedDate**: Datas indisponíveis por médico
- **Notification**: Sistema de notificações

#### Estratégia de Datas

O sistema não armazena todas as datas disponíveis no banco. Em vez disso:

- Gera dinamicamente um range de 3 meses
- Filtra datas bloqueadas pelos médicos
- Remove horários já agendados
- Retorna apenas slots disponíveis


### 🚀 Configuração e Execução

#### Pré-requisitos

- Node.js v20.14.0+
- Docker e Docker Compose
- PostgreSQL 15+
- Redis 7+

### Instalação

**1. Clone o repositório** 

```bash
git clone https://github.com/NJesus144/healthup.git
cd healthup
```

**2. Instale as dependências**

```bash
npm install
```

**3. Configure as variáveis de ambiente**
```bash
.env.example .env
```

**4. Execute o comando Docker**
```bash
docker-compose up -d
```

**5.Execute as migrações**

```bash
npx prisma migrate deploy
npx prisma generate
```

**6. Inicie a aplicação**
```bash
npm run dev
```

### Variáveis de Ambiente Essenciais

```bash
# Database
DATABASE_URL="postgresql://healthup_user:healthup_password@localhost:5432/healthup_db"

# Redis
REDIS_URL="redis://localhost:6379"

# JWT
JWT_PRIVATE_KEY="your-super-secret-jwt-key"
JWT_SECRET=
JWT_ACCESS_TOKEN_EXPIRES_IN=
JWT_REFRESH_TOKEN_EXPIRES_IN=

# Email
SENDGRID_API_KEY="your-api-key"
FROM_EMAIL=""

# Server
PORT=3000

```
<br>

### 🧪 Testes

```bash
# Executar todos os testes
npm test

### Pipeline Automatizada
A cada push/PR, o GitHub Actions executa automaticamente:
- ✅ Testes unitários (Jest)
- ✅ Análise de código (ESLint)
- ✅ Formatação (Prettier)
- ✅ Build da aplicação
```

### 📈 Monitoramento

**Acessar Dashboards**

- **Grafana**: http://localhost:3001 (admin/admin123)
- **Prometheus**: http://localhost:9090
- **API Metrics**: http://localhost:3000/metrics

<br>

### 👨‍💻 Autor
Nalbert de Jesus

### 🔗 Links Úteis

- [Documentação do Prisma](https://www.prisma.io/docs)
- [BullMQ Documentation](https://docs.bullmq.io/)
- [Prometheus Metrics](https://prometheus.io/docs/concepts/metric_types/)
- [Grafana Dashboards](https://grafana.com/grafana/dashboards/)





