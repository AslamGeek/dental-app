'use client';

import React from 'react';
import Link from 'next/link';
import { FollowUpItem } from '@/lib/types';
import { 
  formatRupee, 
  formatPhoneNumber, 
  getTelLink, 
  getWhatsAppLink,
  formatTime12H,
  formatDateDDMMYYYY
} from '@/lib/formatting';
import { 
  Phone, 
  MessageSquare, 
  Check, 
  Calendar, 
  AlertCircle,
  Clock,
  Sparkles,
  ChevronRight
} from 'lucide-react';

interface TodayCardProps {
  item: FollowUpItem;
  onOpenOutcome: (item: FollowUpItem, defaultChannel?: 'call' | 'whatsapp') => void;
  onConfirmAppointment?: (appointmentId: string) => void;
}

export default function TodayCard({
  item,
  onOpenOutcome,
  onConfirmAppointment,
}: TodayCardProps) {
  const isAppointmentConfirm = item.category === 'appointment_confirm';
  const isMissedAppointment = item.category === 'missed_appointment';
  const isNewInquiry = item.category === 'new_inquiry';

  // Category Badge Config
  const getBadge = () => {
    if (item.is_overdue) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-600"></span>
          Overdue
        </span>
      );
    }
    if (isNewInquiry) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
          <Sparkles className="w-3 h-3 text-amber-600" />
          New inquiry
        </span>
      );
    }
    if (isMissedAppointment) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-50 text-orange-700 border border-orange-200">
          <AlertCircle className="w-3 h-3 text-orange-600" />
          Missed appointment
        </span>
      );
    }
    if (isAppointmentConfirm) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
          <Calendar className="w-3 h-3 text-blue-600" />
          Appointment confirmation
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
        <Clock className="w-3 h-3 text-emerald-600" />
        Follow up today
      </span>
    );
  };

  // WhatsApp prefilled message
  const getPrefilledWhatsAppText = () => {
    const clinicName = 'Lucky Dental Care';
    if (isAppointmentConfirm && item.appointment) {
      return `Hello ${item.patient.name}, this is from ${clinicName}, Proddatur. Confirming your dental appointment for ${formatDateDDMMYYYY(item.appointment.appointment_date)} at ${formatTime12H(item.appointment.appointment_time)}. Please reply YES to confirm.`;
    }
    if (isMissedAppointment) {
      return `Hello ${item.patient.name}, we missed you for your dental visit at ${clinicName}, Proddatur. Would you like to reschedule for this week?`;
    }
    if (item.treatment) {
      return `Hello ${item.patient.name}, greeting from ${clinicName}, Proddatur. Following up regarding your ${item.treatment.treatment_name} consultation. Please let us know if you have any questions.`;
    }
    return `Hello ${item.patient.name}, greeting from ${clinicName}, Proddatur. How may we assist you with your dental care?`;
  };

  const whatsappTargetNumber = item.patient.whatsapp_number || item.patient.phone;

  return (
    <div className="card-elevated p-5 transition-all">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        {/* Left Info Column */}
        <div className="space-y-2 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            {getBadge()}
            {item.attempt_count > 0 && (
              <span className="text-[11px] text-slate-500 font-medium">
                (Attempt #{item.attempt_count + 1})
              </span>
            )}
          </div>

          <div>
            <Link
              href={`/patients/${item.patient.id}`}
              className="text-base sm:text-lg font-semibold text-slate-900 hover:text-emerald-700 transition-colors inline-flex items-center gap-1 group"
            >
              <span>{item.patient.name}</span>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-700 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            
            <div className="text-xs text-slate-500 font-mono mt-0.5">
              {formatPhoneNumber(item.patient.phone)}
            </div>
          </div>

          {/* Treatment info if applicable */}
          {item.treatment && (
            <div className="flex items-center gap-2 text-sm text-slate-700">
              <span className="font-medium">{item.treatment.treatment_name}</span>
            </div>
          )}

          {/* Appointment detail if confirmation */}
          {item.appointment && (
            <div className="text-sm font-medium text-blue-900 bg-blue-50/70 px-3 py-1.5 rounded-md inline-block border border-blue-100">
              {formatDateDDMMYYYY(item.appointment.appointment_date)} · {formatTime12H(item.appointment.appointment_time)}
              <span className="text-xs text-blue-700 font-normal ml-1">
                ({item.appointment.treatment_name})
              </span>
            </div>
          )}

          {/* Context note */}
          <p className="text-xs sm:text-sm text-slate-600 italic">
            &ldquo;{item.title}&rdquo;
          </p>
        </div>

        {/* Right Action Buttons Column */}
        <div className="flex items-center gap-2 sm:self-center shrink-0 flex-wrap sm:flex-nowrap">
          {/* Appointment Confirmation specific buttons */}
          {isAppointmentConfirm && item.appointment ? (
            <>
              <a
                href={getWhatsAppLink(whatsappTargetNumber, getPrefilledWhatsAppText())}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => onOpenOutcome(item, 'whatsapp')}
                className="btn-whatsapp text-xs sm:text-sm py-2 px-3 sm:px-4"
              >
                <MessageSquare className="w-4 h-4" />
                <span>WhatsApp</span>
              </a>

              {onConfirmAppointment && (
                <button
                  type="button"
                  onClick={() => onConfirmAppointment(item.appointment!.id)}
                  className="btn-primary text-xs sm:text-sm py-2 px-3 sm:px-4"
                >
                  <Check className="w-4 h-4" />
                  <span>Confirmed</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => onOpenOutcome(item, 'call')}
                className="btn-secondary text-xs sm:text-sm py-2 px-3 sm:px-4"
              >
                <Calendar className="w-4 h-4" />
                <span>Reschedule</span>
              </button>
            </>
          ) : isMissedAppointment ? (
            /* Missed Appointment specific buttons */
            <>
              <a
                href={getTelLink(item.patient.phone)}
                onClick={() => onOpenOutcome(item, 'call')}
                className="btn-call text-xs sm:text-sm py-2 px-3 sm:px-4"
              >
                <Phone className="w-4 h-4" />
                <span>Call</span>
              </a>

              <a
                href={getWhatsAppLink(whatsappTargetNumber, getPrefilledWhatsAppText())}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => onOpenOutcome(item, 'whatsapp')}
                className="btn-whatsapp text-xs sm:text-sm py-2 px-3 sm:px-4"
              >
                <MessageSquare className="w-4 h-4" />
                <span>WhatsApp</span>
              </a>

              <button
                type="button"
                onClick={() => onOpenOutcome(item, 'call')}
                className="btn-secondary text-xs sm:text-sm py-2 px-3 sm:px-4"
              >
                <Calendar className="w-4 h-4" />
                <span>Reschedule</span>
              </button>
            </>
          ) : (
            /* Standard Follow-up buttons */
            <>
              <a
                href={getTelLink(item.patient.phone)}
                onClick={() => onOpenOutcome(item, 'call')}
                className="btn-call text-xs sm:text-sm py-2 px-3 sm:px-4"
              >
                <Phone className="w-4 h-4" />
                <span>Call</span>
              </a>

              <a
                href={getWhatsAppLink(whatsappTargetNumber, getPrefilledWhatsAppText())}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => onOpenOutcome(item, 'whatsapp')}
                className="btn-whatsapp text-xs sm:text-sm py-2 px-3 sm:px-4"
              >
                <MessageSquare className="w-4 h-4" />
                <span>WhatsApp</span>
              </a>

              <button
                type="button"
                onClick={() => onOpenOutcome(item, 'call')}
                className="btn-secondary text-xs sm:text-sm py-2 px-3 sm:px-4 text-slate-700"
              >
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Done</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
