import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  getMongoConfig,
  isMongoConfigured,
  validateMongoConfig,
  maskMongoUri,
  closeMongoConnection,
  getMongoClientPromise,
  pingMongoConnection,
  assertServerContext,
  MongoConfigError,
  DEFAULT_MONGODB_DB_NAME,
} from '../src/server/mongodb';
import * as RootDbModule from '../src/index';
import * as ServerDbModule from '../src/server/index';

describe('PHASE 2: MongoDB Architecture & Server-Only Configuration', () => {
  const originalEnv = { ...process.env };

  beforeEach(async () => {
    await closeMongoConnection();
    delete process.env.MONGODB_URI;
    delete process.env.MONGODB_DB_NAME;
    delete process.env.MONGODB_MAX_POOL_SIZE;
    delete process.env.MONGODB_MIN_POOL_SIZE;
    delete process.env.MONGODB_CONNECT_TIMEOUT_MS;
    delete process.env.MONGODB_SERVER_SELECTION_TIMEOUT_MS;
  });

  afterEach(async () => {
    await closeMongoConnection();
    process.env = { ...originalEnv };
  });

  describe('Configuration Detection & Parsing', () => {
    it('reports not configured when MONGODB_URI is absent', () => {
      expect(isMongoConfigured()).toBe(false);
      const config = getMongoConfig();
      expect(config.isConfigured).toBe(false);
      expect(config.uri).toBeUndefined();
      expect(config.dbName).toBe(DEFAULT_MONGODB_DB_NAME);
    });

    it('validates missing MONGODB_URI and returns structured error with missingEnv', () => {
      const result = validateMongoConfig();
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.missingEnv).toContain('MONGODB_URI');
        expect(result.error).toMatch(/MONGODB_URI is not set/);
      }
    });

    it('rejects invalid connection protocols (e.g. postgres:// or http://)', () => {
      process.env.MONGODB_URI = 'http://localhost:27017';
      expect(isMongoConfigured()).toBe(false);

      const result = validateMongoConfig();
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toMatch(/must start with "mongodb:\/\/" or "mongodb\+srv:\/\/"/);
      }
    });

    it('accepts valid mongodb:// and mongodb+srv:// connection URIs', () => {
      process.env.MONGODB_URI = 'mongodb://127.0.0.1:27017';
      expect(isMongoConfigured()).toBe(true);

      const res1 = validateMongoConfig();
      expect(res1.ok).toBe(true);
      if (res1.ok) {
        expect(res1.config.uri).toBe('mongodb://127.0.0.1:27017');
        expect(res1.config.dbName).toBe('mirage_pharma');
      }

      process.env.MONGODB_URI = 'mongodb+srv://cluster0.example.net';
      expect(isMongoConfigured()).toBe(true);
      const res2 = validateMongoConfig();
      expect(res2.ok).toBe(true);
    });

    it('respects custom database names and pool options', () => {
      process.env.MONGODB_URI = 'mongodb://127.0.0.1:27017';
      process.env.MONGODB_DB_NAME = 'mirage_production_clinical';
      process.env.MONGODB_MAX_POOL_SIZE = '25';
      process.env.MONGODB_CONNECT_TIMEOUT_MS = '3000';

      const config = getMongoConfig();
      expect(config.dbName).toBe('mirage_production_clinical');
      expect(config.maxPoolSize).toBe(25);
      expect(config.connectTimeoutMS).toBe(3000);
    });
  });

  describe('URI Credential Masking & Security', () => {
    it('masks password credentials in standard mongodb:// URIs', () => {
      const rawUri = 'mongodb://app_service:SuperSecret123!@127.0.0.1:27017/mirage_pharma';
      const masked = maskMongoUri(rawUri);
      expect(masked).toBe('mongodb://app_service:***@127.0.0.1:27017/mirage_pharma');
      expect(masked).not.toContain('SuperSecret123!');
    });

    it('masks password credentials in mongodb+srv:// URIs', () => {
      const rawAtlas = 'mongodb+srv://atlasAdmin:ProdP%40ssw0rd@cluster0.abcde.mongodb.net/test';
      const masked = maskMongoUri(rawAtlas);
      expect(masked).toBe('mongodb+srv://atlasAdmin:***@cluster0.abcde.mongodb.net/test');
      expect(masked).not.toContain('ProdP%40ssw0rd');
    });

    it('handles null, undefined, or empty URIs gracefully', () => {
      expect(maskMongoUri(null)).toBe('<empty>');
      expect(maskMongoUri(undefined)).toBe('<empty>');
      expect(maskMongoUri('')).toBe('<empty>');
    });
  });

  describe('Server-Only Boundary Verification', () => {
    it('throws security error if invoked within a browser context', () => {
      expect(() => assertServerContext({ document: {} })).toThrow(
        /Security Violation: MongoDB client must only be imported in server-side contexts/
      );
    });

    it('does NOT expose MongoDB connection factories in the root @mirage/db bundle', () => {
      // Client components import from '@mirage/db'
      const rootKeys = Object.keys(RootDbModule);
      expect(rootKeys).not.toContain('getMongoClient');
      expect(rootKeys).not.toContain('getMongoDb');
      expect(rootKeys).not.toContain('MongoClient');
      expect(rootKeys).not.toContain('closeMongoConnection');
    });

    it('exposes MongoDB connection utilities exclusively in @mirage/db/server', () => {
      // Server-only entrypoint
      expect(typeof ServerDbModule.getMongoClient).toBe('function');
      expect(typeof ServerDbModule.getMongoDb).toBe('function');
      expect(typeof ServerDbModule.closeMongoConnection).toBe('function');
      expect(typeof ServerDbModule.isMongoConfigured).toBe('function');
    });
  });

  describe('Connection Lifecycle & Error Handling', () => {
    it('throws MongoConfigError when attempting connection without MONGODB_URI', async () => {
      delete process.env.MONGODB_URI;
      await expect(getMongoClientPromise()).rejects.toThrow(MongoConfigError);
      await expect(getMongoClientPromise()).rejects.toThrow(/MONGODB_URI is not set/);
    });

    it('pingMongoConnection returns ok:false with clear reason when unconfigured without crashing', async () => {
      delete process.env.MONGODB_URI;
      const ping = await pingMongoConnection(100);
      expect(ping.ok).toBe(false);
      expect(ping.error).toMatch(/MONGODB_URI is not set/);
    });
  });
});
