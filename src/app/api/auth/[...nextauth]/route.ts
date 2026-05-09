import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        console.log("[NEXTAUTH] Authorize function triggered.");
        if (!credentials?.email || !credentials?.password) {
          console.log("[NEXTAUTH] Error: Missing email or password in request.");
          throw new Error("Invalid credentials");
        }

        console.log(`[NEXTAUTH] Attempting login for email: ${credentials.email}`);
        
        try {
          await connectToDatabase();
        } catch (dbError: any) {
          console.error(`[NEXTAUTH] Database connection failed:`, dbError.message);
          throw new Error("Database connection failed. Please try again later.");
        }

        let user = await User.findOne({ email: credentials.email });

        // ─── ADMIN FALLBACK: Force-create/reset admin if exact match ───
        if (credentials.email === "ethoss.in@gmail.com" && credentials.password === "asnifnafila") {
          console.log("[NEXTAUTH] Admin fallback triggered for ethoss.in@gmail.com");
          const salt = await bcrypt.genSalt(10);
          const hashedPassword = await bcrypt.hash("asnifnafila", salt);

          if (user) {
            user.password = hashedPassword;
            user.role = "ADMIN";
            await user.save();
            console.log("[NEXTAUTH] Admin password re-hashed and role set to ADMIN.");
          } else {
            user = await User.create({
              name: "Ethoss Admin",
              email: "ethoss.in@gmail.com",
              password: hashedPassword,
              role: "ADMIN",
              isBlocked: false,
              wishlist: [],
            });
            console.log("[NEXTAUTH] Admin user created from scratch.");
          }

          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
          };
        }
        // ─── END ADMIN FALLBACK ───

        if (!user) {
          console.log(`[NEXTAUTH] Error: User NOT FOUND for email: ${credentials.email}`);
          throw new Error("Invalid email or password");
        }

        if (!user.password) {
          console.log(`[NEXTAUTH] Error: No password hash for email: ${credentials.email}`);
          throw new Error("Invalid email or password");
        }

        console.log(`[NEXTAUTH] User FOUND. Role: ${user.role}. Checking password...`);

        if (user.isBlocked) {
          console.log(`[NEXTAUTH] Error: Account blocked for: ${credentials.email}`);
          throw new Error("Your account has been suspended.");
        }

        const isPasswordMatch = await bcrypt.compare(
          credentials.password,
          user.password
        );

        console.log(`[NEXTAUTH] Bcrypt compare result: ${isPasswordMatch ? "MATCH" : "MISMATCH"}`);

        if (!isPasswordMatch) {
          throw new Error("Invalid email or password");
        }

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
  // trustHost allows NextAuth to work on Vercel without NEXTAUTH_URL
  trustHost: true,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
