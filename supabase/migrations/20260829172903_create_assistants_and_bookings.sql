/*
# Create assistants and bookings tables (single-tenant, no auth)

## Overview
This migration creates the core schema for a university peer-tutor booking platform.
Students browse assistants, book sessions, and pay via InstaPay (manually verified).
An admin manages bookings through a password-protected dashboard. There is no
student sign-in — the app is single-tenant and intentionally public for browsing
and booking. The admin gate is handled client-side (master password), so all
table access runs as the anon role.

## 1. New Tables

### `assistants`
- `id` (uuid, primary key)
- `name` (text, not null) — assistant's full name
- `major` (text, not null) — university major
- `subjects` (text[], not null default '{}') — array of subjects they teach
- `hourly_rate` (integer, not null) — rate in EGP
- `rating` (numeric, default 5.0) — average rating (0–5)
- `photo_url` (text) — profile photo URL
- `video_url` (text) — intro/preview video URL
- `bio` (text) — short bio
- `university` (text) — university name
- `available_slots` (jsonb, default '[]') — array of {date, time} slot objects
- `created_at` (timestamptz, default now())

### `bookings`
- `id` (uuid, primary key)
- `booking_code` (text, not null unique) — human-readable ID like #REQ-8492
- `assistant_id` (uuid, references assistants on delete cascade)
- `student_name` (text, not null)
- `student_email` (text, not null)
- `student_phone` (text, not null)
- `session_date` (text, not null) — ISO date string
- `session_time` (text, not null) — time slot label
- `duration_hours` (integer, default 1)
- `total_cost` (integer, not null) — total in EGP
- `payment_ref` (text) — InstaPay transaction reference number
- `receipt_url` (text) — URL to uploaded receipt screenshot (stored as data URL)
- `status` (text, not null default 'pending_verification')
  — one of: pending_verification, confirmed, completed, cancelled
- `created_at` (timestamptz, default now())

## 2. Security
- RLS enabled on both tables.
- Both tables allow anon + authenticated full CRUD — the app has no sign-in
  and the data is intentionally public/shared (single-tenant). The admin gate
  is a client-side password check, not database-level auth.
*/

CREATE TABLE IF NOT EXISTS assistants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  major text NOT NULL,
  subjects text[] NOT NULL DEFAULT '{}',
  hourly_rate integer NOT NULL,
  rating numeric DEFAULT 5.0,
  photo_url text,
  video_url text,
  bio text,
  university text,
  available_slots jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_code text NOT NULL UNIQUE,
  assistant_id uuid REFERENCES assistants(id) ON DELETE CASCADE,
  student_name text NOT NULL,
  student_email text NOT NULL,
  student_phone text NOT NULL,
  session_date text NOT NULL,
  session_time text NOT NULL,
  duration_hours integer NOT NULL DEFAULT 1,
  total_cost integer NOT NULL,
  payment_ref text,
  receipt_url text,
  status text NOT NULL DEFAULT 'pending_verification',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE assistants ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Assistants: public CRUD (single-tenant, no auth)
DROP POLICY IF EXISTS "anon_select_assistants" ON assistants;
CREATE POLICY "anon_select_assistants" ON assistants FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_assistants" ON assistants;
CREATE POLICY "anon_insert_assistants" ON assistants FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_assistants" ON assistants;
CREATE POLICY "anon_update_assistants" ON assistants FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_assistants" ON assistants;
CREATE POLICY "anon_delete_assistants" ON assistants FOR DELETE
  TO anon, authenticated USING (true);

-- Bookings: public CRUD (single-tenant, no auth)
DROP POLICY IF EXISTS "anon_select_bookings" ON bookings;
CREATE POLICY "anon_select_bookings" ON bookings FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_bookings" ON bookings;
CREATE POLICY "anon_insert_bookings" ON bookings FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_bookings" ON bookings;
CREATE POLICY "anon_update_bookings" ON bookings FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_bookings" ON bookings;
CREATE POLICY "anon_delete_bookings" ON bookings FOR DELETE
  TO anon, authenticated USING (true);
