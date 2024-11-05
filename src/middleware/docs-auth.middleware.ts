// middleware/docs-auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { docsConfig } from '../config';

export const docsAuthMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (process.env.NODE_ENV === 'production') {
    const auth = { login: docsConfig.username, password: docsConfig.password };
    const b64auth = (req.headers.authorization || '').split(' ')[1] || '';
    const [login, password] = Buffer.from(b64auth, 'base64').toString().split(':');

    if (login && password && login === auth.login && password === auth.password) {
      return next();
    }

    res.set('WWW-Authenticate', 'Basic realm="API Documentation"');
    res.status(401).send('Authentication required for API documentation');
    return;
  }
  next();
};