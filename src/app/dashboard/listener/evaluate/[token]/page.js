// ✅ app/listener/evaluate/[token]/page.js
"use client";

import { useEffect, useState } from "react";
import EvaluateClient from "@/components/EvaluateClient";


export default function EvaluatePage({ params }) {
const [data, setData] = useState(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);


useEffect(() => {
async function fetchData() {
try {
// ⚡ en Next 15 params es una promesa
const { token } = await params;
const res = await fetch(`/api/listener/evaluate/${token}`);
if (!res.ok) throw new Error("Error al cargar datos");
const json = await res.json();
setData(json);
} catch (err) {
setError(err.message);
} finally {
setLoading(false);
}
}
fetchData();
}, [params]);


if (loading) return <div>Cargando...</div>;
if (error) return <div>Error: {error}</div>;
if (!data) return <div>No hay datos</div>;


return <EvaluateClient data={data}  />;
}