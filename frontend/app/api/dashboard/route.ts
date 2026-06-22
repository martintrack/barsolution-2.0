import { getDashboardSnapshot } from "@/lib/supabase/repositories";

export async function GET() {
  const snapshot = await getDashboardSnapshot();

  return Response.json(snapshot);
}
