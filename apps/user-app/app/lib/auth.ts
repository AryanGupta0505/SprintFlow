
import NextAuth, { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { JWT } from "next-auth/jwt";
import bcrypt from "bcrypt";
import db from "@repo/db/client";
import { phoneSchema } from "@repo/validation";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Phone Number",
      credentials: {
        phone: { label: "Phone number", type: "text" },
        password: { label: "Password", type: "password" },
        name: { label: "Name", type: "text" },        // ✅ add
        email: { label: "Email", type: "text" },      // ✅ add
        mode: { label: "Mode", type: "text" }, // signup | signin
      },

      async authorize(credentials) {
        if (!credentials) {
          throw new Error("No credentials provided");
        }
        console.log("credentials:", credentials);
        const parsed = phoneSchema.safeParse({
  phone: credentials.phone,
  password: credentials.password,
  mode: credentials.mode,
  name: credentials.name,
  email: credentials.email
});
        if (!parsed.success) {
          throw new Error(
            parsed.error?.errors[0]?.message || "Validation failed"
          );
        }
        console.log("validation passed");
        const { phone, password, mode, name, email } = credentials;

        const existingUser = await db.user.findUnique({
          where: { number: phone }
        });
        console.log("after prisma",existingUser)
        /* ===================== SIGNUP ===================== */

        if (mode === "signup") {

          if (existingUser) {
            // 🚫 Prevent reusing deleted accounts
            if (existingUser.isDeleted) {
              throw new Error("Account previously deleted. Contact support.");
            }

            throw new Error("User already exists");
          }

          const hashedPassword = await bcrypt.hash(password, 10);

          const user = await db.user.create({
            data: {
              number: phone,
              password: hashedPassword,
              name: name || null,
              email: email || null
            }
          });

          return {
            id: user.id.toString(),
            name: user.name ?? null,
            phone: user.number,
            email: user.email
          } as any;
        }

        /* ===================== SIGNIN ===================== */

        if (mode === "signin") {
          console.log("Before existingUser:", existingUser);
          if (!existingUser) {
            throw new Error("User not found");
          }

          // 🚫 Block deleted accounts
          if (existingUser.isDeleted) {
            throw new Error("Account has been deleted");
          }
          console.log("After existingUser:", existingUser);
          const isValid = await bcrypt.compare(
            password,
            existingUser.password
          );
          console.log("checking password...",isValid);
          if (!isValid) {
            throw new Error("Invalid password");
          }

          return {
            id: existingUser.id.toString(),
            name: existingUser.name ?? null,
            phone: existingUser.number,
            email: existingUser.email ?? null
          } as any;
        }

        throw new Error("Invalid mode");
      }
    }),
  ],

  session: {
    strategy: "jwt",
  },
  callbacks: {
      // async jwt({ token }) {
      //   if (!token.sub) return token;

      //   const user = await db.user.findUnique({
      //     where: { id: Number(token.sub) },
      //     select: { isDeleted: true }
      //   });

      //   // 🚫 If user deleted → invalidate token
      //   if (!user || user.isDeleted) {
      //     return {};
      //   }

      //   return token;
      // },
      async jwt({ token, user }) {

        if (user) {
          token.phone = (user as any).phone;
        }

        if (!token.sub) return token;

        const dbUser = await db.user.findUnique({
          where: { id: Number(token.sub) },
          select: { isDeleted: true }
        });

        if (!dbUser || dbUser.isDeleted) {
          return {};
        }

        return token;
      },

      async session({ session, token }) {
        if (!token.sub) {
          return null as any; // forces logout
        }

        if (session.user) {
          session.user.id = token.sub as string;
          session.user.phone = (token as any).phone;
        }

        return session;
      }
    },

  secret: process.env.NEXTAUTH_SECRET || "secret",
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
