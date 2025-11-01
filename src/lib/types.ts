import type { Database } from '@/core/db/database.types';

export type PetRow = Database['public']['Tables']['pets']['Row'];
export type ClientRow = Database['public']['Tables']['clients']['Row'];

export type VisitPhoto = {
  path: string;
  filename: string;
  uploadedAt?: string;
};

export type PetVisitRow = Database['public']['Tables']['pet_visits']['Row'];
export type PetVisitInsert =
  Database['public']['Tables']['pet_visits']['Insert'];
export type PetVisitUpdate =
  Database['public']['Tables']['pet_visits']['Update'];

export type PetVisit = Omit<PetVisitRow, 'photos'> & {
  photos: VisitPhoto[];
};

export type Pet = PetRow & {
  visits?: PetVisit[];
};

export type Client = ClientRow & {
  pets: Pet[];
};

export type CalendarEventRow =
  Database['public']['Tables']['calendar_events']['Row'];

export type UpcomingAppointment = {
  time: string;
  clientName: string;
  petName: string;
  services: string;
};
