'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/core/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { ClientPetSelector } from './ClientPetSelector';
import { CalComEmbedWithPrefill } from './CalComEmbedWithPrefill';
import type { Database } from '@/core/db/database.types';

type Client = Database['public']['Tables']['clients']['Row'];
type Pet = Database['public']['Tables']['pets']['Row'];

interface BookingWithPrefillProps {
  calComUsername?: string;
  eventTypeSlug?: string;
}

export function BookingWithPrefill({
  calComUsername,
  eventTypeSlug,
}: BookingWithPrefillProps) {
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [bookingComplete, setBookingComplete] = useState(false);
  const [username, setUsername] = useState<string>('');

  // Fetch Cal.com username from database or settings
  useEffect(() => {
    async function fetchCalComUsername() {
      if (calComUsername) {
        setUsername(calComUsername);
        return;
      }

      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) return;

        // Fetch salon info with Cal.com username
        const { data: salon } = await supabase
          .from('salons')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (salon) {
          // Assuming you'll add a cal_com_username field to salons table
          const storedUsername =
            (salon as any).cal_com_username ||
            process.env.NEXT_PUBLIC_CALCOM_USERNAME ||
            '';
          setUsername(storedUsername);
        }
      } catch (error) {
        console.error('Error fetching Cal.com username:', error);
      }
    }

    fetchCalComUsername();
  }, [calComUsername]);

  function handleClientPetSelect(client: Client, pet: Pet) {
    setSelectedClient(client);
    setSelectedPet(pet);
    setBookingComplete(false); // Reset booking status when selection changes
  }

  function handleBookingComplete() {
    setBookingComplete(true);
    // Optionally reset selections after a delay
    setTimeout(() => {
      setSelectedClient(null);
      setSelectedPet(null);
      setBookingComplete(false);
    }, 5000);
  }

  if (!username) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Konfiguracja wymagana</AlertTitle>
        <AlertDescription>
          Aby korzystać z kalendarza, skonfiguruj swoją nazwę użytkownika
          Cal.com w ustawieniach.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {bookingComplete && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800">
            Wizyta została zarezerwowana!
          </AlertTitle>
          <AlertDescription className="text-green-700">
            Kalendarz został zaktualizowany. Możesz zarezerwować kolejną wizytę.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left Column: Client & Pet Selection */}
        <div>
          <ClientPetSelector
            onSelect={handleClientPetSelect}
            selectedClientId={selectedClient?.id}
            selectedPetId={selectedPet?.id}
          />
        </div>

        {/* Right Column: Cal.com Embed */}
        <div>
          {selectedClient && selectedPet ? (
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="text-lg">Wybierz termin wizyty</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Dane klienta i zwierzaka zostały automatycznie wypełnione.
                  Wybierz dostępny termin w kalendarzu poniżej.
                </p>
              </CardHeader>
              <CardContent className="h-[600px]">
                <CalComEmbedWithPrefill
                  client={selectedClient}
                  pet={selectedPet}
                  calComUsername={username}
                  eventTypeSlug={eventTypeSlug || 'appointment'}
                  onBookingComplete={handleBookingComplete}
                />
              </CardContent>
            </Card>
          ) : (
            <Card className="h-full">
              <CardContent className="flex items-center justify-center h-[600px]">
                <div className="text-center text-muted-foreground">
                  <p className="text-lg mb-2">Wybierz zwierzaka</p>
                  <p className="text-sm">
                    Aby zarezerwować wizytę, najpierw wybierz zwierzaka z listy
                    po lewej stronie.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
