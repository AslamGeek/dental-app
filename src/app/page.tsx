'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { dentalStore } from '@/lib/store';
import { FollowUpItem } from '@/lib/types';
import TodayCard from '@/components/today/TodayCard';
import OutcomeModal from '@/components/today/OutcomeModal';
import BookAppointmentModal from '@/components/appointments/BookAppointmentModal';
import AddPatientModal from '@/components/patients/AddPatientModal';
import { formatRupee } from '@/lib/formatting';
import {
  CalendarCheck,
  Clock,
  AlertCircle,
  Sparkles,
  Search,
  CheckCircle2,
  CalendarPlus,
  UserPlus,
  Filter,
  IndianRupee,
  RefreshCw,
} from 'lucide-react';

type FilterTab = 'all' | 'overdue' | 'new_inquiry' | 'appointment_confirm' | 'missed_appointment' | 'treatment';

export default function TodayPage() {
  const [items, setItems] = useState<FollowUpItem[]>([]);
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal states
  const [selectedItem, setSelectedItem] = useState<FollowUpItem | null>(null);
  const [outcomeChannel, setOutcomeChannel] = useState<'call' | 'whatsapp'>('call');
  const [isOutcomeOpen, setIsOutcomeOpen] = useState(false);
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [isAddPatientOpen, setIsAddPatientOpen] = useState(false);

  const loadData = () => {
    setItems(dentalStore.getTodayFollowUps());
  };

  useEffect(() => {
    loadData();
    const unsubscribe = dentalStore.subscribe(loadData);
    return () => unsubscribe();
  }, []);

  // Compute metrics
  const overdueCount = useMemo(() => items.filter((i) => i.is_overdue).length, [items]);
  const newInquiriesCount = useMemo(() => items.filter((i) => i.category === 'new_inquiry').length, [items]);
  const confirmCount = useMemo(() => items.filter((i) => i.category === 'appointment_confirm').length, [items]);
  const missedCount = useMemo(() => items.filter((i) => i.category === 'missed_appointment').length, [items]);
  const treatmentFollowUpCount = useMemo(
    () => items.filter((i) => i.category === 'follow_up_today' || i.category === 'treatment_decision').length,
    [items]
  );
  const totalPipelineToday = useMemo(() => {
    return items.reduce((sum, i) => sum + (i.treatment?.estimated_value || 0), 0);
  }, [items]);

  // Filter items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Tab filter
      if (activeTab === 'overdue' && !item.is_overdue) return false;
      if (activeTab === 'new_inquiry' && item.category !== 'new_inquiry') return false;
      if (activeTab === 'appointment_confirm' && item.category !== 'appointment_confirm') return false;
      if (activeTab === 'missed_appointment' && item.category !== 'missed_appointment') return false;
      if (activeTab === 'treatment' && item.category !== 'follow_up_today' && item.category !== 'treatment_decision') return false;

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const nameMatch = item.patient.name.toLowerCase().includes(q);
        const phoneMatch = item.patient.phone.includes(q);
        const treatmentMatch = item.treatment?.treatment_name.toLowerCase().includes(q) || false;
        const titleMatch = item.title.toLowerCase().includes(q);
        if (!nameMatch && !phoneMatch && !treatmentMatch && !titleMatch) {
          return false;
        }
      }

      return true;
    });
  }, [items, activeTab, searchQuery]);

  const handleOpenOutcome = (item: FollowUpItem, defaultChannel: 'call' | 'whatsapp' = 'call') => {
    setSelectedItem(item);
    setOutcomeChannel(defaultChannel);
    setIsOutcomeOpen(true);
  };

  const handleConfirmAppointment = (appointmentId: string) => {
    dentalStore.updateAppointmentStatus(appointmentId, 'confirmed');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Today&apos;s Follow-Up Queue</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
              {items.length} Pending
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Prioritized clinical actions for Reception &amp; Staff. 1-tap call, WhatsApp, and auto-scheduling.
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setIsBookModalOpen(true)}
            className="btn-secondary text-xs sm:text-sm py-2 px-3.5"
          >
            <CalendarPlus className="w-4 h-4 text-slate-600" />
            <span>Book Appointment</span>
          </button>
          <button
            type="button"
            onClick={() => setIsAddPatientOpen(true)}
            className="btn-primary text-xs sm:text-sm py-2 px-3.5"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Patient</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Due Today</span>
            <Clock className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{items.length}</span>
            <span className="text-xs text-slate-500">actions</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-600 uppercase tracking-wider">Overdue</span>
            <AlertCircle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-rose-700">{overdueCount}</span>
            <span className="text-xs text-rose-600 font-medium">needs attention</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Confirmations</span>
            <CalendarCheck className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-blue-800">{confirmCount}</span>
            <span className="text-xs text-slate-500">appointments</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">Active Pipeline</span>
            <IndianRupee className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-bold text-emerald-800">
              {formatRupee(totalPipelineToday)}
            </span>
          </div>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="bg-white p-3 sm:p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search patient by name, phone (+91), or treatment..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-600 transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600 font-semibold"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Tab Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-medium">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
              activeTab === 'all'
                ? 'bg-slate-900 text-white font-semibold'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Today ({items.length})
          </button>

          {overdueCount > 0 && (
            <button
              type="button"
              onClick={() => setActiveTab('overdue')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                activeTab === 'overdue'
                  ? 'bg-rose-700 text-white font-semibold'
                  : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
              }`}
            >
              Overdue ({overdueCount})
            </button>
          )}

          {newInquiriesCount > 0 && (
            <button
              type="button"
              onClick={() => setActiveTab('new_inquiry')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                activeTab === 'new_inquiry'
                  ? 'bg-amber-600 text-white font-semibold'
                  : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
              }`}
            >
              New Inquiries ({newInquiriesCount})
            </button>
          )}

          {confirmCount > 0 && (
            <button
              type="button"
              onClick={() => setActiveTab('appointment_confirm')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                activeTab === 'appointment_confirm'
                  ? 'bg-blue-700 text-white font-semibold'
                  : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200'
              }`}
            >
              Confirmations ({confirmCount})
            </button>
          )}

          {missedCount > 0 && (
            <button
              type="button"
              onClick={() => setActiveTab('missed_appointment')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                activeTab === 'missed_appointment'
                  ? 'bg-orange-700 text-white font-semibold'
                  : 'bg-orange-50 text-orange-800 hover:bg-orange-100 border border-orange-200'
              }`}
            >
              Missed &amp; Reschedule ({missedCount})
            </button>
          )}

          {treatmentFollowUpCount > 0 && (
            <button
              type="button"
              onClick={() => setActiveTab('treatment')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                activeTab === 'treatment'
                  ? 'bg-emerald-700 text-white font-semibold'
                  : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
              }`}
            >
              Treatments ({treatmentFollowUpCount})
            </button>
          )}
        </div>
      </div>

      {/* Follow-up Cards Stream */}
      <div className="space-y-3">
        {filteredItems.length > 0 ? (
          filteredItems.map((item) => (
            <TodayCard
              key={item.id}
              item={item}
              onOpenOutcome={handleOpenOutcome}
              onConfirmAppointment={handleConfirmAppointment}
            />
          ))
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-xs">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-slate-900">
              {searchQuery ? 'No matching follow-ups found' : 'All caught up for today!'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto mt-1">
              {searchQuery
                ? `Try changing your search query "${searchQuery}" or clearing filters.`
                : 'No pending patient calls or reminders scheduled for right now. Great job keeping the clinic on track!'}
            </p>
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="btn-secondary text-xs mt-4"
              >
                Clear Search
              </button>
            )}
          </div>
        )}
      </div>

      {/* Outcome Logging Modal */}
      {selectedItem && (
        <OutcomeModal
          item={selectedItem}
          isOpen={isOutcomeOpen}
          onClose={() => {
            setIsOutcomeOpen(false);
            setSelectedItem(null);
          }}
          defaultChannel={outcomeChannel}
        />
      )}

      {/* Book Appointment Modal */}
      {isBookModalOpen && (
        <BookAppointmentModal
          isOpen={isBookModalOpen}
          onClose={() => setIsBookModalOpen(false)}
        />
      )}

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
