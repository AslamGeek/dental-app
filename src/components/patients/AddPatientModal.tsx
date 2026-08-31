'use client';

import React, { useState } from 'react';
import { dentalStore } from '@/lib/store';
import {
  PREDEFINED_TREATMENTS,
  PATIENT_SOURCES,
  GENDER_OPTIONS,
  PredefinedTreatment,
  PatientSource,
  PatientGender,
} from '@/lib/types';
import { X, UserPlus, Sparkles, AlertCircle, MessageSquare } from 'lucide-react';

interface AddPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (patientId: string) => void;
}

export default function AddPatientModal({
  isOpen,
  onClose,
  onSuccess,
}: AddPatientModalProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [isSameWhatsapp, setIsSameWhatsapp] = useState(true);
  const [whatsappNumber, setWhatsappNumber] = useState('');

  // Treatment selection
  const [selectedTreatment, setSelectedTreatment] = useState<string>('');
  const [customTreatment, setCustomTreatment] = useState('');

  // Optional fields
  const [age, setAge] = useState<string>('');
  const [gender, setGender] = useState<string>('');
  const [location, setLocation] = useState('');
  const [email, setEmail] = useState('');
  const [source, setSource] = useState<string>('');
  const [notes, setNotes] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  // Name Validation: Rejects numbers, numeric-only, arbitrary special characters
  const validateName = (nameStr: string): string | null => {
    const trimmed = nameStr.trim();
    if (!trimmed) {
      return 'Please enter patient name.';
    }
    if (/\d/.test(trimmed)) {
      return 'Patient name cannot contain numbers.';
    }
    // Allow letters, spaces, dots, hyphens, apostrophes
    const nameRegex = /^[a-zA-Z\s.'-]+$/;
    if (!nameRegex.test(trimmed)) {
      return 'Patient name contains invalid characters. Use letters and spaces only.';
    }
    const letterCount = (trimmed.match(/[a-zA-Z]/g) || []).length;
    if (letterCount < 2) {
      return 'Patient name must contain at least 2 letters.';
    }
    return null;
  };

  const handlePhoneChange = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 10);
    setPhone(digits);
  };

  const handleWhatsappChange = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 10);
    setWhatsappNumber(digits);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // 1. Validate Name
    const nameError = validateName(name);
    if (nameError) {
      setError(nameError);
      return;
    }

    // 2. Validate Phone
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      setError('Phone number must be exactly 10 digits.');
      return;
    }

    // 3. Validate WhatsApp
    let cleanWhatsapp = cleanPhone;
    if (!isSameWhatsapp) {
      cleanWhatsapp = whatsappNumber.replace(/\D/g, '');
      if (cleanWhatsapp.length !== 10) {
        setError('WhatsApp number must be exactly 10 digits.');
        return;
      }
    }

    // 4. Validate Email (if provided)
    if (email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        setError('Please enter a valid email address.');
        return;
      }
    }

    // 5. Validate Treatment
    let finalTreatment: string | undefined = undefined;
    if (selectedTreatment) {
      if (selectedTreatment === 'Other') {
        if (!customTreatment.trim()) {
          setError('Please specify the treatment name for "Other".');
          return;
        }
        finalTreatment = customTreatment.trim();
      } else {
        finalTreatment = selectedTreatment;
      }
    }

    // 6. Validate Age (if provided)
    let parsedAge: number | undefined = undefined;
    if (age.trim()) {
      const num = parseInt(age.trim(), 10);
      if (isNaN(num) || num <= 0 || num > 125) {
        setError('Please enter a valid age between 1 and 125.');
        return;
      }
      parsedAge = num;
    }

    setIsSubmitting(true);

    try {
      const { patient } = dentalStore.addPatient({
        name: name.trim(),
        phone: cleanPhone,
        whatsapp_number: cleanWhatsapp,
        email: email.trim() || undefined,
        age: parsedAge,
        gender: gender || undefined,
        location: location.trim() || undefined,
        source: source || undefined,
        notes: notes.trim() || undefined,
        treatment_name: finalTreatment,
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
      <div className="bg-white rounded-xl max-w-lg w-full shadow-xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-6">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-emerald-100 text-emerald-800">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900">Add Patient</h2>
              <p className="text-xs text-slate-500">Lucky Dental Care, Proddatur</p>
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-3 text-xs rounded-md bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Patient Name */}
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

          {/* Phone Number */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Phone Number (10 Digits) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 text-xs font-medium">
                +91
              </div>
              <input
                type="tel"
                required
                maxLength={10}
                placeholder="9876543210"
                value={phone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                className="w-full pl-10 pr-3 py-2 text-sm border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-600 font-mono"
              />
            </div>
          </div>

          {/* WhatsApp Checkbox */}
          <div className="space-y-2 pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
              <input
                type="checkbox"
                checked={isSameWhatsapp}
                onChange={(e) => setIsSameWhatsapp(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
              <span className="flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                WhatsApp number is same as phone number
              </span>
            </label>

            {/* Separate WhatsApp Input if unchecked */}
            {!isSameWhatsapp && (
              <div className="pl-6 pt-1 animate-in fade-in duration-150">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  WhatsApp Number (10 Digits) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 text-xs font-medium">
                    +91
                  </div>
                  <input
                    type="tel"
                    required={!isSameWhatsapp}
                    maxLength={10}
                    placeholder="9848012345"
                    value={whatsappNumber}
                    onChange={(e) => handleWhatsappChange(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 text-sm border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-600 font-mono"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Restricted Treatment Selection */}
          <div className="pt-1">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Treatment <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <select
              value={selectedTreatment}
              onChange={(e) => setSelectedTreatment(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg text-slate-900 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-600"
            >
              <option value="">Select treatment...</option>
              {PREDEFINED_TREATMENTS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>

            {/* Explicit custom treatment field when Other is selected */}
            {selectedTreatment === 'Other' && (
              <div className="mt-2 animate-in fade-in duration-150">
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Specify Treatment Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Laser Gum Treatment, Night Guard"
                  value={customTreatment}
                  onChange={(e) => setCustomTreatment(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                />
              </div>
            )}
          </div>

          {/* Age & Gender Row */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Age <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <input
                type="number"
                min={1}
                max={125}
                placeholder="e.g. 32"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-600 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Gender <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg text-slate-900 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-600"
              >
                <option value="">Select gender...</option>
                {GENDER_OPTIONS.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Location & Source Row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Location <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Proddatur, YMR Colony"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Source <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <select
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg text-slate-900 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-600"
              >
                <option value="">Select source...</option>
                {PATIENT_SOURCES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Email Address <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <input
              type="email"
              placeholder="e.g. patient@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-600"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Notes <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Referred by Dr. Rao, prefers evening visits..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-600"
            />
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
