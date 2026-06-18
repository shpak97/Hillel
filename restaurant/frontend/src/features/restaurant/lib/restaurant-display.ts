import type { Restaurant } from '@/features/restaurant/model/types';

export function getRestaurantInitials(title: string): string {
  const words = title.trim().split(/\s+/).filter(Boolean);

  if (words.length >= 2) {
    return `${words[0]![0]}${words[1]![0]}`.toUpperCase();
  }

  return title.slice(0, 2).toUpperCase();
}

export function getRestaurantAvatarClass(title: string): string {
  const palettes = [
    'bg-ink-950 text-white',
    'bg-brand text-white',
    'bg-saffron text-ink-950',
    'bg-herb text-white',
  ];
  const index = title.charCodeAt(0) % palettes.length;
  return palettes[index]!;
}

const STATUS_LABELS = {
  active: {
    label: 'активний',
    className: 'bg-herb-50 text-herb',
  },
  setup: {
    label: 'налаштування',
    className: 'bg-brand-50 text-brand-700',
  },
} as const;

export function getRestaurantStatusMeta(restaurant: Restaurant) {
  if (!restaurant.isActive) {
    return {
      label: 'вимкнений',
      className: 'bg-paper-100 text-ink-500',
    };
  }

  return STATUS_LABELS[restaurant.status];
}

export function getRestaurantMetaLine(restaurant: Restaurant): string {
  const parts = [restaurant.slug];

  if (!restaurant.isActive && restaurant.deactivatedAt) {
    parts.push('вимкнено');
  }

  if (restaurant.description) {
    parts.push(restaurant.description);
  }

  return parts.join(' · ');
}
