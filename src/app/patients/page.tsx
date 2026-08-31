'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { dentalStore } from '@/lib/store';
import { Patient, TreatmentOpportunity, FollowUp } from '@/lib/types';
import { formatRupee, formatPhoneNumber, getTelLink, getWhatsAppLink, formatDateDDMMYYYY } from '@/lib/formatting';
import AddPatientModal from '@/components/patients/AddPatientModal';
import {
  Users,
  Search,
  Plus,
  Phone,
  MessageSquare,
  AlertTriangle,
  ChevronRight,
  Sparkles,
  Calendar,
  IndianRupee,
  Clock,
} from 'lucide-react';

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [treatments, setTreatments] = useState<TreatmentOpportunity[]>([]);
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'active_treatment' | 'wrong_number' | 'has_followup'>('all');
  const [isAddPatientOpen, setIsAddPatientOpen] = useState(false);

  const loadData = () => {
    setPatients(dentalStore.getPatients());
    setTreatments(dentalStore.getTreatments());
    setFollowUps(dentalStore.getFollowUps());
  };

  useEffect(() => {
    loadData();
    const unsubscribe = dentalStore.subscribe(loadData);
    return () => unsubscribe();
  }, []);

  // Compute patient cards with treatments and next follow-up
  const patientData = useMemo(() => {
    return patients.map((patient) => {
      const patientTreatments = treatments.filter((t) => t.patient_id === patient.id);
      const activeTreatments = patientTreatments.filter((t) => t.status === 'considering');
      const totalPipeline = activeTreatments.reduce((sum, t) => sum + (t.estimated_value || 0), 0);
      const openFollowUp = followUps.find((f) => f.patient_id === patient.id && f.status === 'pending');

      return {
        patient,
        treatments: patientTreatments,
        activeTreatments,
        totalPipeline,
        openFollowUp,
      };
    });
  }, [patients, treatments, followUps]);

  // Filter patients
  const filteredPatients = useMemo(() => {
    return patientData.filter((item) => {
      if (filterType === 'active_treatment' && item.activeTreatments.length === 0) return false;
      if (filterType === 'wrong_number' && !item.patient.flagged_wrong_number) return false;
      if (filterType === 'has_followup' && !item.openFollowUp) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const nameMatch = item.patient.name.toLowerCase().includes(q);
        const phoneMatch = item.patient.phone.includes(q);
        const treatmentMatch = item.treatments.some((t) => t.treatment_name.toLowerCase().includes(q));
        if (!nameMatch && !phoneMatch && !treatmentMatch) return false;
      }

      return true;
    });
  }, [patientData, filterType, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Patients Directory</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
              {patients.length} Total
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Complete list of clinic contacts, active treatment plans, and contact history.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddPatientOpen(true)}
          className="btn-primary text-xs sm:text-sm py-2 px-4 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Patient</span>
        </button>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-3 sm:p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by patient name, phone number, or treatment..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-600"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-medium">
          <button
            type="button"
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
              filterType === 'all'
                ? 'bg-slate-900 text-white font-semibold'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Patients ({patients.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterType('active_treatment')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
              filterType === 'active_treatment'
                ? 'bg-emerald-700 text-white font-semibold'
                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
            }`}
          >
            Active Treatments ({patientData.filter((p) => p.activeTreatments.length > 0).length})
          </button>
          <button
            type="button"
            onClick={() => setFilterType('has_followup')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
              filterType === 'has_followup'
                ? 'bg-blue-700 text-white font-semibold'
                : 'bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-200'
            }`}
          >
            Pending Follow-Up ({patientData.filter((p) => !!p.openFollowUp).length})
          </button>
          <button
            type="button"
            onClick={() => setFilterType('wrong_number')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
              filterType === 'wrong_number'
                ? 'bg-rose-700 text-white font-semibold'
                : 'bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200'
            }`}
          >
            Wrong Number ({patients.filter((p) => p.flagged_wrong_number).length})
          </button>
        </div>
      </div>

      {/* Patient List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        {filteredPatients.length > 0 ? (
          filteredPatients.map(({ patient, treatments: pts, activeTreatments, totalPipeline, openFollowUp }) => (
            <div
              key={patient.id}
              className="card-elevated p-5 flex flex-col justify-between transition-all"
            >
              <div>
                {/* Header Row */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/patients/${patient.id}`}
                        className="text-base font-semibold text-slate-900 hover:text-emerald-700 transition-colors inline-flex items-center gap-1 group"
                      >
                        <span>{patient.name}</span>
                        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-700 group-hover:translate-x-0.5 transition-transform" />
                      </Link>

                      {patient.flagged_wrong_number && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                          <AlertTriangle className="w-3 h-3" />
                          Wrong No.
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-slate-500 font-mono mt-0.5">
                      {formatPhoneNumber(patient.phone)}
                    </div>

                    {(patient.location || patient.age !== undefined || patient.gender || patient.source) && (
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-1 flex-wrap">
                        {patient.location && (
                          <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">
                            {patient.location}
                          </span>
                        )}
                        {patient.age !== undefined && (
                          <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">
                            {patient.age} yrs
                          </span>
                        )}
                        {patient.gender && (
                          <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">
                            {patient.gender}
                          </span>
                        )}
                        {patient.source && (
                          <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">
                            {patient.source}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Quick Action Phone/WhatsApp */}
                  <div className="flex items-center gap-1 shrink-0">
                    <a
                      href={getTelLink(patient.phone)}
                      className="p-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                      title="Call Patient"
                    >
                      <Phone className="w-3.5 h-3.5" />
                    </a>
                    <a
                      href={getWhatsAppLink(patient.whatsapp_number || patient.phone, `Hello ${patient.name}, greeting from Lucky Dental Care, Proddatur.`)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
                      title="Send WhatsApp"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>

                {/* Treatment details */}
                <div className="mt-3 space-y-1.5 border-t border-slate-100 pt-2.5 text-xs text-slate-600">
                  {activeTreatments.length > 0 ? (
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-slate-700">
                        {activeTreatments[0].treatment_name}
                      </span>
                      {totalPipeline > 0 && (
                        <span className="font-semibold text-emerald-800">
                          {formatRupee(totalPipeline)}
                        </span>
                      )}
                    </div>
                  ) : pts.length > 0 ? (
                    <div className="text-slate-500">
                      {pts[0].treatment_name}{' '}
                      <span className="text-[10px] uppercase font-bold text-slate-400">
                        ({pts[0].status})
                      </span>
                    </div>
                  ) : (
                    <div className="text-slate-400 italic">No specific treatment recorded</div>
                  )}

                  {/* Follow-up / schedule context */}
                  {openFollowUp && (
                    <div className="flex items-center gap-1.5 text-[11px] text-amber-800 bg-amber-50 px-2 py-1 rounded">
                      <Clock className="w-3 h-3 text-amber-600 shrink-0" />
                      <span className="truncate">Next: {openFollowUp.title}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Card Footer */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                <span>Added {formatDateDDMMYYYY(patient.created_at)}</span>
                <Link
                  href={`/patients/${patient.id}`}
                  className="font-medium text-emerald-700 hover:text-emerald-800 inline-flex items-center gap-0.5"
                >
                  <span>View Details</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full bg-white rounded-xl border border-slate-200 p-12 text-center">
            <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-slate-900">No patients found</h3>
            <p className="text-xs text-slate-500 mt-1">
              Try modifying your search or filter options.
            </p>
          </div>
        )}
      </div>

      {/* Add Patient Modal */}
      {isAddPatientOpen && (
        <AddPatientModal
          isOpen={isAddPatientOpen}
          onClose={() => setIsAddPatientOpen(false)}
        />
      )}
    </div>
  );
}
