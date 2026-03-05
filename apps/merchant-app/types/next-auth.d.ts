import NextAuth from "next-auth";

declare module "next-auth" {
  interface User {
    phone?: string;
  }

  interface Session {
    user: {
      id: string;
      phone?: string;
      name?: string | null;
      email?: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    phone?: string;
  }
}