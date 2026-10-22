/**
 * SERVER-ONLY durable repository for homepage hero content.
 *
 * Import via `@mirage/db/server` from Server Components, Server Actions and
 * Route Handlers only. It must never be bundled into client code.
 *
 * Primary application database: MongoDB (collection: `site_content`, key: `homepage_hero`).
 * Fallbacks: shared file (local dev) or Supabase (historical migration reference).
 *
 * Process memory is never used as a source of truth for this content.
 */
import { promises as fs, existsSync } from 'node:fs';
import path from 'node:path';
import type { Db } from 'mongodb';
import {
  DEFAULT_HOMEPAGE_HERO_CONTENT,
  HomepageHeroContentSchema,
  HomepageHeroInputSchema,
  type HomepageHeroContent,
  type HomepageHeroInput,
} from '../homepage-content';
import { getMongoDb, isMongoConfigured, assertServerContext } from './mongodb';
import { MONGO_COLLECTIONS } from './mongo-models';
import { resolveHomepageHeroWithFallback } from './mongo-seed';

assertServerContext();

export const SITE_CONTENT_TABLE = 'site_content';
export const HOMEPAGE_HERO_KEY = 'homepage_hero';

export type HomepageStorageMode = 'mongodb' | 'file';

export type HomepageStorageResolution =
  | { ok: true; mode: 'mongodb'; label: string }
  | { ok: true; mode: 'file'; label: string; filePath: string }
  | { ok: false; mode: HomepageStorageMode; label: string; error: string; missingEnv: string[] };

export type ContentPersistenceErrorCode =
  | 'NOT_CONFIGURED'
  | 'VALIDATION_FAILED'
  | 'WRITE_FAILED'
  | 'READ_FAILED';

export class ContentPersistenceError extends Error {
  readonly code: ContentPersistenceErrorCode;
  readonly missingEnv: string[];
  constructor(code: ContentPersistenceErrorCode, message: string, missingEnv: string[] = []) {
    super(message);
    this.name = 'ContentPersistenceError';
    this.code = code;
    this.missingEnv = missingEnv;
  }
}

function env(name: string): string | undefined {
  const value = process.env[name];
  return value && value.trim().length > 0 ? value.trim() : undefined;
}

/** Walks up from cwd to the pnpm workspace root so both apps resolve the same file. */
export function findWorkspaceRoot(start: string = process.cwd()): string {
  let dir = path.resolve(start);
  for (;;) {
    if (existsSync(path.join(dir, 'pnpm-workspace.yaml'))) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) return path.resolve(start);
    dir = parent;
  }
}

export function getHomepageContentFilePath(): string {
  const override = env('MIRAGE_CONTENT_FILE');
  if (override) return path.resolve(override);
  return path.join(findWorkspaceRoot(), '.data', 'site-content', 'homepage-hero.json');
}

/**
 * Decides which durable backend to use. Never returns an in-memory option.
 *
 * MIRAGE_CONTENT_BACKEND = "mongodb" | "file" (optional override)
 */
export function resolveHomepageStorage(): HomepageStorageResolution {
  const forced = env('MIRAGE_CONTENT_BACKEND');
  const mongoLabel = 'MongoDB (site_content)';

  if (forced && forced !== 'mongodb' && forced !== 'file') {
    return {
      ok: false,
      mode: 'file',
      label: 'Invalid configuration',
      error: `MIRAGE_CONTENT_BACKEND must be "mongodb" or "file" (received "${forced}"). Supabase is not supported as an active runtime persistence backend.`,
      missingEnv: [],
    };
  }

  // 1. Check MongoDB (primary database)
  const wantsMongo = forced === 'mongodb' || (!forced && isMongoConfigured());
  if (wantsMongo) {
    if (!isMongoConfigured()) {
      return {
        ok: false,
        mode: 'mongodb',
        label: mongoLabel,
        error:
          'MongoDB storage is selected but MONGODB_URI is not configured in the server environment. Set MONGODB_URI in your server environment.',
        missingEnv: ['MONGODB_URI'],
      };
    }
    return { ok: true, mode: 'mongodb', label: mongoLabel };
  }

  // Serverless hosts have an ephemeral, per-instance filesystem: a file there is
  // neither durable nor shared, so refuse unless the operator explicitly forces it.
  if (!forced && env('VERCEL')) {
    return {
      ok: false,
      mode: 'mongodb',
      label: mongoLabel,
      error:
        'No durable shared storage is configured for this Vercel deployment. Set MONGODB_URI in your environment variables.',
      missingEnv: ['MONGODB_URI'],
    };
  }

  const filePath = getHomepageContentFilePath();
  return { ok: true, mode: 'file', label: `Shared local file (${filePath})`, filePath };
}

/** Public, secret-free description of the active storage (safe to render in the Admin UI). */
export function describeHomepageStorage(): {
  ok: boolean;
  mode: HomepageStorageMode;
  label: string;
  error?: string | undefined;
  missingEnv?: string[] | undefined;
} {
  const r = resolveHomepageStorage();
  if (!r.ok) return { ok: false, mode: r.mode, label: r.label, error: r.error, missingEnv: r.missingEnv };
  return { ok: true, mode: r.mode, label: r.label };
}

export interface LoadedHomepageHero {
  content: HomepageHeroContent;
  /** Where the content came from. "default" = nothing saved yet or database unavailable. */
  source: HomepageStorageMode | 'default';
  /** Set when the store could not be read and defaults were used instead. */
  warning?: string | undefined;
}

/**
 * Loads homepage hero content directly from a provided MongoDB database instance.
 * Merges partial overrides with static defaults so missing fields seamlessly retain baseline copy.
 */
export async function loadHomepageHeroContentFromDb(db: Db): Promise<LoadedHomepageHero> {
  try {
    const col = db.collection(MONGO_COLLECTIONS.SITE_CONTENT);
    const doc = await col.findOne({ key: HOMEPAGE_HERO_KEY });
    if (!doc || !doc.data) {
      return { content: DEFAULT_HOMEPAGE_HERO_CONTENT, source: 'default' };
    }

    const resolved = resolveHomepageHeroWithFallback(doc.data as Partial<HomepageHeroContent>);
    return {
      content: {
        ...resolved,
        updatedAt: doc.updatedAt ? new Date(doc.updatedAt).toISOString() : null,
        updatedBy: doc.updatedBy ? String(doc.updatedBy) : null,
      },
      source: 'mongodb',
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      content: DEFAULT_HOMEPAGE_HERO_CONTENT,
      source: 'default',
      warning: `MongoDB read failed (${message}); serving static defaults.`,
    };
  }
}

/**
 * Reads the current content. Missing records fall back to defaults; read
 * failures also fall back (so the public site keeps rendering) but are
 * reported through `warning` and logged.
 */
export async function loadHomepageHeroContent(customDb?: Db): Promise<LoadedHomepageHero> {
  const storage = resolveHomepageStorage();
  if (!storage.ok) {
    return { content: DEFAULT_HOMEPAGE_HERO_CONTENT, source: 'default', warning: storage.error };
  }

  try {
    if (storage.mode === 'mongodb') {
      try {
        const db = customDb ?? (await getMongoDb());
        return await loadHomepageHeroContentFromDb(db);
      } catch (mongoConnErr) {
        const message = mongoConnErr instanceof Error ? mongoConnErr.message : String(mongoConnErr);
        console.warn(`[homepage-content] MongoDB connection/read failed, falling back to static defaults: ${message}`);
        return {
          content: DEFAULT_HOMEPAGE_HERO_CONTENT,
          source: 'default',
          warning: `MongoDB unavailable (${message}); serving static defaults.`,
        };
      }
    }

    if (storage.mode === 'file') {
      let raw: string;
      try {
        raw = await fs.readFile(storage.filePath, 'utf8');
      } catch (err) {
        if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
          return { content: DEFAULT_HOMEPAGE_HERO_CONTENT, source: 'default' };
        }
        throw err;
      }
      const parsed = HomepageHeroContentSchema.safeParse(JSON.parse(raw));
      if (!parsed.success) {
        throw new Error(`Stored content in ${storage.filePath} failed validation.`);
      }
      return { content: parsed.data, source: 'file' };
    }

    return { content: DEFAULT_HOMEPAGE_HERO_CONTENT, source: 'default' };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[homepage-content] read failed, using defaults: ${message}`);
    return { content: DEFAULT_HOMEPAGE_HERO_CONTENT, source: 'default', warning: message };
  }
}

export async function getHomepageHeroContent(): Promise<HomepageHeroContent> {
  return (await loadHomepageHeroContent()).content;
}

/**
 * Saves homepage hero content directly into a provided MongoDB database instance.
 * Only succeeds if MongoDB acknowledges the write.
 */
export async function saveHomepageHeroContentToDb(
  db: Db,
  input: unknown,
  actorLabel: string
): Promise<{ content: HomepageHeroContent; mode: 'mongodb'; label: string }> {
  const parsed = HomepageHeroInputSchema.safeParse(input);
  if (!parsed.success) {
    throw new ContentPersistenceError(
      'VALIDATION_FAILED',
      parsed.error.issues.map((i) => i.message).join('; ')
    );
  }

  const values: HomepageHeroInput = parsed.data;
  const now = new Date();
  const record: HomepageHeroContent = {
    ...values,
    updatedAt: now.toISOString(),
    updatedBy: actorLabel,
  };

  try {
    const col = db.collection(MONGO_COLLECTIONS.SITE_CONTENT);
    const updateResult = await col.updateOne(
      { key: HOMEPAGE_HERO_KEY },
      {
        $set: {
          key: HOMEPAGE_HERO_KEY,
          data: values,
          updatedAt: now,
          updatedBy: actorLabel,
        },
      },
      { upsert: true }
    );

    if (!updateResult.acknowledged) {
      throw new ContentPersistenceError('WRITE_FAILED', 'MongoDB did not acknowledge write operation.');
    }

    return {
      content: record,
      mode: 'mongodb',
      label: 'MongoDB (collection: site_content, key: homepage_hero)',
    };
  } catch (err) {
    if (err instanceof ContentPersistenceError) throw err;
    const message = err instanceof Error ? err.message : String(err);
    throw new ContentPersistenceError('WRITE_FAILED', `MongoDB write failed: ${message}`);
  }
}

/**
 * Validates and durably persists the content. Resolves only after the backend
 * confirmed the write; otherwise throws `ContentPersistenceError`.
 */
export async function saveHomepageHeroContent(
  input: unknown,
  actorLabel: string,
  customDb?: Db
): Promise<{ content: HomepageHeroContent; mode: HomepageStorageMode; label: string }> {
  const parsed = HomepageHeroInputSchema.safeParse(input);
  if (!parsed.success) {
    throw new ContentPersistenceError(
      'VALIDATION_FAILED',
      parsed.error.issues.map((i) => i.message).join('; ')
    );
  }

  const storage = resolveHomepageStorage();
  if (!storage.ok) {
    throw new ContentPersistenceError('NOT_CONFIGURED', storage.error, storage.missingEnv);
  }

  const values: HomepageHeroInput = parsed.data;
  const record: HomepageHeroContent = {
    ...values,
    updatedAt: new Date().toISOString(),
    updatedBy: actorLabel,
  };

  if (storage.mode === 'mongodb') {
    try {
      const db = customDb ?? (await getMongoDb());
      return await saveHomepageHeroContentToDb(db, input, actorLabel);
    } catch (err) {
      if (err instanceof ContentPersistenceError) throw err;
      const message = err instanceof Error ? err.message : String(err);
      throw new ContentPersistenceError('WRITE_FAILED', `MongoDB write failed: ${message}`);
    }
  }

  if (storage.mode === 'file') {
    const tmp = `${storage.filePath}.${process.pid}.${Date.now()}.tmp`;
    try {
      await fs.mkdir(path.dirname(storage.filePath), { recursive: true });
      await fs.writeFile(tmp, JSON.stringify(record, null, 2), 'utf8');
      await fs.rename(tmp, storage.filePath); // atomic replace: readers never see partial JSON
    } catch (err) {
      await fs.rm(tmp, { force: true }).catch(() => undefined);
      const message = err instanceof Error ? err.message : String(err);
      throw new ContentPersistenceError('WRITE_FAILED', `Could not write ${storage.filePath}: ${message}`);
    }
    return { content: record, mode: 'file', label: storage.label };
  }

  throw new ContentPersistenceError('NOT_CONFIGURED', 'Unsupported storage backend mode.');
}
