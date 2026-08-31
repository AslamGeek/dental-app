// Dental Follow-Up Assistant V1 - TypeScript Data Models

export type UserRole = 'dentist' | 'assistant';

export interface Clinic {
  id: string;
  name: string;
  city: string;
  state: string;
  phone: string;
  currency: string;
  timezone: string;
  working_hours_start: string;
  working_hours_end: string;
  weekly_schedule?: DaySchedule[];
  created_at: string;
}

export interface User {
  id: string;
  clinic_id: string;
  auth_user_id?: string;
  name: string;
  role: UserRole;
  phone?: string;
  created_at: string;
}

export const PREDEFINED_TREATMENTS = [
  'Dental Implant',
  'Braces',
  'Root Canal',
  'Crown',
  'Teeth Whitening',
  'Cleaning',
  'Extraction',
  'Denture',
  'Veneers',
  'Other',
] as const;

export type PredefinedTreatment = (typeof PREDEFINED_TREATMENTS)[number];

export const PATIENT_SOURCES = [
  'Referral',
  'Walk-in',
  'Google',
  'Instagram',
  'Facebook',
  'Website',
  'Existing Patient',
  'Other',
] as const;

export type PatientSource = (typeof PATIENT_SOURCES)[number];

export const GENDER_OPTIONS = ['Male', 'Female', 'Other'] as const;

export type PatientGender = (typeof GENDER_OPTIONS)[number];

export interface Patient {
  id: string;
  clinic_id: string;
  name: string;
  phone: string;
  whatsapp_number?: string;
  email?: string;
  age?: number;
  gender?: PatientGender | string;
  location?: string;
  source?: PatientSource | string;
  notes?: string;
  flagged_wrong_number: boolean;
  created_at: string;
  updated_at: string;
}

export interface TimePeriod {
  start: string; // "09:30"
  end: string;   // "13:00"
}

export interface DaySchedule {
  day_of_week: number; // 0=Sunday, 1=Monday, ..., 6=Saturday
  is_open: boolean;
  periods: TimePeriod[];
}

export interface TreatmentCatalogItem {
  id: string;
  clinic_id: string;
  name: string;
  duration_minutes: number;
  price: number;
  is_active: boolean;
  created_at: string;
}

export type TreatmentStatus = 
  | 'considering'
  | 'accepted'
  | 'scheduled'
  | 'completed'
  | 'declined';

export interface TreatmentOpportunity {
  id: string;
  clinic_id: string;
  patient_id: string;
  treatment_name: string;
  estimated_value: number;
  status: TreatmentStatus;
  decline_reason?: string;
  created_at: string;
  updated_at: string;
}

export type AppointmentStatus =
  | 'scheduled'
  | 'confirmed'
  | 'cancelled'
  | 'rescheduled'
  | 'no_show'
  | 'completed';

export interface Appointment {
  id: string;
  clinic_id: string;
  patient_id: string;
  treatment_id?: string;
  treatment_opportunity_id?: string;
  appointment_date: string; // YYYY-MM-DD
  appointment_time: string; // HH:mm:ss or HH:mm (Start time)
  duration_minutes?: number;
  treatment_name: string;
  status: AppointmentStatus;
  created_at: string;
  updated_at?: string;
}

export type InteractionChannel = 'call' | 'whatsapp' | 'sms' | 'in_person';

export type InteractionOutcome =
  | 'no_answer'
  | 'call_back_later'
  | 'interested'
  | 'needs_time'
  | 'appointment_booked'
  | 'not_interested'
  | 'wrong_number'
  | 'custom';

export interface Interaction {
  id: string;
  clinic_id: string;
  patient_id: string;
  treatment_opportunity_id?: string;
  staff_id?: string;
  channel: InteractionChannel;
  outcome: InteractionOutcome;
  notes?: string;
  occurred_at: string;
}

export type FollowUpCategory =
  | 'follow_up_today'
  | 'new_inquiry'
  | 'appointment_confirm'
  | 'missed_appointment'
  | 'treatment_decision';

export type FollowUpActionType =
  | 'call'
  | 'whatsapp'
  | 'confirm_appointment'
  | 'missed_appointment'
  | 'recall';

export type FollowUpStatus = 'pending' | 'completed' | 'cancelled';

export interface FollowUp {
  id: string;
  clinic_id: string;
  patient_id: string;
  treatment_opportunity_id?: string;
  appointment_id?: string;
  assigned_to?: string;
  action_type: FollowUpActionType;
  title: string;
  category: FollowUpCategory;
  due_at: string; // ISO string
  attempt_count: number;
  status: FollowUpStatus;
  created_at: string;
  completed_at?: string;
}

// Hydrated View Model for UI screens
export interface FollowUpItem {
  id: string;
  patient: Patient;
  treatment?: TreatmentOpportunity;
  appointment?: Appointment;
  action_type: FollowUpActionType;
  title: string;
  category: FollowUpCategory;
  due_at: string;
  attempt_count: number;
  status: FollowUpStatus;
  is_overdue: boolean;
  is_due_today: boolean;
}
