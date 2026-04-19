import UsersManagementPage from "@/app/feature/users-management";
import { requireRootUser } from "@/app/lib/auth/guards";

export default async function DashboardUsersPage() {
  await requireRootUser();

  return <UsersManagementPage />;
}