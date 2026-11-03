-- Application-owned authorization. Managed Auth remains provider-owned in neon_auth.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'popsage_app') THEN
    CREATE ROLE popsage_app NOLOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOBYPASSRLS;
  END IF;
END
$$;

ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspaces FORCE ROW LEVEL SECURITY;
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE memberships FORCE ROW LEVEL SECURITY;
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitations FORCE ROW LEVEL SECURITY;

CREATE POLICY workspaces_select ON workspaces
  FOR SELECT USING (
    owner_user_id = current_setting('app.user_id', true)
    OR EXISTS (
      SELECT 1 FROM memberships m
      WHERE m.workspace_id = workspaces.id
        AND m.user_id = current_setting('app.user_id', true)
        AND m.status = 'active'
    )
  );

CREATE POLICY workspaces_insert ON workspaces
  FOR INSERT WITH CHECK (
    owner_user_id = current_setting('app.user_id', true)
    AND EXISTS (
      SELECT 1 FROM invitations i
      WHERE i.selector::text = current_setting('app.invitation_selector', true)
        AND i.token_hash = current_setting('app.invitation_hash', true)
        AND i.email = current_setting('app.email', true)
        AND i.kind = 'owner_onboarding'
        AND i.status = 'pending'
        AND i.expires_at > now()
    )
  );

CREATE POLICY workspaces_owner_mutation ON workspaces
  FOR UPDATE USING (
    owner_user_id = current_setting('app.user_id', true)
    AND current_setting('app.is_owner', true) = 'true'
  ) WITH CHECK (
    owner_user_id = current_setting('app.user_id', true)
  );

CREATE POLICY memberships_select ON memberships
  FOR SELECT USING (
    user_id = current_setting('app.user_id', true)
    OR (
      workspace_id::text = current_setting('app.workspace_id', true)
      AND current_setting('app.is_owner', true) = 'true'
    )
  );

CREATE POLICY memberships_insert ON memberships
  FOR INSERT WITH CHECK (
    user_id = current_setting('app.user_id', true)
    AND (
      EXISTS (
        SELECT 1 FROM workspaces w
        WHERE w.id = memberships.workspace_id
          AND w.owner_user_id = current_setting('app.user_id', true)
      )
      OR EXISTS (
        SELECT 1 FROM invitations i
        WHERE i.selector::text = current_setting('app.invitation_selector', true)
          AND i.token_hash = current_setting('app.invitation_hash', true)
          AND i.email = current_setting('app.email', true)
          AND i.status = 'pending'
          AND i.expires_at > now()
          AND (i.workspace_id = memberships.workspace_id OR i.kind = 'owner_onboarding')
      )
    )
  );

CREATE POLICY memberships_owner_update ON memberships
  FOR UPDATE USING (
    workspace_id::text = current_setting('app.workspace_id', true)
    AND current_setting('app.is_owner', true) = 'true'
  ) WITH CHECK (
    workspace_id::text = current_setting('app.workspace_id', true)
  );

CREATE POLICY memberships_invitation_reactivate ON memberships
  FOR UPDATE USING (
    user_id = current_setting('app.user_id', true)
    AND EXISTS (
      SELECT 1 FROM invitations i
      WHERE i.selector::text = current_setting('app.invitation_selector', true)
        AND i.token_hash = current_setting('app.invitation_hash', true)
        AND i.email = current_setting('app.email', true)
        AND i.status = 'pending'
        AND i.expires_at > now()
        AND (i.workspace_id = memberships.workspace_id OR i.kind = 'owner_onboarding')
    )
  ) WITH CHECK (
    user_id = current_setting('app.user_id', true)
    AND status = 'active'
    AND EXISTS (
      SELECT 1 FROM invitations i
      WHERE i.selector::text = current_setting('app.invitation_selector', true)
        AND i.token_hash = current_setting('app.invitation_hash', true)
        AND i.email = current_setting('app.email', true)
        AND i.status = 'pending'
        AND i.expires_at > now()
        AND (i.workspace_id = memberships.workspace_id OR i.kind = 'owner_onboarding')
    )
  );

CREATE POLICY invitations_token_select ON invitations
  FOR SELECT USING (
    selector::text = current_setting('app.invitation_selector', true)
    AND token_hash = current_setting('app.invitation_hash', true)
  );

CREATE POLICY invitations_owner_select ON invitations
  FOR SELECT USING (
    workspace_id::text = current_setting('app.workspace_id', true)
    AND current_setting('app.is_owner', true) = 'true'
  );

CREATE POLICY invitations_owner_insert ON invitations
  FOR INSERT WITH CHECK (
    kind = 'teammate'
    AND workspace_id::text = current_setting('app.workspace_id', true)
    AND invited_by_user_id = current_setting('app.user_id', true)
    AND current_setting('app.is_owner', true) = 'true'
  );

-- Bound to the role that applies migrations. The operator script also sets the
-- transaction-local flag, so application runtime roles cannot mint workspaces.
CREATE POLICY invitations_operator_insert ON invitations
  FOR INSERT TO CURRENT_USER WITH CHECK (
    kind = 'owner_onboarding'
    AND workspace_id IS NULL
    AND current_setting('app.operator', true) = 'true'
  );

CREATE POLICY invitations_operator_select ON invitations
  FOR SELECT TO CURRENT_USER USING (
    kind = 'owner_onboarding'
    AND current_setting('app.operator', true) = 'true'
  );

CREATE POLICY invitations_operator_update ON invitations
  FOR UPDATE TO CURRENT_USER USING (
    kind = 'owner_onboarding'
    AND current_setting('app.operator', true) = 'true'
  ) WITH CHECK (
    kind = 'owner_onboarding'
    AND current_setting('app.operator', true) = 'true'
  );

CREATE POLICY invitations_token_accept ON invitations
  FOR UPDATE USING (
    selector::text = current_setting('app.invitation_selector', true)
    AND token_hash = current_setting('app.invitation_hash', true)
    AND email = current_setting('app.email', true)
    AND (
      (status = 'pending' AND expires_at > now())
      OR (status = 'accepted' AND accepted_by_user_id = current_setting('app.user_id', true))
    )
  ) WITH CHECK (
    status = 'accepted'
    AND accepted_by_user_id = current_setting('app.user_id', true)
    AND email = current_setting('app.email', true)
    AND (
      (kind = 'teammate' AND accepted_workspace_id = workspace_id)
      OR (
        kind = 'owner_onboarding'
        AND EXISTS (
          SELECT 1 FROM workspaces w
          WHERE w.id = accepted_workspace_id
            AND w.owner_user_id = current_setting('app.user_id', true)
        )
      )
    )
  );

CREATE FUNCTION prevent_membership_identity_change() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.id IS DISTINCT FROM OLD.id
     OR NEW.workspace_id IS DISTINCT FROM OLD.workspace_id
     OR NEW.user_id IS DISTINCT FROM OLD.user_id THEN
    RAISE EXCEPTION 'membership_identity_is_immutable';
  END IF;
  RETURN NEW;
END
$$;

CREATE TRIGGER memberships_identity_immutable
  BEFORE UPDATE ON memberships
  FOR EACH ROW EXECUTE FUNCTION prevent_membership_identity_change();

CREATE FUNCTION prevent_invitation_identity_change() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  IF OLD.status <> 'pending' THEN
    RAISE EXCEPTION 'terminal_invitation_is_immutable';
  END IF;
  IF NEW.status NOT IN ('accepted', 'revoked', 'replaced') THEN
    RAISE EXCEPTION 'invalid_invitation_transition';
  END IF;
  IF NEW.selector IS DISTINCT FROM OLD.selector
     OR NEW.kind IS DISTINCT FROM OLD.kind
     OR NEW.email IS DISTINCT FROM OLD.email
     OR NEW.token_hash IS DISTINCT FROM OLD.token_hash
     OR NEW.workspace_id IS DISTINCT FROM OLD.workspace_id
     OR NEW.invited_by_user_id IS DISTINCT FROM OLD.invited_by_user_id
     OR NEW.created_at IS DISTINCT FROM OLD.created_at
     OR NEW.expires_at IS DISTINCT FROM OLD.expires_at THEN
    RAISE EXCEPTION 'invitation_identity_is_immutable';
  END IF;
  RETURN NEW;
END
$$;

CREATE TRIGGER invitations_identity_immutable
  BEFORE UPDATE ON invitations
  FOR EACH ROW EXECUTE FUNCTION prevent_invitation_identity_change();

CREATE POLICY invitations_owner_update ON invitations
  FOR UPDATE USING (
    workspace_id::text = current_setting('app.workspace_id', true)
    AND current_setting('app.is_owner', true) = 'true'
  ) WITH CHECK (
    workspace_id::text = current_setting('app.workspace_id', true)
  );

COMMENT ON TABLE invitations IS
  'Raw invitation tokens are never stored; selector plus SHA-256 hash is used for lookup and proof.';

GRANT USAGE ON SCHEMA public TO popsage_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON workspaces, memberships, invitations TO popsage_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO popsage_app;
