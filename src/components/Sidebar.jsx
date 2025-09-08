"use client";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { usePerfil } from "@/context/PerfilContext";
import { useTranslation } from "react-i18next";
import { Toolbar } from "@mui/material";

export default function Sidebar() {
  const { data: session } = useSession();
  const { perfilActual } = usePerfil();
  const { t } = useTranslation();

  if (!session) return null;

  const generarMenu = () => {
    const items = [];

    if (perfilActual === "ADMIN") {
      items.push(
        <li key="catalogs"><Link href="/dashboard/admin/catalogs">{t("catalogs")}</Link></li>,
        <li key="licenses"><Link href="/dashboard/admin/licenses">{t("licenses")}</Link></li>
      );
    }

    if (perfilActual === "CREADOR") {
      items.push(
        <li key="my-songs"><Link href="/dashboard/artist/my-songs">{t("sets")}</Link></li>,
        <li key="focus-groups"><Link href="/dashboard/artist/focus-groups">{t("focusgroups")}</Link></li>,
        <li key="my-questions"><Link href="/dashboard/admin/catalogs/questions">{t("myquestions")}</Link></li>,
        <li key="report"><Link href="/dashboard/artist/report">{t("report")}</Link></li>
      );
    }

    if (perfilActual === "CURADOR") {
      items.push(
        <li key="my-music"><Link href="/dashboard/listener/my-music">{t("songs")}</Link></li>
      );
    }

    items.push(
      <li key="profile"><Link href="/dashboard/profile">{session?.user?.name || session?.user?.email}</Link></li>,
      <li key="logout">
        <button onClick={() => signOut({ callbackUrl: "/" })} className="text-red-600">
          {t("logout")}
        </button>
      </li>
    );

    return items;
  };

  return (
    <aside className="hidden md:block w-64 bg-gray-100 p-4">
      <Toolbar />
      <ul className="space-y-2">{generarMenu()}</ul>
    </aside>
  );
}
