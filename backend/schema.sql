-- ===================================================
-- DSRS-VANET Master Database Schema (Supabase PostgreSQL)
-- ===================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Users Table
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'Judge / Evaluator',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Hospitals Table
CREATE TABLE IF NOT EXISTS public.hospitals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hospital_code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    location TEXT NOT NULL,
    lat DOUBLE PRECISION NOT NULL,
    lng DOUBLE PRECISION NOT NULL,
    total_capacity INT NOT NULL DEFAULT 100,
    occupied INT NOT NULL DEFAULT 0,
    available INT NOT NULL DEFAULT 100,
    occupancy_rate INT NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'Normal',
    icu_beds JSONB NOT NULL DEFAULT '{"occupied": 0, "total": 20}',
    general_beds JSONB NOT NULL DEFAULT '{"occupied": 0, "total": 50}',
    emergency_beds JSONB NOT NULL DEFAULT '{"occupied": 0, "total": 30}',
    ventilators JSONB NOT NULL DEFAULT '{"occupied": 0, "total": 10}',
    pediatric_beds JSONB NOT NULL DEFAULT '{"occupied": 0, "total": 10}',
    doctors INT NOT NULL DEFAULT 10,
    nurses INT NOT NULL DEFAULT 20,
    ambulances INT NOT NULL DEFAULT 4,
    blood_units INT NOT NULL DEFAULT 30,
    last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Vehicles / Fleet Table
CREATE TABLE IF NOT EXISTS public.vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_code TEXT UNIQUE NOT NULL,
    type TEXT NOT NULL, -- Ambulance, Fire Truck, Police Vehicle, Drone
    status TEXT NOT NULL DEFAULT 'Idle', -- Idle, On Mission, Active, Maintenance
    location TEXT NOT NULL,
    zone TEXT NOT NULL,
    lat DOUBLE PRECISION NOT NULL,
    lng DOUBLE PRECISION NOT NULL,
    heading INT DEFAULT 0,
    speed INT DEFAULT 0,
    driver TEXT NOT NULL,
    fuel INT DEFAULT 100,
    battery INT DEFAULT 100,
    health TEXT DEFAULT 'Good',
    mission_id UUID,
    mission_text TEXT DEFAULT 'None',
    last_update TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Emergencies / Incidents Table
CREATE TABLE IF NOT EXISTS public.incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    incident_code TEXT UNIQUE NOT NULL,
    type TEXT NOT NULL,
    location TEXT NOT NULL,
    zone TEXT NOT NULL,
    lat DOUBLE PRECISION NOT NULL,
    lng DOUBLE PRECISION NOT NULL,
    severity TEXT NOT NULL DEFAULT 'MEDIUM', -- LOW, MEDIUM, HIGH
    caller TEXT,
    victim_count INT DEFAULT 0,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'ACTIVE', -- ACTIVE, RESOLVED, PENDING
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Rescue Missions Table
CREATE TABLE IF NOT EXISTS public.missions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mission_code TEXT UNIQUE NOT NULL,
    emergency_id UUID REFERENCES public.incidents(id) ON DELETE SET NULL,
    emergency_type TEXT NOT NULL,
    location TEXT NOT NULL,
    zone TEXT NOT NULL,
    ambulance_id UUID REFERENCES public.vehicles(id) ON DELETE SET NULL,
    hospital_id UUID REFERENCES public.hospitals(id) ON DELETE SET NULL,
    hospital_name TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'CREATED',
    eta_minutes DOUBLE PRECISION NOT NULL,
    acrn_confidence INT NOT NULL DEFAULT 90,
    step_index INT DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- 7. AI Decision Logs Table
CREATE TABLE IF NOT EXISTS public.ai_decision_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    log_code TEXT UNIQUE NOT NULL,
    time_str TEXT NOT NULL,
    event TEXT NOT NULL,
    description TEXT NOT NULL,
    acrn_score INT NOT NULL DEFAULT 90,
    icon_type TEXT NOT NULL DEFAULT 'negotiation',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    time_str TEXT NOT NULL,
    level TEXT NOT NULL DEFAULT 'info', -- critical, warning, info, success
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. System Settings Table
CREATE TABLE IF NOT EXISTS public.settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT UNIQUE NOT NULL,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for Query Performance
CREATE INDEX IF NOT EXISTS idx_incidents_status ON public.incidents(status);
CREATE INDEX IF NOT EXISTS idx_vehicles_status ON public.vehicles(status);
CREATE INDEX IF NOT EXISTS idx_vehicles_type ON public.vehicles(type);
CREATE INDEX IF NOT EXISTS idx_missions_status ON public.missions(status);
CREATE INDEX IF NOT EXISTS idx_hospitals_status ON public.hospitals(status);
