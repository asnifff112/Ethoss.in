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
        await connectToDatabase();

        const user = await User.findOne({ email: credentials.email });

        if (!user) {
          console.log(`[NEXTAUTH] Error: User NOT FOUND in database for email: ${credentials.email}`);
          throw new Error("User not found");
        }
        
        if (!user.password) {
          console.log(`[NEXTAUTH] Error: User found, but no password hash exists for email: ${credentials.email}`);
          throw new Error("User not found");
        }

        console.log(`[NEXTAUTH] User FOUND in DB. Role: ${user.role}. Proceeding to password comparison...`);

        if (user.isBlocked) {
          console.log(`[NEXTAUTH] Error: Account is blocked for email: ${credentials.email}`);
          throw new Error("Your account has been suspended.");
        }

        const isPasswordMatch = await bcrypt.compare(
          credentials.password,
          user.password
        );

        console.log(`[NEXTAUTH] Bcrypt compare result: ${isPasswordMatch ? "MATCH (Success)" : "MISMATCH (Failure)"}`);

        if (!isPasswordMatch) {
          throw new Error("Invalid password");
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
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
