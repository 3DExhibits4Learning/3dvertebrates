/**
 * @file src/app/api/auth/[...nextauth]/route.ts
 * 
 * @fileoverview NextAuth route handler
 */

// Typical imports
import { PrismaAdapter } from "@auth/prisma-adapter"
import { Adapter } from "next-auth/adapters"
import { SessionStrategy } from "next-auth"
import { routeHandlerErrorHandler, routeHandlerTypicalCatch } from "@/functions/server/error"
import { serverLog } from "@/functions/server/utils/utils"

// Default imports
import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import prisma from "@/functions/utils/prisma"

// ROUTE
const route = 'src/app/api/auth/[...nextauth]/route.ts'

// Auth options object
export const authOptions = {
  // debug: true,
  adapter: PrismaAdapter(prisma) as Adapter,
  session: { strategy: 'jwt' as SessionStrategy },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID as string,
      clientSecret: process.env.GOOGLE_SECRET as string,
      allowDangerousEmailAccountLinking: true,
    })
  ],
  callbacks: {
    
    // jwt callback, called whenever a new jwt is created
    // user is only available during sign-in

    async jwt({ token, user, account }: { token: any, user: any, account: any }) {

      if (user) {

        token.id = user.id
        token.provider = account.provider
        token.accessToken = account.access_token
        serverLog(`User ${user.email} signed in with provider ${account.provider}`)

        // If the user is in the database (has signed in before), and logged in with an oauth provider (not email), update their account data upon sign-in
        try {
          // Find user
          const userFromDatabase = await prisma.user.findUnique({ where: { id: user.id } }).catch(e => routeHandlerErrorHandler(route, e.message, 'prisma.user.findUnique', "Error finding user"))

          // Check if the user is in the database and if they did not use an email provider
          if (userFromDatabase && token.provider !== 'email') {

            // If so, update their account with the relevant new data
            await prisma.account.update({
              where: { provider_providerAccountId: { provider: account.provider, providerAccountId: account.providerAccountId } },
              data: {
                access_token: account.access_token,
                expires_at: account.expires_at,
                id_token: account.id_token,
                refresh_token: account.refresh_token,
                session_state: account.session_state,
                scope: account.scope,
              }
            }).catch(e => routeHandlerErrorHandler(route, e.message, 'prisma.account.update', "Couldn't update user account"))
          }
        }
        catch (e: any) { routeHandlerTypicalCatch(e.message) }
      }
      return token
    },

    // session callback
    session({ session, token }: { session: any, token: any }) {
      session.user.id = token.id
      session.accessToken = token.accessToken
      session.provider = token.provider
      return session
    }
  }
}

// Export handler as GET and POST
const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }