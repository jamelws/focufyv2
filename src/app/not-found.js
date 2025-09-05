export const dynamic = "force-dynamic"; // 👈 evita el build timeout

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-4xl font-bold">404</h1>
      <p className="text-gray-600">Página no encontrada</p>
    </div>
  );
}
