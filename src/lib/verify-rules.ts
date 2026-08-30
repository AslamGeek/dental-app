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

// =============================================================
// APPOINTMENT SCHEDULING, DURATION & DOUBLE-BOOKING TESTS
// =============================================================
import { dentalStore, INITIAL_TREATMENT_CATALOG } from './store';

dentalStore.resetToDemoData();

// 11. Treatment Catalog Test
const activeCatalog = dentalStore.getActiveTreatments();
assert(activeCatalog.length === 9, 'Catalog contains 9 predefined active treatments');
assert(activeCatalog.some((t) => t.name === 'Dental Implant' && t.duration_minutes === 90 && t.price === 85000), 'Dental Implant 90 min / ₹85,000 in catalog');
assert(activeCatalog.some((t) => t.name === 'Root Canal Treatment' && t.duration_minutes === 60 && t.price === 8000), 'Root Canal Treatment 60 min / ₹8,000 in catalog');
assert(activeCatalog.some((t) => t.name === 'Cleaning & Scaling' && t.duration_minutes === 30 && t.price === 1500), 'Cleaning & Scaling 30 min / ₹1,500 in catalog');

// 12. Day of week & Sunday Closed Test
// 2026-08-30 is Sunday
const sundaySlots = dentalStore.getAvailableSlots('2026-08-30', 'tc_consultation');
assert(sundaySlots.status === 'closed', 'Sunday is closed');
assert(sundaySlots.slots.length === 0, 'Sunday has 0 available slots');

// 13. Monday (2026-08-31) Working Hours & Multi-Period Slot Generation Test
// Monday morning: 09:30 to 13:00, evening: 16:00 to 20:30
const monday30MinSlots = dentalStore.getAvailableSlots('2026-08-31', 'tc_consultation');
assert(monday30MinSlots.status === 'open', 'Monday 30 min slots are open');
assert(monday30MinSlots.slots.includes('09:30:00'), 'Morning session starts at 09:30 AM');
assert(monday30MinSlots.slots.includes('12:30:00'), '30 min slot at 12:30 PM (ends 13:00 PM)');
assert(!monday30MinSlots.slots.includes('13:00:00'), 'No slot during lunch break at 01:00 PM');
assert(!monday30MinSlots.slots.includes('14:00:00'), 'No slot during lunch break at 02:00 PM');
assert(monday30MinSlots.slots.includes('16:00:00'), 'Evening session starts at 04:00 PM');
assert(monday30MinSlots.slots.includes('20:00:00'), '30 min slot at 08:00 PM (ends 20:30 PM)');
assert(!monday30MinSlots.slots.includes('20:30:00'), 'No slot at or after clinic closing 08:30 PM');

// 14. Treatment Duration Affecting Available Times (Dental Implant: 90 mins)
const implantSlots = dentalStore.getAvailableSlots('2026-08-31', 'tc_implant');
assert(implantSlots.status === 'open', 'Dental Implant (90 min) slots are open');
assert(implantSlots.slots.includes('09:30:00'), '90 min slot starts at 09:30 (ends 11:00)');
assert(implantSlots.slots.includes('11:30:00'), '90 min slot starts at 11:30 (ends 13:00)');
assert(!implantSlots.slots.includes('12:00:00'), '90 min slot CANNOT start at 12:00 PM (would exceed 13:00 lunch closing)');
assert(!implantSlots.slots.includes('12:30:00'), '90 min slot CANNOT start at 12:30 PM (would exceed 13:00 lunch closing)');
assert(implantSlots.slots.includes('19:00:00'), '90 min slot starts at 07:00 PM (ends 20:30)');
assert(!implantSlots.slots.includes('19:30:00'), '90 min slot CANNOT start at 07:30 PM (would exceed 20:30 evening closing)');
assert(!implantSlots.slots.includes('20:00:00'), '90 min slot CANNOT start at 08:00 PM (would exceed 20:30 evening closing)');

// 15. Double Booking Prevention Test
// Book an appointment at 10:00 AM for 60 mins on 2026-08-31
dentalStore.addAppointment({
  patient_id: 'p1',
  treatment_id: 'tc_rct', // 60 min (10:00 - 11:00)
  appointment_date: '2026-08-31',
  appointment_time: '10:00:00',
});

// Verify 10:00 AM slot is no longer offered for any treatment on that day
const postBooking30Min = dentalStore.getAvailableSlots('2026-08-31', 'tc_consultation');
assert(!postBooking30Min.slots.includes('10:00:00'), '10:00 AM slot is excluded after booking');
assert(!postBooking30Min.slots.includes('10:30:00'), '10:30 AM slot is excluded (overlaps 10:00-11:00 appointment)');
assert(postBooking30Min.slots.includes('09:30:00'), '09:30 AM 30-min slot is available (ends 10:00 AM)');
assert(postBooking30Min.slots.includes('11:00:00'), '11:00 AM slot is available (starts when 10:00-11:00 finishes)');

// Verify 60-min treatment cannot start at 09:30 (09:30-10:30 would overlap 10:00-11:00)
const postBooking60Min = dentalStore.getAvailableSlots('2026-08-31', 'tc_rct');
assert(!postBooking60Min.slots.includes('09:30:00'), '60 min slot cannot start at 09:30 AM (overlaps with 10:00 AM appointment)');
assert(postBooking60Min.slots.includes('11:00:00'), '60 min slot can start at 11:00 AM');

// 16. Server-grade Store Validation Rejections
let rejectedClosedDay = false;
try {
  dentalStore.addAppointment({
    patient_id: 'p1',
    treatment_id: 'tc_consultation',
    appointment_date: '2026-08-30', // Sunday
    appointment_time: '10:00:00',
  });
} catch (e: any) {
  rejectedClosedDay = true;
  assert(e.message.includes('Clinic is closed'), 'addAppointment throws on Sunday');
}
assert(rejectedClosedDay, 'Sunday appointment was strictly rejected');

let rejectedOverlap = false;
try {
  dentalStore.addAppointment({
    patient_id: 'p2',
    treatment_id: 'tc_consultation',
    appointment_date: '2026-08-31',
    appointment_time: '10:30:00', // Overlaps with 10:00 - 11:00
  });
} catch (e: any) {
  rejectedOverlap = true;
  assert(e.message.includes('overlaps with an existing appointment'), 'addAppointment throws on overlapping booking');
}
assert(rejectedOverlap, 'Overlapping appointment was strictly rejected');

let rejectedLunchTime = false;
try {
  dentalStore.addAppointment({
    patient_id: 'p2',
    treatment_id: 'tc_consultation',
    appointment_date: '2026-08-31',
    appointment_time: '14:00:00', // Lunch break
  });
} catch (e: any) {
  rejectedLunchTime = true;
}
assert(rejectedLunchTime, 'Lunch break appointment was strictly rejected');

let rejectedDurationOverrun = false;
try {
  dentalStore.addAppointment({
    patient_id: 'p2',
    treatment_id: 'tc_implant', // 90 min
    appointment_date: '2026-08-31',
    appointment_time: '12:30:00', // Exceeds 13:00
  });
} catch (e: any) {
  rejectedDurationOverrun = true;
}
assert(rejectedDurationOverrun, 'Duration exceeding period closing time was strictly rejected');

console.log('--- ALL SCENARIOS, DURATION SLOTS & ENGINE RULES VERIFIED SUCCESSFULLY ---');
