'use client';

import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useClients } from '@/features/clients/contexts/client-context';
import { useLanguage } from '@/features/language/contexts/language-context';
import { Client } from '@/lib/types';
import { PlusCircle } from 'lucide-react';

const petSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  breed: z.string().min(1, 'Breed is required'),
  age: z.number().min(0, 'Age must be a positive number'),
  ownerId: z.string().min(1, 'Owner is required'),
});

const clientSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  surname: z.string().min(1, 'Surname is required'),
  email: z.string().email('Invalid email address'),
  phone_number: z.string().min(1, 'Phone number is required'),
  address: z.string().optional(),
});

type PetFormData = z.infer<typeof petSchema>;
type ClientFormData = z.infer<typeof clientSchema>;

interface AddPetDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddPetDialog({ isOpen, onClose }: AddPetDialogProps) {
  const { t } = useLanguage();
  const { clients, addPet, addClient } = useClients();
  const [showNewOwnerForm, setShowNewOwnerForm] = useState(false);

  const {
    register: registerPet,
    handleSubmit: handlePetSubmit,
    control: petControl,
    reset: resetPetForm,
    setValue: setPetValue,
    formState: { errors: petErrors },
  } = useForm<PetFormData>({
    resolver: zodResolver(petSchema),
    defaultValues: {
      name: '',
      breed: '',
      age: 0,
      ownerId: '',
    },
  });

  const {
    register: registerClient,
    handleSubmit: handleClientSubmit,
    reset: resetClientForm,
    formState: { errors: clientErrors },
  } = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      name: '',
      surname: '',
      email: '',
      phone_number: '',
    },
  });

  useEffect(() => {
    if (!isOpen) return;
    resetPetForm();
    resetClientForm();
    setShowNewOwnerForm(false);
  }, [isOpen, resetPetForm, resetClientForm]);

  const onPetSubmit = async (data: PetFormData) => {
    await addPet(
      { name: data.name, breed: data.breed, age: data.age },
      data.ownerId
    );
    onClose();
  };

  const onClientSubmit = async (data: ClientFormData) => {
    const newClient = await addClient({
      ...data,
      address: data.address || null,
    });
    if (newClient) {
      setShowNewOwnerForm(false);
      setPetValue('ownerId', newClient.id, { shouldValidate: true });
    }
  };

  const handleCancelAddOwner = () => {
    resetClientForm();
    setShowNewOwnerForm(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('client.add_pet')}</DialogTitle>
        </DialogHeader>

        {!showNewOwnerForm ? (
          <form key="pet-form" onSubmit={handlePetSubmit(onPetSubmit)}>
            <div className="grid gap-4 py-4">
              <Label htmlFor="name">{t('pet.name')}</Label>
              <Input id="name" {...registerPet('name')} />
              {petErrors.name && <p>{petErrors.name.message}</p>}

              <Label htmlFor="breed">{t('pet.breed')}</Label>
              <Input id="breed" {...registerPet('breed')} />
              {petErrors.breed && <p>{petErrors.breed.message}</p>}

              <Label htmlFor="age">{t('pet.age')}</Label>
              <Input
                id="age"
                type="number"
                {...registerPet('age', { valueAsNumber: true })}
              />
              {petErrors.age && <p>{petErrors.age.message}</p>}

              <Label htmlFor="ownerId">{t('pets.owner')}</Label>
              <Controller
                name="ownerId"
                control={petControl}
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    defaultValue=""
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('client.select_owner')} />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map((client: Client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.name} {client.surname}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {petErrors.ownerId && <p>{petErrors.ownerId.message}</p>}
            </div>
            <Button
              type="button"
              variant="link"
              onClick={() => setShowNewOwnerForm(true)}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              {t('clients.add')}
            </Button>
            <DialogFooter>
              <Button type="submit">{t('add')}</Button>
            </DialogFooter>
          </form>
        ) : (
          <form key="client-form" onSubmit={handleClientSubmit(onClientSubmit)}>
            <div className="grid gap-4 py-4">
              <Label htmlFor="client-name">{t('clients.name')}</Label>
              <Input id="client-name" {...registerClient('name')} />
              {clientErrors.name && <p>{clientErrors.name.message}</p>}

              <Label htmlFor="client-surname">{t('clients.surname')}</Label>
              <Input id="client-surname" {...registerClient('surname')} />
              {clientErrors.surname && <p>{clientErrors.surname.message}</p>}

              <Label htmlFor="client-email">{t('email')}</Label>
              <Input
                id="client-email"
                type="email"
                {...registerClient('email')}
              />
              {clientErrors.email && <p>{clientErrors.email.message}</p>}

              <Label htmlFor="client-phone">{t('clients.phone')}</Label>
              <Input id="client-phone" {...registerClient('phone_number')} />
              {clientErrors.phone_number && (
                <p>{clientErrors.phone_number.message}</p>
              )}
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowNewOwnerForm(false)}
              >
                {t('cancel')}
              </Button>
              <Button type="submit">{t('clients.add')}</Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
