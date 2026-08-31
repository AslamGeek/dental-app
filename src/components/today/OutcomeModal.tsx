'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { FollowUpItem, InteractionOutcome } from '@/lib/types';
import { dentalStore } from '@/lib/store';
import { formatRupee, formatPhoneNumber, formatTime12H } from '@/lib/formatting';
import { 
  PhoneOff, 
  Clock, 
  ThumbsUp, 
  Hourglass, 
  CalendarCheck, 
  XCircle, 
  AlertTriangle,
  X
} from 'lucide-react';

interface OutcomeModalProps {
  item: FollowUpItem | null;
  isOpen: boolean;
  onClose: () => void;
  defaultChannel?: 'call' | 'whatsapp';
}

export default function OutcomeModal({
  item,
  isOpen,
  onClose,
  defaultChannel = 'call',
}: OutcomeModalProps) {
  const [selectedOutcome, setSelectedOutcome] = useState<InteractionOutcome | null>(null);
  const [callbackChoice, setCallbackChoice] = useState<'later_today' | 'tomorrow' | 'custom'>('tomorrow');
  const [customDateTime, setCustomDateTime] = useState('');
  const [declineReason, setDeclineReason] = useState('Decided not to proceed');
  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const todayDateTimeStr = useMemo(() => new Date().toISOString().slice(0, 16), []);
  const [bookedDate, setBookedDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [selectedTreatmentId, setSelectedTreatmentId] = useState('');
  const [bookedTime, setBookedTime] = useState('');
  const [interestedChoice, setInterestedChoice] = useState<'book' | 'followup'>('book');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const activeTreatments = dentalStore.getActiveTreatments();

  // Initialize selected treatment when item changes
  useEffect(() => {
    if (!item) return;
    let initialTrId = activeTreatments[0]?.id || '';
    if (item.treatment) {
      const match = activeTreatments.find(
        (t) => t.name.toLowerCase() === item.treatment!.treatment_name.toLowerCase()
      );
      if (match) initialTrId = match.id;
    }
    setSelectedTreatmentId(initialTrId);
  }, [item, activeTreatments]);

  // Reactive slot calculation for outcome booking
  const slotData = React.useMemo(() => {
    if (!bookedDate || !selectedTreatmentId) {
      return { status: 'no_slots' as const, slots: [] as string[], reason: 'Select date and treatment.' };
    }
    return dentalStore.getAvailableSlots(bookedDate, selectedTreatmentId);
  }, [bookedDate, selectedTreatmentId]);

  // Keep selected slot valid
  useEffect(() => {
    if (slotData.status === 'open' && slotData.slots.length > 0) {
      if (!bookedTime || !slotData.slots.includes(bookedTime)) {
        setBookedTime(slotData.slots[0]);
      }
    } else {
      setBookedTime('');
    }
  }, [slotData, bookedTime]);

  if (!isOpen || !item) return null;

  const handleSave = () => {
    if (!selectedOutcome) return;
    setErrorMessage('');

    let finalOutcome = selectedOutcome;
    if (selectedOutcome === 'interested' && interestedChoice === 'book') {
      finalOutcome = 'appointment_booked';
    }

    if (finalOutcome === 'appointment_booked') {
      if (!bookedDate) {
        setErrorMessage('Please select an appointment date.');
        return;
      }
      if (bookedDate < todayStr) {
        setErrorMessage('Appointment date must be today or a future date.');
        return;
      }
      if (!bookedTime || slotData.status !== 'open') {
        if (slotData.status === 'closed') {
          setErrorMessage('Clinic is closed on this day.');
        } else {
          setErrorMessage('Please select an available time slot.');
        }
        return;
      }
    }

    if (selectedOutcome === 'call_back_later' && callbackChoice === 'custom') {
      if (!customDateTime) {
        setErrorMessage('Please select a callback date & time.');
        return;
      }
      if (customDateTime.slice(0, 10) < todayStr) {
        setErrorMessage('Callback date must be today or a future date.');
        return;
      }
    }

    setIsSubmitting(true);

    try {
      dentalStore.recordOutcome({
        followUpId: item.id,
        channel: defaultChannel,
        outcome: finalOutcome,
        context: {
          callbackChoice: selectedOutcome === 'call_back_later' ? callbackChoice : undefined,
          customCallbackDateTime: selectedOutcome === 'call_back_later' && callbackChoice === 'custom' && customDateTime ? customDateTime : undefined,
          declineReason: selectedOutcome === 'not_interested' ? declineReason : undefined,
          bookedAppointmentDate: finalOutcome === 'appointment_booked' ? bookedDate : undefined,
          bookedAppointmentTime: finalOutcome === 'appointment_booked' ? bookedTime : undefined,
        },
        notes: notes.trim() || undefined,
      });

      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save outcome.';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const outcomeOptions: {
    id: InteractionOutcome;
    label: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
  }[] = [
    {
      id: 'no_answer',
      label: 'No answer',
      description: item.attempt_count === 0 ? 'Retry tomorrow at 11:00 AM' : `Retry in ${item.attempt_count === 1 ? '3 days' : '7 days'}`,
      icon: PhoneOff,
    },
    {
      id: 'call_back_later',
      label: 'Call back later',
      description: 'Patient requested to be contacted at another time',
      icon: Clock,
    },
    {
      id: 'needs_time',
      label: 'Needs time',
      description: 'Follow up in 3 days regarding decision',
      icon: Hourglass,
    },
    {
      id: 'interested',
      label: 'Interested',
      description: 'Book appointment or schedule decision follow-up',
      icon: ThumbsUp,
    },
    {
      id: 'appointment_booked',
      label: 'Appointment booked',
      description: 'Procedure / consultation appointment scheduled',
      icon: CalendarCheck,
    },
    {
      id: 'not_interested',
      label: 'Not interested',
      description: 'Close active follow-up and record reason',
      icon: XCircle,
    },
    {
      id: 'wrong_number',
      label: 'Wrong number',
      description: 'Flag patient record and halt automatic calls',
      icon: AlertTriangle,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-lg w-full shadow-xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">What happened?</h2>
            <p className="text-xs text-slate-600 mt-0.5">
              <span className="font-medium text-slate-900">{item.patient.name}</span>
              {item.treatment && (
                <> · {item.treatment.treatment_name}</>
              )}
              {' · '}{formatPhoneNumber(item.patient.phone)}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {errorMessage && (
            <div className="p-3 text-xs rounded-md bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Outcome Buttons Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {outcomeOptions.map((opt) => {
              const isSelected = selectedOutcome === opt.id;
              const Icon = opt.icon;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setSelectedOutcome(opt.id)}
                  className={`flex items-start gap-3 p-3 text-left rounded-lg border transition-all ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-50/60 ring-1 ring-emerald-600 text-emerald-950'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-800'
                  }`}
                >
                  <div
                    className={`p-2 rounded-md shrink-0 ${
                      isSelected ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-medium text-sm leading-snug">{opt.label}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5 leading-tight">
                      {opt.description}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Conditional Options based on Selection */}
          {selectedOutcome === 'call_back_later' && (
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-3">
              <label className="block text-xs font-semibold text-slate-700">
                When should we call back?
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setCallbackChoice('later_today')}
                  className={`py-2 px-2 text-xs font-medium rounded-md border text-center transition-colors ${
                    callbackChoice === 'later_today'
                      ? 'bg-emerald-700 text-white border-emerald-700'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  Later today (4 PM)
                </button>
                <button
                  type="button"
                  onClick={() => setCallbackChoice('tomorrow')}
                  className={`py-2 px-2 text-xs font-medium rounded-md border text-center transition-colors ${
                    callbackChoice === 'tomorrow'
                      ? 'bg-emerald-700 text-white border-emerald-700'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  Tomorrow (11 AM)
                </button>
                <button
                  type="button"
                  onClick={() => setCallbackChoice('custom')}
                  className={`py-2 px-2 text-xs font-medium rounded-md border text-center transition-colors ${
                    callbackChoice === 'custom'
                      ? 'bg-emerald-700 text-white border-emerald-700'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  Pick date & time
                </button>
              </div>

              {callbackChoice === 'custom' && (
                <div className="pt-2">
                  <input
                    type="datetime-local"
                    min={todayDateTimeStr}
                    value={customDateTime}
                    onChange={(e) => setCustomDateTime(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  />
                </div>
              )}
            </div>
          )}

          {selectedOutcome === 'interested' && (
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-3">
              <label className="block text-xs font-semibold text-slate-700">Next Action:</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setInterestedChoice('book')}
                  className={`py-2 px-2 text-xs font-medium rounded-md border text-center ${
                    interestedChoice === 'book'
                      ? 'bg-emerald-700 text-white border-emerald-700'
                      : 'bg-white text-slate-700 border-slate-300'
                  }`}
                >
                  Book Appointment Now
                </button>
                <button
                  type="button"
                  onClick={() => setInterestedChoice('followup')}
                  className={`py-2 px-2 text-xs font-medium rounded-md border text-center ${
                    interestedChoice === 'followup'
                      ? 'bg-emerald-700 text-white border-emerald-700'
                      : 'bg-white text-slate-700 border-slate-300'
                  }`}
                >
                  Follow up tomorrow
                </button>
              </div>

              {interestedChoice === 'book' && (
                <div className="space-y-2.5 pt-2 border-t border-slate-200">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Treatment:</label>
                    <select
                      value={selectedTreatmentId}
                      onChange={(e) => setSelectedTreatmentId(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                    >
                      {activeTreatments.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Date:</label>
                    <input
                      type="date"
                      min={todayStr}
                      value={bookedDate}
                      onChange={(e) => setBookedDate(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Available Time Slot:</label>
                    {slotData.status === 'closed' && (
                      <div className="p-2 rounded bg-amber-50 border border-amber-200 text-amber-800 text-xs text-center">
                        Clinic is closed on this day.
                      </div>
                    )}
                    {slotData.status === 'no_slots' && (
                      <div className="p-2 rounded bg-slate-100 border border-slate-200 text-slate-600 text-xs text-center">
                        No available times on this date.
                      </div>
                    )}
                    {slotData.status === 'open' && (
                      <div className="grid grid-cols-3 gap-1.5 max-h-32 overflow-y-auto p-1 border border-slate-200 rounded-md bg-white">
                        {slotData.slots.map((slot) => (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => setBookedTime(slot)}
                            className={`py-1.5 px-1 text-[11px] font-medium rounded border transition-colors text-center ${
                              bookedTime === slot
                                ? 'bg-emerald-700 text-white border-emerald-700'
                                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            {formatTime12H(slot)}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {selectedOutcome === 'appointment_booked' && (
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-3">
              <label className="block text-xs font-semibold text-slate-700">Appointment Slot:</label>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Treatment:</label>
                <select
                  value={selectedTreatmentId}
                  onChange={(e) => setSelectedTreatmentId(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                >
                  {activeTreatments.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Date:</label>
                <input
                  type="date"
                  min={todayStr}
                  value={bookedDate}
                  onChange={(e) => setBookedDate(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Available Time Slot:</label>
                {slotData.status === 'closed' && (
                  <div className="p-2 rounded bg-amber-50 border border-amber-200 text-amber-800 text-xs text-center">
                    Clinic is closed on this day.
                  </div>
                )}
                {slotData.status === 'no_slots' && (
                  <div className="p-2 rounded bg-slate-100 border border-slate-200 text-slate-600 text-xs text-center">
                    No available times on this date.
                  </div>
                )}
                {slotData.status === 'open' && (
                  <div className="grid grid-cols-3 gap-1.5 max-h-32 overflow-y-auto p-1 border border-slate-200 rounded-md bg-white">
                    {slotData.slots.map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setBookedTime(slot)}
                        className={`py-1.5 px-1 text-[11px] font-medium rounded border transition-colors text-center ${
                          bookedTime === slot
                            ? 'bg-emerald-700 text-white border-emerald-700'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {formatTime12H(slot)}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {selectedOutcome === 'not_interested' && (
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
              <label className="block text-xs font-semibold text-slate-700">Reason (Optional):</label>
              <div className="flex flex-wrap gap-1.5">
                {['Decided not to proceed', 'Too expensive', 'Went elsewhere', 'Postponed indefinitely'].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setDeclineReason(r)}
                    className={`px-2.5 py-1 text-xs rounded-full border ${
                      declineReason === r
                        ? 'bg-slate-800 text-white border-slate-800'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Optional Note Field */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Short note <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Wants to discuss with family, will let us know..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-600"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary text-sm py-2 px-4"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!selectedOutcome || isSubmitting}
            onClick={handleSave}
            className={`btn-primary text-sm py-2 px-5 ${
              !selectedOutcome || isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isSubmitting ? 'Saving...' : 'Save Outcome'}
          </button>
        </div>
      </div>
    </div>
  );
}
