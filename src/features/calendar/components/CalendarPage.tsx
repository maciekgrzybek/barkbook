'use client';

import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { upcomingAppointments } from '@/lib/placeholder-data';
import { useLanguage } from '@/features/language/contexts/language-context';
import type { UpcomingAppointment } from '@/lib/types';

export function CalendarPage() {
  const { t } = useLanguage();
  return (
    <>
      <PageHeader title={t('calendar.title')} />
      <Card>
        <CardHeader>
          <CardTitle>{t('calendar.upcoming_appointments')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {upcomingAppointments.map((appt: UpcomingAppointment) => (
              <div key={appt.time} className="flex items-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  {appt.time.split(':')[0]}
                </div>
                <div className="ml-4 flex-1">
                  <p className="font-semibold">
                    {appt.petName} - {appt.services}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {appt.clientName}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </>
  );
}
