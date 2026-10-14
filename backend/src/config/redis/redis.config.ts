import { registerAs } from '@nestjs/config';

export default registerAs('redis', () => {
  let host = process.env.REDIS_HOST || process.env.REDISHOST || 'localhost';
  let port = parseInt(
    process.env.REDIS_PORT || process.env.REDISPORT || '6379',
    10,
  );
  let password =
    process.env.REDIS_PASSWORD || process.env.REDISPASSWORD || undefined;

  // Support Railway Redis URLs: REDIS_URL or REDIS_PRIVATE_URL
  const redisUrl = process.env.REDIS_URL || process.env.REDIS_PRIVATE_URL;
  if (redisUrl) {
    try {
      const parsed = new URL(redisUrl);
      host = parsed.hostname;
      port = parseInt(parsed.port || '6379', 10);
      if (parsed.password) {
        password = decodeURIComponent(parsed.password);
      }
    } catch {
      // Fall back to host/port/password
    }
  }

  return {
    host,
    port,
    password,
  };
});
