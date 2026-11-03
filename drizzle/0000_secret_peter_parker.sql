CREATE TABLE "invitations" (
	"selector" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"kind" text NOT NULL,
	"email" text NOT NULL,
	"token_hash" text NOT NULL,
	"workspace_id" uuid,
	"invited_by_user_id" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"accepted_at" timestamp with time zone,
	"accepted_by_user_id" text,
	"accepted_workspace_id" uuid,
	"replaced_by_selector" uuid,
	CONSTRAINT "invitation_kind_valid" CHECK ("invitations"."kind" in ('owner_onboarding','teammate')),
	CONSTRAINT "invitation_status_valid" CHECK ("invitations"."status" in ('pending','accepted','revoked','replaced')),
	CONSTRAINT "invitation_kind_workspace" CHECK (("invitations"."kind" = 'owner_onboarding' and "invitations"."workspace_id" is null) or ("invitations"."kind" = 'teammate' and "invitations"."workspace_id" is not null)),
	CONSTRAINT "invitation_email_canonical" CHECK ("invitations"."email" = lower(trim("invitations"."email")) and length("invitations"."email") between 3 and 254),
	CONSTRAINT "invitation_hash_sha256" CHECK ("invitations"."token_hash" ~ '^[a-f0-9]{64}$'),
	CONSTRAINT "invitation_expiry_72h" CHECK ("invitations"."expires_at" = "invitations"."created_at" + interval '72 hours'),
	CONSTRAINT "invitation_acceptance_consistent" CHECK (("invitations"."status" = 'accepted') = ("invitations"."accepted_at" is not null and "invitations"."accepted_by_user_id" is not null and "invitations"."accepted_workspace_id" is not null)),
	CONSTRAINT "invitation_replacement_consistent" CHECK (("invitations"."status" = 'replaced') = ("invitations"."replaced_by_selector" is not null))
);
--> statement-breakpoint
CREATE TABLE "memberships" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "membership_status_valid" CHECK ("memberships"."status" in ('active','revoked'))
);
--> statement-breakpoint
CREATE TABLE "workspaces" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"owner_user_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "workspace_name_nonempty" CHECK (length(trim("workspaces"."name")) between 1 and 100)
);
--> statement-breakpoint
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_accepted_workspace_id_workspaces_id_fk" FOREIGN KEY ("accepted_workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "invitation_pending_owner_email_unique" ON "invitations" USING btree ("email") WHERE "invitations"."status" = 'pending' and "invitations"."kind" = 'owner_onboarding';--> statement-breakpoint
CREATE UNIQUE INDEX "invitation_pending_teammate_unique" ON "invitations" USING btree ("workspace_id","email") WHERE "invitations"."status" = 'pending' and "invitations"."kind" = 'teammate';--> statement-breakpoint
CREATE UNIQUE INDEX "membership_workspace_user_unique" ON "memberships" USING btree ("workspace_id","user_id");--> statement-breakpoint
CREATE INDEX "membership_user_idx" ON "memberships" USING btree ("user_id");