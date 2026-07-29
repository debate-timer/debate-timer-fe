export type MaintenanceAccess =
  | 'home'
  | 'guest-composition'
  | 'guest-overview'
  | 'guest-timer'
  | 'blocked';

interface MaintenanceAccessInput {
  access: MaintenanceAccess;
  hasGuestSession: boolean;
  params: Readonly<Record<string, string | undefined>>;
  search: string;
}

function hasExactCompositionQuery(search: string): boolean {
  const searchParams = new URLSearchParams(search);
  const keys = Array.from(searchParams.keys());

  return (
    keys.length === 2 &&
    searchParams.get('mode') === 'edit' &&
    searchParams.get('type') === 'CUSTOMIZE'
  );
}

export function isMaintenanceAccessAllowed({
  access,
  hasGuestSession,
  params,
  search,
}: MaintenanceAccessInput): boolean {
  if (access === 'home') return true;
  if (!hasGuestSession) return false;

  switch (access) {
    case 'guest-composition':
      return hasExactCompositionQuery(search);
    case 'guest-overview':
      return params.type === 'customize' && params.id === 'guest';
    case 'guest-timer':
      return params.id === 'guest';
    case 'blocked':
      return false;
  }
}
