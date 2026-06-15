'use client';

export type Category = 'all' | 'cafe' | 'photo' | 'fun' | 'culture' | 'food' | 'stay';

interface CategoryFilterProps {
  selected: Category[];
  onChange: (cats: Category[]) => void;
}

const CATEGORIES: { id: Category; label: string; emoji: string }[] = [
  { id: 'all',     label: 'All',     emoji: '🗺️' },
  { id: 'cafe',    label: 'Cafe',    emoji: '☕' },
  { id: 'photo',   label: 'Photo',   emoji: '📸' },
  { id: 'fun',     label: 'Fun',     emoji: '🎮' },
  { id: 'culture', label: 'Culture', emoji: '🏛️' },
  { id: 'food',    label: 'Food',    emoji: '🍜' },
  { id: 'stay',    label: 'Stay',    emoji: '🏨' },
];

export function CategoryFilter({ selected, onChange }: CategoryFilterProps) {
  function toggle(id: Category) {
    if (id === 'all') {
      onChange(['all']);
      return;
    }
    const next = selected.includes(id)
      ? selected.filter((c) => c !== id)
      : [...selected.filter((c) => c !== 'all'), id];
    onChange(next.length === 0 ? ['all'] : next);
  }

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
      {CATEGORIES.map(({ id, label, emoji }) => {
        const active = selected.includes(id) || (id === 'all' && selected.includes('all'));
        return (
          <button
            key={id}
            onClick={() => toggle(id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all
              ${active
                ? 'bg-[#FF3A5C] text-white shadow-lg shadow-[#FF3A5C]/30'
                : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
          >
            <span>{emoji}</span>
            <span>{label}</span>
          </button>
        );
      })}
    </div>
  );
}
