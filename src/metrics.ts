import promClient from 'prom-client'

export const httpRequestsTotal = new promClient.Counter({
  name: 'http_requests_total',
  help: 'Total HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
})

export const appointmentsTotal = new promClient.Counter({
  name: 'appointments_total',
  help: 'Total appointments created',
  labelNames: ['status'],
})

export const emailsSent = new promClient.Counter({
  name: 'emails_sent_total',
  help: 'Total emails sent',
})

export const loginsTotal = new promClient.Counter({
  name: 'logins_total',
  help: 'Total de logins realizados',
  labelNames: ['role'],
})

export const futureAppointmentsGauge = new promClient.Gauge({
  name: 'future_appointments',
  help: 'Número de consultas agendadas',
  labelNames: ['date'],
})

export const usersTotal = new promClient.Gauge({
  name: 'users_total',
  help: 'Total de usuários registrados',
  labelNames: ['role'],
})

export const register = promClient.register
