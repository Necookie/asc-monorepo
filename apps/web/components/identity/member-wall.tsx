import { MemberCard } from './member-card';

export interface WallMember {
  id: string;
  slug: string;
  avatar?: string | null;
  displayName: string;
  username: string;
  isSupporter?: boolean;
  primaryRole?: { id: string; name: string; color?: string | null };
  tags?: { id: string; name: string }[];
}

export function MemberWall({ members }: { members: WallMember[] }) {
  return (
    <div className="member-wall">
      {members.map((member, index) => (
        <div className="member-wall__slot" key={member.id}>
          <MemberCard
            slug={member.slug}
            avatar={member.avatar}
            displayName={member.displayName}
            username={member.username}
            isSupporter={member.isSupporter}
            primaryRole={member.primaryRole}
            tags={member.tags}
            featured={index === 0}
          />
        </div>
      ))}
    </div>
  );
}
