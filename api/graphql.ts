import { schema } from 'nexus'
import fetch from 'node-fetch'
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

schema.mutationType({
  definition: t => {
    t.field('authenticate', {
      type: 'User',
      resolve: async (_, __, { token, db }) => {
        const { identity, auth0id, iss, raw } = await tokenToPayload(token)

        // await db.user.delete({ where: { auth0id }})
        const userFromDB = await db.user.findOne({ where: { auth0id }})
          .catch((error: any) => { console.log(error) })
        if(userFromDB) return userFromDB

        const response = await fetch(`${iss}userinfo`, { headers: { authorization: `Bearer ${raw}` }})
          .then(res => res.json())
        const newCreatedUser = await db.user.create({ data: {
          identity,
          auth0id,
          email: response.email,
          name: response.name,
          avatar: response.picture
        }})
          .catch(error => console.log(error))
        if(!newCreatedUser) throw new Error(`can't create user`)
        return newCreatedUser
      }
    })
  }
})