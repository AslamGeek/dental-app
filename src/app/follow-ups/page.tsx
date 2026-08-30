'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { dentalStore } from '@/lib/store';
import { FollowUp, Patient, TreatmentOpportunity, FollowUpItem } from '@/lib/types';
import { formatDateDDMMYYYY, formatPhoneNumber, getRelativeDueDateContext } from '@/lib/formatting';
import OutcomeModal from '@/components/today/OutcomeModal';
import {
  Clock,
  Search,
  CheckCircle2,
  Calendar,
  AlertCircle,
  Sparkles,
  ChevronRight,
  PhoneCall,
  History,
} from 'lucide-react';

export default function FollowUpsPage() {
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [treatments, setTreatments] = useState<TreatmentOpportunity[]>([]);
  const [statusFilter, setStatusFilter] = useState<'pending' | 'completed' | 'all'>('pending');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal state
  const [selectedItem, setSelectedItem] = useState<FollowUpItem | null>(null);
  const [isOutcomeOpen, setIsOutcomeOpen] = useState(false);

  const loadData = () => {
    setFollowUps(dentalStore.getFollowUps());
    setPatients(dentalStore.getPatients());
    setTreatments(dentalStore.getTreatments());
  };

  useEffect(() => {
    loadData();
    const unsubscribe = dentalStore.subscribe(loadData);
    return () => unsubscribe();
  }, []);

  // Hydrate follow-ups
  const hydratedItems = useMemo(() => {
    return followUps.map((f) => {
      const patient = patients.find((p) => p.id === f.patient_id);
      const treatment = treatments.find((t) => t.id === f.treatment_opportunity_id);
      const { isOverdue, isToday } = getRelativeDueDateContext(f.due_at);

      return {
        ...f,
        patient: patient || {
          id: f.patient_id,
          clinic_id: f.clinic_id,
          name: 'Unknown',
          phone: '',
          flagged_wrong_number: false,
          created_at: '',
          updated_at: '',
        },
        treatment,
        is_overdue: isOverdue,
        is_due_today: isToday,
      } as FollowUpItem;
    });
  }, [followUps, patients, treatments]);

  // Filter
  const filteredItems = useMemo(() => {
    return hydratedItems.filter((item) => {
      if (statusFilter !== 'all' && item.status !== statusFilter) return false;
      if (categoryFilter !== 'all' && item.category !== categoryFilter) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const nameMatch = item.patient.name.toLowerCase().includes(q);
        const phoneMatch = item.patient.phone.includes(q);
        const titleMatch = item.title.toLowerCase().includes(q);
        if (!nameMatch && !phoneMatch && !titleMatch) return false;
      }

      return true;
    });
  }, [hydratedItems, statusFilter, categoryFilter, searchQuery]);

  const handleOpenOutcome = (item: FollowUpItem) => {
    setSelectedItem(item);
    setIsOutcomeOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Follow-Up Master Queue</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
              {followUps.filter((f) => f.status === 'pending').length} Pending
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Complete registry of past and upcoming patient communications and scheduled reminders.
          </p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-3 sm:p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search follow-ups by patient, phone, or title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-600"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-medium">
          <button
            type="button"
            onClick={() => setStatusFilter('pending')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
              statusFilter === 'pending'
                ? 'bg-slate-900 text-white font-semibold'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Pending ({followUps.filter((f) => f.status === 'pending').length})
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
            Completed ({followUps.filter((f) => f.status === 'completed').length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
              statusFilter === 'all'
                ? 'bg-slate-700 text-white font-semibold'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All History ({followUps.length})
          </button>
        </div>
      </div>

      {/* Follow-up Items List */}
      <div className="space-y-3">
        {filteredItems.length > 0 ? (
          filteredItems.map((item) => (
            <div
              key={item.id}
              className="card-elevated p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all"
            >
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      item.status === 'completed'
                        ? 'bg-emerald-100 text-emerald-800'
                        : item.is_overdue
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {item.status === 'completed' ? 'Completed' : item.is_overdue ? 'Overdue' : 'Pending'}
                  </span>

                  <span className="text-xs text-slate-500 font-medium">
                    Due: {formatDateDDMMYYYY(item.due_at)}
                  </span>

                  {item.attempt_count > 0 && (
                    <span className="text-[11px] text-slate-400">
                      (Attempt #{item.attempt_count + 1})
                    </span>
                  )}
                </div>

                <div>
                  <Link
                    href={`/patients/${item.patient.id}`}
                    className="text-base font-semibold text-slate-900 hover:text-emerald-700 transition-colors inline-flex items-center gap-1 group"
                  >
                    <span>{item.patient.name}</span>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-700 group-hover:translate-x-0.5 transition-transform" />
                  </Link>

                  <div className="text-xs text-slate-500 font-mono">
                    {formatPhoneNumber(item.patient.phone)}
                  </div>
                </div>

                <p className="text-xs text-slate-600 italic">
                  &ldquo;{item.title}&rdquo;
                </p>
              </div>

              {/* Action */}
              {item.status === 'pending' && (
                <div className="shrink-0">
                  <button
                    type="button"
                    onClick={() => handleOpenOutcome(item)}
                    className="btn-primary text-xs py-1.5 px-3.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Log Outcome</span>
                  </button>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-xs">
            <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-slate-900">No follow-ups found</h3>
            <p className="text-xs text-slate-500 mt-1">
              Try adjusting your filter or search query.
            </p>
          </div>
        )}
      </div>

      {/* Outcome Modal */}
      {selectedItem && (
        <OutcomeModal
          item={selectedItem}
          isOpen={isOutcomeOpen}
          onClose={() => {
            setIsOutcomeOpen(false);
            setSelectedItem(null);
          }}
        />
      )}
    </div>
  );
}
