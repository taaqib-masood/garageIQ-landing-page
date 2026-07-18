-- Supabase requires extensions to be enabled in the public schema
CREATE EXTENSION IF NOT EXISTS "postgis" WITH SCHEMA "public";
CREATE EXTENSION IF NOT EXISTS "vector" WITH SCHEMA "public";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "public";

-- Note: Run this script in your Supabase SQL Editor or include it at the top 
-- of your first Prisma migration file before running `prisma migrate dev`.
