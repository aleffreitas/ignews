import NextAuth from "next-auth"
import GithubProvider from "next-auth/providers/github"
import { signIn } from 'next-auth/react'

import { query as q} from 'faunadb';
import { fauna } from '../../../services/fauna';


export default NextAuth({

  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
      //@ts-ignore  
      scope: 'read:user'    
    }),
  ],

  
  callbacks: {
    
    session({ session, token, user }) {
      return session // The return type will match the one returned in `useSession()`
    },

    async signIn({ user, account, profile, email, credentials }) {
      
      try{
        fauna.query(
          q.If(
            q.Not(
              q.Exists(
                q.Match(
                  q.Index('user_by_email'),
                  q.Casefold(user.email)
                )
              )
            ),
            q.Create(
              q.Collection('users'),
              {data: { email}}
            ),
            q.Get(
              q.Match(
                q.Index('user_by_email'),
                q.Casefold(user.email)
              )
            )
          )
        )
        return true
      } catch {
        // Return false to display a default error message
        return false
        // Or you can return a URL to redirect to:
        // return '/unauthorized'
      }
    }    
  },  

})
