'use client';

import React, { useState, useEffect } from 'react';
import { dentalStore, INITIAL_USERS } from '@/lib/store';
import { TreatmentCatalogItem, DaySchedule } from '@/lib/types';
import { formatRupee, formatTime12H } from '@/lib/formatting';
import {
  Building2,
  Users,
  ShieldAlert,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  Clock,
  PhoneCall,
  CalendarCheck,
  AlertTriangle,
  Database,
  Plus,
  Stethoscope,
  Calendar,
  Check,
  X,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function SettingsPage() {
  const [resetMessage, setResetMessage] = useState('');
  const [treatmentCatalog, setTreatmentCatalog] = useState<TreatmentCatalogItem[]>([]);
  const [schedule, setSchedule] = useState<DaySchedule[]>([]);
  const [isAddingTreatment, setIsAddingTreatment] = useState(false);
  const [newTrName, setNewTrName] = useState('');
  const [newTrDuration, setNewTrDuration] = useState('30');
  const [newTrPrice, setNewTrPrice] = useState('');
  const [formError, setFormError] = useState('');

  const loadData = () => {
    setTreatmentCatalog(dentalStore.getTreatmentCatalog());
    setSchedule(dentalStore.getSchedule());
  };

  useEffect(() => {
    loadData();
    const unsubscribe = dentalStore.subscribe(loadData);
    return () => unsubscribe();
  }, []);

  const handleResetData = () => {
    if (window.confirm('Are you sure you want to reset all clinic data to default demo state?')) {
      dentalStore.resetToDemoData();
      setResetMessage('Clinic data has been reset to default Kadapa demo dataset.');
      setTimeout(() => setResetMessage(''), 4000);
    }
  };

  const handleToggleStatus = (id: string) => {
    dentalStore.toggleTreatmentCatalogStatus(id);
  };

  const handleAddTreatment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTrName.trim()) {
      setFormError('Please enter treatment name.');
      return;
    }
    const duration = parseInt(newTrDuration, 10);
    if (!duration || duration <= 0) {
      setFormError('Please enter a valid duration.');
      return;
    }
    const price = newTrPrice ? parseFloat(newTrPrice) : 0;

    dentalStore.addTreatmentCatalogItem({
      name: newTrName.trim(),
      duration_minutes: duration,
      price: price,
    });

    setNewTrName('');
    setNewTrDuration('30');
    setNewTrPrice('');
    setFormError('');
    setIsAddingTreatment(false);
  };

  const clinic = dentalStore.getClinic();

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Clinic Settings &amp; Treatment Catalog</h1>
        </div>
        <p className="text-sm text-slate-500 mt-1">
          Working hours, treatment catalog, staff accounts, follow-up rules engine, and data controls.
        </p>
      </div>

      {resetMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-sm font-medium flex items-center gap-2 animate-in fade-in duration-150">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{resetMessage}</span>
        </div>
      )}

      {/* Clinic Operating Hours & Multi-Period Schedule */}
      <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-emerald-700" />
            <div>
              <h2 className="text-base font-semibold text-slate-900">Clinic Operating Hours (Asia/Kolkata)</h2>
              <p className="text-xs text-slate-500">Multi-period appointment booking schedule</p>
            </div>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
            IST (UTC+5:30)
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {schedule.map((day) => {
            const dayName = DAY_NAMES[day.day_of_week];
            return (
              <div
                key={day.day_of_week}
                className={`p-3 rounded-lg border text-xs space-y-2 ${
                  day.is_open
                    ? 'bg-slate-50 border-slate-200 text-slate-800'
                    : 'bg-rose-50/50 border-rose-200 text-rose-800'
                }`}
              >
                <div className="flex items-center justify-between font-semibold">
                  <span>{dayName}</span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                      day.is_open ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {day.is_open ? 'Open' : 'Closed'}
                  </span>
                </div>

                {day.is_open && day.periods.length > 0 ? (
                  <div className="space-y-1 text-[11px] text-slate-600">
                    {day.periods.map((p, idx) => (
                      <div key={idx} className="flex items-center justify-between">
                        <span className="text-slate-400">Session {idx + 1}:</span>
                        <span className="font-medium text-slate-700">
                          {formatTime12H(p.start)} – {formatTime12H(p.end)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-rose-600 font-medium">No appointments scheduled</p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Predefined Treatment Catalog Management */}
      <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-emerald-700" />
            <div>
              <h2 className="text-base font-semibold text-slate-900">Clinic Treatment Catalog</h2>
              <p className="text-xs text-slate-500">
                Predefined treatments, clinical durations, and standard fees used across booking
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsAddingTreatment(!isAddingTreatment)}
            className="btn-primary text-xs py-1.5 px-3 inline-flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Treatment</span>
          </button>
        </div>

        {/* Add Treatment Form */}
        {isAddingTreatment && (
          <form
            onSubmit={handleAddTreatment}
            className="p-4 rounded-lg bg-emerald-50/50 border border-emerald-200 space-y-3 animate-in fade-in duration-150"
          >
            <div className="text-xs font-bold text-emerald-900">New Catalog Treatment</div>
            {formError && (
              <div className="p-2 text-xs rounded bg-rose-50 text-rose-700 border border-rose-200">
                {formError}
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Treatment Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Laser Gum Treatment"
                  value={newTrName}
                  onChange={(e) => setNewTrName(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Duration (Minutes) <span className="text-rose-500">*</span>
                </label>
                <select
                  value={newTrDuration}
                  onChange={(e) => setNewTrDuration(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                >
                  <option value="15">15 min</option>
                  <option value="30">30 min</option>
                  <option value="45">45 min</option>
                  <option value="60">60 min</option>
                  <option value="90">90 min</option>
                  <option value="120">120 min</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Default Fee (₹)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 5000"
                  value={newTrPrice}
                  onChange={(e) => setNewTrPrice(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-600 font-mono"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsAddingTreatment(false)}
                className="btn-secondary text-xs py-1.5 px-3"
              >
                Cancel
              </button>
              <button type="submit" className="btn-primary text-xs py-1.5 px-4">
                Save Treatment
              </button>
            </div>
          </form>
        )}

        {/* Catalog Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 bg-slate-50/50">
                <th className="py-2.5 px-3 font-semibold">Treatment Name</th>
                <th className="py-2.5 px-3 font-semibold">Clinical Duration</th>
                <th className="py-2.5 px-3 font-semibold">Standard Fee (₹)</th>
                <th className="py-2.5 px-3 font-semibold">Status</th>
                <th className="py-2.5 px-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {treatmentCatalog.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-2.5 px-3 font-semibold text-slate-900">{item.name}</td>
                  <td className="py-2.5 px-3 text-slate-600">
                    <span className="inline-flex items-center gap-1 font-mono">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {item.duration_minutes} min
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-mono font-medium text-slate-900">
                    {formatRupee(item.price)}
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                        item.is_active
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {item.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(item.id)}
                      className={`text-xs px-2.5 py-1 rounded-md border font-medium transition-colors ${
                        item.is_active
                          ? 'text-rose-700 border-rose-200 hover:bg-rose-50'
                          : 'text-emerald-700 border-emerald-200 hover:bg-emerald-50'
                      }`}
                    >
                      {item.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

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
              <span className="font-semibold text-slate-900">{clinic.name}</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-slate-400 block text-xs">Location</span>
                <span className="text-slate-800">
                  {clinic.city}, {clinic.state}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-xs">Clinic Phone</span>
                <span className="font-mono text-slate-800">{clinic.phone}</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-slate-400 block text-xs">Timezone</span>
                <span className="text-slate-800">{clinic.timezone}</span>
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
