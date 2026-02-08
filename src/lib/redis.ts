import Redis, { RedisOptions } from 'ioredis';
import { env } from './env';
import { logger } from './logger';

/**
 * Redis client singleton
 */
class RedisClient {
  private static instance: Redis | null = null;
  private static isConnecting = false;

  static getInstance(): Redis | null {
    if (!env.REDIS_URL) {
      logger.warn('REDIS_URL not configured, Redis features will be disabled');
      return null;
    }

    if (this.instance) {
      return this.instance;
    }

    if (this.isConnecting) {
      logger.info('Redis connection already in progress');
      return null;
    }

    this.isConnecting = true;

    try {
      const options: RedisOptions = {
        maxRetriesPerRequest: 3,
        enableReadyCheck: true,
        retryStrategy: (times: number) => {
          const delay = Math.min(times * 50, 2000);
          logger.warn(`Redis connection retry attempt ${times}, waiting ${delay}ms`);
          return delay;
        },
      };

      this.instance = new Redis(env.REDIS_URL, options);

      this.instance.on('connect', () => {
        logger.info('Redis connected successfully');
      });

      this.instance.on('ready', () => {
        logger.info('Redis ready to accept commands');
        this.isConnecting = false;
      });

      this.instance.on('error', (error: Error) => {
        logger.error({ err: error }, 'Redis connection error');
      });

      this.instance.on('close', () => {
        logger.warn('Redis connection closed');
      });

      this.instance.on('reconnecting', () => {
        logger.info('Redis reconnecting...');
      });

      return this.instance;
    } catch (error) {
      logger.error({ err: error }, 'Failed to create Redis client');
      this.isConnecting = false;
      return null;
    }
  }

  static async disconnect(): Promise<void> {
    if (this.instance) {
      await this.instance.quit();
      this.instance = null;
      logger.info('Redis disconnected');
    }
  }
}

export const redis = RedisClient.getInstance();

// Graceful shutdown
if (env.NODE_ENV === 'production') {
  const shutdown = async () => {
    await RedisClient.disconnect();
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

export default redis;
