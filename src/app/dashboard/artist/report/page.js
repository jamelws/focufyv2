import ReportClient from './ReportClient';
export const dynamic = "force-dynamic";
export const revalidate = 0;
// Este componente de servidor se mantiene simple.
export default function ReportPage() {
  return <ReportClient />;
}
