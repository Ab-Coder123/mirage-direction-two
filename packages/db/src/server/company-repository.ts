/**
 * SERVER-ONLY durable repository for company story & stats content (/our-story).
 *
 * Import via `@mirage/db/server` from Server Components, Server Actions and
 * Route Handlers only. It must never be bundled into client code.
 *
 * Primary application database: MongoDB (collection: `site_content`, key: `company_story`).
 * Fallbacks: shared file (local dev) or Supabase (historical migration reference).
 */
import { promises as fs } from 'node:fs';
import path from 'node:path';
import type { Db } from 'mongodb';
import {
  DEFAULT_COMPANY_STORY_CONTENT,
  CompanyStoryContentSchema,
  CompanyStoryInputSchema,
  type CompanyStoryContent,
  type CompanyStoryInput,
} from '../company-content';
import {
  findWorkspaceRoot,
  ContentPersistenceError,
} from './homepage-repository';
import { getMongoDb, isMongoConfigured, assertServerContext } from './mongodb';
import { MONGO_COLLECTIONS } from './mongo-models';
import { resolveCompanyStoryWithFallback } from './mongo-seed';

assertServerContext();

export const COMPANY_STORY_KEY = 'company_story';

export type CompanyStorageMode = 'mongodb' | 'file';

export type CompanyStorageResolution =
  | { ok: true; mode: 'mongodb'; label: string }
  | { ok: true; mode: 'file'; label: string; filePath: string }
  | { ok: false; mode: CompanyStorageMode; label: string; error: string; missingEnv: string[] };

function env(name: string): string | undefined {
  const value = process.env[name];
  return value && value.trim().length > 0 ? value.trim() : undefined;
}

export function getCompanyStoryFilePath(): string {
  const override = env('MIRAGE_COMPANY_CONTENT_FILE');
  if (override) return path.resolve(override);
  return path.join(findWorkspaceRoot(), '.data', 'site-content', 'company-story.json');
}

export function resolveCompanyStorage(): CompanyStorageResolution {
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

  const filePath = getCompanyStoryFilePath();
  return { ok: true, mode: 'file', label: `Shared local file (${filePath})`, filePath };
}

export function describeCompanyStorage(): {
  ok: boolean;
  mode: CompanyStorageMode;
  label: string;
  error?: string | undefined;
  missingEnv?: string[] | undefined;
} {
  const r = resolveCompanyStorage();
  if (!r.ok) return { ok: false, mode: r.mode, label: r.label, error: r.error, missingEnv: r.missingEnv };
  return { ok: true, mode: r.mode, label: r.label };
}

export interface LoadedCompanyStory {
  content: CompanyStoryContent;
  source: CompanyStorageMode | 'default';
  warning?: string | undefined;
}


/**
 * Loads company story content directly from a provided MongoDB database instance.
 */
export async function loadCompanyStoryContentFromDb(db: Db): Promise<LoadedCompanyStory> {
  try {
    const col = db.collection(MONGO_COLLECTIONS.SITE_CONTENT);
    const doc = await col.findOne({ key: COMPANY_STORY_KEY });
    if (!doc || !doc.data) {
      return { content: DEFAULT_COMPANY_STORY_CONTENT, source: 'default' };
    }

    const resolved = resolveCompanyStoryWithFallback(doc.data as Partial<CompanyStoryContent>);
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
      content: DEFAULT_COMPANY_STORY_CONTENT,
      source: 'default',
      warning: `MongoDB read failed (${message}); serving static defaults.`,
    };
  }
}

export async function loadCompanyStoryContent(customDb?: Db): Promise<LoadedCompanyStory> {
  const storage = resolveCompanyStorage();
  if (!storage.ok) {
    return { content: DEFAULT_COMPANY_STORY_CONTENT, source: 'default', warning: storage.error };
  }

  try {
    if (storage.mode === 'mongodb') {
      try {
        const db = customDb ?? (await getMongoDb());
        return await loadCompanyStoryContentFromDb(db);
      } catch (mongoConnErr) {
        const message = mongoConnErr instanceof Error ? mongoConnErr.message : String(mongoConnErr);
        console.warn(`[company-content] MongoDB connection/read failed, falling back to static defaults: ${message}`);
        return {
          content: DEFAULT_COMPANY_STORY_CONTENT,
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
          return { content: DEFAULT_COMPANY_STORY_CONTENT, source: 'default' };
        }
        throw err;
      }
      const parsed = CompanyStoryContentSchema.safeParse(JSON.parse(raw));
      if (!parsed.success) {
        throw new Error(`Stored content in ${storage.filePath} failed validation.`);
      }
      return { content: parsed.data, source: 'file' };
    }

    return { content: DEFAULT_COMPANY_STORY_CONTENT, source: 'default' };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[company-content] read failed, using defaults: ${message}`);
    return { content: DEFAULT_COMPANY_STORY_CONTENT, source: 'default', warning: message };
  }
}

export async function getCompanyStoryContent(): Promise<CompanyStoryContent> {
  return (await loadCompanyStoryContent()).content;
}

/**
 * Saves company story content directly into a provided MongoDB database instance.
 * Only succeeds if MongoDB acknowledges the write.
 */
export async function saveCompanyStoryContentToDb(
  db: Db,
  input: unknown,
  actorLabel: string
): Promise<{ content: CompanyStoryContent; mode: 'mongodb'; label: string }> {
  const parsed = CompanyStoryInputSchema.safeParse(input);
  if (!parsed.success) {
    throw new ContentPersistenceError(
      'VALIDATION_FAILED',
      parsed.error.issues.map((i) => i.message).join('; ')
    );
  }

  const values: CompanyStoryInput = parsed.data;
  const now = new Date();
  const record: CompanyStoryContent = {
    ...values,
    updatedAt: now.toISOString(),
    updatedBy: actorLabel,
  };

  try {
    const col = db.collection(MONGO_COLLECTIONS.SITE_CONTENT);
    const updateResult = await col.updateOne(
      { key: COMPANY_STORY_KEY },
      {
        $set: {
          key: COMPANY_STORY_KEY,
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
      label: 'MongoDB (collection: site_content, key: company_story)',
    };
  } catch (err) {
    if (err instanceof ContentPersistenceError) throw err;
    const message = err instanceof Error ? err.message : String(err);
    throw new ContentPersistenceError('WRITE_FAILED', `MongoDB write failed: ${message}`);
  }
}

export async function saveCompanyStoryContent(
  input: unknown,
  actorLabel: string,
  customDb?: Db
): Promise<{ content: CompanyStoryContent; mode: CompanyStorageMode; label: string }> {
  const parsed = CompanyStoryInputSchema.safeParse(input);
  if (!parsed.success) {
    throw new ContentPersistenceError(
      'VALIDATION_FAILED',
      parsed.error.issues.map((i) => i.message).join('; ')
    );
  }

  const storage = resolveCompanyStorage();
  if (!storage.ok) {
    throw new ContentPersistenceError('NOT_CONFIGURED', storage.error, storage.missingEnv);
  }

  if (storage.mode === 'mongodb') {
    const db = customDb ?? (await getMongoDb());
    return await saveCompanyStoryContentToDb(db, input, actorLabel);
  }

  const values: CompanyStoryInput = parsed.data;
  const payload: CompanyStoryContent = {
    ...values,
    updatedAt: new Date().toISOString(),
    updatedBy: actorLabel,
  };

  if (storage.mode === 'file') {
    try {
      await fs.mkdir(path.dirname(storage.filePath), { recursive: true });
      const tmpPath = `${storage.filePath}.${Date.now()}.tmp`;
      await fs.writeFile(tmpPath, JSON.stringify(payload, null, 2), 'utf8');
      await fs.rename(tmpPath, storage.filePath);
      return { content: payload, mode: 'file', label: storage.label };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      throw new ContentPersistenceError('WRITE_FAILED', `Writing ${storage.filePath} failed: ${msg}`);
    }
  }

  throw new ContentPersistenceError('NOT_CONFIGURED', 'Unsupported storage backend mode.');
}
