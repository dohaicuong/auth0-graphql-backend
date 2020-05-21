
type Auth0Payload = {
  raw: string

  iss: string
  sub: string
  aud: string[]
  iat: number
  exp: number
  azp: string
  scope: string

  identity: string
  auth0id: string
}

const tokenToPayload = async (tokenPromise: any): Promise<Auth0Payload> => {
  const ctxToken = await tokenPromise
  const token = ctxToken as unknown
  const auth0Payload = token as Auth0Payload
  const [identity, auth0id] = auth0Payload.sub.split('|')
  
  return {
    ...auth0Payload,
    identity,
    auth0id
  }
}
export default tokenToPayload