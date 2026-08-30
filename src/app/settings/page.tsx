'use client';

import React, { useState } from 'react';
import { dentalStore, INITIAL_CLINIC, INITIAL_USERS } from '@/lib/store';
import {
  Settings,
  Building2,
  Users,
  ShieldAlert,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  Info,
  Clock,
  PhoneCall,
  CalendarCheck,
  AlertTriangle,
  Database,
} from 'lucide-react';

export default function SettingsPage() {
  const [resetMessage, setResetMessage] = useState('');

  const handleResetData = () => {
    if (window.confirm('Are you sure you want to reset all clinic data to default demo state?')) {
      dentalStore.resetToDemoData();
      setResetMessage('Clinic data has been reset to default Kadapa demo dataset.');
      setTimeout(() => setResetMessage(''), 4000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Clinic Settings &amp; Rules</h1>
        </div>
        <p className="text-sm text-slate-500 mt-1">
          Configuration, staff accounts, follow-up rules engine, and data controls.
        </p>
      </div>

      {resetMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-sm font-medium flex items-center gap-2 animate-in fade-in duration-150">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{resetMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Clinic Profile */}
        <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Building2 className="w-5 h-5 text-emerald-700" />
            <h2 className="text-base font-semibold text-slate-900">Clinic Profile</h2>
          </div>

          <div className="space-y-3 text-xs sm:text-sm">
            <div>
              <span className="text-slate-400 block text-xs">Clinic Name</span>
              <span className="font-semibold text-slate-900">{INITIAL_CLINIC.name}</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-slate-400 block text-xs">Location</span>
                <span className="text-slate-800">
                  {INITIAL_CLINIC.city}, {INITIAL_CLINIC.state}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-xs">Clinic Phone</span>
                <span className="font-mono text-slate-800">{INITIAL_CLINIC.phone}</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-slate-400 block text-xs">Working Hours</span>
                <span className="text-slate-800">9:30 AM – 8:30 PM (IST)</span>
              </div>
              <div>
                <span className="text-slate-400 block text-xs">Currency</span>
                <span className="text-slate-800">INR (₹ Indian Rupee)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Staff & Roles */}
        <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Users className="w-5 h-5 text-emerald-700" />
            <h2 className="text-base font-semibold text-slate-900">Clinic Staff &amp; Roles</h2>
          </div>

          <div className="space-y-3">
            {INITIAL_USERS.map((user) => (
              <div
                key={user.id}
                className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between"
              >
                <div>
                  <div className="text-xs sm:text-sm font-semibold text-slate-900">
                    {user.name}
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono">{user.phone}</div>
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                    user.role === 'dentist'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {user.role === 'dentist' ? 'Dentist / Owner' : 'Receptionist'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Rules Engine Specifications */}
      <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Sparkles className="w-5 h-5 text-emerald-700" />
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Automated Follow-Up Rules Engine
            </h2>
            <p className="text-xs text-slate-500">
              Calm, clinical follow-up scheduling logic tailored for Indian dental practices
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 text-xs">
          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-slate-900">
              <PhoneCall className="w-4 h-4 text-emerald-700" />
              <span>No Answer Progression</span>
            </div>
            <p className="text-slate-600">
              1st attempt &rarr; retry tomorrow at 11:00 AM. 2nd attempt &rarr; retry in 3 days. 3rd attempt &rarr; retry in 7 days before auto-closing.
            </p>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-slate-900">
              <Clock className="w-4 h-4 text-blue-700" />
              <span>Needs Time / Deliberating</span>
            </div>
            <p className="text-slate-600">
              When patient wants to discuss with family or check budget, automatically schedules a respectful check-in <strong>3 days later</strong>.
            </p>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-slate-900">
              <CalendarCheck className="w-4 h-4 text-blue-700" />
              <span>Appointment Confirmation</span>
            </div>
            <p className="text-slate-600">
              Appointments trigger a confirmation card on <strong>Today</strong> 1 day prior, with 1-tap WhatsApp reminder &amp; confirmation.
            </p>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-slate-900">
              <AlertTriangle className="w-4 h-4 text-orange-700" />
              <span>No-Show Recovery</span>
            </div>
            <p className="text-slate-600">
              Marking an appointment as No-Show immediately places a friendly reschedule task on Today&apos;s queue with prefilled WhatsApp text.
            </p>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-slate-900">
              <ShieldAlert className="w-4 h-4 text-rose-700" />
              <span>Wrong Number Flag</span>
            </div>
            <p className="text-slate-600">
              Immediately halts further automated calls and tags the patient profile until staff updates with the correct contact number.
            </p>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-slate-900">
              <Database className="w-4 h-4 text-teal-700" />
              <span>Storage &amp; Persistence</span>
            </div>
            <p className="text-slate-600">
              Local-first reactive state engine with instant browser persistence, offline support, and ready for Supabase sync.
            </p>
          </div>
        </div>
      </div>

      {/* Demo Data Management */}
      <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Demo Data Management</h2>
            <p className="text-xs text-slate-500">
              Reset clinic queue, patient data, and appointments to pristine demo state
            </p>
          </div>
          <button
            type="button"
            onClick={handleResetData}
            className="btn-secondary text-xs py-2 px-3.5 text-rose-600 hover:text-rose-700 border-rose-200 hover:bg-rose-50"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo Data</span>
          </button>
        </div>

        <p className="text-xs text-slate-500">
          This restores all 7 Kadapa clinical patient cases (Rahul Kumar, Priya Reddy, Vijay Bhaskar, Suresh Naidu, Lakshmi Devi, Venkatesh Prasad, Anitha Kumari) with preloaded active treatment opportunities and scheduled follow-ups.
        </p>
      </div>
    </div>
  );
}
