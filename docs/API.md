# ASC — API & Server Actions Specification

## 1. Overview

ASC utilizes Next.js **Server Actions** for client mutations (form submissions, profile updates, settings changes) and **Route Handlers** (`app/api/*`) for webhooks, automated checks, and read endpoints.

---

## 2. Server Actions

### 2.1 `updateProfileBioAction`
- **Purpose**: Updates the authenticated member's biography and custom title.
- **Authentication**: Required (Clerk session cookie).
- **Authorization**: User must own the profile (`session.externalId === user.external_user_id`). Custom title requires `'profile.custom_title'` entitlement.
- **Input**:
  ```typescript
  {
    bio: string;
    customTitle?: string;
  }
  ```
- **Validation**:
  - `bio`: Optional string, max 500 characters, markdown/HTML stripped.
  - `customTitle`: Optional string, max 64 characters; verified against entitlement.
- **Output**:
  ```typescript
  { success: true, profile: Profile }
  ```
- **Errors**:
  - `401 Unauthorized`: Unauthenticated request.
  - `403 Forbidden`: Entitlement missing or attempting cross-profile mutation.
  - `422 Unprocessable Entity`: Bio or title exceeds character limit.

---

### 2.2 `updateProfileLinksAction`
- **Purpose**: Saves the list of verified outbound links for a member.
- **Authentication**: Required (Clerk session cookie).
- **Authorization**: Profile owner only. Maximum links governed by entitlement (default 5, supporter 10).
- **Input**:
  ```typescript
  {
    links: Array<{
      label: string;
      url: string;
      displayOrder: number;
    }>;
  }
  ```
- **Validation**:
  - `label`: String, 1-32 characters.
  - `url`: Valid HTTPS URL scheme (`^https:\/\/`). Rejects `javascript:`, `data:`, `file:`.
  - Max links count validation.
- **Output**:
  ```typescript
  { success: true, linksCount: number }
  ```
- **Errors**:
  - `400 Bad Request`: Insecure URL scheme or malformed URL.
  - `403 Forbidden`: Link limit exceeded.

---

### 2.3 `updateProfileAppearanceAction`
- **Purpose**: Updates curated profile appearance settings.
- **Authentication**: Required (Clerk session cookie).
- **Authorization**: Profile owner only. Background artwork requires the existing supporter/background rule; studio controls require supporter or staff status, or an active explicit `profile.studio` grant.
- **Input**:
  ```typescript
  {
    theme: 'canvas' | 'indigo' | 'onyx';
    accentColor: string;
    layout?: 'classic' | 'split';
    supporterLayout?: 'arcade' | 'showcase' | null;
    typography?: 'balanced' | 'bold' | 'playful';
    avatarFrame?: 'none' | 'pixel' | 'neon' | 'crest';
    coverTreatment?: 'solid' | 'artwork' | 'pattern';
    coverPosition?: number; // integer 0–100
    motion?: 'off' | 'subtle' | 'lively';
    backgroundUrl?: string | null;
  }
  ```
- **Validation**:
  - `theme`: One of approved theme enum values.
  - `accentColor`: Valid hex color matching `#([0-9a-fA-F]{3}){1,2}$`.
  - `backgroundUrl`: Optional valid HTTPS URL.
  - Every choice is an enumerated value; focal position is bounded. Premium fields cannot be submitted without active access. Standard edits preserve saved premium fields.
- **Output**:
  ```typescript
  { success: true }
  ```
- **Errors**:
  - `403 Forbidden`: Background URL provided without active supporter entitlement.

---

### 2.4 `updateProfilePrivacyAction`
- **Purpose**: Configures granular privacy visibility toggles.
- **Authentication**: Required (Clerk session cookie).
- **Authorization**: Profile owner only.
- **Input**:
  ```typescript
  {
    isPrivate: boolean;
    showRoles: boolean;
    showMembershipDate: boolean;
    showTags: boolean;
    showLinks: boolean;
  }
  ```
- **Validation**: All fields strictly boolean.
- **Output**:
  ```typescript
  { success: true, privacy: PrivacySettings }
  ```

---

### 2.5 `updateMemberTagsAction`
- **Purpose**: Selects member tags from approved community tags.
- **Authentication**: Required (Clerk session cookie).
- **Authorization**: Profile owner only. Maximum tags enforced (default: 5).
- **Input**:
  ```typescript
  {
    tagIds: string[];
  }
  ```
- **Validation**: Array of existing, active `tags.id` UUIDs. Max length <= allowed tags.
- **Output**:
  ```typescript
  { success: true }
  ```

---

## 3. Administrative Actions

### 3.1 `adminModerateProfileAction`
- **Purpose**: Hides an offensive profile or clears inappropriate bio/links/background.
- **Authentication**: Required.
- **Authorization**: Server-side admin check (`community_roles.is_admin === true`).
- **Input**:
  ```typescript
  {
    targetUserId: string;
    action: 'HIDE_PROFILE' | 'UNHIDE_PROFILE' | 'RESET_BIO' | 'RESET_BACKGROUND' | 'RESET_LINKS';
    reason: string;
  }
  ```
- **Validation**:
  - `targetUserId`: Valid user ID.
  - `action`: One of approved enum values.
  - `reason`: String, 5-255 characters.
- **Output**:
  ```typescript
  { success: true, actionId: string }
  ```
- **Side Effect**: Appends entry to `moderation_actions` and `audit_logs`.

---

### 3.2 `adminManageTagAction`
- **Purpose**: Creates, modifies, or deactivates community tags.
- **Authentication**: Required.
- **Authorization**: Administrator only.
- **Input**:
  ```typescript
  {
    tagId?: string;
    name: string;
    slug: string;
    description?: string;
    color: string;
    isActive: boolean;
  }
  ```
- **Validation**:
  - `name`: 2-30 characters.
  - `slug`: Alphanumeric slug (`^[a-z0-9-]+$`).
  - `color`: Hex color string.
- **Output**:
  ```typescript
  { success: true, tag: Tag }
  ```

---

## 4. Route Handlers (`app/api/*`)

### 4.1 `GET /api/health`
- **Purpose**: Liveness and readiness probe for Docker / monitoring.
- **Authentication**: None.
- **Output**:
  ```json
  {
    "status": "healthy",
    "timestamp": "2026-09-19T01:54:31Z",
    "version": "0.1.0",
    "database": "connected"
  }
  ```

### 4.2 `POST /api/webhooks/clerk`
- **Purpose**: Ingests Clerk user events (e.g. `user.created`, `user.deleted`) if configured.
- **Authentication**: Verified Svix webhook signature.
