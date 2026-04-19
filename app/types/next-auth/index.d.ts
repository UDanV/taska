import type { AppRole, UserSpecialization } from "@/app/lib/auth/roles";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: AppRole;
      specialization?: UserSpecialization | null;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }

  interface User {
    id: string;
    role: AppRole;
    specialization?: UserSpecialization | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: AppRole;
    specialization?: UserSpecialization | null;
  }
}