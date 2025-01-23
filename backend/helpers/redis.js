import { createClient } from 'redis';

let connection = null;
let currentUrl = null;

export const createConnection = async (url) => {
  if (!url) {
    throw new Error('Missing Redis Url');
  }

  currentUrl = url;

  try {
    connection = createClient({ url });

    connection.on('connect', () => console.log('-> Connected to Redis'));
    connection.on('error', (e) => console.log('redis error: ', e));

    await connection.connect();
  } catch (e) {
    console.log('Redis connection errror:', e);
    throw e;
  }
};

const ensureConnection = async () => {
  if (!connection || !connection.isOpen) {
    if (!currentUrl) {
      throw new Error('Redis connection not initialized');
    }
    await createConnection(currentUrl);
  }
};

export const set = async (key, value, ...args) => {
  await ensureConnection();
  return connection.set(key, value, ...args);
};

export const get = async (key) => {
  await ensureConnection();
  return connection.get(key);
};

export const getJSON = async (key) => {
  const value = await get(key);
  return value ? JSON.parse(value) : null;
}

export const setJSON = async (key, value, ttl = null) => {
  const stringValue = JSON.stringify(value);
  if (typeof ttl === 'number' && ttl > 0) {
    return set(key, stringValue, 'EX', ttl);
  }
  return set(key, stringValue);
}

export const del = async (key) => {
  await ensureConnection();
  return connection.del(key);
};

export const getConnection = () => {
  if (!connection) {
    throw new Error('Redis connection not initialized');
  }
  return connection;
};
