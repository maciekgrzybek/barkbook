'use client';

import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
  useCallback,
} from 'react';
import { useAuth } from './auth-context';
import type { Client, Dog } from '@/lib/types';
import { createClient } from '@/core/supabase/client';

interface ClientContextType {
  clients: Client[];
  addClient: (client: Omit<Client, 'id' | 'dogs'>) => Promise<void>;
  getClientById: (id: string) => Client | undefined;
  isLoading: boolean;
}

const ClientContext = createContext<ClientContextType | undefined>(undefined);

export const ClientProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
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
        .eq('owner_id', user.id)
        .single();

      if (salonError || !salon) {
        console.log('No salon found for this user.');
        setSalonId(null);
        setClients([]);
        return;
      }

      const currentSalonId = salon.id;
      setSalonId(currentSalonId);

      // 2. Fetch clients for that salon, with their dogs
      const { data: clientsData, error: clientsError } = await supabase
        .from('clients')
        .select('*, dogs(*)')
        .eq('salon_id', currentSalonId);

      if (clientsError) {
        throw clientsError;
      }

      setClients(clientsData as Client[]);
    } catch (error) {
      console.error('Error fetching clients data:', error);
      setClients([]);
    } finally {
      setIsLoading(false);
    }
  }, [user, supabase]);

  useEffect(() => {
    fetchSalonAndClients();
  }, [fetchSalonAndClients]);

  const addClient = async (clientData: Omit<Client, 'id' | 'dogs'>) => {
    if (!salonId) {
      console.error('No salon ID available.');
      return;
    }

    const newClientData = {
      ...clientData,
      salon_id: salonId,
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
      setClients((prevClients) => [{ ...newClient, dogs: [] }, ...prevClients]);
    }
  };

  const getClientById = (id: string) => {
    return clients.find((c) => c.id === id);
  };

  return (
    <ClientContext.Provider
      value={{ clients, addClient, getClientById, isLoading }}
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
