# Website staff access

Website permissions are separate from Discord community roles. Only an active, verified ASC member whose Clerk account has private metadata `{"role":"owner"}` can manage staff access. Public metadata, unsafe metadata, Discord role names, and browser claims cannot appoint an owner.

## Set up your owner account later

1. In the Clerk dashboard, open **Users** and select your main account.
2. Add `"role": "owner"` to its **Private metadata**, preserving any other fields.
3. Sign in with the verified Discord account that belongs to an active ASC member. Reload the dashboard.
4. Open **Staff permissions** at `/dashboard/permissions`. Search by name or exact Discord ID, select a member, choose Admin or Moderator, and enter a reason.

No account was assigned owner access during implementation. Until you set the flag, the owner page remains inaccessible. Owners can only be appointed or removed in Clerk; the website never writes owner metadata.

## Permission levels

| Capability | Owner | Admin | Moderator | Member |
| --- | --- | --- | --- | --- |
| Edit own profile | Yes | Yes | Yes | Yes |
| Hide/restore member profiles | Yes | Yes | Yes | No |
| Reset profile content | Yes | Yes | No | No |
| Inspect members, manage tags/settings, read audit history | Yes | Yes | No | No |
| Grant/revoke website customization perks | Yes | Yes | No | No |
| Grant/revoke Admin or Moderator access | Yes | No | No | No |
| Appoint owners through website | No | No | No | No |

The admin panel is at `/admin`. Moderators are directed to `/admin/profiles`; Admin and Owner accounts see the broader tools. UI links reflect access, and each route, query, and mutation independently enforces it on the server.

## Grants and revocation

Staff assignments are stored against the canonical ASC user in `staff_access`, with the granting owner and timestamp. Grants require active membership. Leaving or being banned suspends access without deleting the profile or grant; rejoining restores an existing grant. Owners may revoke a former member's dormant grant. Changes take effect on the next server request; each request reads current membership and grants.

Only the owner can change staff access. The current owner's row is protected. An Admin or Moderator cannot promote themselves, modify another staff assignment, or write an OWNER role to the database. Saving checks the previous role to avoid overwriting another owner's intervening edit. Changes and their audit records commit together or roll back together.

## Customization perks

At `/admin/perks`, Admins and Owners can grant a curated studio bundle: background artwork, custom title, advanced studio choices, and up to ten links and tags. Grants use the `WEBSITE_ADMIN` source. Revoking them does not remove Discord-earned perks or saved styling. Website grants are suspended for inactive membership. Discord booster/staff cosmetic rules continue independently of website administrative access.

## Moderation and migration

Moderation uses server-owned `profiles.is_moderated`. A member changing their own privacy settings cannot undo a hide. Hidden profiles are excluded from public profile responses, directory results, and homepage member lists. Restoring a profile preserves its member-selected privacy setting.

Apply migration `0003_minor_black_tom.sql` before running this version. It creates the staff table and moderation flag, then backfills the flag from the latest historical hide/restore action, using row order to break timestamp ties. Existing privacy choices are retained. Legacy profiles previously hidden using privacy may remain private after restoration until their member chooses to make them public.

Audit history is a database log, not a cryptographically tamper-evident ledger. Owner metadata changes made directly in Clerk are outside ASC's website audit history.

## Verification limits

Automated tests cover permission boundaries, forbidden promotions, departed membership, stale edits, audit rollback, moderation privacy, and perk preservation. The owner's live grant workflow remains to be exercised after the owner flag is configured. Submitted member searches return up to 100 matches; complete pagination and fine-grained custom permissions are future work.

## Local verification on 26 September 2026

- Full suite: 192 passing tests in 23 files; workspace type checks and clean web production build pass. The build retains an existing font metrics warning for Atkinson Hyperlegible Next.
- Lint command completes, but scripts remain placeholders.
- Migration applied to an isolated seeded database and the configured ASC database. No owner metadata or live staff grants changed.
- Browser review used the real client forms with fictional members and mocked actions in an isolated preview. Grant/revoke feedback, protected owner row, inactive grant restrictions, and desktop/mobile layout passed. At a 375px viewport the content had no horizontal overflow.
- Integration tests separately exercised real database transactions and authorization. The live Clerk owner grant flow awaits your owner flag.
