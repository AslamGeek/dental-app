'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { dentalStore } from '@/lib/store';
import { formatRupee, formatDateDDMMYYYY, formatPhoneNumber } from '@/lib/formatting';
import {
  BarChart3,
  IndianRupee,
  Clock,
  AlertCircle,
  CheckCircle2,
  Users,
  Calendar,
  ChevronRight,
  TrendingUp,
  Award,
  Sparkles,
} from 'lucide-react';

export default function SummaryPage() {
  const [metrics, setMetrics] = useState<ReturnType<typeof dentalStore.getSummaryMetrics>>({
    totalPotentialValue: 0,
    consideringCount: 0,
    dueTodayCount: 0,
    overdueCount: 0,
    patientTreatmentList: [],
  });
  const [totalPatients, setTotalPatients] = useState(0);
  const [totalAppointments, setTotalAppointments] = useState(0);
  const [interactions, setInteractions] = useState<any[]>([]);

  const loadData = () => {
    setMetrics(dentalStore.getSummaryMetrics());
    setTotalPatients(dentalStore.getPatients().length);
    setTotalAppointments(dentalStore.getAppointments().length);
    setInteractions(dentalStore.getInteractions());
  };

  useEffect(() => {
    loadData();
    const unsubscribe = dentalStore.subscribe(loadData);
    return () => unsubscribe();
  }, []);

  // Outcome statistics breakdown
  const outcomeStats = useMemo(() => {
    const counts: Record<string, number> = {
      appointment_booked: 0,
      interested: 0,
      needs_time: 0,
      call_back_later: 0,
      no_answer: 0,
      not_interested: 0,
      wrong_number: 0,
    };

    interactions.forEach((i) => {
      if (counts[i.outcome] !== undefined) {
        counts[i.outcome]++;
      }
    });

    return counts;
  }, [interactions]);

  return (
    <div className="space-y-6">
      {/* Top Welcome Banner */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white p-6 rounded-2xl shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-700/80 text-emerald-100 border border-emerald-600">
                Dentist &amp; Owner Executive View
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold mt-2">
              Dr. Harsha Vardhan Reddy
            </h1>
            <p className="text-emerald-100 text-xs sm:text-sm mt-1 max-w-xl">
              Sree Balaji Dental Care, Kadapa — Active Treatment Pipeline &amp; Conversion Dashboard
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-xs rounded-xl p-4 border border-white/20 text-center sm:text-right shrink-0">
            <div className="text-xs font-medium text-emerald-200 uppercase tracking-wider">
              Total Considering Pipeline
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              {formatRupee(metrics.totalPotentialValue)}
            </div>
            <div className="text-xs text-emerald-200 mt-0.5">
              Across {metrics.consideringCount} active cases
            </div>
          </div>
        </div>
      </div>

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Under Consideration
            </span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-slate-900">
              {metrics.consideringCount}
            </span>
            <span className="text-xs text-slate-500">treatments</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-600 uppercase tracking-wider">
              Overdue Actions
            </span>
            <AlertCircle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-rose-700">
              {metrics.overdueCount}
            </span>
            <span className="text-xs text-rose-600 font-medium">requires follow-up</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
              Appointments Booked
            </span>
            <Calendar className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-blue-800">
              {totalAppointments}
            </span>
            <span className="text-xs text-slate-500">scheduled</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Patients
            </span>
            <Users className="w-4 h-4 text-slate-600" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-slate-900">
              {totalPatients}
            </span>
            <span className="text-xs text-slate-500">registered</span>
          </div>
        </div>
      </div>

      {/* Main High-Value Pipeline Table */}
      <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Active Treatment Opportunities Under Consideration
            </h2>
            <p className="text-xs text-slate-500">
              Patients proposed high-value treatments with scheduled next touches
            </p>
          </div>
          <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            {formatRupee(metrics.totalPotentialValue)} Total
          </span>
        </div>

        {metrics.patientTreatmentList.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 text-[11px] uppercase tracking-wider">
                  <th className="py-2.5 font-semibold">Patient</th>
                  <th className="py-2.5 font-semibold">Treatment Proposal</th>
                  <th className="py-2.5 font-semibold">Estimated Value</th>
                  <th className="py-2.5 font-semibold">Next Follow-Up</th>
                  <th className="py-2.5 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {metrics.patientTreatmentList.map(({ treatment, patient, nextFollowUp }) => (
                  <tr key={treatment.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 font-medium text-slate-900">
                      {patient ? (
                        <div>
                          <Link
                            href={`/patients/${patient.id}`}
                            className="font-semibold text-slate-900 hover:text-emerald-700 transition-colors"
                          >
                            {patient.name}
                          </Link>
                          <div className="text-xs text-slate-400 font-mono">
                            {formatPhoneNumber(patient.phone)}
                          </div>
                        </div>
                      ) : (
                        'Unknown'
                      )}
                    </td>

                    <td className="py-3 text-slate-800 font-medium">
                      {treatment.treatment_name}
                    </td>

                    <td className="py-3 font-bold text-emerald-800">
                      {treatment.estimated_value > 0
                        ? formatRupee(treatment.estimated_value)
                        : '—'}
                    </td>

                    <td className="py-3 text-slate-600">
                      {nextFollowUp ? (
                        <div className="space-y-0.5">
                          <span className="text-xs font-medium text-amber-800 bg-amber-50 px-2 py-0.5 rounded inline-block">
                            Due {formatDateDDMMYYYY(nextFollowUp.due_at)}
                          </span>
                          <div className="text-[11px] text-slate-400 truncate max-w-xs">
                            {nextFollowUp.title}
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 italic">No open follow-up</span>
                      )}
                    </td>

                    <td className="py-3 text-right">
                      {patient && (
                        <Link
                          href={`/patients/${patient.id}`}
                          className="btn-secondary text-xs py-1 px-2.5 inline-flex items-center gap-1"
                        >
                          <span>Review</span>
                          <ChevronRight className="w-3 h-3" />
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-xs text-slate-400 italic py-4 text-center">
            No active considering cases in pipeline right now.
          </p>
        )}
      </div>

      {/* Staff Activity & Conversion Stats */}
      <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="border-b border-slate-100 pb-3">
          <h2 className="text-base font-semibold text-slate-900">
            Interaction &amp; Outreach Conversion Summary
          </h2>
          <p className="text-xs text-slate-500">
            Breakdown of logged receptionist patient responses across calls &amp; WhatsApp
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-lg">
            <div className="text-[11px] font-bold text-emerald-800 uppercase">Booked &amp; Accepted</div>
            <div className="text-2xl font-bold text-emerald-900 mt-1">
              {outcomeStats.appointment_booked}
            </div>
            <div className="text-[11px] text-emerald-700">High conversion</div>
          </div>

          <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-lg">
            <div className="text-[11px] font-bold text-blue-800 uppercase">Needs Time / Callback</div>
            <div className="text-2xl font-bold text-blue-900 mt-1">
              {outcomeStats.needs_time + outcomeStats.call_back_later}
            </div>
            <div className="text-[11px] text-blue-700">Follow-up active</div>
          </div>

          <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-lg">
            <div className="text-[11px] font-bold text-amber-800 uppercase">No Answer Retries</div>
            <div className="text-2xl font-bold text-amber-900 mt-1">
              {outcomeStats.no_answer}
            </div>
            <div className="text-[11px] text-amber-700">Scheduled retry</div>
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg">
            <div className="text-[11px] font-bold text-slate-700 uppercase">Declined / Wrong No.</div>
            <div className="text-2xl font-bold text-slate-900 mt-1">
              {outcomeStats.not_interested + outcomeStats.wrong_number}
            </div>
            <div className="text-[11px] text-slate-500">Pipeline cleaned</div>
          </div>
        </div>
      </div>
    </div>
  );
}
