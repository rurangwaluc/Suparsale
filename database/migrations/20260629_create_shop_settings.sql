CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS shop_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  settings_key text NOT NULL UNIQUE DEFAULT 'main',

  business_name text,
  shop_name text,
  phone text,
  email text,
  website text,
  address text,
  tin text,
  momo_code text,
  logo_url text,
  bank_accounts jsonb NOT NULL DEFAULT '[]'::jsonb,

  report_business_name text,
  report_footer_text text,

  currency text NOT NULL DEFAULT 'Rwf',

  require_open_cash_for_sales boolean NOT NULL DEFAULT true,
  require_open_cash_for_debt_payments boolean NOT NULL DEFAULT true,
  require_open_cash_for_paid_expenses boolean NOT NULL DEFAULT true,
  allow_owner_cash_reopen boolean NOT NULL DEFAULT true,

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO shop_settings (
  settings_key,
  business_name,
  shop_name,
  report_business_name,
  report_footer_text,
  currency
)
VALUES (
  'main',
  'Suparsale Store Ltd',
  'Main Shop',
  'Suparsale Store Ltd',
  'Suparsale Store Ltd PDF proof generated from saved sales, stock, payment, expense, and cash records.',
  'Rwf'
)
ON CONFLICT (settings_key) DO NOTHING;
