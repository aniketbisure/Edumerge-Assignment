import Redis from 'ioredis';
import logger from '../utils/logger';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
const redis = new Redis(redisUrl);

redis.on('connect', () => {
  logger.info('Redis Connected');
});

redis.on('error', (err) => {
  logger.error('Redis Error:', err);
});

export default redis;
