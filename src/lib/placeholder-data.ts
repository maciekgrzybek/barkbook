import type { Client, Pet, Visit } from './types';

function createVisit(
  id: string,
  date: string,
  services: string[],
  notes: string,
  price: number
): Visit {
  return { id, date, services, notes, price };
}

const pets: Pet[] = [
  {
    id: '1',
    name: 'Burek',
    type: 'Dog',
    breed: 'Mongrel',
    age: 5,
    notes: 'Loves belly rubs.',
  },
  {
    id: '2',
    name: 'Mruczek',
    type: 'Cat',
    breed: 'Persian',
    age: 2,
    notes: 'Prefers quiet environment.',
    visits: [createVisit('v3', '2023-11-01', ['Nail Trim'], 'Just nails.', 30)],
  },
  {
    id: '3',
    name: 'Fafik',
    type: 'Dog',
    breed: 'Golden Retriever',
    age: 7,
    notes: 'Can be nervous around other pets.',
    visits: [
      createVisit(
        'v4',
        '2023-09-10',
        ['Wash', 'Cut', 'Nail Trim'],
        'Full package.',
        150
      ),
    ],
  },
  {
    id: '4',
    name: 'Puszek',
    type: 'Rabbit',
    breed: 'Lionhead',
    age: 3,
    notes: 'Handle with care, very delicate.',
    visits: [],
  },
];

export const clients: Client[] = [
  {
    id: '1',
    name: 'Jan Kowalski',
    email: 'jan.kowalski@example.com',
    phone: '123-456-789',
    pets: [pets[0], pets[1]],
  },
  {
    id: '2',
    name: 'Anna Nowak',
    email: 'anna.nowak@example.com',
    phone: '987-654-321',
    pets: [pets[2]],
  },
  {
    id: '3',
    name: 'Piotr Wiśniewski',
    email: 'piotr.wisniewski@example.com',
    phone: '555-555-555',
    pets: [pets[3]],
  },
];

export const getPetById = (id: string) => pets.find((p) => p.id === id);

export const upcomingAppointments = [
  {
    time: '09:00',
    clientName: 'Jan Kowalski',
    petName: 'Burek',
    services: 'Wash, Cut',
  },
  {
    time: '11:00',
    clientName: 'Anna Nowak',
    petName: 'Fafik',
    services: 'Nail Trim',
  },
  {
    time: '14:00',
    clientName: 'Jan Kowalski',
    petName: 'Mruczek',
    services: 'Wash',
  },
];
