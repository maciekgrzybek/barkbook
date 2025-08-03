'use client';

import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
  useCallback,
} from 'react';
import { useAuth } from '@/features/auth/contexts/auth-context';
import type { Client, Pet } from '@/lib/types';
import { createClient } from '@/core/supabase/client';

interface ClientContextType {
  clients: Client[];
  allPets: Pet[];
  addClient: (
    client: Omit<
      Client,
      | 'id'
      | 'pets'
      | 'created_at'
      | 'salon_id'
      | 'has_gdpr_consent'
      | 'gdpr_consent_date'
    >
  ) => Promise<Client | undefined>;
  deleteClient: (id: string) => Promise<void>;
  deletePet: (petId: string, clientId?: string) => Promise<void>;
  addPet: (
    pet: Pick<Pet, 'name' | 'breed' | 'age'>,
    clientId: string
  ) => Promise<void>;
  getClientById: (id: string) => Client | undefined;
  isLoading: boolean;
}

const ClientContext = createContext<ClientContextType | undefined>(undefined);

export const ClientProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [allPets, setAllPets] = useState<Pet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [salonId, setSalonId] = useState<string | null>(null);
  const supabase = createClient();

  const fetchSalonAndClients = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      setClients([]);
      return;
    }

    setIsLoading(true);
    try {
      // 1. Find the salon for the current user
      const { data: salon, error: salonError } = await supabase
        .from('salons')
        .select('id')
        .eq('user_id', user.id)
        .single();

      console.log('salon', salon);

      if (salonError || !salon) {
        console.log('No salon found for this user.');
        setSalonId(null);
        setClients([]);
        return;
      }

      const currentSalonId = salon.id;
      setSalonId(currentSalonId);

      // 2. Fetch clients for that salon, with their pets
      const { data: clientsData, error: clientsError } = await supabase
        .from('clients')
        .select('*, pets(*)')
        .eq('salon_id', currentSalonId);

      if (clientsError) {
        throw clientsError;
      }

      setClients(clientsData as Client[]);

      // 3. Fetch all pets for the salon (including orphaned ones)
      const { data: allPetsData, error: petsError } = await supabase
        .from('pets')
        .select('*')
        .eq('salon_id', currentSalonId);

      if (petsError) {
        throw petsError;
      }

      setAllPets(allPetsData as Pet[]);
    } catch (error) {
      console.error('Error fetching clients data:', error);
      setClients([]);
      setAllPets([]);
    } finally {
      setIsLoading(false);
    }
  }, [user, supabase]);

  useEffect(() => {
    fetchSalonAndClients();
  }, [fetchSalonAndClients]);

  const addClient = async (
    clientData: Omit<
      Client,
      | 'id'
      | 'pets'
      | 'created_at'
      | 'salon_id'
      | 'has_gdpr_consent'
      | 'gdpr_consent_date'
    >
  ): Promise<Client | undefined> => {
    if (!salonId) {
      console.error('No salon ID available.');
      return;
    }

    const newClientData = {
      ...clientData,
      salon_id: salonId,
      has_gdpr_consent: true,
      gdpr_consent_date: new Date().toISOString(),
    };

    const { data: newClient, error } = await supabase
      .from('clients')
      .insert(newClientData)
      .select()
      .single();

    if (error) {
      console.error('Error adding client:', error);
      return;
    }

    // Add new client to local state to update UI immediately
    if (newClient) {
      const clientWithEmptyPets = { ...newClient, pets: [] } as Client;
      setClients((prevClients) => [clientWithEmptyPets, ...prevClients]);
      return clientWithEmptyPets;
    }
  };

  const deleteClient = async (id: string) => {
    const { error } = await supabase.from('clients').delete().eq('id', id);

    if (error) {
      console.error('Error deleting client:', error);
      return;
    }

    setClients((prevClients) =>
      prevClients.filter((client) => client.id !== id)
    );
  };

  const deletePet = async (petId: string, clientId?: string) => {
    const { error } = await supabase.from('pets').delete().eq('id', petId);

    if (error) {
      console.error('Error deleting pet:', error);
      return;
    }

    // Update allPets state
    setAllPets((prevPets) => prevPets.filter((pet) => pet.id !== petId));

    // Update clients state only if clientId is provided
    if (clientId) {
      setClients((prevClients) =>
        prevClients.map((client) => {
          if (client.id === clientId) {
            return {
              ...client,
              pets: client.pets.filter((pet) => pet.id !== petId),
            };
          }
          return client;
        })
      );
    }
  };

  const addPet = async (
    petData: Pick<Pet, 'name' | 'breed' | 'age'>,
    clientId: string
  ) => {
    if (!salonId) {
      console.error('No salon ID available.');
      return;
    }

    const { data: newPet, error: petError } = await supabase
      .from('pets')
      .insert([
        {
          ...petData,
          salon_id: salonId,
          age: Number(petData.age),
        },
      ])
      .select()
      .single();

    if (petError) {
      console.error('Error adding pet:', petError);
      return;
    }
    if (!newPet) return;

    const { error: linkError } = await supabase
      .from('client_pets')
      .insert({ client_id: clientId, pet_id: newPet.id });

    if (linkError) {
      console.error('Error linking pet to client:', linkError);
      // Here you might want to delete the created pet
      return;
    }

    const petWithDetails: Pet = {
      ...newPet,
    };

    // Update allPets state
    setAllPets((prevPets) => [...prevPets, petWithDetails]);

    setClients((prevClients) =>
      prevClients.map((client) =>
        client.id === clientId
          ? { ...client, pets: [...client.pets, petWithDetails] }
          : client
      )
    );
  };

  const getClientById = (id: string) => {
    return clients.find((c) => c.id === id);
  };

  return (
    <ClientContext.Provider
      value={{
        clients,
        allPets,
        addClient,
        getClientById,
        isLoading,
        addPet,
        deleteClient,
        deletePet,
      }}
    >
      {children}
    </ClientContext.Provider>
  );
};

export const useClients = () => {
  const context = useContext(ClientContext);
  if (context === undefined) {
    throw new Error('useClients must be used within a ClientProvider');
  }
  return context;
};
