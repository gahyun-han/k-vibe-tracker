'use client';

import { Building2, Camera, Coffee, Landmark, Map, ShoppingBag, Utensils } from 'lucide-react';

export type Category = 'all' | 'cafe' | 'photo' | 'fun' | 'culture' | 'food' | 'stay';

interface CategoryFilterProps {
  selected: Category[];
  onChange: (cats: Category[]) => void;
  labels?: Readonly<Partial<Record<Category, string>>>;
}

const CATEGORIES = [
  { id: 'all', label: 'All', icon: Map },
  { id: 'cafe', label: 'Cafe', icon: Coffee },
  { id: 'photo', label: 'Photo', icon: Camera },
  { id: 'fun', label: 'Fun', icon: ShoppingBag },
  { id: 'culture', label: 'Culture', icon: Landmark },
  { id: 'food', label: 'Food', icon: Utensils },
  { id: 'stay', label: 'Stay', icon: Building2 },
] satisfies { id: Category; label: string; icon: typeof Map }[];

export function CategoryFilter({ selected, onChange, labels }: CategoryFilterProps) {
  function toggle(id: Category) {
    if (id === 'all') {
      onChange(['all']);
      return;
    }

    const next = selected.includes(id)
      ? selected.filter((category) => category !== id)
      : [...selected.filter((category) => category !== 'all'), id];
    onChange(next.length === 0 ? ['all'] : next);
  }

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
      {CATEGORIES.map(({ id, label, icon: Icon }) => {
        const active = selected.includes(id) || (id === 'all' && selected.includes('all'));
        const displayLabel = labels?.[id] ?? label;
        return (
          <button
            key={id}
            onClick={() => toggle(id)}
            className={`flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium transition-all ${
              active
                ? 'bg-[#FF3A5C] text-white shadow-lg shadow-[#FF3A5C]/30'
                : 'bg-white/10 text-white/70 hover:bg-white/20'
            }`}
          >
            <Icon size={14} />
            <span>{displayLabel}</span>
          </button>
        );
      })}
    </div>
  );
}
