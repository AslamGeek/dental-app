-- Dental Follow-Up Assistant V1
-- 01_schema.sql: PostgreSQL / Supabase Schema for Kadapa Dental Clinic

-- Drop tables in reverse dependency order if recreating
DROP TABLE IF EXISTS follow_ups CASCADE;
DROP TABLE IF EXISTS interactions CASCADE;
DROP TABLE IF EXISTS appointments CASCADE;
DROP TABLE IF EXISTS treatment_opportunities CASCADE;
DROP TABLE IF EXISTS patients CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS clinics CASCADE;

-- 1. Clinics Table (Tenant)
CREATE TABLE clinics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    city VARCHAR(100) DEFAULT 'Kadapa',
    state VARCHAR(100) DEFAULT 'Andhra Pradesh',
    phone VARCHAR(20) DEFAULT '+919440212345',
    currency VARCHAR(10) DEFAULT 'INR',
    timezone VARCHAR(50) DEFAULT 'Asia/Kolkata',
    working_hours_start TIME DEFAULT '09:30:00',
    working_hours_end TIME DEFAULT '20:30:00',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Users Table (Dentists, Assistants/Receptionists)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    auth_user_id UUID,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('dentist', 'assistant')),
    phone VARCHAR(20),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Patients Table
CREATE TABLE patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    flagged_wrong_number BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_patients_clinic ON patients(clinic_id);
CREATE INDEX idx_patients_phone ON patients(phone);
CREATE INDEX idx_patients_name ON patients(name);

-- 4. Treatment Opportunities Table
CREATE TABLE treatment_opportunities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    treatment_name VARCHAR(255) NOT NULL,
    estimated_value NUMERIC(12, 2) DEFAULT 0,
    status VARCHAR(50) NOT NULL CHECK (status IN ('considering', 'accepted', 'scheduled', 'completed', 'declined')),
    decline_reason VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_treatment_opps_clinic ON treatment_opportunities(clinic_id);
CREATE INDEX idx_treatment_opps_patient ON treatment_opportunities(patient_id);
CREATE INDEX idx_treatment_opps_status ON treatment_opportunities(status);

-- 5. Appointments Table
CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    treatment_opportunity_id UUID REFERENCES treatment_opportunities(id) ON DELETE SET NULL,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    treatment_name VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL CHECK (status IN ('scheduled', 'confirmed', 'cancelled', 'rescheduled', 'no_show', 'completed')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_appointments_clinic ON appointments(clinic_id);
CREATE INDEX idx_appointments_patient ON appointments(patient_id);
CREATE INDEX idx_appointments_date ON appointments(appointment_date);
CREATE INDEX idx_appointments_status ON appointments(status);

-- 6. Interactions Table (Contact History)
CREATE TABLE interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    treatment_opportunity_id UUID REFERENCES treatment_opportunities(id) ON DELETE SET NULL,
    staff_id UUID REFERENCES users(id) ON DELETE SET NULL,
    channel VARCHAR(50) NOT NULL CHECK (channel IN ('call', 'whatsapp', 'sms', 'in_person')),
    outcome VARCHAR(50) NOT NULL CHECK (outcome IN ('no_answer', 'call_back_later', 'interested', 'needs_time', 'appointment_booked', 'not_interested', 'wrong_number', 'custom')),
    notes TEXT,
    occurred_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_interactions_clinic ON interactions(clinic_id);
CREATE INDEX idx_interactions_patient ON interactions(patient_id);
CREATE INDEX idx_interactions_occurred_at ON interactions(occurred_at);

-- 7. Follow-Ups Table (Core Automation & Daily Action Queue)
CREATE TABLE follow_ups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    treatment_opportunity_id UUID REFERENCES treatment_opportunities(id) ON DELETE SET NULL,
    appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
    assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
    action_type VARCHAR(50) NOT NULL CHECK (action_type IN ('call', 'whatsapp', 'confirm_appointment', 'missed_appointment', 'recall')),
    title VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('follow_up_today', 'new_inquiry', 'appointment_confirm', 'missed_appointment', 'treatment_decision')),
    due_at TIMESTAMPTZ NOT NULL,
    attempt_count INT DEFAULT 0,
    status VARCHAR(50) NOT NULL CHECK (status IN ('pending', 'completed', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

CREATE INDEX idx_follow_ups_clinic ON follow_ups(clinic_id);
CREATE INDEX idx_follow_ups_patient ON follow_ups(patient_id);
CREATE INDEX idx_follow_ups_status_due ON follow_ups(status, due_at);
