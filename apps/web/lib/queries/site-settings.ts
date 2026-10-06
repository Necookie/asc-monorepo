import { eq } from 'drizzle-orm';
import { db, siteSettings, type ASCDatabase } from '@asc/db';

export async function getPublicAnnouncement(
  database: ASCDatabase = db
): Promise<string | null> {
  try {
    const record = await database.query.siteSettings.findFirst({
      where: eq(siteSettings.key, 'system_announcement'),
    });
    const content = record?.value?.trim();
    return content && content.length > 0 ? content : null;
  } catch {
    return null;
  }
}
