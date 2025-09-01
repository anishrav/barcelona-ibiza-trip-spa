import { ScheduleItem } from "@/types/trip";

export function mapLink(address: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    address
  )}`;
}

export function formatTime(time24: string): string {
  const [hours, minutes] = time24.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const hours12 = hours % 12 || 12;
  return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
}

export function formatDT(date: string, time?: string) {
  const [y, m, d] = date.split("-").map(Number);
  const dt = new Date(y, (m || 1) - 1, d || 1);
  const day = dt.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  return time ? `${day} · ${formatTime(time)}` : day;
}

export function byDateTime(a: ScheduleItem, b: ScheduleItem) {
  if (a.date === b.date) {
    const ta = a.time ?? "00:00";
    const tb = b.time ?? "00:00";
    return ta.localeCompare(tb);
  }
  return a.date.localeCompare(b.date);
}

export function groupByDate(items: ScheduleItem[]) {
  return items.reduce<Record<string, ScheduleItem[]>>((acc, it) => {
    (acc[it.date] = acc[it.date] || []).push(it);
    return acc;
  }, {});
}

export function uid(prefix = "id") {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

export function isUpcoming(it: ScheduleItem, now: Date = new Date()) {
  const today = now.toISOString().slice(0, 10);
  if (it.date > today) return true;
  if (it.date < today) return false;

  if (!it.time) return true;
  const [h, m] = it.time.split(":").map(Number);
  const itemTime = new Date(now);
  itemTime.setHours(h, m, 0, 0);
  return itemTime >= now;
}
