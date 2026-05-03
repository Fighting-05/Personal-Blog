const { createClient } = require('ioredis');

let redisClient = null;

async function initRedis() {
  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
  redisClient = createClient(redisUrl, {
    retryStrategy: (times) => {
      if (times > 3) return null;
      return Math.min(times * 100, 3000);
    }
  });

  redisClient.on('error', (err) => {
    console.warn('[Redis] Connection error:', err.message);
  });

  redisClient.on('connect', () => {
    console.log('[Redis] Connected successfully');
  });

  try {
    await redisClient.connect();
    return redisClient;
  } catch (err) {
    console.warn('[Redis] Failed to connect, cache disabled:', err.message);
    redisClient = null;
    return null;
  }
}

function getRedisClient() {
  return redisClient;
}

async function cacheGet(key) {
  if (!redisClient) return null;
  try {
    const data = await redisClient.get(key);
    return data ? JSON.parse(data) : null;
  } catch (err) {
    return null;
  }
}

async function cacheSet(key, value, ttl = 300) {
  if (!redisClient) return false;
  try {
    await redisClient.set(key, JSON.stringify(value), { EX: ttl });
    return true;
  } catch (err) {
    return false;
  }
}

async function cacheDel(key) {
  if (!redisClient) return false;
  try {
    await redisClient.del(key);
    return true;
  } catch (err) {
    return false;
  }
}

async function cacheDelPattern(pattern) {
  if (!redisClient) return false;
  try {
    let cursor = '0';
    const keysToDelete = [];
    do {
      const [newCursor, keys] = await redisClient.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
      cursor = newCursor;
      keysToDelete.push(...keys);
    } while (cursor !== '0');
    if (keysToDelete.length > 0) {
      await redisClient.del(...keysToDelete);
    }
    return true;
  } catch (err) {
    return false;
  }
}

module.exports = { initRedis, getRedisClient, cacheGet, cacheSet, cacheDel, cacheDelPattern };
