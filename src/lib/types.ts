export type Visit = {
  id: string;
  date: string;
  services: string[];
  notes: string;
  price: number;
};

export type Pet = {
  id: string;
  name: string;
  type: string;
  breed: string;
  age: number;
  photoUrl: string;
  groomingNotes: string;
  visits: Visit[];
};

export type Client = {
  id: string;
  name: string;
  email: string;
  phone: string;
  photoUrl: string;
  pets: Pet[];
};

export type UpcomingAppointment = {
  time: string;
  clientName: string;
  petName: string;
  services: string;
};
