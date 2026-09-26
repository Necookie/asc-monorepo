import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { createDb } from '../client';

describe('Staff access migration', () => {
  it('preserves historical moderation hides and privacy, including same-second restores', async () => {
    const database = createDb(':memory:');
    const directory = path.resolve(__dirname, '../../drizzle');
    try {
      for (const file of ['0000_massive_magdalene.sql', '0001_tough_mach_iv.sql', '0002_polite_wong.sql']) {
        await database.$client.executeMultiple(fs.readFileSync(path.join(directory, file), 'utf8').replaceAll('--> statement-breakpoint', ''));
      }
      for (const id of ['hidden', 'restored']) {
        await database.$client.execute({ sql: 'INSERT INTO users (id, external_user_id, username, display_name, first_joined_at, last_synced_at, created_at, updated_at) VALUES (?, ?, ?, ?, 0, 0, 0, 0)', args: [id, id, id, id] });
        await database.$client.execute({ sql: 'INSERT INTO profiles (id, user_id, is_private, created_at, updated_at) VALUES (?, ?, 1, 0, 0)', args: [id, id] });
        await database.$client.execute({ sql: "INSERT INTO moderation_actions (id, target_user_id, actor_user_id, action_type, reason, created_at) VALUES (?, ?, ?, 'HIDE_PROFILE', 'Reported profile', 1)", args: [`hide-${id}`, id, id] });
      }
      await database.$client.execute("INSERT INTO moderation_actions (id, target_user_id, actor_user_id, action_type, reason, created_at) VALUES ('restore', 'restored', 'restored', 'UNHIDE_PROFILE', 'Appeal accepted', 1)");
      await database.$client.executeMultiple(fs.readFileSync(path.join(directory, '0003_minor_black_tom.sql'), 'utf8').replaceAll('--> statement-breakpoint', ''));
      const rows = await database.query.profiles.findMany();
      expect(rows.find(row => row.userId === 'hidden')).toMatchObject({ isModerated: true, isPrivate: true });
      expect(rows.find(row => row.userId === 'restored')).toMatchObject({ isModerated: false, isPrivate: true });
      expect(await database.query.staffAccess.findMany()).toHaveLength(0);
    } finally { database.$client.close(); }
  });
});
