CREATE TABLE IF NOT EXISTS players (
 id uuid PRIMARY KEY, email text UNIQUE NOT NULL, password_hash text NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS sessions (
 hash text PRIMARY KEY, player_id uuid NOT NULL REFERENCES players(id), expires_at timestamptz NOT NULL
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
