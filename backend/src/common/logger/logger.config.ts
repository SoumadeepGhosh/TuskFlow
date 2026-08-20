/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import * as crypto from 'crypto';
import { Params } from 'nestjs-pino';

export const loggerConfig: Params = {
  pinoHttp: {
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',

    transport: {
      target: 'pino-elasticsearch',
      options: {
        node: 'http://localhost:9200',
        index: 'taskflow-logs',
      },
    },
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
      service: 'taskflow-backend',
      environment: process.env.NODE_ENV,
      ip: req.socket?.remoteAddress,
      userAgent: req.headers['user-agent'],
    }),
  },
};
