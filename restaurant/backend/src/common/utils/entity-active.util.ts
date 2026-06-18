export const CLOSED_INTERVAL_OPENS = '00:00';
export const CLOSED_INTERVAL_CLOSES = '00:00';

export function isClosedInterval(opensAt: string, closesAt: string): boolean {
  return (
    opensAt === CLOSED_INTERVAL_OPENS && closesAt === CLOSED_INTERVAL_CLOSES
  );
}

export function isEntityActive(
  deactivatedAt: Date | null,
  deletedAt: Date | null = null,
): boolean {
  return deactivatedAt === null && deletedAt === null;
}

export function activeStateFromFlag(isActive: boolean): {
  deactivatedAt: Date | null;
} {
  return { deactivatedAt: isActive ? null : new Date() };
}
