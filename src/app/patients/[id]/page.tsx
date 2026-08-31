'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { dentalStore } from '@/lib/store';
import {
  Patient,
  TreatmentOpportunity,
  Appointment,
  Interaction,
  FollowUp,
  PREDEFINED_TREATMENTS,
} from '@/lib/types';
import {
  formatPhoneNumber,
  getTelLink,
  getWhatsAppLink,
  formatDateDDMMYYYY,
  formatTime12H,
} from '@/lib/formatting';
import BookAppointmentModal from '@/components/appointments/BookAppointmentModal';
import {
  ArrowLeft,
  Phone,
  MessageSquare,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Edit2,
  Check,
  X,
  XCircle,
  History,
  MapPin,
  User as UserIcon,
  Tag,
} from 'lucide-react';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function PatientDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const patientId = resolvedParams.id;

  const todayStr = new Date().toISOString().slice(0, 10);

  const [patient, setPatient] = useState<Patient | null>(null);
  const [treatments, setTreatments] = useState<TreatmentOpportunity[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);

  // Modal / form states
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [newPhone, setNewPhone] = useState('');
  const [isAddTreatmentOpen, setIsAddTreatmentOpen] = useState(false);
  const [selectedTreatment, setSelectedTreatment] = useState<string>(PREDEFINED_TREATMENTS[0]);
  const [customTreatmentName, setCustomTreatmentName] = useState('');
  const [isScheduleFollowUpOpen, setIsScheduleFollowUpOpen] = useState(false);
  const [followUpTitle, setFollowUpTitle] = useState('');
  const [followUpDate, setFollowUpDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    return d.toISOString().slice(0, 10);
  });
  const [dateError, setDateError] = useState('');

  const loadData = () => {
    const p = dentalStore.getPatientById(patientId);
    if (p) {
      setPatient({ ...p });
      setNewPhone(p.phone);
      setTreatments(dentalStore.getTreatmentsForPatient(patientId));
      setAppointments(dentalStore.getAppointmentsForPatient(patientId));
      setInteractions(dentalStore.getInteractionsForPatient(patientId));
      setFollowUps(dentalStore.getFollowUpsForPatient(patientId));
    } else {
      setPatient(null);
    }
  };

  useEffect(() => {
    loadData();
    const unsubscribe = dentalStore.subscribe(loadData);
    return () => unsubscribe();
  }, [patientId]);

  if (!patient) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-xs">
        <h2 className="text-lg font-semibold text-slate-900">Patient Not Found</h2>
        <p className="text-sm text-slate-500 mt-1">
          The requested patient ID could not be located in local clinic records.
        </p>
        <Link href="/patients" className="btn-primary text-xs mt-4 inline-flex">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Patients</span>
        </Link>
      </div>
    );
  }

  const handleUpdatePhone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPhone.trim()) return;
    dentalStore.updatePatientPhone(patientId, newPhone);
    setIsEditingPhone(false);
  };

  const handleAddTreatment = (e: React.FormEvent) => {
    e.preventDefault();
    const treatmentName =
      selectedTreatment === 'Other'
        ? customTreatmentName.trim()
        : selectedTreatment;

    if (!treatmentName) return;

    dentalStore.addTreatment({
      patient_id: patientId,
      treatment_name: treatmentName,
    });
    setSelectedTreatment(PREDEFINED_TREATMENTS[0]);
    setCustomTreatmentName('');
    setIsAddTreatmentOpen(false);
  };

  const handleScheduleFollowUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!followUpDate) return;
    if (followUpDate < todayStr) {
      setDateError('Follow-up date must be today or a future date.');
      return;
    }
    setDateError('');
    dentalStore.scheduleManualFollowUp({
      patient_id: patientId,
      due_at: new Date(`${followUpDate}T11:00:00`).toISOString(),
      title: followUpTitle.trim() || 'Scheduled Follow-Up Call',
    });
    setFollowUpTitle('');
    setIsScheduleFollowUpOpen(false);
  };

  const activeTreatments = treatments.filter((t) => t.status === 'considering');
  const openFollowUp = followUps.find((f) => f.status === 'pending');
  const whatsappTargetNumber = patient.whatsapp_number || patient.phone;

  return (
    <div className="space-y-6">
      {/* Back Link */}
      <div>
        <Link
          href="/patients"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Patients Directory</span>
        </Link>
      </div>

      {/* Patient Profile Card */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          {/* Avatar & Patient Info */}
          <div className="flex items-start gap-4 flex-1">
            <div className="w-14 h-14 rounded-2xl bg-emerald-700 text-white flex items-center justify-center font-bold text-2xl shadow-sm shrink-0">
              {patient.name.charAt(0)}
            </div>

            <div className="space-y-1.5 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900">{patient.name}</h1>
                {patient.flagged_wrong_number ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">
                    <AlertTriangle className="w-3 h-3" />
                    Flagged Wrong Number
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3" />
                    Active Patient
                  </span>
                )}
              </div>

              {/* Phone Row */}
              {isEditingPhone ? (
                <form onSubmit={handleUpdatePhone} className="flex items-center gap-2 mt-2">
                  <input
                    type="tel"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="px-2.5 py-1 text-xs border border-slate-300 rounded font-mono focus:outline-none focus:ring-1 focus:ring-emerald-600"
                    placeholder="9876543210"
                    maxLength={10}
                    autoFocus
                  />
                  <button type="submit" className="btn-primary text-xs py-1 px-2">
                    <Check className="w-3 h-3" />
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditingPhone(false)}
                    className="btn-secondary text-xs py-1 px-2"
                  >
                    Cancel
                  </button>
                </form>
              ) : (
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm font-mono text-slate-700">
                    {formatPhoneNumber(patient.phone)}
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsEditingPhone(true)}
                    className="text-slate-400 hover:text-slate-600 p-0.5"
                    title="Edit Phone Number"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                </div>
              )}

              {/* Extended Profile Attributes */}
              <div className="flex items-center gap-3 text-xs text-slate-600 pt-1 flex-wrap">
                {patient.age !== undefined && (
                  <span className="inline-flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                    <UserIcon className="w-3 h-3 text-slate-500" />
                    {patient.age} yrs
                  </span>
                )}
                {patient.gender && (
                  <span className="inline-flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                    {patient.gender}
                  </span>
                )}
                {patient.location && (
                  <span className="inline-flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                    <MapPin className="w-3 h-3 text-slate-500" />
                    {patient.location}
                  </span>
                )}
                {patient.source && (
                  <span className="inline-flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                    <Tag className="w-3 h-3 text-slate-500" />
                    {patient.source}
                  </span>
                )}
                {patient.whatsapp_number && patient.whatsapp_number !== patient.phone && (
                  <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded font-mono">
                    <MessageSquare className="w-3 h-3 text-emerald-600" />
                    WA: {formatPhoneNumber(patient.whatsapp_number)}
                  </span>
                )}
              </div>

              {patient.notes && (
                <div className="text-xs text-slate-700 mt-2 bg-slate-50 border border-slate-200/80 rounded-md p-2.5">
                  <span className="font-semibold text-slate-900">Notes: </span>
                  {patient.notes}
                </div>
              )}

              <p className="text-[11px] text-slate-400 mt-1">
                Patient registered on {formatDateDDMMYYYY(patient.created_at)}
              </p>
            </div>
          </div>

          {/* Contact and Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap shrink-0">
            <a
              href={getTelLink(patient.phone)}
              className="btn-call text-xs sm:text-sm py-2 px-3.5"
            >
              <Phone className="w-4 h-4" />
              <span>Call</span>
            </a>
            <a
              href={getWhatsAppLink(
                whatsappTargetNumber,
                `Hello ${patient.name}, greeting from Lucky Dental Care, Proddatur.`
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-whatsapp text-xs sm:text-sm py-2 px-3.5"
            >
              <MessageSquare className="w-4 h-4" />
              <span>WhatsApp</span>
            </a>
            <button
              type="button"
              onClick={() => setIsBookModalOpen(true)}
              className="btn-primary text-xs sm:text-sm py-2 px-3.5"
            >
              <Calendar className="w-4 h-4" />
              <span>Book Appt</span>
            </button>
            <button
              type="button"
              onClick={() => setIsScheduleFollowUpOpen(true)}
              className="btn-secondary text-xs sm:text-sm py-2 px-3.5"
            >
              <Clock className="w-4 h-4 text-slate-600" />
              <span>Set Follow-up</span>
            </button>
          </div>
        </div>

        {/* Current Active Follow-Up Notice */}
        {openFollowUp && (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center justify-between gap-3 text-xs text-amber-900">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-700 shrink-0" />
              <span>
                <strong>Next Pending Action:</strong> &ldquo;{openFollowUp.title}&rdquo; (Due:{' '}
                {formatDateDDMMYYYY(openFollowUp.due_at)})
              </span>
            </div>
            <Link
              href="/"
              className="font-bold text-amber-800 hover:text-amber-950 underline shrink-0"
            >
              Open Today Queue
            </Link>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Treatments & Appointments */}
        <div className="lg:col-span-2 space-y-6">
          {/* Treatments Section */}
          <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-base font-semibold text-slate-900">Treatment Opportunities</h2>
                <p className="text-xs text-slate-500">Proposed and active dental procedures</p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddTreatmentOpen(true)}
                className="btn-secondary text-xs py-1.5 px-3"
              >
                <Plus className="w-3.5 h-3.5 text-slate-600" />
                <span>Add Treatment</span>
              </button>
            </div>

            {/* Add Treatment Form */}
            {isAddTreatmentOpen && (
              <form
                onSubmit={handleAddTreatment}
                className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3 animate-in fade-in duration-150"
              >
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Select Treatment Procedure
                    </label>
                    <select
                      value={selectedTreatment}
                      onChange={(e) => setSelectedTreatment(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                    >
                      {PREDEFINED_TREATMENTS.map((tr) => (
                        <option key={tr} value={tr}>
                          {tr}
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedTreatment === 'Other' && (
                    <div className="mt-2 animate-in fade-in duration-150">
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Specify Treatment Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Laser Gum Treatment, Night Guard"
                        value={customTreatmentName}
                        onChange={(e) => setCustomTreatmentName(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                      />
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsAddTreatmentOpen(false)}
                    className="btn-secondary text-xs py-1 px-2.5"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary text-xs py-1 px-3">
                    Save Treatment
                  </button>
                </div>
              </form>
            )}

            {/* Treatments List */}
            <div className="space-y-3">
              {treatments.length > 0 ? (
                treatments.map((t) => (
                  <div
                    key={t.id}
                    className="p-4 rounded-lg border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900 text-sm">
                          {t.treatment_name}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                            t.status === 'considering'
                              ? 'bg-amber-100 text-amber-800'
                              : t.status === 'scheduled'
                              ? 'bg-blue-100 text-blue-800'
                              : t.status === 'completed'
                              ? 'bg-emerald-100 text-emerald-800'
                              : t.status === 'accepted'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {t.status}
                        </span>
                      </div>
                      {t.decline_reason && (
                        <p className="text-xs text-rose-600 italic mt-1">
                          Reason: {t.decline_reason}
                        </p>
                      )}
                    </div>

                    {/* Action buttons if considering */}
                    {t.status === 'considering' && (
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            dentalStore.markTreatmentDeclined(patientId, 'Patient chose not to proceed');
                          }}
                          className="btn-secondary text-xs py-1 px-2 text-rose-600 hover:text-rose-700"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Declined</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            dentalStore.updateTreatmentStatus(t.id, 'completed');
                          }}
                          className="btn-secondary text-xs py-1 px-2 text-emerald-700 hover:text-emerald-800"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Done</span>
                        </button>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 italic py-2">
                  No treatments recorded for this patient yet.
                </p>
              )}
            </div>
          </div>

          {/* Appointments Section */}
          <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-base font-semibold text-slate-900">Appointments Schedule</h2>
                <p className="text-xs text-slate-500">Upcoming visits and visit history</p>
              </div>
              <button
                type="button"
                onClick={() => setIsBookModalOpen(true)}
                className="btn-primary text-xs py-1.5 px-3"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Book Slot</span>
              </button>
            </div>

            <div className="space-y-3">
              {appointments.length > 0 ? (
                appointments.map((appt) => (
                  <div
                    key={appt.id}
                    className="p-4 rounded-lg border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900 text-sm">
                          {formatDateDDMMYYYY(appt.appointment_date)} at {formatTime12H(appt.appointment_time)}
                        </span>
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
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5">{appt.treatment_name}</p>
                    </div>

                    {/* Quick status buttons */}
                    <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
                      {appt.status !== 'confirmed' && appt.status !== 'completed' && (
                        <button
                          type="button"
                          onClick={() => dentalStore.updateAppointmentStatus(appt.id, 'confirmed')}
                          className="btn-secondary text-xs py-1 px-2 text-blue-700"
                        >
                          <Check className="w-3 h-3" />
                          <span>Confirm</span>
                        </button>
                      )}

                      {appt.status !== 'completed' && (
                        <button
                          type="button"
                          onClick={() => dentalStore.updateAppointmentStatus(appt.id, 'completed')}
                          className="btn-secondary text-xs py-1 px-2 text-emerald-700"
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Completed</span>
                        </button>
                      )}

                      {appt.status !== 'no_show' && appt.status !== 'completed' && (
                        <button
                          type="button"
                          onClick={() => dentalStore.updateAppointmentStatus(appt.id, 'no_show')}
                          className="btn-secondary text-xs py-1 px-2 text-rose-600"
                          title="Mark No-Show (Automatically queues reschedule follow-up)"
                        >
                          <span>No-Show</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 italic py-2">
                  No appointments scheduled.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Interaction & Follow-Up History */}
        <div className="space-y-6">
          <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                <History className="w-4 h-4 text-emerald-700" />
                <span>Interaction Timeline</span>
              </h2>
              <p className="text-xs text-slate-500">Log of clinic calls &amp; WhatsApp messages</p>
            </div>

            <div className="space-y-4">
              {interactions.length > 0 ? (
                interactions.map((interaction) => (
                  <div
                    key={interaction.id}
                    className="relative pl-4 border-l-2 border-slate-200 space-y-1"
                  >
                    <div className="absolute -left-[5px] top-1 w-2 h-2 rounded-full bg-emerald-600"></div>
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span className="font-semibold text-slate-700 capitalize">
                        {interaction.channel} · {interaction.outcome.replace('_', ' ')}
                      </span>
                      <span>{formatDateDDMMYYYY(interaction.occurred_at)}</span>
                    </div>
                    {interaction.notes && (
                      <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded border border-slate-100">
                        {interaction.notes}
                      </p>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 italic py-2">
                  No interaction logs recorded yet.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Book Appointment Modal */}
      {isBookModalOpen && (
        <BookAppointmentModal
          isOpen={isBookModalOpen}
          initialPatientId={patientId}
          initialTreatmentId={activeTreatments[0]?.id}
          onClose={() => setIsBookModalOpen(false)}
        />
      )}

      {/* Schedule Manual Follow-Up Modal */}
      {isScheduleFollowUpOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full shadow-xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h2 className="text-base font-semibold text-slate-900">Schedule Follow-Up</h2>
              <button
                type="button"
                onClick={() => setIsScheduleFollowUpOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleScheduleFollowUp} className="p-6 space-y-4">
              {dateError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 font-medium flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{dateError}</span>
                </div>
              )}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Follow-Up Reason / Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Call to check if ready for Dental Implant"
                  value={followUpTitle}
                  onChange={(e) => setFollowUpTitle(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg text-slate-900"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Due Date</label>
                <input
                  type="date"
                  required
                  min={todayStr}
                  value={followUpDate}
                  onChange={(e) => {
                    setFollowUpDate(e.target.value);
                    setDateError('');
                  }}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg text-slate-900"
                />
              </div>
              <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsScheduleFollowUpOpen(false);
                    setDateError('');
                  }}
                  className="btn-secondary text-sm py-2 px-4"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary text-sm py-2 px-5">
                  Schedule Follow-Up
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
