import * as React from 'react';
import BasicDateCalendar from './calendar.jsx';
import { supabase } from '../../utils/supabase';

function todayISODate() {
  try {
    return new Date().toLocaleDateString('en-CA');
  } catch {
    return '2000-01-01';
  }
}

/** Map `public."Data"` row → panel model (hours from minutes where applicable) */
function mapRowToEntry(row) {
  const rawDate = row.date ?? row.Date;
  const dateStr =
    typeof rawDate === 'string'
      ? rawDate.slice(0, 10)
      : rawDate instanceof Date
        ? rawDate.toISOString().slice(0, 10)
        : '';

  const totalMin = Number(row.Total_sleep ?? 0);
  const deepMin = Number(row.Deep_sleep ?? 0);
  const screenMin = Number(row.Screen ?? 0);
  const c = row.Caffeine;

  let lastPhone = row.Last_phone_time ?? row.last_phone_time ?? '';
  if (lastPhone && typeof lastPhone === 'string') {
    lastPhone = lastPhone.length >= 5 ? lastPhone.slice(0, 5) : lastPhone;
  }

  return {
    date: dateStr,
    totalSleep: totalMin / 60,
    deepSleep: deepMin / 60,
    sleepQuality: row.Sleep_quality ?? '',
    caffeineAfter3: c === 1 ? 'Yes' : 'No',
    steps: Number(row.Steps ?? 0),
    screenTime: screenMin / 60,
    lastPhoneUse: lastPhone,
    notes: row.Notes ?? row.notes ?? '',
  };
}

function defaultEntryForDate(date) {
  return {
    date,
    totalSleep: 0,
    deepSleep: 0,
    caffeineAfter3: 'No',
    steps: 0,
    screenTime: 0,
    lastPhoneUse: '',
    sleepQuality: '',
    notes: '',
  };
}

function averageOf(entries, key) {
  if (!entries.length) return 0;
  return entries.reduce((sum, item) => sum + Number(item[key] ?? 0), 0) / entries.length;
}

function comparisonText(value, average, higherIsBetter = true, unit = '') {
  const v = Number(value) || 0;
  const a = Number(average) || 0;
  const diff = Math.abs(v - a);
  const rounded = unit === 'steps' ? Math.round(diff) : diff.toFixed(1);

  if (Math.abs(v - a) < 0.05) return 'About average';

  if (higherIsBetter) {
    return v > a
      ? `${rounded}${unit} better than average`
      : `${rounded}${unit} below average`;
  }

  return v < a
    ? `${rounded}${unit} better than average`
    : `${rounded}${unit} worse than average`;
}

function getMotivationalMessage(entry, avg) {
  const { avgDeepSleep, avgScreenTime, avgSteps } = avg;

  if (entry.deepSleep >= avgDeepSleep && entry.caffeineAfter3 === 'No' && entry.screenTime <= avgScreenTime) {
    return "Great job — this day supports your sleep goals. Try keeping this routine consistent.";
  }

  if (entry.caffeineAfter3 === 'Yes') {
    return "Late caffeine may reduce deep sleep. Try stopping caffeine after 3 PM for a few days.";
  }

  if (entry.screenTime > avgScreenTime) {
    return "Your screen time is above average. A calmer digital evening may support deeper sleep.";
  }

  if (entry.steps < avgSteps) {
    return "Your activity is lower than average. A small walk today could still support better sleep tonight.";
  }

  if (entry.deepSleep < avgDeepSleep) {
    return "This day had lower deep sleep than usual. Small routine changes can make a real difference.";
  }

  return "Every tracked day helps you understand your sleep patterns better. Progress comes from consistency.";
}

function getInsightLabel(entry, avgDeepSleep) {
  if (entry.deepSleep >= avgDeepSleep) return "Positive pattern";
  return "Attention point";
}

function getInsightStyle(entry, avgDeepSleep) {
  if (entry.deepSleep >= avgDeepSleep) {
    return {
      card: "rounded-2xl bg-emerald-50 p-5",
      label: "text-sm font-semibold uppercase tracking-wide text-emerald-700",
    };
  }

  return {
    card: "rounded-2xl bg-amber-50 p-5",
    label: "text-sm font-semibold uppercase tracking-wide text-amber-700",
  };
}

export default function DashboardPanel() {
  const [entries, setEntries] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [loadError, setLoadError] = React.useState(null);
  const [selectedDate, setSelectedDate] = React.useState(todayISODate);

  React.useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      setLoadError(null);
      const { data, error } = await supabase.from('Data').select('*').order('date', { ascending: true });

      if (cancelled) return;

      if (error) {
        setLoadError(error.message);
        setEntries([]);
        setLoading(false);
        return;
      }

      const mapped = (data || []).map(mapRowToEntry).filter((e) => e.date);
      setEntries(mapped);
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const avgDeepSleep = averageOf(entries, 'deepSleep');
  const avgTotalSleep = averageOf(entries, 'totalSleep');
  const avgSteps = averageOf(entries, 'steps');
  const avgScreenTime = averageOf(entries, 'screenTime');

  const selectedEntry =
    entries.find((entry) => entry.date === selectedDate) ?? defaultEntryForDate(selectedDate);

  const motivationalMessage = getMotivationalMessage(selectedEntry, {
    avgDeepSleep,
    avgScreenTime,
    avgSteps,
  });
  const insightStyle = getInsightStyle(selectedEntry, avgDeepSleep);

  const sleepQualityDisplay = selectedEntry.sleepQuality || '—';
  const notesDisplay = selectedEntry.notes?.trim() ? selectedEntry.notes : 'No notes for this day.';

  return (
    <div className="flex flex-col gap-8">
      {loadError && (
        <div className="rounded-2xl border border-red-900/30 bg-red-950/30 px-4 py-3 text-sm text-red-400">
          Could not load dashboard data: {loadError}
        </div>
      )}

      <div className="rounded-3xl border border-white/7 bg-white/5 p-6 shadow-sm md:p-8">
        <div className="flex flex-col gap-6">
          <h2 className="text-2xl font-bold text-slate-100">Select a day</h2>
          <div className="flex justify-center">
            <BasicDateCalendar onDateChange={setSelectedDate} />
          </div>
          {loading && (
            <p className="text-center text-sm text-slate-400">Loading your entries…</p>
          )}
        </div>
      </div>

      <div className="rounded-3xl border border-white/7 bg-white/5 p-6 shadow-sm md:p-8">
        <div className="mb-6">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-400">
            Daily insight
          </p>
          <h2 className="mt-2 text-3xl font-bold text-slate-100">
            {selectedEntry.date}
          </h2>
          <p className="mt-2 max-w-2xl text-slate-400">
            Review the selected day and compare it with your average from saved entries.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl bg-sky-950/30 border border-sky-900/30 p-5">
            <p className="text-sm font-semibold uppercase tracking-wide text-sky-400">Deep sleep</p>
            <p className="mt-2 text-3xl font-bold text-slate-100">
              {(Number(selectedEntry.deepSleep) || 0).toFixed(1)}h
            </p>
            <p className="mt-2 text-sm text-slate-400">
              {comparisonText(selectedEntry.deepSleep, avgDeepSleep, true, 'h')}
            </p>
          </div>

          <div className="rounded-2xl bg-emerald-950/30 border border-emerald-900/30 p-5">
            <p className="text-sm font-semibold uppercase tracking-wide text-emerald-400">Total sleep</p>
            <p className="mt-2 text-3xl font-bold text-slate-100">
              {(Number(selectedEntry.totalSleep) || 0).toFixed(1)}h
            </p>
            <p className="mt-2 text-sm text-slate-400">
              {comparisonText(selectedEntry.totalSleep, avgTotalSleep, true, 'h')}
            </p>
          </div>

          <div className="rounded-2xl bg-violet-950/30 border border-violet-900/30 p-5">
            <p className="text-sm font-semibold uppercase tracking-wide text-violet-400">Steps</p>
            <p className="mt-2 text-3xl font-bold text-slate-100">{selectedEntry.steps}</p>
            <p className="mt-2 text-sm text-slate-400">
              {comparisonText(selectedEntry.steps, avgSteps, true, ' steps')}
            </p>
          </div>

          <div className="rounded-2xl bg-amber-950/30 border border-amber-900/30 p-5">
            <p className="text-sm font-semibold uppercase tracking-wide text-amber-400">Screen time</p>
            <p className="mt-2 text-3xl font-bold text-slate-100">
              {(Number(selectedEntry.screenTime) || 0).toFixed(1)}h
            </p>
            <p className="mt-2 text-sm text-slate-400">
              {comparisonText(selectedEntry.screenTime, avgScreenTime, false, 'h')}
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-white/7 bg-white/5 p-5">
            <h3 className="text-lg font-bold text-slate-100">Behavior details</h3>
            <div className="mt-4 flex flex-col gap-2 text-slate-400">
              <p><span className="font-semibold text-slate-200">Sleep quality:</span> {sleepQualityDisplay}</p>
              <p><span className="font-semibold text-slate-200">Caffeine after 3 PM:</span> {selectedEntry.caffeineAfter3}</p>
              <p><span className="font-semibold text-slate-200">Last phone use:</span> {selectedEntry.lastPhoneUse || '—'}</p>
            </div>
          </div>

          <div className="rounded-2xl border border-white/7 bg-white/5 p-5">
            <h3 className="text-lg font-bold text-slate-100">Reflection</h3>
            <p className="mt-4 text-slate-400">{notesDisplay}</p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className={selectedEntry.deepSleep >= avgDeepSleep
            ? "rounded-2xl bg-emerald-950/30 border border-emerald-900/30 p-5"
            : "rounded-2xl bg-amber-950/30 border border-amber-900/30 p-5"}>
            <p className={selectedEntry.deepSleep >= avgDeepSleep
              ? "text-sm font-semibold uppercase tracking-wide text-emerald-400"
              : "text-sm font-semibold uppercase tracking-wide text-amber-400"}>{getInsightLabel(selectedEntry, avgDeepSleep)}</p>
            <p className="mt-2 text-slate-300">
              {selectedEntry.deepSleep >= avgDeepSleep
                ? "This day performed better than your average deep sleep pattern."
                : "This day performed below your average deep sleep pattern."}
            </p>
          </div>

          <div className="rounded-2xl bg-sky-950/30 border border-sky-900/30 p-5">
            <p className="text-sm font-semibold uppercase tracking-wide text-sky-400">
              Motivation
            </p>
            <p className="mt-2 text-slate-300">
              {motivationalMessage}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
