'use server';

import { createSupabaseServerClient } from '@/core/supabase/server';
import {
  type PetVisit,
  type PetVisitInsert,
  type PetVisitUpdate,
  type VisitPhoto,
} from '@/lib/types';
import { revalidatePath } from 'next/cache';

/**
 * Get all visits for a specific pet, ordered by date (newest first)
 * Implements US-008: Przeglądanie historii wizyt zwierzaka
 */
export async function getPetVisits(petId: string): Promise<PetVisit[]> {
  if (!petId) {
    throw new Error('Pet ID is required');
  }

  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from('pet_visits')
    .select('*')
    .eq('pet_id', petId)
    .order('visit_date', { ascending: false });

  if (error) {
    console.error('Error fetching pet visits:', error);
    throw new Error('Failed to fetch pet visits');
  }

  // Transform the data to match our type
  const transformedData: PetVisit[] = (data || []).map((visit) => ({
    ...visit,
    photos: Array.isArray(visit.photos) ? (visit.photos as VisitPhoto[]) : [],
  }));

  return transformedData;
}

/**
 * Add a new visit for a pet
 * Implements US-010: Dodawanie notatki do historii po wizycie
 */
export async function addPetVisit(
  petId: string,
  visitData: Omit<PetVisitInsert, 'pet_id' | 'salon_id'>
): Promise<PetVisit> {
  if (!petId) {
    throw new Error('Pet ID is required');
  }

  if (!visitData.visit_date || !visitData.notes) {
    throw new Error('Visit date and notes are required');
  }

  const supabase = await createSupabaseServerClient();

  // Get the salon_id for the current user
  const { data: userSession } = await supabase.auth.getSession();
  if (!userSession.session?.user) {
    throw new Error('User not authenticated');
  }

  const { data: salon } = await supabase
    .from('salons')
    .select('id')
    .eq('user_id', userSession.session.user.id)
    .single();

  if (!salon) {
    throw new Error('Salon not found for user');
  }

  const { data, error } = await supabase
    .from('pet_visits')
    .insert({
      pet_id: petId,
      salon_id: salon.id,
      photos: [],
      ...visitData,
    })
    .select()
    .single();

  if (error) {
    console.error('Error adding pet visit:', error);
    throw new Error('Failed to add pet visit');
  }

  // Transform the data to match our type
  const transformedData: PetVisit = {
    ...data,
    photos: Array.isArray(data.photos) ? (data.photos as VisitPhoto[]) : [],
  };

  revalidatePath(`/clients/[clientId]/pets/[petId]`);
  revalidatePath('/pets');

  return transformedData;
}

/**
 * Update an existing pet visit
 */
export async function updatePetVisit(
  visitId: string,
  visitData: PetVisitUpdate
): Promise<PetVisit> {
  if (!visitId) {
    throw new Error('Visit ID is required');
  }

  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from('pet_visits')
    .update(visitData)
    .eq('id', visitId)
    .select()
    .single();

  if (error) {
    console.error('Error updating pet visit:', error);
    throw new Error('Failed to update pet visit');
  }

  revalidatePath(`/clients/[clientId]/pets/[petId]`);
  revalidatePath('/pets');

  // Transform the data to match our type
  const transformedData: PetVisit = {
    ...data,
    photos: Array.isArray(data.photos) ? (data.photos as VisitPhoto[]) : [],
  };

  return transformedData;
}

/**
 * Delete a pet visit
 */
export async function deletePetVisit(visitId: string): Promise<void> {
  if (!visitId) {
    throw new Error('Visit ID is required');
  }

  const supabase = await createSupabaseServerClient();

  const { error } = await supabase
    .from('pet_visits')
    .delete()
    .eq('id', visitId);

  if (error) {
    console.error('Error deleting pet visit:', error);
    throw new Error('Failed to delete pet visit');
  }

  revalidatePath(`/clients/[clientId]/pets/[petId]`);
  revalidatePath('/pets');
}
