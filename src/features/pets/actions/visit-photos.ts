'use server';

import { createSupabaseServerClient } from '@/core/supabase/server';
import { type VisitPhoto } from '@/lib/types';
import { revalidatePath } from 'next/cache';

/**
 * Upload a photo for a visit
 */
export async function uploadVisitPhoto(
  visitId: string,
  petId: string,
  file: File
): Promise<VisitPhoto> {
  console.log('uploadVisitPhoto called with:', {
    visitId,
    petId,
    fileName: file.name,
    fileSize: file.size,
  });

  if (!visitId || !petId || !file) {
    throw new Error('Visit ID, pet ID, and file are required');
  }

  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Only JPEG, PNG, and WebP images are allowed');
  }

  // Validate file size (10MB max)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    throw new Error('File size must be less than 10MB');
  }

  const supabase = await createSupabaseServerClient();

  // Get the salon_id for the current user
  const { data: userSession } = await supabase.auth.getSession();
  console.log('User session:', userSession.session?.user?.id);

  if (!userSession.session?.user) {
    throw new Error('User not authenticated');
  }

  const { data: salon, error: salonError } = await supabase
    .from('salons')
    .select('id')
    .eq('user_id', userSession.session.user.id)
    .single();

  console.log('Salon query result:', { salon, salonError });

  if (salonError) {
    console.error('Error fetching salon:', salonError);
    throw new Error(`Failed to fetch salon: ${salonError.message}`);
  }

  if (!salon) {
    throw new Error('Salon not found for user');
  }

  // Generate unique filename
  const timestamp = Date.now();
  const fileExtension = file.name.split('.').pop();
  const sanitizedOriginalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const filename = `${timestamp}_${sanitizedOriginalName}`;
  const filePath = `${salon.id}/${petId}/${visitId}/${filename}`;

  console.log('Uploading to path:', filePath);

  // Upload file to Supabase Storage
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('visit-photos')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  console.log('Upload result:', { uploadData, uploadError });

  if (uploadError) {
    console.error('Error uploading photo:', uploadError);
    throw new Error(`Failed to upload photo: ${uploadError.message}`);
  }

  // Create photo object
  const photoObject: VisitPhoto = {
    path: uploadData.path,
    filename: file.name,
    uploadedAt: new Date().toISOString(),
  };

  console.log('Photo object created:', photoObject);

  // Update visit with new photo
  try {
    await addPhotoToVisit(visitId, photoObject);
    console.log('Photo added to visit successfully');
  } catch (error) {
    console.error('Error adding photo to visit:', error);
    throw error;
  }

  revalidatePath(`/clients/[clientId]/pets/[petId]`);
  revalidatePath('/pets');

  return photoObject;
}

/**
 * Add photo metadata to visit
 */
async function addPhotoToVisit(
  visitId: string,
  photo: VisitPhoto
): Promise<void> {
  console.log('addPhotoToVisit called with:', { visitId, photo });

  const supabase = await createSupabaseServerClient();

  // Get current photos
  const { data: visit, error: fetchError } = await supabase
    .from('pet_visits')
    .select('photos')
    .eq('id', visitId)
    .single();

  console.log('Visit fetch result:', { visit, fetchError });

  if (fetchError) {
    console.error('Error fetching visit:', fetchError);
    throw new Error(`Failed to fetch visit data: ${fetchError.message}`);
  }

  const currentPhotos = Array.isArray(visit.photos)
    ? (visit.photos as VisitPhoto[])
    : [];
  const updatedPhotos = [...currentPhotos, photo];

  console.log('Photos update:', { currentPhotos, updatedPhotos });

  // Update visit with new photos array
  const { error: updateError } = await supabase
    .from('pet_visits')
    .update({ photos: updatedPhotos })
    .eq('id', visitId);

  console.log('Visit update result:', { updateError });

  if (updateError) {
    console.error('Error updating visit photos:', updateError);
    throw new Error(
      `Failed to update visit with photo: ${updateError.message}`
    );
  }

  console.log('Photo successfully added to visit');
}

/**
 * Delete a photo from a visit
 */
export async function deleteVisitPhoto(
  visitId: string,
  photoPath: string
): Promise<void> {
  if (!visitId || !photoPath) {
    throw new Error('Visit ID and photo path are required');
  }

  const supabase = await createSupabaseServerClient();

  // Delete file from storage
  const { error: storageError } = await supabase.storage
    .from('visit-photos')
    .remove([photoPath]);

  if (storageError) {
    console.error('Error deleting photo from storage:', storageError);
    throw new Error('Failed to delete photo from storage');
  }

  // Remove photo from visit metadata
  const { data: visit, error: fetchError } = await supabase
    .from('pet_visits')
    .select('photos')
    .eq('id', visitId)
    .single();

  if (fetchError) {
    throw new Error('Failed to fetch visit data');
  }

  const currentPhotos = Array.isArray(visit.photos)
    ? (visit.photos as VisitPhoto[])
    : [];
  const updatedPhotos = currentPhotos.filter(
    (photo) => photo.path !== photoPath
  );

  // Update visit with filtered photos array
  const { error: updateError } = await supabase
    .from('pet_visits')
    .update({ photos: updatedPhotos })
    .eq('id', visitId);

  if (updateError) {
    console.error('Error updating visit photos:', updateError);
    throw new Error('Failed to update visit photos');
  }

  revalidatePath(`/clients/[clientId]/pets/[petId]`);
  revalidatePath('/pets');
}

/**
 * Get signed URL for viewing a photo
 */
export async function getPhotoUrl(photoPath: string): Promise<string> {
  if (!photoPath) {
    throw new Error('Photo path is required');
  }

  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase.storage
    .from('visit-photos')
    .createSignedUrl(photoPath, 3600); // 1 hour expiry

  if (error) {
    console.error('Error creating signed URL:', error);
    throw new Error('Failed to get photo URL');
  }

  return data.signedUrl;
}
