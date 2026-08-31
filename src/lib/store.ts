// Dental Follow-Up Assistant V1 - Reactive State & Data Store
'use client';

import {
  Clinic,
  User,
  Patient,
  TreatmentOpportunity,
  Appointment,
  Interaction,
  FollowUp,
  FollowUpItem,
  InteractionOutcome,
  AppointmentStatus,
  TreatmentStatus,
  TreatmentCatalogItem,
  DaySchedule,
  TimePeriod,
  PatientGender,
  PatientSource,
  PREDEFINED_TREATMENTS,
} from './types';
import { 
  evaluateOutcomeRules, 
  createNewPatientFollowUpPlan, 
  createMissedAppointmentFollowUpPlan,
  OutcomeContext 
} from './follow-up-rules';
import { getRelativeDueDateContext } from './formatting';

const CLINIC_ID = 'c0000000-0000-0000-0000-000000000001';
const ASSISTANT_USER_ID = 'u0000000-0000-0000-0000-000000000002';

// -------------------------------------------------------------
// DEFAULT MULTI-PERIOD CLINIC SCHEDULE (Asia/Kolkata)
// Mon-Sat: 09:30 AM - 01:00 PM & 04:00 PM - 08:30 PM
// Sun: Closed
// -------------------------------------------------------------
export const INITIAL_SCHEDULE: DaySchedule[] = [
  {
    day_of_week: 0, // Sunday
    is_open: false,
    periods: [],
  },
  {
    day_of_week: 1, // Monday
    is_open: true,
    periods: [
      { start: '09:30', end: '13:00' },
      { start: '16:00', end: '20:30' },
    ],
  },
  {
    day_of_week: 2, // Tuesday
    is_open: true,
    periods: [
      { start: '09:30', end: '13:00' },
      { start: '16:00', end: '20:30' },
    ],
  },
  {
    day_of_week: 3, // Wednesday
    is_open: true,
    periods: [
      { start: '09:30', end: '13:00' },
      { start: '16:00', end: '20:30' },
    ],
  },
  {
    day_of_week: 4, // Thursday
    is_open: true,
    periods: [
      { start: '09:30', end: '13:00' },
      { start: '16:00', end: '20:30' },
    ],
  },
  {
    day_of_week: 5, // Friday
    is_open: true,
    periods: [
      { start: '09:30', end: '13:00' },
      { start: '16:00', end: '20:30' },
    ],
  },
  {
    day_of_week: 6, // Saturday
    is_open: true,
    periods: [
      { start: '09:30', end: '13:00' },
      { start: '16:00', end: '20:30' },
    ],
  },
];

// -------------------------------------------------------------
// DEFAULT PREDEFINED TREATMENT CATALOG
// -------------------------------------------------------------
export const INITIAL_TREATMENT_CATALOG: TreatmentCatalogItem[] = [
  {
    id: 'tc_implant',
    clinic_id: CLINIC_ID,
    name: 'Dental Implant',
    duration_minutes: 90,
    price: 85000,
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'tc_braces',
    clinic_id: CLINIC_ID,
    name: 'Braces',
    duration_minutes: 30,
    price: 50000,
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'tc_rct',
    clinic_id: CLINIC_ID,
    name: 'Root Canal',
    duration_minutes: 60,
    price: 8000,
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'tc_crown',
    clinic_id: CLINIC_ID,
    name: 'Crown',
    duration_minutes: 60,
    price: 12000,
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'tc_whitening',
    clinic_id: CLINIC_ID,
    name: 'Teeth Whitening',
    duration_minutes: 60,
    price: 8000,
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'tc_cleaning',
    clinic_id: CLINIC_ID,
    name: 'Cleaning',
    duration_minutes: 30,
    price: 1500,
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'tc_extraction',
    clinic_id: CLINIC_ID,
    name: 'Extraction',
    duration_minutes: 30,
    price: 2000,
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'tc_denture',
    clinic_id: CLINIC_ID,
    name: 'Denture',
    duration_minutes: 45,
    price: 25000,
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'tc_veneers',
    clinic_id: CLINIC_ID,
    name: 'Veneers',
    duration_minutes: 60,
    price: 15000,
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'tc_other',
    clinic_id: CLINIC_ID,
    name: 'Other',
    duration_minutes: 30,
    price: 500,
    is_active: true,
    created_at: new Date().toISOString(),
  },
];

// -------------------------------------------------------------
// SEED DATA INITIALIZER (Lucky Dental Care, Proddatur, AP)
// -------------------------------------------------------------
export const INITIAL_CLINIC: Clinic = {
  id: CLINIC_ID,
  name: 'Lucky Dental Care',
  city: 'Proddatur',
  state: 'Andhra Pradesh',
  phone: '+91 94402 12345',
  currency: 'INR',
  timezone: 'Asia/Kolkata',
  working_hours_start: '09:30:00',
  working_hours_end: '20:30:00',
  weekly_schedule: INITIAL_SCHEDULE,
  created_at: new Date().toISOString(),
};

export const INITIAL_USERS: User[] = [
  {
    id: 'u0000000-0000-0000-0000-000000000001',
    clinic_id: CLINIC_ID,
    name: 'Dr. Harsha Vardhan Reddy',
    role: 'dentist',
    phone: '+91 94402 12345',
    created_at: new Date().toISOString(),
  },
  {
    id: ASSISTANT_USER_ID,
    clinic_id: CLINIC_ID,
    name: 'Pooja',
    role: 'assistant',
    phone: '+91 98480 98765',
    created_at: new Date().toISOString(),
  },
];

export const INITIAL_PATIENTS: Patient[] = [
  {
    id: 'p1',
    clinic_id: CLINIC_ID,
    name: 'Rahul Kumar',
    phone: '9876543210',
    whatsapp_number: '9876543210',
    email: 'rahul.k@example.com',
    age: 34,
    gender: 'Male',
    location: 'Proddatur',
    source: 'Google',
    notes: 'Interested in full lower arch implant options.',
    flagged_wrong_number: false,
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'p2',
    clinic_id: CLINIC_ID,
    name: 'Priya Reddy',
    phone: '9848012345',
    whatsapp_number: '9848012345',
    email: 'priya.r@example.com',
    age: 22,
    gender: 'Female',
    location: 'Proddatur',
    source: 'Instagram',
    notes: 'Seeking consultation for ceramic braces alignment.',
    flagged_wrong_number: false,
    created_at: new Date(Date.now() - 2 * 3600000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'p3',
    clinic_id: CLINIC_ID,
    name: 'Vijay Bhaskar',
    phone: '9440156789',
    whatsapp_number: '9440156789',
    email: 'vijay.b@example.com',
    age: 45,
    gender: 'Male',
    location: 'Proddatur',
    source: 'Referral',
    notes: 'Severe toothache in upper left molar.',
    flagged_wrong_number: false,
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'p4',
    clinic_id: CLINIC_ID,
    name: 'Suresh Naidu',
    phone: '9988776655',
    whatsapp_number: '9988776655',
    email: 'suresh.n@example.com',
    age: 29,
    gender: 'Male',
    location: 'Proddatur',
    source: 'Walk-in',
    notes: 'Requested routine cleaning and check-up.',
    flagged_wrong_number: false,
    created_at: new Date(Date.now() - 8 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'p5',
    clinic_id: CLINIC_ID,
    name: 'Anita Rao',
    phone: '9123456780',
    whatsapp_number: '9123456780',
    email: 'anita.rao@example.com',
    age: 38,
    gender: 'Female',
    location: 'Proddatur',
    source: 'Website',
    notes: 'Considering zirconia crown restoration.',
    flagged_wrong_number: false,
    created_at: new Date(Date.now() - 6 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'p6',
    clinic_id: CLINIC_ID,
    name: 'K. Venkat Ramana',
    phone: '9654321098',
    whatsapp_number: '9654321098',
    email: 'venkat.k@example.com',
    age: 58,
    gender: 'Male',
    location: 'Proddatur',
    source: 'Existing Patient',
    notes: 'Full mouth evaluation and denture consultation.',
    flagged_wrong_number: false,
    created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'p7',
    clinic_id: CLINIC_ID,
    name: 'Sunitha Devi',
    phone: '9876123450',
    whatsapp_number: '9876123450',
    email: 'sunitha.d@example.com',
    age: 26,
    gender: 'Female',
    location: 'Proddatur',
    source: 'Facebook',
    notes: 'Completed teeth whitening procedure.',
    flagged_wrong_number: false,
    created_at: new Date(Date.now() - 20 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'p8',
    clinic_id: CLINIC_ID,
    name: 'Ramesh Babu',
    phone: '9000112233',
    whatsapp_number: '9000112233',
    email: 'ramesh.b@example.com',
    age: 42,
    gender: 'Male',
    location: 'Proddatur',
    source: 'Walk-in',
    notes: 'Contact number reached wrong party.',
    flagged_wrong_number: true,
    created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'p9',
    clinic_id: CLINIC_ID,
    name: 'Meena Kumari',
    phone: '9700223344',
    whatsapp_number: '9700223344',
    email: 'meena.k@example.com',
    age: 31,
    gender: 'Female',
    location: 'Proddatur',
    source: 'Referral',
    notes: 'Composite filling scheduled.',
    flagged_wrong_number: false,
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'p10',
    clinic_id: CLINIC_ID,
    name: 'Rajesh Varma',
    phone: '9888334455',
    whatsapp_number: '9888334455',
    email: 'rajesh.v@example.com',
    age: 50,
    gender: 'Male',
    location: 'Proddatur',
    source: 'Google',
    notes: 'Decided to postpone bridge treatment.',
    flagged_wrong_number: false,
    created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const INITIAL_TREATMENTS: TreatmentOpportunity[] = [
  {
    id: 't1',
    clinic_id: CLINIC_ID,
    patient_id: 'p1',
    treatment_name: 'Dental Implant',
    estimated_value: 85000,
    status: 'considering',
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 't2',
    clinic_id: CLINIC_ID,
    patient_id: 'p2',
    treatment_name: 'Braces',
    estimated_value: 55000,
    status: 'considering',
    created_at: new Date(Date.now() - 2 * 3600000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 't3',
    clinic_id: CLINIC_ID,
    patient_id: 'p3',
    treatment_name: 'Root Canal & Crown',
    estimated_value: 12000,
    status: 'scheduled',
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 't4',
    clinic_id: CLINIC_ID,
    patient_id: 'p4',
    treatment_name: 'Cleaning & Scaling',
    estimated_value: 1500,
    status: 'considering',
    created_at: new Date(Date.now() - 8 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 't5',
    clinic_id: CLINIC_ID,
    patient_id: 'p5',
    treatment_name: 'Ceramic Crown',
    estimated_value: 18000,
    status: 'considering',
    created_at: new Date(Date.now() - 6 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 't6',
    clinic_id: CLINIC_ID,
    patient_id: 'p6',
    treatment_name: 'Full Mouth Rehabilitation',
    estimated_value: 150000,
    status: 'considering',
    created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 't7',
    clinic_id: CLINIC_ID,
    patient_id: 'p7',
    treatment_name: 'Teeth Whitening',
    estimated_value: 8000,
    status: 'completed',
    created_at: new Date(Date.now() - 20 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 't8',
    clinic_id: CLINIC_ID,
    patient_id: 'p8',
    treatment_name: 'Toothache Consultation',
    estimated_value: 2000,
    status: 'considering',
    created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 't9',
    clinic_id: CLINIC_ID,
    patient_id: 'p9',
    treatment_name: 'Filling & Polishing',
    estimated_value: 4500,
    status: 'scheduled',
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 't10',
    clinic_id: CLINIC_ID,
    patient_id: 'p10',
    treatment_name: 'Bridge',
    estimated_value: 35000,
    status: 'declined',
    decline_reason: 'Went elsewhere',
    created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const tomorrowDate = new Date();
tomorrowDate.setDate(tomorrowDate.getDate() + 1);
const tomorrowStr = tomorrowDate.toISOString().slice(0, 10);

const yesterdayDate = new Date();
yesterdayDate.setDate(yesterdayDate.getDate() - 1);
const yesterdayStr = yesterdayDate.toISOString().slice(0, 10);

const todayStr = new Date().toISOString().slice(0, 10);

export const INITIAL_APPOINTMENTS: Appointment[] = [
  {
    id: 'a1',
    clinic_id: CLINIC_ID,
    patient_id: 'p3',
    treatment_id: 'tc_rct',
    treatment_opportunity_id: 't3',
    appointment_date: tomorrowStr,
    appointment_time: '17:30:00',
    duration_minutes: 60,
    treatment_name: 'Root Canal Treatment',
    status: 'scheduled',
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: 'a2',
    clinic_id: CLINIC_ID,
    patient_id: 'p4',
    treatment_id: 'tc_cleaning',
    treatment_opportunity_id: 't4',
    appointment_date: yesterdayStr,
    appointment_time: '11:00:00',
    duration_minutes: 30,
    treatment_name: 'Cleaning & Scaling',
    status: 'no_show',
    created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
  },
  {
    id: 'a3',
    clinic_id: CLINIC_ID,
    patient_id: 'p9',
    treatment_id: 'tc_filling',
    treatment_opportunity_id: 't9',
    appointment_date: todayStr,
    appointment_time: '11:30:00',
    duration_minutes: 30,
    treatment_name: 'Dental Filling',
    status: 'confirmed',
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
];

export const INITIAL_INTERACTIONS: Interaction[] = [
  {
    id: 'i1',
    clinic_id: CLINIC_ID,
    patient_id: 'p1',
    treatment_opportunity_id: 't1',
    staff_id: ASSISTANT_USER_ID,
    channel: 'call',
    outcome: 'call_back_later',
    notes: 'Patient asked to be called today morning after discussing with wife',
    occurred_at: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: 'i2',
    clinic_id: CLINIC_ID,
    patient_id: 'p5',
    treatment_opportunity_id: 't5',
    staff_id: ASSISTANT_USER_ID,
    channel: 'call',
    outcome: 'needs_time',
    notes: 'Considering budget for front teeth ceramic crown',
    occurred_at: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
];

export const INITIAL_FOLLOW_UPS: FollowUp[] = [
  {
    id: 'f1',
    clinic_id: CLINIC_ID,
    patient_id: 'p1',
    treatment_opportunity_id: 't1',
    assigned_to: ASSISTANT_USER_ID,
    action_type: 'call',
    title: 'Patient asked to be called today.',
    category: 'follow_up_today',
    due_at: new Date().toISOString(),
    attempt_count: 1,
    status: 'pending',
    created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: 'f2',
    clinic_id: CLINIC_ID,
    patient_id: 'p2',
    treatment_opportunity_id: 't2',
    assigned_to: ASSISTANT_USER_ID,
    action_type: 'call',
    title: 'No contact has been made yet.',
    category: 'new_inquiry',
    due_at: new Date().toISOString(),
    attempt_count: 0,
    status: 'pending',
    created_at: new Date(Date.now() - 2 * 3600000).toISOString(),
  },
  {
    id: 'f3',
    clinic_id: CLINIC_ID,
    patient_id: 'p3',
    treatment_opportunity_id: 't3',
    appointment_id: 'a1',
    assigned_to: ASSISTANT_USER_ID,
    action_type: 'confirm_appointment',
    title: 'Appointment needs confirmation.',
    category: 'appointment_confirm',
    due_at: new Date().toISOString(),
    attempt_count: 0,
    status: 'pending',
    created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: 'f4',
    clinic_id: CLINIC_ID,
    patient_id: 'p4',
    treatment_opportunity_id: 't4',
    appointment_id: 'a2',
    assigned_to: ASSISTANT_USER_ID,
    action_type: 'missed_appointment',
    title: 'Missed yesterday. Needs rescheduling.',
    category: 'missed_appointment',
    due_at: new Date().toISOString(),
    attempt_count: 0,
    status: 'pending',
    created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: 'f5',
    clinic_id: CLINIC_ID,
    patient_id: 'p5',
    treatment_opportunity_id: 't5',
    assigned_to: ASSISTANT_USER_ID,
    action_type: 'call',
    title: 'Follow up on ceramic crown budget decision.',
    category: 'follow_up_today',
    due_at: new Date().toISOString(),
    attempt_count: 1,
    status: 'pending',
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
];

// -------------------------------------------------------------
// LOCAL STATE HOLDER & EVENT EMITTER
// -------------------------------------------------------------
class DentalStore {
  private clinic: Clinic = INITIAL_CLINIC;
  private users: User[] = INITIAL_USERS;
  private patients: Patient[] = INITIAL_PATIENTS;
  private treatments: TreatmentOpportunity[] = INITIAL_TREATMENTS;
  private appointments: Appointment[] = INITIAL_APPOINTMENTS;
  private interactions: Interaction[] = INITIAL_INTERACTIONS;
  private followUps: FollowUp[] = INITIAL_FOLLOW_UPS;
  private treatmentCatalog: TreatmentCatalogItem[] = INITIAL_TREATMENT_CATALOG;
  private schedule: DaySchedule[] = INITIAL_SCHEDULE;
  private listeners: Set<() => void> = new Set();

  constructor() {
    if (typeof window !== 'undefined') {
      this.loadFromLocalStorage();
    }
  }

  private loadFromLocalStorage() {
    try {
      const data = localStorage.getItem('lucky_dental_v1_store') || localStorage.getItem('kadapa_dental_v1_store');
      if (data) {
        const parsed = JSON.parse(data);
        if (parsed.patients) {
          this.patients = parsed.patients.map((p: Patient) => ({
            ...p,
            whatsapp_number: p.whatsapp_number || p.phone,
          }));
        }
        if (parsed.treatments) this.treatments = parsed.treatments;
        if (parsed.appointments) this.appointments = parsed.appointments;
        if (parsed.interactions) this.interactions = parsed.interactions;
        if (parsed.followUps) this.followUps = parsed.followUps;
        if (parsed.treatmentCatalog) this.treatmentCatalog = parsed.treatmentCatalog;
        if (parsed.schedule) this.schedule = parsed.schedule;
      }
    } catch {
      // fallback to initial seed
    }
  }

  private saveToLocalStorage() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(
        'lucky_dental_v1_store',
        JSON.stringify({
          patients: this.patients,
          treatments: this.treatments,
          appointments: this.appointments,
          interactions: this.interactions,
          followUps: this.followUps,
          treatmentCatalog: this.treatmentCatalog,
          schedule: this.schedule,
        })
      );
    } catch {
      // local storage quota or disabled
    }
    this.notify();
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((l) => l());
  }

  // --- TIME & SCHEDULE HELPERS ---

  public timeToMinutes(timeStr: string): number {
    if (!timeStr) return 0;
    const parts = timeStr.split(':');
    const hours = parseInt(parts[0], 10) || 0;
    const minutes = parseInt(parts[1], 10) || 0;
    return hours * 60 + minutes;
  }

  public minutesToTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:00`;
  }

  public getDayOfWeek(dateStr: string): number {
    const parts = dateStr.split('-').map(Number);
    if (parts.length < 3) return 0;
    const [year, month, day] = parts;
    return new Date(Date.UTC(year, month - 1, day, 12, 0, 0)).getUTCDay();
  }

  // --- QUERY METHODS ---

  public getClinic(): Clinic {
    return {
      ...this.clinic,
      weekly_schedule: this.schedule,
    };
  }

  public getSchedule(): DaySchedule[] {
    return [...this.schedule];
  }

  public updateSchedule(newSchedule: DaySchedule[]): void {
    this.schedule = newSchedule;
    this.saveToLocalStorage();
  }

  public getTreatmentCatalog(): TreatmentCatalogItem[] {
    return [...this.treatmentCatalog];
  }

  public getActiveTreatments(): TreatmentCatalogItem[] {
    return this.treatmentCatalog.filter((t) => t.is_active && t.clinic_id === CLINIC_ID);
  }

  public getTreatmentCatalogItem(id: string): TreatmentCatalogItem | undefined {
    return this.treatmentCatalog.find((t) => t.id === id);
  }

  public addTreatmentCatalogItem(params: {
    name: string;
    duration_minutes: number;
    price: number;
  }): TreatmentCatalogItem {
    const newItem: TreatmentCatalogItem = {
      id: `tc_${Date.now()}`,
      clinic_id: CLINIC_ID,
      name: params.name.trim(),
      duration_minutes: Number(params.duration_minutes) || 30,
      price: Number(params.price) || 0,
      is_active: true,
      created_at: new Date().toISOString(),
    };
    this.treatmentCatalog.push(newItem);
    this.saveToLocalStorage();
    return newItem;
  }

  public updateTreatmentCatalogItem(
    id: string,
    updates: Partial<Pick<TreatmentCatalogItem, 'name' | 'duration_minutes' | 'price' | 'is_active'>>
  ): TreatmentCatalogItem | undefined {
    const item = this.treatmentCatalog.find((t) => t.id === id);
    if (item) {
      if (updates.name !== undefined) item.name = updates.name.trim();
      if (updates.duration_minutes !== undefined) item.duration_minutes = Number(updates.duration_minutes);
      if (updates.price !== undefined) item.price = Number(updates.price);
      if (updates.is_active !== undefined) item.is_active = updates.is_active;
      this.saveToLocalStorage();
    }
    return item;
  }

  public toggleTreatmentCatalogStatus(id: string): TreatmentCatalogItem | undefined {
    const item = this.treatmentCatalog.find((t) => t.id === id);
    if (item) {
      item.is_active = !item.is_active;
      this.saveToLocalStorage();
    }
    return item;
  }

  /**
   * Generates strictly validated, collision-free available time slots
   * for a given date and catalog treatment.
   */
  public getAvailableSlots(
    dateStr: string,
    treatmentId: string
  ): {
    status: 'open' | 'closed' | 'no_slots' | 'invalid_treatment';
    slots: string[];
    reason?: string;
  } {
    if (!dateStr || !treatmentId) {
      return { status: 'no_slots', slots: [], reason: 'Please select a date and treatment.' };
    }

    const treatment = this.treatmentCatalog.find(
      (t) => t.id === treatmentId && t.clinic_id === CLINIC_ID
    );
    if (!treatment || !treatment.is_active) {
      return { status: 'invalid_treatment', slots: [], reason: 'Selected treatment is inactive or invalid.' };
    }

    const dayOfWeek = this.getDayOfWeek(dateStr);
    const daySchedule = this.schedule.find((s) => s.day_of_week === dayOfWeek);

    if (!daySchedule || !daySchedule.is_open || daySchedule.periods.length === 0) {
      return { status: 'closed', slots: [], reason: 'Clinic is closed on this day.' };
    }

    const duration = treatment.duration_minutes; // e.g. 30, 60, 90 min
    const slotInterval = 30; // 30-minute interval

    // Existing active appointments on this day (excluding cancelled)
    const existingAppts = this.appointments.filter(
      (a) => a.appointment_date === dateStr && a.status !== 'cancelled'
    );

    const bookedIntervals: { start: number; end: number }[] = existingAppts.map((a) => {
      const startMin = this.timeToMinutes(a.appointment_time);
      let apptDuration = a.duration_minutes;
      if (!apptDuration) {
        const cat = this.treatmentCatalog.find(
          (tc) => tc.id === a.treatment_id || tc.name.toLowerCase() === a.treatment_name.toLowerCase()
        );
        apptDuration = cat?.duration_minutes || 30;
      }
      return {
        start: startMin,
        end: startMin + apptDuration,
      };
    });

    const availableSlots: string[] = [];

    for (const period of daySchedule.periods) {
      const pStart = this.timeToMinutes(period.start);
      const pEnd = this.timeToMinutes(period.end);

      for (let slotStart = pStart; slotStart + duration <= pEnd; slotStart += slotInterval) {
        const slotEnd = slotStart + duration;

        // Overlap test: max(slotStart, b.start) < min(slotEnd, b.end)
        const hasOverlap = bookedIntervals.some(
          (b) => Math.max(slotStart, b.start) < Math.min(slotEnd, b.end)
        );

        if (!hasOverlap) {
          availableSlots.push(this.minutesToTime(slotStart));
        }
      }
    }

    if (availableSlots.length === 0) {
      return { status: 'no_slots', slots: [], reason: 'No available times on this date.' };
    }

    return { status: 'open', slots: availableSlots };
  }

  public getPatients(): Patient[] {
    return [...this.patients].sort((a, b) => b.created_at.localeCompare(a.created_at));
  }

  public getPatientById(id: string): Patient | undefined {
    return this.patients.find((p) => p.id === id);
  }

  public getTreatments(): TreatmentOpportunity[] {
    return [...this.treatments];
  }

  public getTreatmentsForPatient(patientId: string): TreatmentOpportunity[] {
    return this.treatments.filter((t) => t.patient_id === patientId);
  }

  public getAppointments(): Appointment[] {
    return [...this.appointments].sort((a, b) => {
      const dateA = `${a.appointment_date}T${a.appointment_time}`;
      const dateB = `${b.appointment_date}T${b.appointment_time}`;
      return dateA.localeCompare(dateB);
    });
  }

  public getAppointmentsForPatient(patientId: string): Appointment[] {
    return this.appointments
      .filter((a) => a.patient_id === patientId)
      .sort((a, b) => {
        const dateA = `${a.appointment_date}T${a.appointment_time}`;
        const dateB = `${b.appointment_date}T${b.appointment_time}`;
        return dateA.localeCompare(dateB);
      });
  }

  public getInteractions(): Interaction[] {
    return [...this.interactions].sort((a, b) => b.occurred_at.localeCompare(a.occurred_at));
  }

  public getInteractionsForPatient(patientId: string): Interaction[] {
    return this.interactions
      .filter((i) => i.patient_id === patientId)
      .sort((a, b) => b.occurred_at.localeCompare(a.occurred_at));
  }

  public getFollowUps(): FollowUp[] {
    return [...this.followUps];
  }

  public getFollowUpsForPatient(patientId: string): FollowUp[] {
    return this.followUps
      .filter((f) => f.patient_id === patientId)
      .sort((a, b) => b.created_at.localeCompare(a.created_at));
  }

  /**
   * Returns fully hydrated follow-up items for the TODAY screen
   * grouped and strictly prioritized:
   * 1. Overdue follow-ups
   * 2. Follow-ups due today
   * 3. New inquiries
   * 4. Missed appointments
   * 5. Appointment confirmations
   * 6. Other upcoming actions
   */
  public getTodayFollowUps(): FollowUpItem[] {
    const activeFollowUps = this.followUps.filter((f) => f.status === 'pending');
    const now = new Date();
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    const items: FollowUpItem[] = [];

    for (const f of activeFollowUps) {
      const patient = this.patients.find((p) => p.id === f.patient_id);
      if (!patient) continue;

      const treatment = this.treatments.find((t) => t.id === f.treatment_opportunity_id);
      const appointment = this.appointments.find((a) => a.id === f.appointment_id);
      const { isOverdue, isToday } = getRelativeDueDateContext(f.due_at);

      const dueDate = new Date(f.due_at);
      // Surface items due today or in the past (overdue), or high-priority new inquiries / missed appointments
      if (dueDate <= todayEnd || f.category === 'new_inquiry' || f.category === 'missed_appointment') {
        items.push({
          id: f.id,
          patient,
          treatment,
          appointment,
          action_type: f.action_type,
          title: f.title,
          category: f.category,
          due_at: f.due_at,
          attempt_count: f.attempt_count,
          status: f.status,
          is_overdue: isOverdue,
          is_due_today: isToday,
        });
      }
    }

    // Priority Category Rank
    const getCategoryRank = (item: FollowUpItem): number => {
      if (item.is_overdue) return 1;
      if (item.category === 'follow_up_today') return 2;
      if (item.category === 'new_inquiry') return 3;
      if (item.category === 'missed_appointment') return 4;
      if (item.category === 'appointment_confirm') return 5;
      return 6;
    };

    return items.sort((a, b) => {
      const rankA = getCategoryRank(a);
      const rankB = getCategoryRank(b);
      if (rankA !== rankB) return rankA - rankB;
      // Secondary: Due date ascending (oldest first)
      return a.due_at.localeCompare(b.due_at);
    });
  }

  public addTreatment(params: {
    patient_id: string;
    treatment_name: string;
    estimated_value?: number;
  }): TreatmentOpportunity {
    const treatment: TreatmentOpportunity = {
      id: `t_${Date.now()}`,
      clinic_id: CLINIC_ID,
      patient_id: params.patient_id,
      treatment_name: params.treatment_name.trim(),
      estimated_value: params.estimated_value || 0,
      status: 'considering',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.treatments.unshift(treatment);
    this.saveToLocalStorage();
    return treatment;
  }

  public updateTreatmentStatus(
    treatmentId: string,
    status: TreatmentStatus,
    declineReason?: string
  ): TreatmentOpportunity | undefined {
    const tr = this.treatments.find((t) => t.id === treatmentId);
    if (tr) {
      tr.status = status;
      if (declineReason) tr.decline_reason = declineReason;
      tr.updated_at = new Date().toISOString();
      this.saveToLocalStorage();
    }
    return tr;
  }

  // --- MUTATION ACTIONS ---

  /**
   * Fast Patient Intake
   */
  public addPatient(params: {
    name: string;
    phone: string;
    whatsapp_number?: string;
    email?: string;
    age?: number;
    gender?: PatientGender | string;
    location?: string;
    source?: PatientSource | string;
    notes?: string;
    treatment_name?: string;
    estimated_value?: number;
  }): { patient: Patient; followUp: FollowUp } {
    const patientId = `p_${Date.now()}`;
    const cleanPhone = params.phone.replace(/\D/g, '').slice(0, 10);
    const cleanWhatsapp = params.whatsapp_number
      ? params.whatsapp_number.replace(/\D/g, '').slice(0, 10)
      : cleanPhone;

    const newPatient: Patient = {
      id: patientId,
      clinic_id: CLINIC_ID,
      name: params.name.trim(),
      phone: cleanPhone,
      whatsapp_number: cleanWhatsapp,
      email: params.email?.trim() || undefined,
      age: params.age,
      gender: params.gender,
      location: params.location?.trim() || undefined,
      source: params.source,
      notes: params.notes?.trim() || undefined,
      flagged_wrong_number: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    this.patients.unshift(newPatient);

    let newTreatment: TreatmentOpportunity | undefined;
    if (params.treatment_name) {
      newTreatment = {
        id: `t_${Date.now()}`,
        clinic_id: CLINIC_ID,
        patient_id: patientId,
        treatment_name: params.treatment_name.trim(),
        estimated_value: params.estimated_value || 0,
        status: 'considering',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      this.treatments.unshift(newTreatment);
    }

    // Auto-generate new inquiry follow-up
    const plan = createNewPatientFollowUpPlan(params.treatment_name);
    const followUpId = `f_${Date.now()}`;
    const newFollowUp: FollowUp = {
      id: followUpId,
      clinic_id: CLINIC_ID,
      patient_id: patientId,
      treatment_opportunity_id: newTreatment?.id,
      assigned_to: ASSISTANT_USER_ID,
      action_type: plan.action_type || 'call',
      title: plan.title || 'No contact has been made yet.',
      category: plan.category || 'new_inquiry',
      due_at: plan.due_at || new Date().toISOString(),
      attempt_count: 0,
      status: 'pending',
      created_at: new Date().toISOString(),
    };

    this.followUps.unshift(newFollowUp);
    this.saveToLocalStorage();

    return { patient: newPatient, followUp: newFollowUp };
  }

  /**
   * Records contact outcome and executes deterministic state side-effects
   */
  public recordOutcome(params: {
    followUpId: string;
    channel: 'call' | 'whatsapp' | 'sms' | 'in_person';
    outcome: InteractionOutcome;
    context?: OutcomeContext;
    notes?: string;
  }): { interaction: Interaction; nextFollowUp?: FollowUp } {
    const currentFollowUp = this.followUps.find((f) => f.id === params.followUpId);
    if (!currentFollowUp) {
      throw new Error(`Follow-up ${params.followUpId} not found`);
    }

    // 1. Mark current follow-up completed
    currentFollowUp.status = 'completed';
    currentFollowUp.completed_at = new Date().toISOString();

    const treatment = this.treatments.find((t) => t.id === currentFollowUp.treatment_opportunity_id);
    const appointment = this.appointments.find((a) => a.id === currentFollowUp.appointment_id);

    // 2. Record Interaction
    const interaction: Interaction = {
      id: `i_${Date.now()}`,
      clinic_id: CLINIC_ID,
      patient_id: currentFollowUp.patient_id,
      treatment_opportunity_id: currentFollowUp.treatment_opportunity_id,
      staff_id: ASSISTANT_USER_ID,
      channel: params.channel,
      outcome: params.outcome,
      notes: params.notes?.trim() || undefined,
      occurred_at: new Date().toISOString(),
    };
    this.interactions.unshift(interaction);

    // 3. Evaluate deterministic rules
    const outcomeCtx: OutcomeContext = {
      currentFollowUp,
      treatmentOpportunity: treatment,
      appointment,
      ...params.context,
    };

    const plan = evaluateOutcomeRules(params.outcome, outcomeCtx);

    // 4. Update Treatment status if applicable
    if (treatment && plan.treatment_status_update) {
      treatment.status = plan.treatment_status_update;
      if (plan.decline_reason) {
        treatment.decline_reason = plan.decline_reason;
      }
      treatment.updated_at = new Date().toISOString();
    }

    // 5. Flag wrong number if applicable
    if (plan.flag_wrong_number) {
      const patient = this.patients.find((p) => p.id === currentFollowUp.patient_id);
      if (patient) {
        patient.flagged_wrong_number = true;
        patient.updated_at = new Date().toISOString();
      }
    }

    // 6. If appointment was booked directly from outcome
    if (params.outcome === 'appointment_booked' && params.context?.bookedAppointmentDate) {
      try {
        const apptDate = params.context.bookedAppointmentDate;
        const apptTime = params.context.bookedAppointmentTime || '11:00:00';
        
        // Find suitable catalog treatment
        let treatmentId: string | undefined;
        if (treatment) {
          const match = this.treatmentCatalog.find(
            (tc) => tc.name.toLowerCase() === treatment.treatment_name.toLowerCase() && tc.is_active
          );
          if (match) treatmentId = match.id;
        }
        if (!treatmentId) {
          treatmentId = this.getActiveTreatments()[0]?.id || 'tc_consultation';
        }

        this.addAppointment({
          patient_id: currentFollowUp.patient_id,
          treatment_id: treatmentId,
          treatment_opportunity_id: treatment?.id,
          appointment_date: apptDate,
          appointment_time: apptTime,
        });
      } catch (err) {
        console.warn('Could not auto-add validated appointment from outcome:', err);
      }
    }

    // 7. Create Next Follow-Up if needed
    let nextFollowUp: FollowUp | undefined;
    if (plan.shouldCreate && plan.due_at) {
      nextFollowUp = {
        id: `f_${Date.now() + 1}`,
        clinic_id: CLINIC_ID,
        patient_id: currentFollowUp.patient_id,
        treatment_opportunity_id: currentFollowUp.treatment_opportunity_id,
        appointment_id: currentFollowUp.appointment_id,
        assigned_to: ASSISTANT_USER_ID,
        action_type: plan.action_type || 'call',
        title: plan.title || 'Scheduled follow-up.',
        category: plan.category || 'follow_up_today',
        due_at: plan.due_at,
        attempt_count: plan.attempt_count ?? 0,
        status: 'pending',
        created_at: new Date().toISOString(),
      };
      this.followUps.unshift(nextFollowUp);
    }

    this.saveToLocalStorage();
    return { interaction, nextFollowUp };
  }

  /**
   * Fast Appointment Booking with strict catalog duration & collision validation
   */
  public addAppointment(params: {
    patient_id: string;
    treatment_id?: string;
    treatment_name?: string;
    treatment_opportunity_id?: string;
    appointment_date: string; // YYYY-MM-DD
    appointment_time: string; // HH:mm:ss or HH:mm
  }): Appointment {
    // 1. Patient check
    const patient = this.patients.find((p) => p.id === params.patient_id);
    if (!patient) {
      throw new Error('Patient not found.');
    }

    // 2. Treatment validation: Must resolve from catalog
    let treatmentItem: TreatmentCatalogItem | undefined;
    if (params.treatment_id) {
      treatmentItem = this.treatmentCatalog.find(
        (t) => t.id === params.treatment_id && t.clinic_id === CLINIC_ID
      );
    } else if (params.treatment_name) {
      treatmentItem = this.treatmentCatalog.find(
        (t) => t.name.toLowerCase() === params.treatment_name!.toLowerCase() && t.clinic_id === CLINIC_ID
      );
    }

    if (!treatmentItem) {
      throw new Error('Invalid treatment: Treatment must be selected from the clinic treatment catalog.');
    }
    if (!treatmentItem.is_active) {
      throw new Error('Treatment is currently inactive.');
    }
    if (treatmentItem.clinic_id !== CLINIC_ID) {
      throw new Error('Treatment belongs to another clinic.');
    }

    // Treatment duration MUST come from the database/catalog, not from a client-supplied value
    const duration = treatmentItem.duration_minutes;

    // 3. Date & Schedule check
    const dateStr = params.appointment_date;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      throw new Error('Invalid appointment date format.');
    }

    const todayStr = new Date().toISOString().slice(0, 10);
    if (dateStr < todayStr) {
      throw new Error('Appointment date must be today or a future date.');
    }

    const dayOfWeek = this.getDayOfWeek(dateStr);
    const daySchedule = this.schedule.find((s) => s.day_of_week === dayOfWeek);
    if (!daySchedule || !daySchedule.is_open || daySchedule.periods.length === 0) {
      throw new Error('Clinic is closed on this day.');
    }

    // 4. Time within period check
    const startMinutes = this.timeToMinutes(params.appointment_time);
    const endMinutes = startMinutes + duration;

    // Must fit entirely within one period
    const matchingPeriod = daySchedule.periods.find((period) => {
      const pStart = this.timeToMinutes(period.start);
      const pEnd = this.timeToMinutes(period.end);
      return startMinutes >= pStart && endMinutes <= pEnd;
    });

    if (!matchingPeriod) {
      throw new Error(
        'Selected appointment time is outside working hours, during a closed/break period, or duration exceeds closing time.'
      );
    }

    // Must align with slot interval (30 min) from period start
    const pStartMinutes = this.timeToMinutes(matchingPeriod.start);
    if ((startMinutes - pStartMinutes) % 30 !== 0) {
      throw new Error('Appointment time must align with the 30-minute schedule interval.');
    }

    // 5. Double booking check (overlapping appointments)
    const existingAppts = this.appointments.filter(
      (a) => a.appointment_date === dateStr && a.status !== 'cancelled'
    );

    for (const existing of existingAppts) {
      const exStart = this.timeToMinutes(existing.appointment_time);
      let exDuration = existing.duration_minutes;
      if (!exDuration) {
        const cat = this.treatmentCatalog.find(
          (tc) => tc.id === existing.treatment_id || tc.name.toLowerCase() === existing.treatment_name.toLowerCase()
        );
        exDuration = cat?.duration_minutes || 30;
      }
      const exEnd = exStart + exDuration;

      if (Math.max(startMinutes, exStart) < Math.min(endMinutes, exEnd)) {
        throw new Error(
          `Time slot overlaps with an existing appointment (${existing.treatment_name} at ${existing.appointment_time.slice(0, 5)}).`
        );
      }
    }

    const formattedTime = this.minutesToTime(startMinutes);
    const newAppt: Appointment = {
      id: `a_${Date.now()}`,
      clinic_id: CLINIC_ID,
      patient_id: params.patient_id,
      treatment_id: treatmentItem.id,
      treatment_opportunity_id: params.treatment_opportunity_id,
      appointment_date: params.appointment_date,
      appointment_time: formattedTime,
      duration_minutes: duration,
      treatment_name: treatmentItem.name,
      status: 'scheduled',
      created_at: new Date().toISOString(),
    };
    this.appointments.unshift(newAppt);

    // If patient has pending sales follow-ups, close them as appointment is booked
    this.followUps
      .filter((f) => f.patient_id === params.patient_id && f.status === 'pending')
      .forEach((f) => {
        f.status = 'completed';
        f.completed_at = new Date().toISOString();
      });

    this.saveToLocalStorage();
    return newAppt;
  }

  /**
   * Updates Appointment status with automatic follow-up side effects
   */
  public updateAppointmentStatus(appointmentId: string, newStatus: AppointmentStatus): Appointment | undefined {
    const appt = this.appointments.find((a) => a.id === appointmentId);
    if (!appt) return undefined;

    appt.status = newStatus;
    appt.updated_at = new Date().toISOString();

    // If marked confirmed, complete any pending confirmation follow-up
    if (newStatus === 'confirmed') {
      this.followUps
        .filter((f) => f.appointment_id === appointmentId && f.status === 'pending')
        .forEach((f) => {
          f.status = 'completed';
          f.completed_at = new Date().toISOString();
        });
    }

    // If marked no-show, immediately create a reschedule recovery follow-up on Today
    if (newStatus === 'no_show') {
      const plan = createMissedAppointmentFollowUpPlan();
      const followUp: FollowUp = {
        id: `f_${Date.now()}`,
        clinic_id: CLINIC_ID,
        patient_id: appt.patient_id,
        treatment_opportunity_id: appt.treatment_opportunity_id,
        appointment_id: appt.id,
        assigned_to: ASSISTANT_USER_ID,
        action_type: 'missed_appointment',
        title: plan.title || 'Missed yesterday. Needs rescheduling.',
        category: 'missed_appointment',
        due_at: new Date().toISOString(),
        attempt_count: 0,
        status: 'pending',
        created_at: new Date().toISOString(),
      };
      this.followUps.unshift(followUp);
    }

    this.saveToLocalStorage();
    return appt;
  }

  /**
   * Updates patient phone and clears wrong number flag
   */
  public updatePatientPhone(patientId: string, newPhone: string): void {
    const patient = this.patients.find((p) => p.id === patientId);
    if (patient) {
      patient.phone = newPhone.trim();
      patient.flagged_wrong_number = false;
      patient.updated_at = new Date().toISOString();
      this.saveToLocalStorage();
    }
  }

  /**
   * Schedule manual follow-up from patient detail
   */
  public scheduleManualFollowUp(params: {
    patient_id: string;
    due_at: string;
    title?: string;
    treatment_opportunity_id?: string;
  }): FollowUp {
    const todayStr = new Date().toISOString().slice(0, 10);
    const dueDateStr = params.due_at.slice(0, 10);
    if (dueDateStr < todayStr) {
      throw new Error('Follow-up date must be today or a future date.');
    }

    const followUp: FollowUp = {
      id: `f_${Date.now()}`,
      clinic_id: CLINIC_ID,
      patient_id: params.patient_id,
      treatment_opportunity_id: params.treatment_opportunity_id,
      assigned_to: ASSISTANT_USER_ID,
      action_type: 'call',
      title: params.title || 'Scheduled follow-up.',
      category: 'follow_up_today',
      due_at: params.due_at,
      attempt_count: 0,
      status: 'pending',
      created_at: new Date().toISOString(),
    };
    this.followUps.unshift(followUp);
    this.saveToLocalStorage();
    return followUp;
  }

  /**
   * Mark treatment not interested from patient detail
   */
  public markTreatmentDeclined(patientId: string, reason: string = 'Decided not to proceed'): void {
    this.treatments
      .filter((t) => t.patient_id === patientId && t.status === 'considering')
      .forEach((t) => {
        t.status = 'declined';
        t.decline_reason = reason;
        t.updated_at = new Date().toISOString();
      });

    this.followUps
      .filter((f) => f.patient_id === patientId && f.status === 'pending')
      .forEach((f) => {
        f.status = 'completed';
        f.completed_at = new Date().toISOString();
      });

    this.saveToLocalStorage();
  }

  /**
   * Dentist / Owner Summary calculation
   */
  public getSummaryMetrics() {
    const activeTreatments = this.treatments.filter((t) => t.status === 'considering');
    const totalPotentialValue = activeTreatments.reduce((sum, t) => sum + (t.estimated_value || 0), 0);

    const pendingFollowUps = this.followUps.filter((f) => f.status === 'pending');
    const now = new Date();
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    let dueTodayCount = 0;
    let overdueCount = 0;

    pendingFollowUps.forEach((f) => {
      const dueDate = new Date(f.due_at);
      const { isOverdue, isToday } = getRelativeDueDateContext(f.due_at);
      if (isOverdue) overdueCount++;
      if (isToday || dueDate <= todayEnd) dueTodayCount++;
    });

    const patientTreatmentList = activeTreatments.map((t) => {
      const patient = this.patients.find((p) => p.id === t.patient_id);
      const openFollowUp = this.followUps.find(
        (f) => f.treatment_opportunity_id === t.id && f.status === 'pending'
      );
      return {
        treatment: t,
        patient,
        nextFollowUp: openFollowUp,
      };
    });

    return {
      totalPotentialValue,
      consideringCount: activeTreatments.length,
      dueTodayCount,
      overdueCount,
      patientTreatmentList,
    };
  }

  /**
   * Resets data to default seed
   */
  public resetToDemoData(): void {
    this.patients = [...INITIAL_PATIENTS];
    this.treatments = [...INITIAL_TREATMENTS];
    this.appointments = [...INITIAL_APPOINTMENTS];
    this.interactions = [...INITIAL_INTERACTIONS];
    this.followUps = [...INITIAL_FOLLOW_UPS];
    this.treatmentCatalog = [...INITIAL_TREATMENT_CATALOG];
    this.schedule = [...INITIAL_SCHEDULE];
    this.saveToLocalStorage();
  }
}

// Global Singleton
export const dentalStore = new DentalStore();
