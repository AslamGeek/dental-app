-- Dental Follow-Up Assistant V1
-- 03_seed.sql: Realistic Seed Data for Sree Balaji Dental Care, Kadapa, AP

-- 1. Insert Clinic
INSERT INTO clinics (id, name, city, state, phone, currency, timezone, working_hours_start, working_hours_end)
VALUES (
    'c0000000-0000-0000-0000-000000000001',
    'Sree Balaji Dental Care',
    'Kadapa',
    'Andhra Pradesh',
    '+919440212345',
    'INR',
    'Asia/Kolkata',
    '09:30:00',
    '20:30:00'
) ON CONFLICT (id) DO NOTHING;

-- 2. Insert Staff Members
INSERT INTO users (id, clinic_id, name, role, phone)
VALUES 
(
    'u0000000-0000-0000-0000-000000000001',
    'c0000000-0000-0000-0000-000000000001',
    'Dr. Harsha Vardhan Reddy',
    'dentist',
    '+919440212345'
),
(
    'u0000000-0000-0000-0000-000000000002',
    'c0000000-0000-0000-0000-000000000001',
    'Pooja',
    'assistant',
    '+919848098765'
) ON CONFLICT (id) DO NOTHING;

-- 3. Insert Patients
INSERT INTO patients (id, clinic_id, name, phone, email, flagged_wrong_number, created_at)
VALUES
('p0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'Rahul Kumar', '+919876543210', 'rahul.k@example.com', FALSE, NOW() - INTERVAL '5 days'),
('p0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000001', 'Priya Reddy', '+919848012345', 'priya.r@example.com', FALSE, NOW() - INTERVAL '2 hours'),
('p0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000001', 'Vijay Bhaskar', '+919440156789', 'vijay.b@example.com', FALSE, NOW() - INTERVAL '3 days'),
('p0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000001', 'Suresh Naidu', '+919988776655', 'suresh.n@example.com', FALSE, NOW() - INTERVAL '8 days'),
('p0000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000001', 'Anita Rao', '+919123456780', 'anita.rao@example.com', FALSE, NOW() - INTERVAL '6 days'),
('p0000000-0000-0000-0000-000000000006', 'c0000000-0000-0000-0000-000000000001', 'K. Venkat Ramana', '+919654321098', 'venkat.k@example.com', FALSE, NOW() - INTERVAL '10 days'),
('p0000000-0000-0000-0000-000000000007', 'c0000000-0000-0000-0000-000000000001', 'Sunitha Devi', '+919876123450', 'sunitha.d@example.com', FALSE, NOW() - INTERVAL '20 days'),
('p0000000-0000-0000-0000-000000000008', 'c0000000-0000-0000-0000-000000000001', 'Ramesh Babu', '+919000112233', 'ramesh.b@example.com', TRUE, NOW() - INTERVAL '4 days'),
('p0000000-0000-0000-0000-000000000009', 'c0000000-0000-0000-0000-000000000001', 'Meena Kumari', '+919700223344', 'meena.k@example.com', FALSE, NOW() - INTERVAL '2 days'),
('p0000000-0000-0000-0000-000000000010', 'c0000000-0000-0000-0000-000000000001', 'Rajesh Varma', '+919888334455', 'rajesh.v@example.com', FALSE, NOW() - INTERVAL '15 days')
ON CONFLICT (id) DO NOTHING;

-- 4. Insert Treatment Opportunities
INSERT INTO treatment_opportunities (id, clinic_id, patient_id, treatment_name, estimated_value, status, decline_reason, created_at)
VALUES
('t0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'p0000000-0000-0000-0000-000000000001', 'Dental Implant', 85000, 'considering', NULL, NOW() - INTERVAL '5 days'),
('t0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000001', 'p0000000-0000-0000-0000-000000000002', 'Braces', 55000, 'considering', NULL, NOW() - INTERVAL '2 hours'),
('t0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000001', 'p0000000-0000-0000-0000-000000000003', 'Root Canal & Crown', 12000, 'scheduled', NULL, NOW() - INTERVAL '3 days'),
('t0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000001', 'p0000000-0000-0000-0000-000000000004', 'Cleaning & Scaling', 1500, 'considering', NULL, NOW() - INTERVAL '8 days'),
('t0000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000001', 'p0000000-0000-0000-0000-000000000005', 'Ceramic Crown', 18000, 'considering', NULL, NOW() - INTERVAL '6 days'),
('t0000000-0000-0000-0000-000000000006', 'c0000000-0000-0000-0000-000000000001', 'p0000000-0000-0000-0000-000000000006', 'Full Mouth Rehabilitation', 150000, 'considering', NULL, NOW() - INTERVAL '10 days'),
('t0000000-0000-0000-0000-000000000007', 'c0000000-0000-0000-0000-000000000001', 'p0000000-0000-0000-0000-000000000007', 'Teeth Whitening', 8000, 'completed', NULL, NOW() - INTERVAL '20 days'),
('t0000000-0000-0000-0000-000000000008', 'c0000000-0000-0000-0000-000000000001', 'p0000000-0000-0000-0000-000000000008', 'Toothache Consultation', 2000, 'considering', NULL, NOW() - INTERVAL '4 days'),
('t0000000-0000-0000-0000-000000000009', 'c0000000-0000-0000-0000-000000000001', 'p0000000-0000-0000-0000-000000000009', 'Filling & Polishing', 4500, 'scheduled', NULL, NOW() - INTERVAL '2 days'),
('t0000000-0000-0000-0000-000000000010', 'c0000000-0000-0000-0000-000000000001', 'p0000000-0000-0000-0000-000000000010', 'Bridge', 35000, 'declined', 'Went elsewhere', NOW() - INTERVAL '15 days')
ON CONFLICT (id) DO NOTHING;

-- 5. Insert Appointments
INSERT INTO appointments (id, clinic_id, patient_id, treatment_opportunity_id, appointment_date, appointment_time, treatment_name, status)
VALUES
-- Vijay Bhaskar: Tomorrow 5:30 PM (Needs confirmation)
('a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'p0000000-0000-0000-0000-000000000003', 't0000000-0000-0000-0000-000000000003', CURRENT_DATE + INTERVAL '1 day', '17:30:00', 'Root Canal & Crown', 'scheduled'),
-- Suresh Naidu: Missed yesterday (No-show)
('a0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000001', 'p0000000-0000-0000-0000-000000000004', 't0000000-0000-0000-0000-000000000004', CURRENT_DATE - INTERVAL '1 day', '11:00:00', 'Cleaning & Scaling', 'no_show'),
-- Meena Kumari: Today 11:30 AM (Confirmed)
('a0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000001', 'p0000000-0000-0000-0000-000000000009', 't0000000-0000-0000-0000-000000000009', CURRENT_DATE, '11:30:00', 'Filling & Polishing', 'confirmed')
ON CONFLICT (id) DO NOTHING;

-- 6. Insert Recent Interactions
INSERT INTO interactions (id, clinic_id, patient_id, treatment_opportunity_id, staff_id, channel, outcome, notes, occurred_at)
VALUES
('i0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'p0000000-0000-0000-0000-000000000001', 't0000000-0000-0000-0000-000000000001', 'u0000000-0000-0000-0000-000000000002', 'call', 'call_back_later', 'Wants to discuss with wife, asked to call today morning', NOW() - INTERVAL '1 day'),
('i0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000001', 'p0000000-0000-0000-0000-000000000005', 't0000000-0000-0000-0000-000000000005', 'u0000000-0000-0000-0000-000000000002', 'call', 'needs_time', 'Considering costs for front teeth ceramic crown', NOW() - INTERVAL '3 days')
ON CONFLICT (id) DO NOTHING;

-- 7. Insert Initial Follow-Ups (Powering Today's Queue)
INSERT INTO follow_ups (id, clinic_id, patient_id, treatment_opportunity_id, appointment_id, assigned_to, action_type, title, category, due_at, attempt_count, status)
VALUES
-- 1. Rahul Kumar: Follow up today
(
    'f0000000-0000-0000-0000-000000000001',
    'c0000000-0000-0000-0000-000000000001',
    'p0000000-0000-0000-0000-000000000001',
    't0000000-0000-0000-0000-000000000001',
    NULL,
    'u0000000-0000-0000-0000-000000000002',
    'call',
    'Patient asked to be called today.',
    'follow_up_today',
    NOW(),
    1,
    'pending'
),
-- 2. Priya Reddy: New inquiry
(
    'f0000000-0000-0000-0000-000000000002',
    'c0000000-0000-0000-0000-000000000001',
    'p0000000-0000-0000-0000-000000000002',
    't0000000-0000-0000-0000-000000000002',
    NULL,
    'u0000000-0000-0000-0000-000000000002',
    'call',
    'No contact has been made yet.',
    'new_inquiry',
    NOW(),
    0,
    'pending'
),
-- 3. Vijay Bhaskar: Appointment confirmation
(
    'f0000000-0000-0000-0000-000000000003',
    'c0000000-0000-0000-0000-000000000001',
    'p0000000-0000-0000-0000-000000000003',
    't0000000-0000-0000-0000-000000000003',
    'a0000000-0000-0000-0000-000000000001',
    'u0000000-0000-0000-0000-000000000002',
    'confirm_appointment',
    'Appointment needs confirmation.',
    'appointment_confirm',
    NOW(),
    0,
    'pending'
),
-- 4. Suresh Naidu: Missed appointment
(
    'f0000000-0000-0000-0000-000000000004',
    'c0000000-0000-0000-0000-000000000001',
    'p0000000-0000-0000-0000-000000000004',
    't0000000-0000-0000-0000-000000000004',
    'a0000000-0000-0000-0000-000000000002',
    'u0000000-0000-0000-0000-000000000002',
    'missed_appointment',
    'Missed yesterday. Needs rescheduling.',
    'missed_appointment',
    NOW(),
    0,
    'pending'
),
-- 5. Anita Rao: Follow-up today (Considering treatment)
(
    'f0000000-0000-0000-0000-000000000005',
    'c0000000-0000-0000-0000-000000000001',
    'p0000000-0000-0000-0000-000000000005',
    't0000000-0000-0000-0000-000000000005',
    NULL,
    'u0000000-0000-0000-0000-000000000002',
    'call',
    'Follow up on ceramic crown budget decision.',
    'follow_up_today',
    NOW(),
    1,
    'pending'
)
ON CONFLICT (id) DO NOTHING;
