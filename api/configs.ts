export const AUTH0_CLIENT_ID = process.env.AUTH0_CLIENT_ID || ''
export const AUTH0_DOMAIN = process.env.AUTH0_DOMAIN || ''
export const jwksUri = `https://${AUTH0_DOMAIN}/.well-known/jwks.json`