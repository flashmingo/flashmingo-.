import {
  Sparkles, Layers, Trophy, Rocket, GraduationCap, Flame, Star, Award,
  Brain, CheckCircle2, BarChart2, CalendarCheck, Medal,
} from 'lucide-react';

/**
 * Achievements and quests store a lucide icon name as text in the database.
 * This maps those names to components — one place to extend when new
 * catalog rows are added.
 */
const ICON_MAP: Record<string, React.ElementType> = {
  Sparkles, Layers, Trophy, Rocket, GraduationCap, Flame, Star, Award,
  Brain, CheckCircle2, BarChart2, CalendarCheck,
};

export function gamificationIcon(name: string): React.ElementType {
  return ICON_MAP[name] ?? Medal;
}
