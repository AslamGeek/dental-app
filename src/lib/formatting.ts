// Dental Follow-Up Assistant V1 - Localization & Formatting (India / en-IN)

/**
 * Formats a number into Indian Rupee representation (e.g., ₹85,000, ₹2,40,000).
 */
export function formatRupee(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '₹0';
  }
  const formatted = new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0,
  }).format(amount);
  return `₹${formatted}`;
}

/**
 * Formats a phone number for display (e.g. "98765 43210" or "+91 98765 43210").
 */
export function formatPhoneNumber(phone: string): string {
  if (!phone) return '';
  const cleaned = phone.replace(/[^\d+]/g, '');
  if (cleaned.startsWith('+91') && cleaned.length === 13) {
    return `+91 ${cleaned.slice(3, 8)} ${cleaned.slice(8)}`;
  }
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
  }
  return phone;
}

/**
 * Generates a clean tel: URI
 */
export function getTelLink(phone: string): string {
  const cleaned = phone.replace(/[^\d+]/g, '');
  if (cleaned.startsWith('+')) return `tel:${cleaned}`;
  if (cleaned.length === 10) return `tel:+91${cleaned}`;
  return `tel:${cleaned}`;
}

/**
 * Generates a clean WhatsApp web/app link with optional prefilled message
 */
export function getWhatsAppLink(phone: string, text?: string): string {
  let cleaned = phone.replace(/[^\d]/g, '');
  if (cleaned.length === 10) {
    cleaned = `91${cleaned}`;
  }
  const base = `https://wa.me/${cleaned}`;
  if (text) {
    return `${base}?text=${encodeURIComponent(text)}`;
  }
  return base;
}

/**
 * Formats a Date/ISO string to DD/MM/YYYY (e.g. 30/08/2026).
 */
export function formatDateDDMMYYYY(dateInput: string | Date | null | undefined): string {
  if (!dateInput) return '';
  const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(d.getTime())) return '';
  
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Formats a time string or Date into 12-hour AM/PM format (e.g. 11:00 AM, 5:30 PM).
 */
export function formatTime12H(timeInput: string | Date | null | undefined): string {
  if (!timeInput) return '';
  if (typeof timeInput === 'string' && timeInput.includes(':') && !timeInput.includes('T')) {
    // Handling HH:mm or HH:mm:ss string directly
    const [hoursStr, minutesStr] = timeInput.split(':');
    let hours = parseInt(hoursStr, 10);
    const minutes = minutesStr ? minutesStr.slice(0, 2) : '00';
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // 0 becomes 12
    return `${hours}:${minutes} ${ampm}`;
  }

  const d = typeof timeInput === 'string' ? new Date(timeInput) : timeInput;
  if (isNaN(d.getTime())) return '';

  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  return `${hours}:${minutes} ${ampm}`;
}

/**
 * Returns human-friendly context string for due dates.
 */
export function getRelativeDueDateContext(isoDateStr: string): { label: string; isOverdue: boolean; isToday: boolean } {
  const target = new Date(isoDateStr);
  const now = new Date();
  
  const targetMidnight = new Date(target.getFullYear(), target.getMonth(), target.getDate()).getTime();
  const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const diffDays = Math.round((targetMidnight - todayMidnight) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    const daysOverdue = Math.abs(diffDays);
    return {
      label: daysOverdue === 1 ? '1 day overdue' : `${daysOverdue} days overdue`,
      isOverdue: true,
      isToday: false,
    };
  }
  if (diffDays === 0) {
    return { label: 'Due today', isOverdue: false, isToday: true };
  }
  if (diffDays === 1) {
    return { label: 'Due tomorrow', isOverdue: false, isToday: false };
  }
  return {
    label: `Due ${formatDateDDMMYYYY(target)}`,
    isOverdue: false,
    isToday: false,
  };
}
