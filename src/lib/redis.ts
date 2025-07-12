import Redis from 'ioredis'

const redisClient = new Redis(process.env.REDIS_URL as string, {
  maxRetriesPerRequest: null,
})

export default redisClient
