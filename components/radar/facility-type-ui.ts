import {
  Coffee,
  Landmark,
  Pill,
  ShoppingBag,
  Sparkles,
  Toilet,
  type LucideIcon,
} from 'lucide-react';
import type { FacilityType } from '@/lib/facilities';

export interface FacilityTypeUi {
  Icon: LucideIcon;
  color: string;
  bg: string;
  pin: string;
}

export const FACILITY_TYPE_UI: Record<FacilityType, FacilityTypeUi> = {
  restroom: {
    Icon: Toilet,
    color: 'text-blue-400',
    bg: 'bg-blue-400/10',
    pin: 'bg-blue-400 text-[#0D0D1A]',
  },
  atm: {
    Icon: Landmark,
    color: 'text-cyan-400',
    bg: 'bg-cyan-400/10',
    pin: 'bg-cyan-400 text-[#0D0D1A]',
  },
  pharmacy: {
    Icon: Pill,
    color: 'text-emerald-400',
    bg: 'bg-emerald-400/10',
    pin: 'bg-emerald-400 text-[#0D0D1A]',
  },
  cafe_toilet: {
    Icon: Coffee,
    color: 'text-amber-400',
    bg: 'bg-amber-400/10',
    pin: 'bg-amber-400 text-[#0D0D1A]',
  },
  convenience: {
    Icon: ShoppingBag,
    color: 'text-violet-400',
    bg: 'bg-violet-400/10',
    pin: 'bg-violet-400 text-white',
  },
  popup: {
    Icon: Sparkles,
    color: 'text-pink-400',
    bg: 'bg-pink-400/10',
    pin: 'bg-pink-400 text-white',
  },
};

export function getFacilityTypeUi(type: FacilityType) {
  return FACILITY_TYPE_UI[type];
}
