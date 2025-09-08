export const dynamic = "force-dynamic";

export default function TermsOfService() {
  return (
    <main className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">Términos y Condiciones</h1>
      <p className="mb-4">
        Estos Términos rigen el uso de la aplicación <strong>Focufy</strong>. 
        Al acceder o usar la aplicación, aceptas cumplir con ellos.
      </p>
      
      <h2 className="text-xl font-semibold mt-6 mb-2">Uso permitido</h2>
      <p className="mb-4">
        Puedes usar la aplicación únicamente para fines personales y no comerciales,
        cumpliendo siempre con las leyes aplicables.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">Servicios de terceros</h2>
      <p className="mb-4">
        La aplicación se integra con servicios de terceros como Google y Spotify.
        Al autenticarte con estos servicios, aceptas también sus políticas y condiciones.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">Limitación de responsabilidad</h2>
      <p className="mb-4">
        La aplicación se ofrece tal cual sin garantías de ningún tipo. 
        No nos hacemos responsables por daños derivados del uso de la aplicación.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">Modificaciones</h2>
      <p>
        Podemos actualizar estos Términos en cualquier momento. 
        El uso continuo de la aplicación tras cambios constituye aceptación de los mismos.
      </p>
    </main>
  );
}
