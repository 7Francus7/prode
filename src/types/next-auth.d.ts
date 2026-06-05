import "next-auth";

declare module "next-auth" {
  interface User {
    isAdmin?: boolean;
    isSuperAdmin?: boolean;
    isPaid?: boolean;
    isBlocked?: boolean;
  }
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      isAdmin?: boolean;
      isSuperAdmin?: boolean;
      isPaid?: boolean;
      isBlocked?: boolean;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    isAdmin?: boolean;
    isSuperAdmin?: boolean;
    isPaid?: boolean;
    isBlocked?: boolean;
  }
}
