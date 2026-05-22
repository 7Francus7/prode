import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";

function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const email = normalizeEmail(credentials.email as string);

        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user || !user.password) return null;

        const valid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );
        if (!valid) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          isAdmin: user.isAdmin,
          isPaid: user.isPaid,
        };
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.isAdmin = user.isAdmin;
        token.isPaid = user.isPaid;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id as string;

      // Always fetch fresh isPaid/isAdmin from DB so changes by admin take effect immediately
      if (token.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { isPaid: true, isAdmin: true },
        });
        session.user.isPaid = dbUser?.isPaid ?? false;
        session.user.isAdmin = dbUser?.isAdmin ?? false;
      } else {
        session.user.isPaid = (token.isPaid as boolean) ?? false;
        session.user.isAdmin = (token.isAdmin as boolean) ?? false;
      }

      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
});
