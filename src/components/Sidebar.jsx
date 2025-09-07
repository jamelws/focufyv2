"use client";

import Image from "next/image";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { useSession, signOut } from "next-auth/react";
import { usePerfil } from "@/context/PerfilContext";

export default function Sidebar() {
  const { t } = useTranslation();
  const { data: session } = useSession();
  const { perfilActual } = usePerfil();

  if (!session) return <></>;

  const generarMenu = () => {
    const items = [];

    if (perfilActual === "ADMIN") {
      items.push(
        <li key="catalogs"><Link href="/admin/catalogs">Catálogos</Link></li>,
        <li key="licenses"><Link href="/admin/licenses">Licencias</Link></li>
      );
    }

    if (perfilActual === "CREADOR") {
      items.push(
        <li key="my-songs"><Link href="/artist/my-songs">{t("sets")}</Link></li>,
        <li key="focus-groups"><Link href="/artist/focus-groups">{t("focusgroups")}</Link></li>,
        <li key="my-questions"><Link href="/admin/catalogs/questions">{t("myquestions")}</Link></li>,
        <li key="report"><Link href="/artist/report">{t("report")}</Link></li>
      );
    }

    if (perfilActual === "CURADOR") {
      items.push(
        <li key="my-music"><Link href="/listener/my-music">{t("songs")}</Link></li>
      );
    }

    items.push(
      <li key="profile"><Link href="/profile">{session?.user?.name || session?.user?.email}</Link></li>,
      <li key="logout">
        <button onClick={() => signOut({ callbackUrl: "/" })} className="text-red-600">
          {t("logout")}
        </button>
      </li>
    );

    return items;
  };
  if(!session) return null;
  return (
    <aside className="w-64 bg-gray-100 p-4">
      <div style={{ height: 50, width: "100%" }}></div>
      <ul className="space-y-2">{generarMenu()}</ul>
    </aside>
  );
}
