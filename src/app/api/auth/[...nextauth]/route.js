// Ruta del archivo: /app/api/auth/[...nextauth]/route.js

import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth"; // Ahora importa las opciones desde lib

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };