import * as React from 'react';
import BasicDateCalendar from './calendar.jsx';

const sampleEntries = [
  {
    date: '2026-04-01',
    totalSleep: 7.2,
    deepSleep: 1.4,
    caffeineAfter3: 'Yes',
    steps: 5400,
    screenTime: 5.6,
    lastPhoneUse: '23:45',
    sleepQuality: 'fair',
    notes: 'Worked late and had coffee in the afternoon.'
  },
  {
    date: '2026-04-02',
    totalSleep: 7.8,
    deepSleep: 1.9,
    caffeineAfter3: 'No',
    steps: 9100,
    screenTime: 3.1,
    lastPhoneUse: '22:15',
    sleepQuality: 'good',
    notes: 'Walked a lot and stopped using the phone earlier.'
  },
  {
    date: '2026-04-03',
    totalSleep: 6.9,
    deepSleep: 1.1,
    caffeineAfter3: 'Yes',
    steps: 4300,
    screenTime: 6.4,
    lastPhoneUse: '00:10',
    sleepQuality: 'poor',
    notes: 'Late phone use and very low deep sleep.'
  },
  {
    date: '2026-04-04',
    totalSleep: 8.1,
    deepSleep: 2.0,
    caffeineAfter3: 'No',
    steps: 10200,
    screenTime: 2.8,
    lastPhoneUse: '22:00',
    sleepQuality: 'excellent',
    notes: 'Very good routine and high deep sleep.'
  },
  {
    date: '2026-04-05',
    totalSleep: 7.5,
    deepSleep: 1.7,
    caffeineAfter3: 'No',
    steps: 8600,
    screenTime: 3.7,
    lastPhoneUse: '22:20',
    sleepQuality: 'good',
    notes: 'Solid day overall.'
  },
  {
    date: '2026-04-06',
    totalSleep: 6.8,
    deepSleep: 1.2,
    caffeineAfter3: 'Yes',
    steps: 5000,
    screenTime: 5.9,
    lastPhoneUse: '23:35',
    sleepQuality: 'fair',
    notes: 'Sleep may have been affected by caffeine and screen time.'
  },
  {
    date: '2026-04-07',
    totalSleep: 8.0,
    deepSleep: 2.1,
    caffeineAfter3: 'No',
    steps: 9800,
    screenTime: 3.0,
    lastPhoneUse: '21:50',
    sleepQuality: 'excellent',
    notes: 'Best sleep pattern of the week.'
  }
];

function averageOf(key) {
  return sampleEntries.reduce((sum, item) => sum + item[key], 0) / sampleEntries.length;
}

const avgDeepSleep = averageOf('deepSleep');
const avgTotalSleep = averageOf('totalSleep');
const avgSteps = averageOf('steps');
const avgScreenTime = averageOf('screenTime');

function comparisonText(value, average, higherIsBetter = true, unit = '') {
  const diff = Math.abs(value - average);
  const rounded = unit === 'steps' ? Math.round(diff) : diff.toFixed(1);

  if (Math.abs(value - average) < 0.05) return 'About average';

  if (higherIsBetter) {
    return value > average
      ? `${rounded}${unit} better than average`
      : `${rounded}${unit} below average`;
  }

  return value < average
    ? `${rounded}${unit} better than average`
    : `${rounded}${unit} worse than average`;
}

function getMotivationalMessage(entry) {
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

function getInsightLabel(entry) {
  if (entry.deepSleep >= avgDeepSleep) return "Positive pattern";
  return "Attention point";
}

function getInsightStyle(entry) {
  if (entry.deepSleep >= avgDeepSleep) {
    return {
      card: "rounded-2xl bg-emerald-50 p-5",
      label: "text-sm font-semibold uppercase tracking-wide text-emerald-700"
    };
  }

  return {
    card: "rounded-2xl bg-amber-50 p-5",
    label: "text-sm font-semibold uppercase tracking-wide text-amber-700"
  };
}

export default function DashboardPanel() {
  const [selectedDate, setSelectedDate] = React.useState('2026-04-07');

  const selectedEntry =
    sampleEntries.find((entry) => entry.date === selectedDate) || sampleEntries[0];

  const motivationalMessage = getMotivationalMessage(selectedEntry);
  const insightStyle = getInsightStyle(selectedEntry);

  return (
    <div className="flex flex-col gap-8">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <div className="flex flex-col gap-6">
          <h2 className="text-2xl font-bold text-slate-900">Select a day</h2>
          <div className="flex justify-center">
            <BasicDateCalendar onDateChange={setSelectedDate} />
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <div className="mb-6">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-700">
            Daily insight
          </p>
          <h2 className="mt-2 text-3xl font-bold text-slate-900">
            {selectedEntry.date}
          </h2>
          <p className="mt-2 max-w-2xl text-slate-600">
            Review the selected day and compare it with your weekly average.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl bg-sky-50 p-5">
            <p className="text-sm font-semibold uppercase tracking-wide text-sky-700">Deep sleep</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">{selectedEntry.deepSleep}h</p>
            <p className="mt-2 text-sm text-slate-600">
              {comparisonText(selectedEntry.deepSleep, avgDeepSleep, true, 'h')}
            </p>
          </div>

          <div className="rounded-2xl bg-emerald-50 p-5">
            <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">Total sleep</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">{selectedEntry.totalSleep}h</p>
            <p className="mt-2 text-sm text-slate-600">
              {comparisonText(selectedEntry.totalSleep, avgTotalSleep, true, 'h')}
            </p>
          </div>

          <div className="rounded-2xl bg-violet-50 p-5">
            <p className="text-sm font-semibold uppercase tracking-wide text-violet-700">Steps</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">{selectedEntry.steps}</p>
            <p className="mt-2 text-sm text-slate-600">
              {comparisonText(selectedEntry.steps, avgSteps, true, ' steps')}
            </p>
          </div>

          <div className="rounded-2xl bg-amber-50 p-5">
            <p className="text-sm font-semibold uppercase tracking-wide text-amber-700">Screen time</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">{selectedEntry.screenTime}h</p>
            <p className="mt-2 text-sm text-slate-600">
              {comparisonText(selectedEntry.screenTime, avgScreenTime, false, 'h')}
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <h3 className="text-lg font-bold text-slate-900">Behavior details</h3>
            <div className="mt-4 flex flex-col gap-2 text-slate-600">
              <p><span className="font-semibold text-slate-900">Sleep quality:</span> {selectedEntry.sleepQuality}</p>
              <p><span className="font-semibold text-slate-900">Caffeine after 3 PM:</span> {selectedEntry.caffeineAfter3}</p>
              <p><span className="font-semibold text-slate-900">Last phone use:</span> {selectedEntry.lastPhoneUse}</p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <h3 className="text-lg font-bold text-slate-900">Reflection</h3>
            <p className="mt-4 text-slate-600">{selectedEntry.notes}</p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className={insightStyle.card}>
            <p className={insightStyle.label}>{getInsightLabel(selectedEntry)}</p>
            <p className="mt-2 text-slate-700">
              {selectedEntry.deepSleep >= avgDeepSleep
                ? "This day performed better than your average deep sleep pattern."
                : "This day performed below your average deep sleep pattern."}
            </p>
          </div>

          <div className="rounded-2xl bg-sky-50 p-5">
            <p className="text-sm font-semibold uppercase tracking-wide text-sky-700">
              Motivation
            </p>
            <p className="mt-2 text-slate-700">
              {motivationalMessage}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
