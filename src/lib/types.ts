export type Visit = {
  id: string;
  date: string;
  services: string[];
  notes: string;
  price: number;
};

export type Dog = {
  id: string;
  name: string;
  breed: string;
  age: number;
  photoUrl: string;
  groomingNotes: string;
  visits: Visit[];
  clientId: string;
};

export type Client = {
  id: string;
  name: string;
  phone: string;
  email: string;
  dogs: Dog[];
};
