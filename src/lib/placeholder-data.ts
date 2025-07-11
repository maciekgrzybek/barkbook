import type { Client, Dog, Visit } from './types';

const visits: Visit[] = [
  { id: 'v1', date: '2023-10-15', services: ['Full Groom', 'Nail Trim'], notes: 'Very well-behaved.', price: 150 },
  { id: 'v2', date: '2023-08-10', services: ['Wash & Dry'], notes: 'A bit anxious during drying.', price: 80 },
  { id: 'v3', date: '2023-11-01', services: ['Puppy Cut'], notes: 'First visit, did great!', price: 100 },
  { id: 'v4', date: '2023-09-20', services: ['Full Groom', 'Teeth Cleaning'], notes: 'Required extra time for de-matting.', price: 200 },
];

const dogs: Dog[] = [
  {
    id: 'd1',
    name: 'Burek',
    breed: 'Mixed Breed',
    age: 5,
    photoUrl: 'https://placehold.co/400x400.png',
    groomingNotes: 'Allergic to scented shampoos. Prefers a shorter cut in summer.',
    visits: [visits[0], visits[1]],
    clientId: 'c1',
  },
  {
    id: 'd2',
    name: 'Fafik',
    breed: 'Golden Retriever',
    age: 2,
    photoUrl: 'https://placehold.co/400x400.png',
    groomingNotes: 'Loves water. Be careful with ears.',
    visits: [visits[3]],
    clientId: 'c1',
  },
  {
    id: 'd3',
    name: 'Pimpek',
    breed: 'Poodle',
    age: 7,
    photoUrl: 'https://placehold.co/400x400.png',
    groomingNotes: 'Requires regular de-matting. Use sensitive skin formula.',
    visits: [],
    clientId: 'c2',
  },
  {
    id: 'd4',
    name: 'Azor',
    breed: 'German Shepherd',
    age: 4,
    photoUrl: 'https://placehold.co/400x400.png',
    groomingNotes: 'Can be nervous around other dogs.',
    visits: [visits[2]],
    clientId: 'c3',
  },
];

export const placeholderClients: Client[] = [
  {
    id: 'c1',
    name: 'Jan Kowalski',
    phone: '+48 123 456 789',
    email: 'jan.kowalski@example.com',
    dogs: [dogs[0], dogs[1]],
  },
  {
    id: 'c2',
    name: 'Anna Nowak',
    phone: '+48 987 654 321',
    email: 'anna.nowak@example.com',
    dogs: [dogs[2]],
  },
  {
    id: 'c3',
    name: 'Piotr Wiśniewski',
    phone: '+48 555 123 456',
    email: 'piotr.wisniewski@example.com',
    dogs: [dogs[3]],
  },
];

export const getClientById = (id: string) => placeholderClients.find(c => c.id === id);
export const getDogById = (id: string) => dogs.find(d => d.id === id);

export const placeholderAppointments = [
    {
        id: 'a1',
        time: '10:00 AM',
        dogName: 'Burek',
        clientName: 'Jan Kowalski',
        services: 'Full Groom',
    },
    {
        id: 'a2',
        time: '12:00 PM',
        dogName: 'Azor',
        clientName: 'Piotr Wiśniewski',
        services: 'Puppy Cut',
    },
    {
        id: 'a3',
        time: '2:00 PM',
        dogName: 'Fafik',
        clientName: 'Jan Kowalski',
        services: 'Wash & Dry',
    },
];
