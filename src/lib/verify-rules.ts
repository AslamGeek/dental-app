// Automated Rule and Scenario Verification Suite for Kadapa Dental Assistant V1
import { evaluateOutcomeRules, createNewPatientFollowUpPlan, createMissedAppointmentFollowUpPlan } from './follow-up-rules';
import { formatRupee, formatPhoneNumber, formatDateDDMMYYYY, formatTime12H, getRelativeDueDateContext } from './formatting';
import { FollowUp } from './types';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  }
  console.log(`✅ PASSED: ${message}`);
}

console.log('--- RUNNING DENTAL FOLLOW-UP ASSISTANT V1 VERIFICATION ---');

// 1. Currency Formatting
assert(formatRupee(85000) === '₹85,000', 'Rupee formatting ₹85,000');
assert(formatRupee(240000) === '₹2,40,000', 'Indian Rupee formatting ₹2,40,000');
assert(formatRupee(1500) === '₹1,500', 'Rupee formatting ₹1,500');

// 2. Phone Formatting
assert(formatPhoneNumber('9876543210') === '98765 43210', 'Phone formatting 98765 43210');
assert(formatPhoneNumber('+919876543210') === '+91 98765 43210', 'Phone formatting +91 98765 43210');

// 3. Date & Time Formatting
assert(formatDateDDMMYYYY('2026-08-30T10:00:00Z') === '30/08/2026', 'DD/MM/YYYY date formatting');
assert(formatTime12H('17:30:00') === '5:30 PM', '12H time 17:30:00 -> 5:30 PM');
assert(formatTime12H('11:00:00') === '11:00 AM', '12H time 11:00:00 -> 11:00 AM');

// 4. Test Scenario 1: New patient intake
const newPatientPlan = createNewPatientFollowUpPlan('Dental Implant');
assert(newPatientPlan.shouldCreate === true, 'New patient plan creates follow-up');
assert(newPatientPlan.category === 'new_inquiry', 'New patient category is new_inquiry');
assert(newPatientPlan.action_type === 'call', 'New patient action is call');

// 5. Test Scenario 2: Needs time (+3 days)
const dummyFollowUp: FollowUp = {
  id: 'f_test',
  clinic_id: 'c1',
  patient_id: 'p1',
  action_type: 'call',
  title: 'Call',
  category: 'follow_up_today',
  due_at: new Date().toISOString(),
  attempt_count: 0,
  status: 'pending',
  created_at: new Date().toISOString(),
};
const needsTimePlan = evaluateOutcomeRules('needs_time', { currentFollowUp: dummyFollowUp });
assert(needsTimePlan.shouldCreate === true, 'Needs time creates follow-up');
assert(needsTimePlan.category === 'treatment_decision', 'Needs time category is treatment_decision');
const dueDate = new Date(needsTimePlan.due_at!);
const now = new Date();
const diffDays = Math.round((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
assert(diffDays >= 2 && diffDays <= 4, 'Needs time is scheduled ~3 days later');

// 6. Test Scenario 3: No answer progression
const noAnswer1 = evaluateOutcomeRules('no_answer', { currentFollowUp: { ...dummyFollowUp, attempt_count: 0 } });
assert(noAnswer1.attempt_count === 1, 'Attempt 0 -> Attempt 1 on No Answer');

const noAnswer2 = evaluateOutcomeRules('no_answer', { currentFollowUp: { ...dummyFollowUp, attempt_count: 1 } });
assert(noAnswer2.attempt_count === 2, 'Attempt 1 -> Attempt 2 on No Answer');

const noAnswer3 = evaluateOutcomeRules('no_answer', { currentFollowUp: { ...dummyFollowUp, attempt_count: 2 } });
assert(noAnswer3.attempt_count === 3, 'Attempt 2 -> Attempt 3 on No Answer');

// 7. Test Scenario 4: Callback requested
const callbackPlan = evaluateOutcomeRules('call_back_later', { 
  currentFollowUp: dummyFollowUp, 
  callbackChoice: 'tomorrow' 
});
assert(callbackPlan.shouldCreate === true, 'Callback plan creates follow-up');
assert(callbackPlan.title === 'Patient requested callback.', 'Callback title matches');

// 8. Test Scenario 5: Appointment booked
const apptBookedPlan = evaluateOutcomeRules('appointment_booked', { currentFollowUp: dummyFollowUp });
assert(apptBookedPlan.shouldCreate === false, 'Appointment booked stops active sales follow-up');
assert(apptBookedPlan.treatment_status_update === 'scheduled', 'Treatment marked scheduled');

// 9. Test Scenario 6: No-Show recovery
const noShowPlan = createMissedAppointmentFollowUpPlan();
assert(noShowPlan.shouldCreate === true, 'No-show recovery creates follow-up');
assert(noShowPlan.category === 'missed_appointment', 'No-show category is missed_appointment');

// 10. Test Scenario 7: Wrong number
const wrongNumberPlan = evaluateOutcomeRules('wrong_number', { currentFollowUp: dummyFollowUp });
assert(wrongNumberPlan.flag_wrong_number === true, 'Wrong number flags patient record');

console.log('--- ALL SCENARIOS & ENGINE RULES VERIFIED SUCCESSFULLY ---');
