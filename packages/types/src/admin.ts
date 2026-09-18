export type ModerationActionType =
  | 'HIDE_PROFILE'
  | 'UNHIDE_PROFILE'
  | 'RESET_BIO'
  | 'RESET_BACKGROUND'
  | 'RESET_LINKS';

export interface ModerationAction {
  id: string;
  targetUserId: string;
  actorUserId: string;
  actionType: ModerationActionType;
  reason: string;
  metadata: string | null;
  createdAt: Date;
}

export interface AuditLog {
  id: string;
  actorId: string;
  action: string;
  targetType: string;
  targetId: string;
  metadata: string | null;
  createdAt: Date;
}

export interface SiteSetting {
  key: string;
  value: string;
  updatedAt: Date;
  updatedBy: string;
}
