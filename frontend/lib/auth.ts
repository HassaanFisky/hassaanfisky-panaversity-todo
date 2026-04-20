import { betterAuth } from "better-auth";
import { jwt } from "better-auth/plugins";
import { Pool } from "pg";

/**
 * Better Auth Server Configuration for Hackathon II.
 * baseURL ensures the server knows its primary address for redirects and token issuance.
 * trustedOrigins allows cross-domain communication within the Panaversity ecosystem.
 */
export const auth = betterAuth({
  database: new Pool({
    connectionString: process.env.DATABASE_URL!,
    ssl: { rejectUnauthorized: false },
  }),

  baseURL: process.env.VERCEL_URL 
    ? `https://${process.env.VERCEL_URL}` 
    : (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),


  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },

  session: {
    expiresIn: 60 * 60 * 24 * 7,        // 7 days
    updateAge: 60 * 60 * 24,             // refresh daily
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5,
    },
  },

  plugins: [
    jwt({
      jwt: {
        expirationTime: "7d",
        issuer: "hackathon-2-todo",
      },
    }),
  ],

  secret: process.env.BETTER_AUTH_SECRET!,

  trustedOrigins: [
    "http://localhost:3000",
    process.env.NEXT_PUBLIC_APP_URL!,
    "https://panaversity-h0-portfolio.vercel.app", 
    "https://physical-ai-humanoid-robots-textbook.vercel.app", 
    "https://hassaanfisky-panaversity-todo-app.vercel.app", 
    "https://hassaanfisky-learnflow-h3.vercel.app", 
    "https://hassaanfisky-aira-digital-fte.vercel.app"
  ],
});

export type Session = typeof auth.$Infer.Session;
export type User    = typeof auth.$Infer.Session.user;


