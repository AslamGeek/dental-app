'use client';

import React, { useState } from 'react';
import { dentalStore } from '@/lib/store';
import { Patient, TreatmentOpportunity } from '@/lib/types';
import { X, CalendarPlus } from 'lucide-react';

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
  const patients = dentalStore.getPatients();
  const [selectedPatientId, setSelectedPatientId] = useState(initialPatientId || patients[0]?.id || '');
  const [treatmentName, setTreatmentName] = useState(() => {
    if (initialTreatmentId) {
      const patientTreatments = dentalStore.getTreatmentsForPatient(initialPatientId || '');
      const tr = patientTreatments.find((t) => t.id === initialTreatmentId);
      if (tr) return tr.treatment_name;
    }
    return 'Consultation & Examination';
  });

  const [appointmentDate, setAppointmentDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1); // default tomorrow
    return d.toISOString().slice(0, 10);
  });
  const [appointmentTime, setAppointmentTime] = useState('11:00');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId) {
      setError('Please select a patient.');
      return;
    }
    if (!appointmentDate || !appointmentTime) {
      setError('Please select date and time.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      dentalStore.addAppointment({
        patient_id: selectedPatientId,
        treatment_opportunity_id: initialTreatmentId,
        appointment_date: appointmentDate,
        appointment_time: `${appointmentTime}:00`,
        treatment_name: treatmentName.trim() || 'Consultation',
      });

      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      setError('Failed to book appointment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-md w-full shadow-xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-blue-100 text-blue-800">
              <CalendarPlus className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900">Book Appointment</h2>
              <p className="text-xs text-slate-500">Schedule clinic slot</p>
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
            <div className="p-3 text-xs rounded-md bg-rose-50 text-rose-700 border border-rose-200">
              {error}
            </div>
          )}

          {/* Patient Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Patient</label>
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

          {/* Treatment / Reason */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Treatment / Reason</label>
            <input
              type="text"
              required
              value={treatmentName}
              onChange={(e) => setTreatmentName(e.target.value)}
              placeholder="e.g. Dental Implant Consultation"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-600"
            />
          </div>

          {/* Date & Time Row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Date</label>
              <input
                type="date"
                required
                value={appointmentDate}
                onChange={(e) => setAppointmentDate(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-600"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Time</label>
              <input
                type="time"
                required
                value={appointmentTime}
                onChange={(e) => setAppointmentTime(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-600"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
            <button type="button" onClick={onClose} className="btn-secondary text-sm py-2 px-4">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="btn-primary text-sm py-2 px-5">
              {isSubmitting ? 'Booking...' : 'Confirm Booking'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
