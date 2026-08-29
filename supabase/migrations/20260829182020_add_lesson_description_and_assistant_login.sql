/*
# Add lesson description and assistant login credentials

## Overview
This migration adds a lesson description column to bookings so students can
specify what topics they need help with. It also adds login credentials to
the assistants table so teachers can log in to their dedicated portal.

## 1. Modified Tables

### `bookings`
- `lesson_description` (text) — multi-line description of topics/lessons the
  student needs help with. Added via DO block for idempotency.

### `assistants`
- `login_email` (text) — email used for teacher portal login
- `login_password` (text) — password used for teacher portal login (plain text
  for demo purposes; in production this would be hashed)

## 2. Data Updates
- Sets login credentials for the 4 existing assistants:
  * Mariam Hassan → teacher1@platform.com / pass123
  * Omar Khaled → teacher2@platform.com / pass123
  * Salma Youssef → teacher3@platform.com / pass123
  * Youssef Adel → teacher4@platform.com / pass123
- Adds lesson descriptions to the 4 existing sample bookings.

## 3. Security
- No RLS policy changes. Existing anon+authenticated CRUD policies remain.
*/

DO $$ BEGIN
  ALTER TABLE bookings ADD COLUMN IF NOT EXISTS lesson_description text;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE assistants ADD COLUMN IF NOT EXISTS login_email text;
  ALTER TABLE assistants ADD COLUMN IF NOT EXISTS login_password text;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

UPDATE assistants SET login_email = 'teacher1@platform.com', login_password = 'pass123' WHERE name = 'Mariam Hassan';
UPDATE assistants SET login_email = 'teacher2@platform.com', login_password = 'pass123' WHERE name = 'Omar Khaled';
UPDATE assistants SET login_email = 'teacher3@platform.com', login_password = 'pass123' WHERE name = 'Salma Youssef';
UPDATE assistants SET login_email = 'teacher4@platform.com', login_password = 'pass123' WHERE name = 'Youssef Adel';

UPDATE bookings SET lesson_description = 'Need help with linked lists, binary trees, and Big-O analysis for my midterm next week.' WHERE booking_code = 'REQ-8492';
UPDATE bookings SET lesson_description = 'Struggling with thermodynamics problem sets — specifically the Carnot cycle and entropy calculations.' WHERE booking_code = 'REQ-8493';
UPDATE bookings SET lesson_description = 'Need a review of elasticity, consumer surplus, and market equilibrium before my final.' WHERE booking_code = 'REQ-8494';
UPDATE bookings SET lesson_description = 'Organic chemistry: SN1 vs SN2 reaction mechanisms and stereochemistry.' WHERE booking_code = 'REQ-8495';
