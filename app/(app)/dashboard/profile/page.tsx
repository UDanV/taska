import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import ProfileContent from "@/app/feature/profile/content";
import { authOptions } from "@/app/lib/auth/options";
import { prisma } from "@/app/lib/prisma";

export default async function DashboardProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      name: true,
      email: true,
      image: true,
      password: true,
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
      }}
    />
  );
}
