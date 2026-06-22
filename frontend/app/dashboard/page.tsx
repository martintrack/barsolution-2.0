import { DashboardPage } from "@/components/dashboard/DashboardPage";
import { getDashboardSnapshot } from "@/lib/supabase/repositories";

export default async function Dashboard() {
  const snapshot = await getDashboardSnapshot();

  return <DashboardPage snapshot={snapshot} />;
}
