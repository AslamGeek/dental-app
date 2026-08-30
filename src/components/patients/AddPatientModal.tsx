'use client';

import React, { useState } from 'react';
import { dentalStore } from '@/lib/store';
import { X, UserPlus, Sparkles } from 'lucide-react';

interface AddPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (patientId: string) => void;
}

const COMMON_TREATMENTS = [
  { name: 'Dental Implant', value: 85000 },
  { name: 'Braces / Aligners', value: 55000 },
  { name: 'Root Canal & Crown', value: 12000 },
  { name: 'Ceramic Crown', value: 18000 },
  { name: 'Teeth Whitening', value: 8000 },
  { name: 'Cleaning & Scaling', value: 1500 },
];

export default function AddPatientModal({
  isOpen,
  onClose,
  onSuccess,
}: AddPatientModalProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [treatmentName, setTreatmentName] = useState('');
  const [estimatedValue, setEstimatedValue] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSelectQuickTreatment = (treatment: { name: string; value: number }) => {
    setTreatmentName(treatment.name);
    setEstimatedValue(treatment.value.toString());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter patient name.');
      return;
    }
    if (!phone.trim()) {
      setError('Please enter a contact phone number.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const val = estimatedValue ? parseFloat(estimatedValue.replace(/[^\d.]/g, '')) : 0;
      const { patient } = dentalStore.addPatient({
        name: name.trim(),
        phone: phone.trim(),
        treatment_name: treatmentName.trim() || undefined,
        estimated_value: val || undefined,
      });

      if (onSuccess) onSuccess(patient.id);
      onClose();
    } catch (err) {
      console.error(err);
      setError('Failed to create patient. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-md w-full shadow-xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-emerald-100 text-emerald-800">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900">Add Patient</h2>
              <p className="text-xs text-slate-500">Fast inquiry intake</p>
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 text-xs rounded-md bg-rose-50 text-rose-700 border border-rose-200">
              {error}
            </div>
          )}

          {/* Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Patient Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              autoFocus
              placeholder="e.g. Rahul Kumar"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-600"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Phone Number <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="tel"
                required
                placeholder="e.g. 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-600 font-mono"
              />
            </div>
          </div>

          {/* What do they need? */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              What do they need? <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Dental Implant, Root Canal, Cleaning..."
              value={treatmentName}
              onChange={(e) => setTreatmentName(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-600 mb-2"
            />

            {/* Quick 1-tap treatment pills */}
            <div className="flex flex-wrap gap-1.5">
              {COMMON_TREATMENTS.map((item) => (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => handleSelectQuickTreatment(item)}
                  className={`px-2 py-1 text-[11px] rounded-full border transition-colors ${
                    treatmentName === item.name
                      ? 'bg-emerald-700 text-white border-emerald-700'
                      : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                  }`}
                >
                  {item.name}
                </button>
              ))}
            </div>
          </div>

          {/* Estimated Value */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Estimated Value (₹) <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-slate-400 text-sm font-semibold">₹</span>
              <input
                type="number"
                placeholder="85000"
                value={estimatedValue}
                onChange={(e) => setEstimatedValue(e.target.value)}
                className="w-full pl-7 pr-3 py-2 text-sm border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-600 font-mono"
              />
            </div>
          </div>

          {/* Helper notice */}
          <div className="p-3 bg-emerald-50/70 border border-emerald-100 rounded-lg text-[11px] text-emerald-800 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 shrink-0 text-emerald-700" />
            <span>The system will automatically schedule a follow-up on your <strong>Today</strong> queue.</span>
          </div>

          {/* Footer */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary text-sm py-2 px-4"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary text-sm py-2 px-5"
            >
              {isSubmitting ? 'Saving...' : 'Save Patient'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
