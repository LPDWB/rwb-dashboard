import { PrismaClient } from '../generated/prisma'

declare global {
  var prisma: PrismaClient | undefined
}

const prismaClientSingleton = () => {
  try {
    const client = new PrismaClient({
      log: ['error', 'warn'],
    })

    // Проверяем подключение к базе данных
    client.$connect()
      .then(() => console.log('Successfully connected to database'))
      .catch((error) => {
        console.error('Failed to connect to database:', error)
        throw error
      })

    return client
  } catch (error) {
    console.error('Failed to initialize PrismaClient:', error)
    throw error
  }
}

export const prisma = global.prisma ?? prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma
}

export default prisma 