import { AuditLogRecord, AuditFramework } from '../schema';
import { memoryStore } from './memory-store';

function sha256(content: string): string {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const crypto = require('crypto');
    return crypto.createHash('sha256').update(content).digest('hex');
  } catch {
    // Fallback if running in pure browser environment
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0;
    }
    return Math.abs(hash).toString(16).padStart(64, '0');
  }
}

export interface RecordAuditParams {
  action: string;
  actorId: string;
  actorRole: string;
  entityType: string;
  entityId: string;
  beforePayload?: Record<string, any> | null;
  afterPayload?: Record<string, any> | null;
  framework?: AuditFramework;
}

export async function recordAuditLog(params: RecordAuditParams): Promise<AuditLogRecord> {
  const timestamp = new Date().toISOString();
  const eventId = `GXP-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
  const framework = params.framework || 'FDA_21_CFR_PART_11';

  let prevHash = '0000000000000000000000000000000000000000000000000000000000000000';
  const existingLogs = await getAuditLogs();
  if (existingLogs.length > 0 && existingLogs[0]) {
    prevHash = existingLogs[0].hash;
  }

  const payloadToHash = JSON.stringify({
    eventId,
    timestamp,
    framework,
    action: params.action,
    actorId: params.actorId,
    actorRole: params.actorRole,
    entityType: params.entityType,
    entityId: params.entityId,
    before: params.beforePayload,
    after: params.afterPayload,
    prevHash,
  });
  const hash = sha256(payloadToHash);

  const logRecord: AuditLogRecord = {
    id: `audit-${Date.now()}`,
    event_id: eventId,
    timestamp,
    framework,
    action: params.action,
    actor_id: params.actorId,
    actor_role: params.actorRole,
    entity_type: params.entityType,
    entity_id: params.entityId,
    before_payload: params.beforePayload || null,
    after_payload: params.afterPayload || null,
    hash,
    prev_hash: prevHash,
  };

  memoryStore.addAuditLog(logRecord);
  return logRecord;
}

export async function getAuditLogs(): Promise<AuditLogRecord[]> {
  return memoryStore.getAuditLogs();
}
