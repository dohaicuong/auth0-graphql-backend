require('dotenv').config()

import { use, log, server } from 'nexus'
import * as cors from 'cors'
server.express.use(cors())

import { prisma } from 'nexus-plugin-prisma'
use(prisma())

import { auth } from 'nexus-plugin-jwt-auth'
import getUserFromToken from './libs/getUserFromToken'
import * as jwksClient from 'jwks-rsa'
import { jwksUri, AUTH0_DOMAIN, AUTH0_CLIENT_ID } from './configs'

const client = jwksClient({ jwksUri })
use(auth({
  // TODO remove app secret when they fix it
  appSecret: '',
  verify: async (req) => {
    const token = req.headers.authorization?.replace('Bearer ', '')
    if (!token) return null

    const auth0User: any = await getUserFromToken({ token, client, domain: AUTH0_DOMAIN, clientId: AUTH0_CLIENT_ID })
      .catch(error => log.error(error))

    return {
      raw: token,
      ...auth0User,
    }
  }
}))

import { shield, rule } from 'nexus-plugin-shield'
import { AuthenticationError } from 'apollo-server'
const isAuthenticated = rule({ cache: 'contextual' })(
  async (parent, args, ctx: NexusContext, info) => {
    const token = await ctx.token
    const isAuthenticated = Boolean(token)
    if(!isAuthenticated) return new AuthenticationError('You must be logged to do this')
    return isAuthenticated
  }
)
use(shield({
  rules: {
    // Query: {
    //   hello: isAuthenticated
    // },
    Mutation: {

    }
  },
  options: {
    // fallbackRule: deny
  }
}))