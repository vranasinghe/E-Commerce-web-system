-- The two shared demo accounts opened by the "Try the demo" buttons.
-- They have no password, so the login form cannot sign in to them.
INSERT INTO "User" ("id", "email", "name", "role", "updatedAt") VALUES
  ('demo_account_customer', 'demo.customer@demo.aura.test', 'Demo Customer', 'CUSTOMER', CURRENT_TIMESTAMP),
  ('demo_account_admin',    'demo.admin@demo.aura.test',    'Demo Admin',    'ADMIN',    CURRENT_TIMESTAMP)
ON CONFLICT ("email") DO NOTHING;

-- Nobody (including the demo admin, or any future code) can rename, re-password,
-- change the role of, change the email of, or delete these two accounts.
CREATE OR REPLACE FUNCTION protect_demo_accounts() RETURNS trigger AS $$
BEGIN
  IF OLD."email" IN ('demo.customer@demo.aura.test', 'demo.admin@demo.aura.test') THEN
    IF TG_OP = 'DELETE' THEN
      RAISE EXCEPTION 'The demo accounts cannot be deleted';
    END IF;
    IF NEW."email" IS DISTINCT FROM OLD."email"
       OR NEW."name" IS DISTINCT FROM OLD."name"
       OR NEW."passwordHash" IS DISTINCT FROM OLD."passwordHash"
       OR NEW."role" IS DISTINCT FROM OLD."role" THEN
      RAISE EXCEPTION 'The demo accounts cannot be changed';
    END IF;
  END IF;
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "protect_demo_accounts_trigger"
BEFORE UPDATE OR DELETE ON "User"
FOR EACH ROW EXECUTE FUNCTION protect_demo_accounts();
