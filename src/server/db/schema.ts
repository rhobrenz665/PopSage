import { sql } from "drizzle-orm";
import { check, index, pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";

const time = (name: string) => timestamp(name, { withTimezone: true, mode: "date" });
// Provider identity IDs are opaque strings. neon_auth remains provider-owned.
export const workspaces = pgTable("workspaces", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  ownerUserId: text("owner_user_id").notNull(),
  createdAt: time("created_at").defaultNow().notNull(),
}, (t) => [check("workspace_name_nonempty", sql`length(trim(${t.name})) between 1 and 100`)]);

export const memberships = pgTable("memberships", {
  id: uuid("id").defaultRandom().primaryKey(),
  workspaceId: uuid("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull(),
  status: text("status", { enum: ["active", "revoked"] }).default("active").notNull(),
  createdAt: time("created_at").defaultNow().notNull(),
  updatedAt: time("updated_at").defaultNow().notNull(),
}, (t) => [
  uniqueIndex("membership_workspace_user_unique").on(t.workspaceId, t.userId),
  index("membership_user_idx").on(t.userId),
  check("membership_status_valid", sql`${t.status} in ('active','revoked')`),
]);

export const invitations = pgTable("invitations", {
  selector: uuid("selector").primaryKey().defaultRandom(),
  kind: text("kind", { enum: ["owner_onboarding", "teammate"] }).notNull(),
  email: text("email").notNull(),
  tokenHash: text("token_hash").notNull(),
  workspaceId: uuid("workspace_id").references(() => workspaces.id, { onDelete: "cascade" }),
  invitedByUserId: text("invited_by_user_id"),
  status: text("status", { enum: ["pending", "accepted", "revoked", "replaced"] }).default("pending").notNull(),
  expiresAt: time("expires_at").notNull(),
  createdAt: time("created_at").defaultNow().notNull(),
  acceptedAt: time("accepted_at"),
  acceptedByUserId: text("accepted_by_user_id"),
  acceptedWorkspaceId: uuid("accepted_workspace_id").references(() => workspaces.id),
  replacedBySelector: uuid("replaced_by_selector"),
}, (t) => [
  uniqueIndex("invitation_pending_owner_email_unique").on(t.email).where(sql`${t.status} = 'pending' and ${t.kind} = 'owner_onboarding'`),
  uniqueIndex("invitation_pending_teammate_unique").on(t.workspaceId, t.email).where(sql`${t.status} = 'pending' and ${t.kind} = 'teammate'`),
  check("invitation_kind_valid", sql`${t.kind} in ('owner_onboarding','teammate')`),
  check("invitation_status_valid", sql`${t.status} in ('pending','accepted','revoked','replaced')`),
  check("invitation_kind_workspace", sql`(${t.kind} = 'owner_onboarding' and ${t.workspaceId} is null) or (${t.kind} = 'teammate' and ${t.workspaceId} is not null)`),
  check("invitation_email_canonical", sql`${t.email} = lower(trim(${t.email})) and length(${t.email}) between 3 and 254`),
  check("invitation_hash_sha256", sql`${t.tokenHash} ~ '^[a-f0-9]{64}$'`),
  check("invitation_expiry_72h", sql`${t.expiresAt} = ${t.createdAt} + interval '72 hours'`),
  check("invitation_acceptance_consistent", sql`(${t.status} = 'accepted') = (${t.acceptedAt} is not null and ${t.acceptedByUserId} is not null and ${t.acceptedWorkspaceId} is not null)`),
  check("invitation_replacement_consistent", sql`(${t.status} = 'replaced') = (${t.replacedBySelector} is not null)`),
]);
