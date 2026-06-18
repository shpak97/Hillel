export const CLOSED_INTERVAL_OPENS = '00:00';
export const CLOSED_INTERVAL_CLOSES = '00:00';

export function isClosedInterval(opensAt: string, closesAt: string): boolean {
  return (
    opensAt === CLOSED_INTERVAL_OPENS && closesAt === CLOSED_INTERVAL_CLOSES
  );
}
