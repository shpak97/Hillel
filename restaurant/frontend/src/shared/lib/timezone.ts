import { getTimeZones } from '@vvo/tzdb';

export const DEFAULT_TIMEZONE = 'Europe/Kyiv';

export type TimezoneOption = {
  value: string;
  label: string;
  searchText: string;
};

let cachedOptions: TimezoneOption[] | null = null;

export function getTimezoneOptions(): TimezoneOption[] {
  if (cachedOptions) {
    return cachedOptions;
  }

  cachedOptions = getTimeZones().map((zone) => {
    const city = zone.mainCities[0] ?? zone.name.split('/').pop() ?? zone.name;

    return {
      value: zone.name,
      label: `${city} — ${zone.currentTimeFormat}`,
      searchText: [
        zone.name,
        zone.alternativeName,
        zone.countryName,
        ...zone.mainCities,
        zone.abbreviation,
      ]
        .join(' ')
        .toLowerCase(),
    };
  });

  return cachedOptions;
}

export function getBrowserTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return DEFAULT_TIMEZONE;
  }
}

export function resolveInitialTimezone(savedTimezone?: string | null): string {
  if (savedTimezone) {
    return normalizeTimezoneValue(savedTimezone);
  }

  return normalizeTimezoneValue(getBrowserTimezone());
}

export function normalizeTimezoneValue(value: string): string {
  const options = getTimezoneOptions();
  const exact = options.find((option) => option.value === value);

  if (exact) {
    return exact.value;
  }

  const zone = getTimeZones().find(
    (item) => item.name === value || item.group.includes(value),
  );

  if (zone) {
    return zone.name;
  }

  return DEFAULT_TIMEZONE;
}

export function getTimezoneLabel(value: string): string {
  const option = getTimezoneOptions().find((item) => item.value === value);
  return option?.label ?? value;
}
