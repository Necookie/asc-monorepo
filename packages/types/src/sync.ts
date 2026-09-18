export type SyncEventType =
  | 'GUILD_MEMBER_ADD'
  | 'GUILD_MEMBER_REMOVE'
  | 'GUILD_MEMBER_UPDATE'
  | 'USER_UPDATE'
  | 'RECONCILIATION';

export interface SyncPayload {
  externalUserId: string;
  username: string;
  displayName: string;
  nickname: string | null;
  avatar: string | null;
  roles: string[]; // external role IDs
  joinedAt?: Date;
}

export interface ReconciliationSummary {
  scannedCount: number;
  addedCount: number;
  updatedCount: number;
  leftCount: number;
  restoredCount: number;
  durationMs: number;
  timestamp: Date;
}
