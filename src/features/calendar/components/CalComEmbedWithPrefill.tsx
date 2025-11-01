'use client';

import { useEffect } from 'react';
import Cal, { getCalApi } from '@calcom/embed-react';
import type { Database } from '@/core/db/database.types';

type Client = Database['public']['Tables']['clients']['Row'];
type Pet = Database['public']['Tables']['pets']['Row'];

interface CalComEmbedWithPrefillProps {
  client: Client;
  pet: Pet;
  calComUsername: string;
  eventTypeSlug?: string;
  onBookingComplete?: () => void;
}

export function CalComEmbedWithPrefill({
  client,
  pet,
  calComUsername,
  eventTypeSlug = '',
  onBookingComplete,
}: CalComEmbedWithPrefillProps) {
  useEffect(() => {
    (async function () {
      const cal = await getCalApi();
      
      // Configure Cal.com UI
      cal('ui', {
        styles: { branding: { brandColor: '#000000' } },
        hideEventTypeDetails: false,
      });

      // Listen for booking completion
      if (onBookingComplete) {
        cal('on', {
          action: 'bookingSuccessful',
          callback: () => {
            onBookingComplete();
          },
        });
      }
    })();
  }, [onBookingComplete]);

  // Construct the Cal.com link
  const calLink = eventTypeSlug
    ? `${calComUsername}/${eventTypeSlug}`
    : calComUsername;

  // Build notes with pet information
  const bookingNotes = `
Klient: ${client.name} ${client.surname}
Zwierzak: ${pet.name}
${pet.breed ? `Rasa: ${pet.breed}` : ''}
${pet.type ? `Gatunek: ${pet.type}` : ''}
${pet.age ? `Wiek: ${pet.age}` : ''}
${pet.health_issues ? `Stan zdrowia: ${pet.health_issues}` : ''}
${pet.allergies ? `Alergie: ${pet.allergies}` : ''}
${pet.preferences ? `Preferencje: ${pet.preferences}` : ''}
${pet.notes ? `Uwagi: ${pet.notes}` : ''}
  `.trim();

  return (
    <Cal
      calLink={calLink}
      style={{ width: '100%', height: '100%', overflow: 'scroll' }}
      config={{
        // Prefill client contact information
        name: `${client.name} ${client.surname}`,
        email: client.email || `${client.phone_number.replace(/\s/g, '')}@temp.barkbook.app`,
        phone: client.phone_number,
        notes: bookingNotes,

        // Store BarkBook IDs in metadata for webhook processing
        'metadata[barkbookClientId]': client.id,
        'metadata[barkbookPetId]': pet.id,
        'metadata[source]': 'barkbook',

        // Custom booking questions (must be configured in Cal.com first)
        petName: pet.name,
        petBreed: pet.breed || '',
        petAge: pet.age?.toString() || '',

        // Location prefill
        location: JSON.stringify({
          value: 'inPerson',
          optionValue: client.address || '',
        }),

        // Language preference
        lang: 'pl',
      }}
    />
  );
}

