/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Params } from 'nestjs-pino';

export const loggerConfig: Params = {
  pinoHttp: {
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',

    transport:
      process.env.NODE_ENV !== 'production'
        ? {
            target: 'pino-pretty',
            options: {
              colorize: true,
              singleLine: false,
              translateTime: 'SYS:standard',
              ignore: 'pid,hostname',
            },
          }
        : undefined,

    autoLogging: true,

    genReqId: (req) => {
      return req.headers['x-request-id']?.toString() ?? crypto.randomUUID();
    },

    redact: {
      paths: [
        'req.headers.authorization',
        'req.headers.cookie',
        'req.body.password',
        'req.body.confirmPassword',
        'req.body.refreshToken',
        'req.body.accessToken',
      ],
      censor: '[Redacted]',
    },

    customProps: (req: any) => ({
      ip: req.socket?.remoteAddress,
      userAgent: req.headers['user-agent'],
    }),
  },
};
