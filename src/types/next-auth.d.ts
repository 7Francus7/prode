import "next-auth";

declare module "next-auth" {
  interface User {
    isAdmin?: boolean;
    isPaid?: boolean;
  }
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      isAdmin?: boolean;
      isPaid?: boolean;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    isAdmin?: boolean;
    isPaid?: boolean;
  }
}
