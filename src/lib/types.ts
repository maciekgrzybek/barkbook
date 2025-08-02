import type { Database } from '@/core/db/database.types';

export type PetRow = Database['public']['Tables']['pets']['Row'];
export type ClientRow = Database['public']['Tables']['clients']['Row'];

export type Visit = {
  id: string;
  date: string;
  services: string[];
  notes: string;
  price: number;
};

export type Pet = PetRow;

export type Client = ClientRow & {
  pets: Pet[];
};

export type UpcomingAppointment = {
  time: string;
  clientName: string;
  petName: string;
  services: string;
};
