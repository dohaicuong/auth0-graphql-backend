import { schema, log } from 'nexus'
import tokenToPayload from './libs/tokenToPayload'

schema.objectType({
  name: 'User',
  definition: t => {
    t.model.id()
    t.model.identity()
    t.model.auth0id()
    t.model.email()
    t.model.name()
    t.model.avatar()
  }
})

schema.queryType({
  definition: t => {
    t.string('hello', { resolve: () => 'world' })
    t.field('me', {
      type: 'User',
      resolve: async (_, __, { token, db }) => {
        const { auth0id } = await tokenToPayload(token)
        return db.user.findOne({ where: { auth0id }})
      }
    })
  }
})

type UserProfile = {
  sub: string
  given_name: string
  family_name: string
  nickname: string
  name: string
  picture: string
  locale: string
  updated_at: string
  email: string
  email_verified: boolean
};
schema.mutationType({
  definition: t => {
    t.field('authenticate', {
      type: 'User',
      resolve: async (_, __, { token, db }) => {
        const { identity, auth0id, iss, raw, auth0 } = await tokenToPayload(token)

        // await db.user.delete({ where: { auth0id }})
        const userFromDB = await db.user.findOne({ where: { auth0id }})
          .catch((error: any) => { log.error(error) })
        if(userFromDB) return userFromDB

        const userProfile = await new Promise<UserProfile>((resolve, reject) => {
          // @ts-ignore
          auth0.getProfile(raw, async (err, userInfo: UserProfile) => {
            if (err) reject(err)
            resolve(userInfo)
          })
        })

        const newCreatedUser = await db.user
          .create({
            data: {
              identity,
              auth0id,
              email: userProfile.email,
              name: userProfile.name,
              avatar: userProfile.picture
            }
          })
          .catch(error => log.error(error))

        if (!newCreatedUser) throw new Error(`can't create user`)
        return newCreatedUser
      }
    })
  }
})