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

// National series
const jobOpeningsValues = curve(7000, 12000, 14, 7500, 48);
const unemploymentValues = curve(6.7, 3.4, 24, 4.1, 48).map(
  (v) => Math.max(3.4, Math.min(6.7, v))
);
const hiresValues = curve(6000, 6800, 12, 5500, 48);
const quitsValues = curve(4000, 4500, 15, 3400, 48);
const layoffsValues = curve(1600, 1800, 22, 1700, 48);
const separationsValues = curve(5800, 6200, 14, 5200, 48);

// California series
const caUnemploymentValues = curve(8.7, 3.8, 24, 5.5, 48).map(
  (v) => Math.max(3.8, Math.min(8.7, v))
);
const caPayrollsValues = curve(16000, 18200, 36, 18000, 48).map(
  (v) => Math.round(v * 10) / 10
);
const caClaimsValues = curve(80000, 30000, 30, 38000, 48).map(
  (v) => Math.max(25000, Math.round(v))
);

// Bay Area series
const sfUnemploymentValues = curve(7.1, 2.2, 22, 3.8, 48).map(
  (v) => Math.max(2.0, Math.min(7.5, v))
);

function toObservations(values: number[]): FredObservation[] {
  return dates.map((date, i) => ({ date, value: values[i] }));
}

export const MOCK_DATA: Record<string, FredObservation[]> = {
  // National
  JTSJOL: toObservations(jobOpeningsValues),
  UNRATE: toObservations(unemploymentValues),
  JTSHIL: toObservations(hiresValues),
  JTSQUL: toObservations(quitsValues),
  JTSLLL: toObservations(layoffsValues),
  JTSTSL: toObservations(separationsValues),
  // California
  CAUR: toObservations(caUnemploymentValues),
  CANA: toObservations(caPayrollsValues),
  CAICLAIMS: toObservations(caClaimsValues),
  // Bay Area
  SANF806URN: toObservations(sfUnemploymentValues),
};
