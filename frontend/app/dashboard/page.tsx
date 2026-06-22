import { DashboardPage } from "@/components/dashboard/DashboardPage";
import { getDashboardSnapshot } from "@/lib/supabase/repositories";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const snapshot = await getDashboardSnapshot();

  return <DashboardPage snapshot={snapshot} />;
}
