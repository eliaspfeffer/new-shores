CREATE TABLE IF NOT EXISTS players (
 id uuid PRIMARY KEY, email text UNIQUE NOT NULL, password_hash text NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now()
);
DO $$
BEGIN
 IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema=current_schema() AND table_name='players' AND column_name='email_verified_at') THEN
  ALTER TABLE players ADD COLUMN email_verified_at timestamptz;
  -- Accounts created before e-mail verification existed remain usable.
  UPDATE players SET email_verified_at=created_at;
 END IF;
END $$;
CREATE TABLE IF NOT EXISTS sessions (
 hash text PRIMARY KEY, player_id uuid NOT NULL REFERENCES players(id), expires_at timestamptz NOT NULL
);
CREATE TABLE IF NOT EXISTS account_tokens (
 hash text PRIMARY KEY,
 player_id uuid NOT NULL REFERENCES players(id) ON DELETE CASCADE,
 purpose text NOT NULL CHECK(purpose IN ('verify','reset')),
 expires_at timestamptz NOT NULL,
 used_at timestamptz
);
CREATE TABLE IF NOT EXISTS islands (
 id uuid PRIMARY KEY, owner_id uuid NOT NULL REFERENCES players(id), name text NOT NULL,
 snapshot jsonb NOT NULL, revision integer NOT NULL DEFAULT 1, updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS island_members (
 island_id uuid REFERENCES islands(id), player_id uuid REFERENCES players(id),
 permission text NOT NULL CHECK(permission IN ('view','edit')), PRIMARY KEY(island_id,player_id)
);
CREATE TABLE IF NOT EXISTS island_history (
 island_id uuid REFERENCES islands(id), revision integer NOT NULL, snapshot jsonb NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now(), PRIMARY KEY(island_id,revision)
);
CREATE TABLE IF NOT EXISTS invitations (
 hash text PRIMARY KEY, island_id uuid REFERENCES islands(id), permission text NOT NULL CHECK(permission IN ('view','edit')),
 expires_at timestamptz NOT NULL, used_by uuid REFERENCES players(id)
);
ALTER TABLE islands ADD COLUMN IF NOT EXISTS accept_deliveries boolean NOT NULL DEFAULT false;
CREATE TABLE IF NOT EXISTS goods_transfers (
 id uuid PRIMARY KEY, sender_id uuid NOT NULL REFERENCES players(id),
 source_id uuid NOT NULL REFERENCES islands(id), target_id uuid NOT NULL REFERENCES islands(id),
 item text NOT NULL, amount integer NOT NULL CHECK(amount BETWEEN 1 AND 100),
 source_revision integer NOT NULL, target_revision integer NOT NULL,
 delivery_x integer NOT NULL, delivery_y integer NOT NULL, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS island_messages (
 id bigserial PRIMARY KEY,
 island_id uuid NOT NULL REFERENCES islands(id) ON DELETE CASCADE,
 player_id uuid NOT NULL REFERENCES players(id) ON DELETE CASCADE,
 body text NOT NULL CHECK(char_length(body) BETWEEN 1 AND 280),
 kind text NOT NULL DEFAULT 'message' CHECK(kind IN ('message','trade','warning','diplomacy')),
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS island_messages_recent ON island_messages(island_id,created_at DESC);
