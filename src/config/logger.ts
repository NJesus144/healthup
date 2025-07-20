import pino from 'pino'

const isProduction = process.env.NODE_ENV === 'production'
const isDevelopment = process.env.NODE_ENV === 'development'

const logger = pino({
  level: isDevelopment ? 'debug' : 'info',
  transport: {
    targets: [
      ...(isDevelopment
        ? [
            {
              target: 'pino-pretty',
              level: 'debug',
              options: {
                colorize: true,
                translateTime: 'SYS:standard',
                ignore: 'pid,hostname',
              },
            },
          ]
        : []),
      {
        target: 'pino-loki',
        level: 'info',
        options: {
          batching: true,
          interval: 5,
          host: process.env.LOKI_URL || 'http://localhost:3100',
          labels: {
            application: 'healthup-api',
            environment: process.env.NODE_ENV || 'development',
          },
        },
      },
    ],
  },
})

export default logger
