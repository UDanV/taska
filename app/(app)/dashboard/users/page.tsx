import UsersManagementPage from "@/app/feature/users-management";
import { requireRootOrManagerUser } from "@/app/lib/auth/guards";

export default async function DashboardUsersPage() {
  await requireRootOrManagerUser();

  return <UsersManagementPage />;
}