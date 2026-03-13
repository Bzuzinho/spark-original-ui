import type {
  Athlete,
  Competition,
  CompetitionResult,
  Macrocycle,
  Microcycle,
  PerformanceMetric,
  Season,
  TeamResult,
  Training,
  TrainingAttendance,
  TrainingSession,
  TrainingTemplate,
} from '@/types/sports';

export interface SportsHighlight {
  id: string;
  title: string;
  value: string | number;
  type?: 'info' | 'warning' | 'success' | 'critical';
}

export interface CalendarDay {
  date: string;
  sessions: number;
  competitions: number;
}

export const athletes: Athlete[] = [];
export const trainingLibrary: TrainingTemplate[] = [];
export const sessions: TrainingSession[] = [];
export const attendanceBySession: Record<string, TrainingAttendance[]> = {};
export const scheduled: Training[] = [];
export const calendarDays: CalendarDay[] = [];
export const seasons: Season[] = [];
export const macros: Macrocycle[] = [];
export const micros: Microcycle[] = [];
export const competitions: Competition[] = [];
export const competitionResults: CompetitionResult[] = [];
export const teamResults: TeamResult[] = [];
export const performance: PerformanceMetric[] = [];
export const scientificMetrics: PerformanceMetric[] = [];
export const highlights: SportsHighlight[] = [];
export const performanceRowsByAthlete: Record<string, PerformanceMetric[]> = {};
