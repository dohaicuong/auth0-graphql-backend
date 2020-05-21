import * as jwt from 'jsonwebtoken'
import { JwksClient } from 'jwks-rsa'

type Options = {
  token: string
  client: JwksClient
  domain: string
  clientId: string
}
const getUserFromToken = ({ token, client, domain, clientId }: Options) => {
  return new Promise((resolve, reject) => {
    jwt.verify(
      token,
      (header, cb) => {
        if(!header.kid) return cb('header got no kid')
        client.getSigningKey(header.kid, (err, key) => {
          const signingKey = key.getPublicKey()
          cb(null, signingKey)
        })
      }, 
      {
        audience: clientId,
        issuer: `https://${domain}/`,
        algorithms: ['RS256']
      }, 
      (err, decoded) => {
        if(err) reject(err)
        resolve(decoded)
      }
    )
  })
}
export default getUserFromToken