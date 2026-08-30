'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { dentalStore } from '@/lib/store';
import { Appointment, Patient, AppointmentStatus } from '@/lib/types';
import {
  formatDateDDMMYYYY,
  formatTime12H,
  formatPhoneNumber,
  getTelLink,
  getWhatsAppLink,
} from '@/lib/formatting';
import BookAppointmentModal from '@/components/appointments/BookAppointmentModal';
import {
  Calendar,
  Plus,
  Search,
  CheckCircle2,
  CalendarCheck,
  Phone,
  MessageSquare,
  AlertCircle,
  Clock,
  ChevronRight,
  Filter,
} from 'lucide-react';

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | AppointmentStatus>('all');
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);

  const loadData = () => {
    setAppointments(dentalStore.getAppointments());
    setPatients(dentalStore.getPatients());
  };

  useEffect(() => {
    loadData();
    const unsubscribe = dentalStore.subscribe(loadData);
    return () => unsubscribe();
  }, []);

  // Hydrate appointments with patient data
  const hydratedAppointments = useMemo(() => {
    return appointments.map((appt) => {
      const patient = patients.find((p) => p.id === appt.patient_id);
      return {
        ...appt,
        patient,
      };
    });
  }, [appointments, patients]);

  // Filter
  const filteredAppointments = useMemo(() => {
    return hydratedAppointments.filter((appt) => {
      if (statusFilter !== 'all' && appt.status !== statusFilter) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const patientName = appt.patient?.name.toLowerCase() || '';
        const phone = appt.patient?.phone || '';
        const treatment = appt.treatment_name.toLowerCase();
        if (!patientName.includes(q) && !phone.includes(q) && !treatment.includes(q)) {
          return false;
        }
      }

      return true;
    });
  }, [hydratedAppointments, statusFilter, searchQuery]);

  // Group by Today, Tomorrow, Upcoming, Past
  const grouped = useMemo(() => {
    const todayStr = new Date().toISOString().slice(0, 10);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().slice(0, 10);

    const today: typeof filteredAppointments = [];
    const tomorrowList: typeof filteredAppointments = [];
    const upcoming: typeof filteredAppointments = [];
    const past: typeof filteredAppointments = [];

    filteredAppointments.forEach((appt) => {
      if (appt.appointment_date === todayStr) {
        today.push(appt);
      } else if (appt.appointment_date === tomorrowStr) {
        tomorrowList.push(appt);
      } else if (appt.appointment_date > tomorrowStr) {
        upcoming.push(appt);
      } else {
        past.push(appt);
      }
    });

    // Sort by date/time
    const sortByDateTime = (
      a: { appointment_date: string; appointment_time: string },
      b: { appointment_date: string; appointment_time: string }
    ) =>
      `${a.appointment_date} ${a.appointment_time}`.localeCompare(
        `${b.appointment_date} ${b.appointment_time}`
      );

    return {
      today: today.sort(sortByDateTime),
      tomorrow: tomorrowList.sort(sortByDateTime),
      upcoming: upcoming.sort(sortByDateTime),
      past: past.sort((a, b) => sortByDateTime(b, a)), // reverse sort for past
    };
  }, [filteredAppointments]);

  const handleUpdateStatus = (appointmentId: string, status: AppointmentStatus) => {
    dentalStore.updateAppointmentStatus(appointmentId, status);
  };

  const renderAppointmentCard = (appt: (typeof filteredAppointments)[0]) => {
    const p = appt.patient;
    const whatsappMsg = `Hello ${p?.name || 'Patient'}, confirming your appointment at Sree Balaji Dental Care on ${formatDateDDMMYYYY(appt.appointment_date)} at ${formatTime12H(appt.appointment_time)} (${appt.treatment_name}).`;

    return (
      <div
        key={appt.id}
        className="card-elevated p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all"
      >
        <div className="space-y-1.5 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                appt.status === 'confirmed'
                  ? 'bg-blue-100 text-blue-800'
                  : appt.status === 'scheduled'
                  ? 'bg-amber-100 text-amber-800'
                  : appt.status === 'completed'
                  ? 'bg-emerald-100 text-emerald-800'
                  : appt.status === 'no_show'
                  ? 'bg-rose-100 text-rose-800'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {appt.status.replace('_', ' ')}
            </span>

            <span className="text-xs font-semibold text-slate-800">
              {formatDateDDMMYYYY(appt.appointment_date)} · {formatTime12H(appt.appointment_time)}
            </span>
          </div>

          <div>
            {p ? (
              <Link
                href={`/patients/${p.id}`}
                className="text-base font-semibold text-slate-900 hover:text-emerald-700 transition-colors inline-flex items-center gap-1 group"
              >
                <span>{p.name}</span>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-700 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            ) : (
              <span className="text-base font-semibold text-slate-900">Unknown Patient</span>
            )}

            <div className="text-xs text-slate-500 font-mono mt-0.5">
              {p ? formatPhoneNumber(p.phone) : ''}
            </div>
          </div>

          <p className="text-xs text-slate-600 font-medium">{appt.treatment_name}</p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap shrink-0">
          {p && (
            <>
              <a
                href={getTelLink(p.phone)}
                className="btn-call text-xs py-1.5 px-3"
                title="Call"
              >
                <Phone className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Call</span>
              </a>
              <a
                href={getWhatsAppLink(p.phone, whatsappMsg)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-whatsapp text-xs py-1.5 px-3"
                title="WhatsApp Reminder"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">WhatsApp</span>
              </a>
            </>
          )}

          {appt.status !== 'confirmed' && appt.status !== 'completed' && (
            <button
              type="button"
              onClick={() => handleUpdateStatus(appt.id, 'confirmed')}
              className="btn-secondary text-xs py-1.5 px-3 text-blue-700"
            >
              <CalendarCheck className="w-3.5 h-3.5" />
              <span>Confirm</span>
            </button>
          )}

          {appt.status !== 'completed' && (
            <button
              type="button"
              onClick={() => handleUpdateStatus(appt.id, 'completed')}
              className="btn-secondary text-xs py-1.5 px-3 text-emerald-700"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Completed</span>
            </button>
          )}

          {appt.status !== 'no_show' && appt.status !== 'completed' && (
            <button
              type="button"
              onClick={() => handleUpdateStatus(appt.id, 'no_show')}
              className="btn-secondary text-xs py-1.5 px-3 text-rose-600"
              title="Mark No Show and automatically create reschedule follow-up"
            >
              <AlertCircle className="w-3.5 h-3.5" />
              <span>No-Show</span>
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Clinic Appointments</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
              {appointments.length} Total
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Manage dental schedule, confirm tomorrow&apos;s visits, and track completed procedures.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsBookModalOpen(true)}
          className="btn-primary text-xs sm:text-sm py-2 px-4 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Book Appointment</span>
        </button>
      </div>

      {/* Search & Filter */}
      <div className="bg-white p-3 sm:p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search appointments by patient name, phone, or procedure..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-600"
          />
        </div>

        {/* Status Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-medium">
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
              statusFilter === 'all'
                ? 'bg-slate-900 text-white font-semibold'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All ({appointments.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('scheduled')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
              statusFilter === 'scheduled'
                ? 'bg-amber-700 text-white font-semibold'
                : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
            }`}
          >
            Scheduled ({appointments.filter((a) => a.status === 'scheduled').length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('confirmed')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
              statusFilter === 'confirmed'
                ? 'bg-blue-700 text-white font-semibold'
                : 'bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-200'
            }`}
          >
            Confirmed ({appointments.filter((a) => a.status === 'confirmed').length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('completed')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
              statusFilter === 'completed'
                ? 'bg-emerald-700 text-white font-semibold'
                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
            }`}
          >
            Completed ({appointments.filter((a) => a.status === 'completed').length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('no_show')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
              statusFilter === 'no_show'
                ? 'bg-rose-700 text-white font-semibold'
                : 'bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200'
            }`}
          >
            No-Show ({appointments.filter((a) => a.status === 'no_show').length})
          </button>
        </div>
      </div>

      {/* Sections Grouped by Date */}
      <div className="space-y-6">
        {/* Today's Appointments */}
        {grouped.today.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">
                Today ({grouped.today.length})
              </h2>
            </div>
            <div className="space-y-3">{grouped.today.map(renderAppointmentCard)}</div>
          </div>
        )}

        {/* Tomorrow's Appointments */}
        {grouped.tomorrow.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-600"></span>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">
                Tomorrow ({grouped.tomorrow.length})
              </h2>
            </div>
            <div className="space-y-3">{grouped.tomorrow.map(renderAppointmentCard)}</div>
          </div>
        )}

        {/* Upcoming Appointments */}
        {grouped.upcoming.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-slate-400"></span>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">
                Upcoming ({grouped.upcoming.length})
              </h2>
            </div>
            <div className="space-y-3">{grouped.upcoming.map(renderAppointmentCard)}</div>
          </div>
        )}

        {/* Past Appointments */}
        {grouped.past.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-slate-300"></span>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">
                Past Visits ({grouped.past.length})
              </h2>
            </div>
            <div className="space-y-3">{grouped.past.map(renderAppointmentCard)}</div>
          </div>
        )}

        {filteredAppointments.length === 0 && (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-xs">
            <Calendar className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-slate-900">No appointments found</h3>
            <p className="text-xs text-slate-500 mt-1">
              Try adjusting your search or filters.
            </p>
          </div>
        )}
      </div>

      {/* Book Appointment Modal */}
      {isBookModalOpen && (
        <BookAppointmentModal
          isOpen={isBookModalOpen}
          onClose={() => setIsBookModalOpen(false)}
        />
      )}
    </div>
  );
}
