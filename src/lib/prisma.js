// Ruta del archivo: /lib/prisma.js

import { PrismaClient } from '@prisma/client';

// Esta configuración evita que se creen múltiples conexiones a la BD en desarrollo
const globalForPrisma = global;

const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;