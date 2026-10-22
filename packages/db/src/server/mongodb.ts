/**
 * SERVER-ONLY MongoDB connection management and lifecycle for Next.js App Router.
 *
 * This module MUST NEVER be imported by client components or client bundles.
 * It is exported strictly via `@mirage/db/server`.
 */

import { MongoClient, type MongoClientOptions, type Db } from 'mongodb';

// Strict runtime guard against accidental client bundling in production/browser environments
export function assertServerContext(mockWindow?: unknown): void {
  const hasWindow = mockWindow !== undefined || (typeof window !== 'undefined' && !(process.env.VITEST || process.env.NODE_ENV === 'test'));
  if (hasWindow) {
    throw new Error(
      '[@mirage/db/server] Security Violation: MongoDB client must only be imported in server-side contexts.'
    );
  }
}

// Execute guard check on module evaluation
assertServerContext();

export const DEFAULT_MONGODB_DB_NAME = 'mirage_pharma';
export const DEFAULT_MONGODB_TIMEOUT_MS = 5000;

export interface MongoConfig {
  uri: string | undefined;
  dbName: string;
  isConfigured: boolean;
  maxPoolSize?: number;
  minPoolSize?: number;
  connectTimeoutMS?: number;
  serverSelectionTimeoutMS?: number;
}

export interface ValidatedMongoConfig {
  uri: string;
  dbName: string;
  isConfigured: true;
  maxPoolSize: number;
  minPoolSize: number;
  connectTimeoutMS: number;
  serverSelectionTimeoutMS: number;
}

export type MongoValidationResult =
  | { ok: true; config: ValidatedMongoConfig }
  | { ok: false; error: string; missingEnv: string[] };

/**
 * Safely masks credentials in a MongoDB connection string for logs or diagnostics.
 * Never logs raw passwords or auth tokens.
 */
export function maskMongoUri(uri?: string | null): string {
  if (!uri) return '<empty>';
  try {
    // Greedily match user:password up to the last @ preceding host specification
    return uri.replace(/(mongodb(?:\+srv)?:\/\/[^:]+:)(.*)(@[^/@?]+)/, '$1***$3');
  } catch {
    return 'mongodb://***@masked';
  }
}

/**
 * Reads MongoDB configuration from environment variables.
 */
export function getMongoConfig(): MongoConfig {
  const uri = process.env.MONGODB_URI?.trim();
  const dbName = process.env.MONGODB_DB_NAME?.trim() || DEFAULT_MONGODB_DB_NAME;

  const maxPoolSize = process.env.MONGODB_MAX_POOL_SIZE
    ? parseInt(process.env.MONGODB_MAX_POOL_SIZE, 10)
    : 30;
  const minPoolSize = process.env.MONGODB_MIN_POOL_SIZE
    ? parseInt(process.env.MONGODB_MIN_POOL_SIZE, 10)
    : 1;
  const connectTimeoutMS = process.env.MONGODB_CONNECT_TIMEOUT_MS
    ? parseInt(process.env.MONGODB_CONNECT_TIMEOUT_MS, 10)
    : DEFAULT_MONGODB_TIMEOUT_MS;
  const serverSelectionTimeoutMS = process.env.MONGODB_SERVER_SELECTION_TIMEOUT_MS
    ? parseInt(process.env.MONGODB_SERVER_SELECTION_TIMEOUT_MS, 10)
    : DEFAULT_MONGODB_TIMEOUT_MS;

  const isConfigured = Boolean(
    uri &&
      (uri.startsWith('mongodb://') || uri.startsWith('mongodb+srv://'))
  );

  return {
    uri,
    dbName,
    isConfigured,
    maxPoolSize: isNaN(maxPoolSize) ? 10 : maxPoolSize,
    minPoolSize: isNaN(minPoolSize) ? 1 : minPoolSize,
    connectTimeoutMS: isNaN(connectTimeoutMS) ? DEFAULT_MONGODB_TIMEOUT_MS : connectTimeoutMS,
    serverSelectionTimeoutMS: isNaN(serverSelectionTimeoutMS) ? DEFAULT_MONGODB_TIMEOUT_MS : serverSelectionTimeoutMS,
  };
}

/**
 * Returns true if MONGODB_URI is provided with a valid protocol.
 */
export function isMongoConfigured(): boolean {
  return getMongoConfig().isConfigured;
}

/**
 * Validates configuration and returns either validated options or a clear error with missing env list.
 */
export function validateMongoConfig(): MongoValidationResult {
  const config = getMongoConfig();
  if (!config.uri) {
    return {
      ok: false,
      error: 'MONGODB_URI is not set. Please configure MONGODB_URI in your server environment.',
      missingEnv: ['MONGODB_URI'],
    };
  }

  if (!config.uri.startsWith('mongodb://') && !config.uri.startsWith('mongodb+srv://')) {
    return {
      ok: false,
      error: 'MONGODB_URI must start with "mongodb://" or "mongodb+srv://".',
      missingEnv: [],
    };
  }

  return {
    ok: true,
    config: {
      uri: config.uri,
      dbName: config.dbName,
      isConfigured: true,
      maxPoolSize: config.maxPoolSize ?? 10,
      minPoolSize: config.minPoolSize ?? 1,
      connectTimeoutMS: config.connectTimeoutMS ?? DEFAULT_MONGODB_TIMEOUT_MS,
      serverSelectionTimeoutMS: config.serverSelectionTimeoutMS ?? DEFAULT_MONGODB_TIMEOUT_MS,
    },
  };
}

export class MongoConfigError extends Error {
  readonly missingEnv: string[];
  constructor(message: string, missingEnv: string[] = []) {
    super(message);
    this.name = 'MongoConfigError';
    this.missingEnv = missingEnv;
  }
}

export class MongoConnectionError extends Error {
  constructor(message: string, public readonly originalError?: unknown) {
    super(message);
    this.name = 'MongoConnectionError';
  }
}

// Global cached client promise across HMR cycles in development
declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
  // eslint-disable-next-line no-var
  var _mongoClientInstance: MongoClient | undefined;
}

/**
 * Returns a cached MongoClient promise, safely maintaining singletons across Next.js HMR in dev.
 */
export async function getMongoClientPromise(): Promise<MongoClient> {
  const validation = validateMongoConfig();
  if (!validation.ok) {
    throw new MongoConfigError(validation.error, validation.missingEnv);
  }

  const { uri, maxPoolSize, minPoolSize, connectTimeoutMS, serverSelectionTimeoutMS } = validation.config;

  const options: MongoClientOptions = {
    maxPoolSize,
    minPoolSize,
    connectTimeoutMS,
    serverSelectionTimeoutMS,
  };

  if (process.env.NODE_ENV === 'development') {
    if (!globalThis._mongoClientPromise) {
      const client = new MongoClient(uri, options);
      globalThis._mongoClientInstance = client;
      globalThis._mongoClientPromise = client.connect();
    }
    return globalThis._mongoClientPromise;
  }

  // In production / test / CI environments
  if (!globalThis._mongoClientPromise) {
    const client = new MongoClient(uri, options);
    globalThis._mongoClientInstance = client;
    globalThis._mongoClientPromise = client.connect();
  }

  return globalThis._mongoClientPromise;
}

/**
 * Returns a connected MongoClient instance.
 */
export async function getMongoClient(): Promise<MongoClient> {
  try {
    return await getMongoClientPromise();
  } catch (err) {
    if (err instanceof MongoConfigError) {
      throw err;
    }
    const safeError = err instanceof Error ? err.message : String(err);
    throw new MongoConnectionError(
      `Failed to connect to MongoDB server: ${safeError}`,
      err
    );
  }
}

/**
 * Returns the target database instance.
 */
export async function getMongoDb(dbNameOverride?: string): Promise<Db> {
  const client = await getMongoClient();
  const config = getMongoConfig();
  const dbName = dbNameOverride || config.dbName || DEFAULT_MONGODB_DB_NAME;
  return client.db(dbName);
}

/**
 * Closes the active MongoDB connection and cleans up singleton promises.
 * Essential for test cleanup and graceful server shutdown.
 */
export async function closeMongoConnection(): Promise<void> {
  if (globalThis._mongoClientInstance) {
    try {
      await globalThis._mongoClientInstance.close();
    } catch {
      // Ignore cleanup error if already closed
    }
  }
  globalThis._mongoClientInstance = undefined;
  globalThis._mongoClientPromise = undefined;
}

/**
 * Pings the database to verify connectivity and measure latency.
 */
export async function pingMongoConnection(
  timeoutMs: number = DEFAULT_MONGODB_TIMEOUT_MS
): Promise<{ ok: boolean; latencyMs?: number; dbName?: string; error?: string }> {
  const start = Date.now();
  try {
    const validation = validateMongoConfig();
    if (!validation.ok) {
      return { ok: false, error: validation.error };
    }

    const client = await getMongoClient();
    const config = getMongoConfig();
    const db = client.db(config.dbName);

    // Run ping command with timeout
    await Promise.race([
      db.command({ ping: 1 }),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error(`Ping timed out after ${timeoutMs}ms`)), timeoutMs)
      ),
    ]);

    const latencyMs = Date.now() - start;
    return { ok: true, latencyMs, dbName: config.dbName };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { ok: false, error: message };
  }
}
