export function resolveMaintenanceMode(value: string | undefined): boolean {
  return value === 'true';
}

export function isMaintenanceModeEnabled(): boolean {
  return resolveMaintenanceMode(import.meta.env.VITE_MAINTENANCE_MODE);
}
