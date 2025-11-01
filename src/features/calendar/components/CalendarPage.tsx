'use client';

import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useLanguage } from '@/features/language/contexts/language-context';
import type { UpcomingAppointment } from '@/lib/types';
import { EmbeddedCalComCalendar } from './EmbeddedCalComCalendar';
import { BookingWithPrefill } from './BookingWithPrefill';
import { Suspense, useEffect, useState } from 'react';
import { Calendar, UserPlus, AlertCircle, Clock } from 'lucide-react';
import { createClient } from '@/core/supabase/client';
import {
  CalendarService,
  type CalendarEventWithDetails,
} from '../services/calendar-service';

export function CalendarPage() {
  const { t } = useLanguage();
  const [calComUsername, setCalComUsername] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [weeklyAppointments, setWeeklyAppointments] = useState<
    CalendarEventWithDetails[]
  >([]);

  useEffect(() => {
    async function checkCalComSetup() {
      try {
        setIsLoading(true);

        // First, try to get username from Supabase
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          const { data: salon } = await supabase
            .from('salons')
            .select('cal_com_username')
            .eq('user_id', user.id)
            .maybeSingle();

          if (salon?.cal_com_username) {
            setCalComUsername(salon.cal_com_username);
            setIsLoading(false);
            return;
          }
        }

        // Fallback to environment variable
        // Access it through window to ensure it's available client-side
        const envUsername = process.env.NEXT_PUBLIC_CALCOM_USERNAME;
        if (envUsername) {
          setCalComUsername(envUsername);
        }
      } catch (error) {
        console.error('Error checking Cal.com setup:', error);
      } finally {
        setIsLoading(false);
      }
    }

    checkCalComSetup();
  }, []);

  // Fetch this week's appointments from synced data
  useEffect(() => {
    async function fetchWeeklyAppointments() {
      try {
        const appointments =
          await CalendarService.getThisWeeksAppointmentsForCurrentUser();
        setWeeklyAppointments(appointments);
      } catch (error) {
        console.error('Error fetching appointments:', error);
      }
    }

    if (!isLoading && calComUsername) {
      fetchWeeklyAppointments();

      // Refresh every 5 minutes
      const interval = setInterval(fetchWeeklyAppointments, 5 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [isLoading, calComUsername]);

  return (
    <>
      <PageHeader title={t('calendar.title')} />

      {isLoading ? (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Ładowanie...</p>
          </CardContent>
        </Card>
      ) : calComUsername ? (
        <Tabs defaultValue="book" className="mb-6">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="book" className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Zarezerwuj wizytę
            </TabsTrigger>
            <TabsTrigger value="view" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Zobacz kalendarz
            </TabsTrigger>
          </TabsList>

          <TabsContent value="book">
            <BookingWithPrefill calComUsername={calComUsername} />
          </TabsContent>

          <TabsContent value="view">
            <Card>
              <CardHeader>
                <CardTitle>Twój kalendarz</CardTitle>
              </CardHeader>
              <CardContent>
                <Suspense
                  fallback={
                    <div className="text-sm text-muted-foreground">
                      Ładowanie kalendarza…
                    </div>
                  }
                >
                  <EmbeddedCalComCalendar username={calComUsername} />
                </Suspense>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      ) : (
        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Skonfiguruj Cal.com</AlertTitle>
          <AlertDescription>
            <p className="mb-3">
              Aby korzystać z kalendarza, dodaj swoją nazwę użytkownika Cal.com.
            </p>
            <div className="space-y-2 text-sm">
              <p>
                <strong>Opcja 1:</strong> Dodaj do bazy danych
              </p>
              <code className="block bg-muted p-2 rounded text-xs">
                UPDATE salons SET cal_com_username = 'twoja-nazwa' WHERE user_id
                = auth.uid();
              </code>
              <p className="mt-3">
                <strong>Opcja 2:</strong> Dodaj do zmiennych środowiskowych
              </p>
              <code className="block bg-muted p-2 rounded text-xs">
                NEXT_PUBLIC_CALCOM_USERNAME=twoja-nazwa
              </code>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Wizyty w tym tygodniu</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Synchronizowane z Cal.com
          </p>
        </CardHeader>
        <CardContent>
          {weeklyAppointments.length > 0 ? (
            <div className="space-y-4">
              {weeklyAppointments.map((appt) => (
                <div
                  key={appt.id}
                  className="flex items-start gap-4 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex flex-col h-12 w-16 items-center justify-center rounded-lg bg-primary text-primary-foreground font-semibold">
                    <span className="text-xs uppercase">
                      {
                        CalendarService.formatDateWithWeekday(
                          appt.start_time
                        ).split(' ')[0]
                      }
                    </span>
                    <span className="text-lg">
                      {
                        CalendarService.formatDateWithWeekday(
                          appt.start_time
                        ).split(' ')[1]
                      }
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-base">
                        {CalendarService.formatTime(appt.start_time)}
                      </p>
                      <span className="text-xs text-muted-foreground">
                        ({appt.duration_minutes} min)
                      </span>
                    </div>
                    <p className="font-medium">
                      {appt.pet?.name || 'Zwierzak'}
                      {appt.pet?.breed && ` (${appt.pet.breed})`}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {appt.client
                        ? `${appt.client.name} ${appt.client.surname}`
                        : appt.attendee_email || 'Brak danych klienta'}
                    </p>
                    {appt.pet?.allergies && (
                      <p className="text-xs text-orange-600 font-medium mt-1">
                        ⚠️ Alergie: {appt.pet.allergies}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        appt.status === 'scheduled'
                          ? 'bg-blue-100 text-blue-800'
                          : appt.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {appt.status === 'scheduled'
                        ? 'Zaplanowana'
                        : appt.status === 'completed'
                        ? 'Zakończona'
                        : appt.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              Brak wizyt w tym tygodniu
            </p>
          )}
        </CardContent>
      </Card>
    </>
  );
}
