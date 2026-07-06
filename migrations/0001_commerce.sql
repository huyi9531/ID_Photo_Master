CREATE TABLE IF NOT EXISTS purchases (
  token TEXT PRIMARY KEY,
  request_id TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL CHECK (status IN ('pending', 'paid', 'processing', 'used', 'refunded')),
  customer_email TEXT,
  checkout_id TEXT,
  checkout_url TEXT,
  order_id TEXT,
  transaction_id TEXT,
  product_id TEXT,
  amount_cents INTEGER,
  currency TEXT,
  credits_total INTEGER NOT NULL DEFAULT 1,
  credits_used INTEGER NOT NULL DEFAULT 0,
  creem_mode TEXT,
  metadata_json TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  paid_at TEXT,
  used_at TEXT,
  refunded_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_purchases_request_id ON purchases(request_id);
CREATE INDEX IF NOT EXISTS idx_purchases_customer_email ON purchases(customer_email);
CREATE INDEX IF NOT EXISTS idx_purchases_status ON purchases(status);

CREATE TABLE IF NOT EXISTS generation_attempts (
  id TEXT PRIMARY KEY,
  purchase_token TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('moderation_blocked', 'failed', 'succeeded')),
  moderation_id TEXT,
  moderation_decision TEXT,
  prompt_length INTEGER NOT NULL,
  result_image_url TEXT,
  error_message TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (purchase_token) REFERENCES purchases(token)
);

CREATE INDEX IF NOT EXISTS idx_generation_attempts_purchase_token
  ON generation_attempts(purchase_token);

CREATE TABLE IF NOT EXISTS webhook_events (
  id TEXT PRIMARY KEY,
  event_type TEXT NOT NULL,
  payload_json TEXT NOT NULL,
  creem_created_at INTEGER,
  processed_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_webhook_events_event_type ON webhook_events(event_type);
