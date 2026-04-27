import TeamsManagementPage from "@/app/feature/teams-management";
import { requireAuthenticatedUser } from "@/app/lib/auth/guards";

export default async function DashboardTeamsPage() {
  await requireAuthenticatedUser();

  return <TeamsManagementPage />;
}