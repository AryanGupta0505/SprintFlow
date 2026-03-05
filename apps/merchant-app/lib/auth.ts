// import GoogleProvider from "next-auth/providers/google";
// import db from "@repo/db/client";

// export const authOptions = {
//     providers: [
//         GoogleProvider({
//             clientId: process.env.GOOGLE_CLIENT_ID || "",
//             clientSecret: process.env.GOOGLE_CLIENT_SECRET || ""
//         })
//     ],
//     callbacks: {
//       async signIn({ user, account }: {
//         user: {
//           email: string;
//           name: string
//         },
//         account: {
//           provider: "google" | "github"
//         }
//       }) {
//         console.log("hi signin")
//         if (!user || !user.email) {
//           return false;
//         }

//         await db.merchant.upsert({
//           select: {
//             id: true
//           },
//           where: {
//             email: user.email
//           },
//           create: {
//             email: user.email,
//             name: user.name,
//             auth_type: account.provider === "google" ? "Google" : "Github" // Use a prisma type here
//           },
//           update: {
//             name: user.name,
//             auth_type: account.provider === "google" ? "Google" : "Github" // Use a prisma type here
//           }
//         });

//         return true;
//       }
//     },
//     secret: process.env.NEXTAUTH_SECRET || "secret"
//   }

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

        const parsed = phoneSchema.safeParse(credentials);
        if (!parsed.success) {
          throw new Error(
            parsed.error?.errors[0]?.message || "Validation failed"
          );
        }

        const { phone, password, mode, name, email } = credentials;

        const existingUser = await db.user.findUnique({
          where: { number: phone }
        });

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

          if (!existingUser) {
            throw new Error("User not found");
          }

          // 🚫 Block deleted accounts
          if (existingUser.isDeleted) {
            throw new Error("Account has been deleted");
          }

          const isValid = await bcrypt.compare(
            password,
            existingUser.password
          );

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
