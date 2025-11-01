'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/core/supabase/client';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';
import type { Database } from '@/core/db/database.types';

type Client = Database['public']['Tables']['clients']['Row'];
type Pet = Database['public']['Tables']['pets']['Row'];

interface PetWithClients extends Pet {
  clients?: Client[];
}

interface ClientPetSelectorProps {
  onSelect: (client: Client, pet: Pet) => void;
  selectedClientId?: string;
  selectedPetId?: string;
}

export function ClientPetSelector({
  onSelect,
  selectedClientId,
  selectedPetId,
}: ClientPetSelectorProps) {
  const [pets, setPets] = useState<PetWithClients[]>([]);
  const [selectedPet, setSelectedPet] = useState<PetWithClients | null>(null);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load pets with their clients
  useEffect(() => {
    async function loadPets() {
      try {
        setIsLoading(true);
        const supabase = createClient();

        // Fetch all pets
        const { data: petsData, error: petsError } = await supabase
          .from('pets')
          .select('*')
          .order('name');

        if (petsError) throw petsError;

        // Fetch client-pet relationships with client details
        const { data: clientPetsData, error: clientPetsError } = await supabase
          .from('client_pets')
          .select('pet_id, client_id, clients(*)');

        if (clientPetsError) throw clientPetsError;

        // Build pets with their clients
        const petsWithClients = petsData.map((pet) => ({
          ...pet,
          clients: clientPetsData
            .filter((cp) => cp.pet_id === pet.id)
            .map((cp) => cp.clients as unknown as Client)
            .filter(
              (client): client is Client =>
                client !== null && client !== undefined
            ),
        }));

        setPets(petsWithClients);
      } catch (err) {
        console.error('Error loading pets:', err);
        setError('Nie udało się załadować zwierzaków');
      } finally {
        setIsLoading(false);
      }
    }

    loadPets();
  }, []);

  // Handle pet selection
  function handlePetChange(petId: string) {
    const pet = pets.find((p) => p.id === petId);
    if (pet) {
      setSelectedPet(pet);
      setSelectedClient(null); // Reset client selection when pet changes

      // If pet has only one client, auto-select it
      if (pet.clients && pet.clients.length === 1) {
        const client = pet.clients[0];
        setSelectedClient(client);
        onSelect(client, pet);
      }
    }
  }

  // Handle client selection (when pet has multiple owners)
  function handleClientChange(clientId: string) {
    if (!selectedPet) return;

    const client = selectedPet.clients?.find((c) => c.id === clientId);
    if (client) {
      setSelectedClient(client);
      onSelect(client, selectedPet);
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">Ładowanie klientów...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Wybierz zwierzaka</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Pet Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Zwierzak</label>
            <Select
              value={selectedPet?.id || selectedPetId}
              onValueChange={handlePetChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Wybierz zwierzaka" />
              </SelectTrigger>
              <SelectContent>
                {pets.map((pet) => (
                  <SelectItem key={pet.id} value={pet.id}>
                    {pet.name}
                    {pet.breed && ` (${pet.breed})`}
                    {pet.type && ` - ${pet.type}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Client Selection (if pet has multiple owners) */}
          {selectedPet &&
            selectedPet.clients &&
            selectedPet.clients.length > 1 && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Właściciel</label>
                <Alert className="mb-2">
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Ten zwierzak ma więcej niż jednego właściciela. Wybierz
                    właściciela dla tej wizyty.
                  </AlertDescription>
                </Alert>
                <Select
                  value={selectedClient?.id || selectedClientId}
                  onValueChange={handleClientChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Wybierz właściciela" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedPet.clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name} {client.surname} - {client.phone_number}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

          {/* Show auto-selected client (if pet has only one owner) */}
          {selectedPet &&
            selectedClient &&
            selectedPet.clients &&
            selectedPet.clients.length === 1 && (
              <Alert className="bg-green-50 border-green-200">
                <Info className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  Właściciel:{' '}
                  <strong>
                    {selectedClient.name} {selectedClient.surname}
                  </strong>
                </AlertDescription>
              </Alert>
            )}
        </CardContent>
      </Card>

      {/* Selected Pet & Client Preview */}
      {selectedPet && selectedClient && (
        <Card className="bg-muted/50">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              Szczegóły wizyty
              <Badge variant="secondary">Dane auto-wypełnione</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="font-medium">Zwierzak:</dt>
                <dd className="text-muted-foreground font-semibold text-base">
                  {selectedPet.name}
                </dd>
              </div>
              {selectedPet.breed && (
                <div className="flex justify-between">
                  <dt className="font-medium">Rasa:</dt>
                  <dd className="text-muted-foreground">{selectedPet.breed}</dd>
                </div>
              )}
              {selectedPet.type && (
                <div className="flex justify-between">
                  <dt className="font-medium">Gatunek:</dt>
                  <dd className="text-muted-foreground">{selectedPet.type}</dd>
                </div>
              )}
              {selectedPet.age && (
                <div className="flex justify-between">
                  <dt className="font-medium">Wiek:</dt>
                  <dd className="text-muted-foreground">
                    {selectedPet.age} {selectedPet.age === 1 ? 'rok' : 'lat'}
                  </dd>
                </div>
              )}
              {selectedPet.allergies && (
                <div className="flex justify-between">
                  <dt className="font-medium text-orange-600">⚠️ Alergie:</dt>
                  <dd className="text-orange-600 font-medium">
                    {selectedPet.allergies}
                  </dd>
                </div>
              )}
              {selectedPet.health_issues && (
                <div className="flex justify-between">
                  <dt className="font-medium text-orange-600">⚠️ Zdrowie:</dt>
                  <dd className="text-orange-600 font-medium">
                    {selectedPet.health_issues}
                  </dd>
                </div>
              )}
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between">
                  <dt className="font-medium">Właściciel:</dt>
                  <dd className="text-muted-foreground">
                    {selectedClient.name} {selectedClient.surname}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="font-medium">Telefon:</dt>
                  <dd className="text-muted-foreground">
                    {selectedClient.phone_number}
                  </dd>
                </div>
                {selectedClient.email && (
                  <div className="flex justify-between">
                    <dt className="font-medium">Email:</dt>
                    <dd className="text-muted-foreground">
                      {selectedClient.email}
                    </dd>
                  </div>
                )}
              </div>
            </dl>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
