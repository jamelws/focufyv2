import LandingPage from "./LandingPage";

// 👇 Esto funciona porque page.js es un server component
export const dynamic = "force-dynamic";

export default function Page() {
  return <LandingPage />;
}