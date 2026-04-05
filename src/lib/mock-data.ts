import { FredObservation } from "./fred";

function generateMonthlyDates(
  startYear: number,
  startMonth: number,
  count: number
): string[] {
  const dates: string[] = [];
  let year = startYear;
  let month = startMonth;
  for (let i = 0; i < count; i++) {
    dates.push(
      `${year}-${String(month).padStart(2, "0")}-01`
    );
    month++;
    if (month > 12) {
      month = 1;
      year++;
    }
  }
  return dates;
}

const dates = generateMonthlyDates(2021, 1, 48); // Jan 2021 - Dec 2024

function curve(
  base: number,
  peak: number,
  peakIndex: number,
  endValue: number,
  count: number
): number[] {
  const values: number[] = [];
  for (let i = 0; i < count; i++) {
    let v: number;
    if (i <= peakIndex) {
      const t = i / peakIndex;
      v = base + (peak - base) * t;
    } else {
      const t = (i - peakIndex) / (count - 1 - peakIndex);
      v = peak + (endValue - peak) * t;
    }
    // Add slight noise
    v += (Math.sin(i * 1.7) * (peak - base)) / 30;
    values.push(Math.round(v * 10) / 10);
  }
  return values;
}

const jobOpeningsValues = curve(7000, 12000, 14, 7500, 48);
const unemploymentValues = curve(6.7, 3.4, 24, 4.1, 48).map(
  (v) => Math.max(3.4, Math.min(6.7, v))
);
const hiresValues = curve(6000, 6800, 12, 5500, 48);
const quitsValues = curve(4000, 4500, 15, 3400, 48);
const layoffsValues = curve(1600, 1800, 22, 1700, 48);
const separationsValues = curve(5800, 6200, 14, 5200, 48);

function toObservations(values: number[]): FredObservation[] {
  return dates.map((date, i) => ({ date, value: values[i] }));
}

export const MOCK_DATA: Record<string, FredObservation[]> = {
  JTSJOL: toObservations(jobOpeningsValues),
  UNRATE: toObservations(unemploymentValues),
  JTSHIL: toObservations(hiresValues),
  JTSQUL: toObservations(quitsValues),
  JTSLLL: toObservations(layoffsValues),
  JTSTSL: toObservations(separationsValues),
};
