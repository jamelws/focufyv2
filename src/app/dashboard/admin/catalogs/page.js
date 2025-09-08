// ❌ NO pongas "use client" aquí
export const dynamic = "force-dynamic";
export const revalidate = 0;

import Link from "next/link";

export default function CatalogsPage() {
  return (
    <div>
      <section>
        <div className="container">
          <h1>Catálogos</h1>
          <div className="cards">
            <div className="card">
              <h3>Preguntas</h3>
              <p>Gestiona catálogo de preguntas.</p>
              <Link href="/admin/catalogs/questions" className="btn">
                Ver
              </Link>
            </div>
            <div className="card">
              <h3>Perfiles</h3>
              <p>Gestiona catálogo de perfiles.</p>
              <Link href="/admin/catalogs/profiles" className="btn">
                Ver
              </Link>
            </div>
            <div className="card">
              <h3>Usuarios</h3>
              <p>Gestiona catálogo de usuarios.</p>
              <Link href="/admin/catalogs/users" className="btn">
                Ver
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
