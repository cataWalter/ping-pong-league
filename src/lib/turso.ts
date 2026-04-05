import { createClient } from '@libsql/client'

const isProduction = process.env.NODE_ENV === 'production'

export const turso = isProduction 
  ? createClient({
      url: process.env.DATABASE_URL!,
      authToken: process.env.TURSO_AUTH_TOKEN!,
    })
  : createClient({
      url: 'file:./dev.db',
    })

export default turso