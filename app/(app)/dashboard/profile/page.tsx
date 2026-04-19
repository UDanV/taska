import { redirect } from "next/navigation";
import ProfileContent from "@/app/feature/profile/content";
import { requireAuthenticatedUser } from "@/app/lib/auth/guards";
import { prisma } from "@/app/lib/prisma";

export default async function DashboardProfilePage() {
  const currentUser = await requireAuthenticatedUser();

  const user = await prisma.user.findUnique({
    where: { id: currentUser.id },
    select: {
      name: true,
      email: true,
      image: true,
      password: true,
      specialization: true,
    },
  });

  if (!user) {
    redirect("/");
  }

  return (
    <ProfileContent
      user={{
        name: user.name,
        email: user.email,
        image: user.image,
        hasPassword: Boolean(user.password),
        role: currentUser.role,
        specialization: user.specialization,
      }}
    />
  );
}
