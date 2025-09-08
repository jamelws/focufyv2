import CreateFocusGroupClient from './CreateFocusGroupClient';
export const dynamic = "force-dynamic";

// Este componente de servidor ahora es muy simple.
// Su única responsabilidad es mostrar el componente de cliente.
export default function CreateFocusGroupPage() {
  return <CreateFocusGroupClient />;
}
