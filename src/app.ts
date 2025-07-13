import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'
import { PrismaClient } from '@prisma/client'
import patientRoutes from '@/modules/patients/routes/patient.routes'
import doctorRoutes from '@/modules/doctors/routes/doctor.routes'
import appointmentRoutes from '@/modules/appointments/routes/appointment.routes'
import { errorHandler } from '@/shared/errors/errorHandler'
import authRoutes from '@/modules/authentication/routes/auth.routes'
import adminRoutes from '@/modules/admin/routes/adminRoutes'
import NotificationWorker from '@/workers/notificationWorker'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000
const prisma = new PrismaClient()
const notificationWorker = new NotificationWorker()

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

app.use('/auth', authRoutes)

app.use('/patients', patientRoutes)
app.use('/doctors', doctorRoutes)
app.use('/appointments', appointmentRoutes)
app.use('/admin', adminRoutes)

process.on('SIGTERM', async () => {
  await notificationWorker.close()
  process.exit(0)
})

app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`🏥 HealthUp API running on http://localhost:${PORT}`)
  console.log(`📊 Health check: http://localhost:${PORT}/health`)
})

export default app
