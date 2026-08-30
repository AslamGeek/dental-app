-- Dental Follow-Up Assistant V1
-- 02_rls.sql: Row Level Security Policies for Tenant Isolation

-- Enable Row Level Security on all tenant tables
ALTER TABLE clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE treatment_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE follow_ups ENABLE ROW LEVEL SECURITY;

-- Helper function to get current user's clinic_id
CREATE OR REPLACE FUNCTION get_current_user_clinic_id()
RETURNS UUID AS $$
    SELECT clinic_id FROM users WHERE auth_user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Clinics policies
CREATE POLICY "Users can access their own clinic"
ON clinics FOR ALL
USING (id = get_current_user_clinic_id());

-- Users policies
CREATE POLICY "Users can access staff of their own clinic"
ON users FOR ALL
USING (clinic_id = get_current_user_clinic_id());

-- Patients policies
CREATE POLICY "Users can access patients of their own clinic"
ON patients FOR ALL
USING (clinic_id = get_current_user_clinic_id());

-- Treatment Opportunities policies
CREATE POLICY "Users can access treatment opportunities of their own clinic"
ON treatment_opportunities FOR ALL
USING (clinic_id = get_current_user_clinic_id());

-- Appointments policies
CREATE POLICY "Users can access appointments of their own clinic"
ON appointments FOR ALL
USING (clinic_id = get_current_user_clinic_id());

-- Interactions policies
CREATE POLICY "Users can access interactions of their own clinic"
ON interactions FOR ALL
USING (clinic_id = get_current_user_clinic_id());

-- Follow-ups policies
CREATE POLICY "Users can access follow-ups of their own clinic"
ON follow_ups FOR ALL
USING (clinic_id = get_current_user_clinic_id());
