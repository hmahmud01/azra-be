import { createHash } from 'crypto';

export function hashToken(token) {
  return createHash('sha512').update(token).digest('hex');
}


// https://dev.to/mihaiandrei97/jwt-authentication-using-prisma-and-express-37nk