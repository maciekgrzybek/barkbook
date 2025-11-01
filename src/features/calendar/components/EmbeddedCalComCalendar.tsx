'use client';

import { useMemo } from 'react';

interface EmbeddedCalComCalendarProps {
  username?: string;
}

export function EmbeddedCalComCalendar({
  username,
}: EmbeddedCalComCalendarProps) {
  const src = useMemo(() => {
    if (!username) return '';
    return `https://cal.com/${encodeURIComponent(username)}?embed=inline`;
  }, [username]);

  if (!src) {
    return (
      <div className="text-sm text-muted-foreground">
        Brak konfiguracji kalendarza
      </div>
    );
  }

  return (
    <iframe
      title="Cal.com Calendar"
      src={src}
      className="w-full min-h-[70vh] rounded border"
      loading="lazy"
    />
  );
}
