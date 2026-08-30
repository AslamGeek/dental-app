'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { dentalStore } from '@/lib/store';
import { Patient, TreatmentCatalogItem } from '@/lib/types';
import { formatTime12H, formatRupee, formatDateDDMMYYYY } from '@/lib/formatting';
import { X, CalendarPlus, Clock, AlertCircle, Calendar } from 'lucide-react';

interface BookAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPatientId?: string;
  initialTreatmentId?: string;
  onSuccess?: () => void;
}

export default function BookAppointmentModal({
  isOpen,
  onClose,
  initialPatientId,
  initialTreatmentId,
  onSuccess,
}: BookAppointmentModalProps) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [activeTreatments, setActiveTreatments] = useState<TreatmentCatalogItem[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [selectedTreatmentId, setSelectedTreatmentId] = useState('');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [selectedSlotTime, setSelectedSlotTime] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Initialize or reload data when modal opens
  useEffect(() => {
    if (!isOpen) return;

    const allPatients = dentalStore.getPatients();
    const treatments = dentalStore.getActiveTreatments();
    setPatients(allPatients);
    setActiveTreatments(treatments);

    const patId = initialPatientId || allPatients[0]?.id || '';
    setSelectedPatientId(patId);

    // Initial treatment resolution
    let defaultTrId = treatments[0]?.id || '';
    if (initialTreatmentId) {
      // Check if it's already a catalog ID
      const directMatch = treatments.find((t) => t.id === initialTreatmentId);
      if (directMatch) {
        defaultTrId = directMatch.id;
      } else {
        // Look up patient opportunity name to match catalog
        const patTreatments = dentalStore.getTreatmentsForPatient(patId);
        const opp = patTreatments.find((t) => t.id === initialTreatmentId);
        if (opp) {
          const nameMatch = treatments.find(
            (t) => t.name.toLowerCase() === opp.treatment_name.toLowerCase()
          );
          if (nameMatch) defaultTrId = nameMatch.id;
        }
      }
    }
    setSelectedTreatmentId(defaultTrId);

    // Default to tomorrow's date
    const d = new Date();
    d.setDate(d.getDate() + 1);
    const tomorrowStr = d.toISOString().slice(0, 10);
    setAppointmentDate(tomorrowStr);
    setSelectedSlotTime('');
    setError('');
  }, [isOpen, initialPatientId, initialTreatmentId]);

  // Reactive slot calculation based on date and treatment
  const slotData = useMemo(() => {
    if (!appointmentDate || !selectedTreatmentId) {
      return { status: 'no_slots' as const, slots: [] as string[], reason: 'Select date and treatment.' };
    }
    return dentalStore.getAvailableSlots(appointmentDate, selectedTreatmentId);
  }, [appointmentDate, selectedTreatmentId]);

  // Keep selected slot valid
  useEffect(() => {
    if (slotData.status === 'open' && slotData.slots.length > 0) {
      if (!selectedSlotTime || !slotData.slots.includes(selectedSlotTime)) {
        setSelectedSlotTime(slotData.slots[0]);
      }
    } else {
      setSelectedSlotTime('');
    }
  }, [slotData, selectedSlotTime]);

  if (!isOpen) return null;

  const selectedTreatment = activeTreatments.find((t) => t.id === selectedTreatmentId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId) {
      setError('Please select a patient.');
      return;
    }
    if (!selectedTreatmentId) {
      setError('Please select a treatment.');
      return;
    }
    if (!appointmentDate) {
      setError('Please select a valid date.');
      return;
    }
    if (!selectedSlotTime) {
      if (slotData.status === 'closed') {
        setError('Clinic is closed on this day.');
      } else {
        setError('Please select an available time slot.');
      }
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      dentalStore.addAppointment({
        patient_id: selectedPatientId,
        treatment_id: selectedTreatmentId,
        treatment_opportunity_id: initialTreatmentId,
        appointment_date: appointmentDate,
        appointment_time: selectedSlotTime,
      });

      if (onSuccess) onSuccess();
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to book appointment.';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-lg w-full shadow-xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-blue-100 text-blue-800">
              <CalendarPlus className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900">Book Appointment</h2>
              <p className="text-xs text-slate-500">Scheduled clinic slot (Asia/Kolkata)</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 text-xs rounded-md bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* 1. Patient Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Patient <span className="text-rose-500">*</span>
            </label>
            <select
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg text-slate-900 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-600"
            >
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.phone})
                </option>
              ))}
            </select>
          </div>

          {/* 2. Treatment Selection from Catalog */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Treatment <span className="text-rose-500">*</span>
            </label>
            <select
              value={selectedTreatmentId}
              onChange={(e) => setSelectedTreatmentId(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg text-slate-900 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-600"
            >
              {activeTreatments.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} — {t.duration_minutes} min ({formatRupee(t.price)})
                </option>
              ))}
            </select>
            {selectedTreatment && (
              <div className="mt-1.5 flex items-center gap-3 text-[11px] text-slate-500">
                <span className="inline-flex items-center gap-1 font-medium text-slate-700">
                  <Clock className="w-3 h-3 text-slate-400" />
                  Duration: {selectedTreatment.duration_minutes} mins
                </span>
                <span>•</span>
                <span className="font-medium text-slate-700">
                  Fee: {formatRupee(selectedTreatment.price)}
                </span>
              </div>
            )}
          </div>

          {/* 3. Appointment Date */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Appointment Date <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="date"
                required
                value={appointmentDate}
                onChange={(e) => setAppointmentDate(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-600"
              />
            </div>
            {appointmentDate && (
              <p className="text-[11px] text-slate-500 mt-1">
                Selected date: <span className="font-semibold text-slate-700">{formatDateDDMMYYYY(appointmentDate)}</span>
              </p>
            )}
          </div>

          {/* 4. Available Times Slot Grid */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                Available Time Slots <span className="text-rose-500">*</span>
              </label>
              {slotData.status === 'open' && (
                <span className="text-[11px] text-slate-500">
                  {slotData.slots.length} available {slotData.slots.length === 1 ? 'slot' : 'slots'}
                </span>
              )}
            </div>

            {slotData.status === 'closed' && (
              <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium text-center">
                Clinic is closed on this day.
              </div>
            )}

            {slotData.status === 'no_slots' && (
              <div className="p-3 rounded-lg bg-slate-100 border border-slate-200 text-slate-600 text-xs text-center">
                No available times on this date.
              </div>
            )}

            {slotData.status === 'invalid_treatment' && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs text-center">
                Please select a valid active treatment.
              </div>
            )}

            {slotData.status === 'open' && (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-48 overflow-y-auto p-1 border border-slate-100 rounded-lg bg-slate-50/50">
                {slotData.slots.map((slot) => {
                  const isSelected = selectedSlotTime === slot;
                  return (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setSelectedSlotTime(slot)}
                      className={`py-2 px-2 text-xs font-medium rounded-lg border transition-all text-center ${
                        isSelected
                          ? 'bg-emerald-700 text-white border-emerald-700 ring-2 ring-emerald-600/30 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      {formatTime12H(slot)}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
            <button type="button" onClick={onClose} className="btn-secondary text-sm py-2 px-4">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !selectedSlotTime || slotData.status !== 'open'}
              className="btn-primary text-sm py-2 px-5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Booking...' : 'Book Appointment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
