import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'
import { PrismaClient } from '@prisma/client'
import patientRoutes from '../src/modules/patients/routes/patient.routes'
import { errorHandler } from '@/shared/errors/errorHandler'
import authenticationRoutes from '@/modules/authentication/routes/authentication.route'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000
const prisma = new PrismaClient()

app.use(helmet())
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use((req, res, next) => {
  ;(req as any).prisma = prisma
  next()
})

app.get('/', (req, res) => {
  res.json({
    message: 'H0.ealth API está funcionando!',
    version: '1.0.0',
    time: new Date().toISOString(),
  })
})

app.use('/authentication', authenticationRoutes)
app.use('/patients', patientRoutes)

app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`🏥 HealthUp API running on http://localhost:${PORT}`)
  console.log(`📊 Health check: http://localhost:${PORT}/health`)
})

export default app
