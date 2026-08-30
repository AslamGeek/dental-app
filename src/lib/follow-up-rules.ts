// Dental Follow-Up Assistant V1 - Centralized Follow-Up Rules Engine

import { 
  FollowUp, 
  InteractionOutcome, 
  FollowUpActionType, 
  FollowUpCategory,
  TreatmentOpportunity,
  Appointment
} from './types';

/**
 * Calculates a standard IST morning clinic follow-up time (11:00 AM)
 * with a given offset in days from reference date.
 */
export function getOffsetMorningTime(daysOffset: number, baseDate: Date = new Date()): Date {
  const result = new Date(baseDate.getTime());
  result.setDate(result.getDate() + daysOffset);
  result.setHours(11, 0, 0, 0);
  return result;
}

/**
 * Calculates a standard IST afternoon clinic follow-up time (4:00 PM) for later today.
 */
export function getLaterTodayTime(baseDate: Date = new Date()): Date {
  const result = new Date(baseDate.getTime());
  const currentHour = result.getHours();
  if (currentHour < 16) {
    result.setHours(16, 0, 0, 0);
  } else {
    // If already past 4 PM, add 2 hours or set to 7:00 PM
    result.setHours(Math.min(currentHour + 2, 20), 0, 0, 0);
  }
  return result;
}

export interface NextFollowUpPlan {
  shouldCreate: boolean;
  action_type?: FollowUpActionType;
  title?: string;
  category?: FollowUpCategory;
  due_at?: string; // ISO string
  attempt_count?: number;
  treatment_status_update?: 'considering' | 'accepted' | 'scheduled' | 'completed' | 'declined';
  decline_reason?: string;
  flag_wrong_number?: boolean;
}

export interface OutcomeContext {
  currentFollowUp?: FollowUp;
  treatmentOpportunity?: TreatmentOpportunity;
  appointment?: Appointment;
  callbackChoice?: 'later_today' | 'tomorrow' | 'custom';
  customCallbackDateTime?: string; // ISO string
  declineReason?: string;
  bookedAppointmentDate?: string;
  bookedAppointmentTime?: string;
}

/**
 * Evaluates the outcome of a contact event and deterministically
 * decides the next action, due timestamp, and database side-effects.
 */
export function evaluateOutcomeRules(
  outcome: InteractionOutcome,
  context: OutcomeContext = {}
): NextFollowUpPlan {
  const currentAttempts = context.currentFollowUp?.attempt_count ?? 0;

  switch (outcome) {
    case 'no_answer': {
      let daysOffset = 1;
      let nextAttempt = currentAttempts + 1;

      if (nextAttempt === 1) {
        daysOffset = 1; // Attempt 1: Next day
      } else if (nextAttempt === 2) {
        daysOffset = 3; // Attempt 2: 3 days later
      } else {
        daysOffset = 7; // Attempt 3+: 7 days later
      }

      const due = getOffsetMorningTime(daysOffset);
      return {
        shouldCreate: true,
        action_type: 'call',
        title: `Follow-up attempt #${nextAttempt + 1} - No answer previously.`,
        category: 'follow_up_today',
        due_at: due.toISOString(),
        attempt_count: nextAttempt,
      };
    }

    case 'call_back_later': {
      let due = getOffsetMorningTime(1); // default tomorrow 11 AM

      if (context.callbackChoice === 'later_today') {
        due = getLaterTodayTime();
      } else if (context.callbackChoice === 'tomorrow') {
        due = getOffsetMorningTime(1);
      } else if (context.callbackChoice === 'custom' && context.customCallbackDateTime) {
        due = new Date(context.customCallbackDateTime);
      }

      return {
        shouldCreate: true,
        action_type: 'call',
        title: 'Patient requested callback.',
        category: 'follow_up_today',
        due_at: due.toISOString(),
        attempt_count: 0,
      };
    }

    case 'needs_time': {
      const due = getOffsetMorningTime(3); // Follow up in 3 days
      return {
        shouldCreate: true,
        action_type: 'call',
        title: 'Patient considering treatment. Follow up on decision.',
        category: 'treatment_decision',
        due_at: due.toISOString(),
        attempt_count: 0,
        treatment_status_update: 'considering',
      };
    }

    case 'interested': {
      // Default to follow up tomorrow unless appointment is explicitly booked
      const due = getOffsetMorningTime(1);
      return {
        shouldCreate: true,
        action_type: 'call',
        title: 'Patient interested. Finalize appointment & schedule.',
        category: 'follow_up_today',
        due_at: due.toISOString(),
        attempt_count: 0,
        treatment_status_update: 'considering',
      };
    }

    case 'appointment_booked': {
      // Closes active sales follow-up without creating a new follow-up task
      return {
        shouldCreate: false,
        treatment_status_update: 'scheduled',
      };
    }

    case 'not_interested': {
      // Closes active follow-up
      return {
        shouldCreate: false,
        treatment_status_update: 'declined',
        decline_reason: context.declineReason || 'Decided not to proceed',
      };
    }

    case 'wrong_number': {
      return {
        shouldCreate: true,
        action_type: 'call',
        title: 'Phone number incorrect. Verify contact details.',
        category: 'follow_up_today',
        due_at: new Date().toISOString(),
        attempt_count: 0,
        flag_wrong_number: true,
      };
    }

    case 'custom':
    default: {
      const due = context.customCallbackDateTime
        ? new Date(context.customCallbackDateTime)
        : getOffsetMorningTime(2);
      return {
        shouldCreate: true,
        action_type: 'call',
        title: 'Scheduled follow-up.',
        category: 'follow_up_today',
        due_at: due.toISOString(),
        attempt_count: 0,
      };
    }
  }
}

/**
 * Creates the initial follow-up plan for a newly registered patient.
 */
export function createNewPatientFollowUpPlan(treatmentName?: string): NextFollowUpPlan {
  return {
    shouldCreate: true,
    action_type: 'call',
    title: treatmentName
      ? `New inquiry for ${treatmentName}. Initial contact.`
      : 'No contact has been made yet.',
    category: 'new_inquiry',
    due_at: new Date().toISOString(),
    attempt_count: 0,
    treatment_status_update: 'considering',
  };
}

/**
 * Creates a missed-appointment recovery follow-up plan.
 */
export function createMissedAppointmentFollowUpPlan(): NextFollowUpPlan {
  return {
    shouldCreate: true,
    action_type: 'call',
    title: 'Missed yesterday. Needs rescheduling.',
    category: 'missed_appointment',
    due_at: new Date().toISOString(),
    attempt_count: 0,
  };
}

/**
 * Creates an appointment confirmation follow-up plan for upcoming slots.
 */
export function createAppointmentConfirmationFollowUpPlan(
  appointmentDateStr: string,
  appointmentTimeStr: string
): NextFollowUpPlan {
  return {
    shouldCreate: true,
    action_type: 'confirm_appointment',
    title: `Appointment confirmation for ${appointmentDateStr} at ${appointmentTimeStr}.`,
    category: 'appointment_confirm',
    due_at: new Date().toISOString(),
    attempt_count: 0,
  };
}
