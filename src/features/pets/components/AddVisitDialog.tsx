'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, FileText } from 'lucide-react';
import { useLanguage } from '@/features/language/contexts/language-context';
import { addPetVisit } from '../actions/pet-visits';
import { PhotoUpload } from './PhotoUpload';
import { type VisitPhoto } from '@/lib/types';
import { format } from 'date-fns';

const visitSchema = z.object({
  visit_date: z.string().min(1, 'Data wizyty jest wymagana'),
  notes: z
    .string()
    .min(1, 'Notatki są wymagane')
    .max(2000, 'Notatki nie mogą przekraczać 2000 znaków'),
});

type VisitFormData = z.infer<typeof visitSchema>;

interface AddVisitDialogProps {
  isOpen: boolean;
  onClose: () => void;
  petId: string;
  petName: string;
  onVisitAdded: () => void;
}

export function AddVisitDialog({
  isOpen,
  onClose,
  petId,
  petName,
  onVisitAdded,
}: AddVisitDialogProps) {
  const { t } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPhotoUpload, setShowPhotoUpload] = useState(false);
  const [createdVisitId, setCreatedVisitId] = useState<string>('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<VisitFormData>({
    resolver: zodResolver(visitSchema),
    defaultValues: {
      visit_date: format(new Date(), 'yyyy-MM-dd'),
      notes: '',
    },
  });

  const onSubmit = async (data: VisitFormData) => {
    try {
      setIsSubmitting(true);
      const newVisit = await addPetVisit(petId, {
        visit_date: data.visit_date,
        notes: data.notes.trim(),
        photos: [],
      });

      setCreatedVisitId(newVisit.id);
      setShowPhotoUpload(true);
      onVisitAdded();
    } catch (error) {
      console.error('Error adding visit:', error);
      // TODO: Add toast notification for error
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      reset();
      setShowPhotoUpload(false);
      setCreatedVisitId('');
      onClose();
    }
  };

  const handlePhotoUploaded = (photo: VisitPhoto) => {
    // Photo uploaded successfully, refresh visit data
    onVisitAdded();
  };

  const handleFinishAddingPhotos = () => {
    reset();
    setShowPhotoUpload(false);
    setCreatedVisitId('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {showPhotoUpload ? t('pet.add_photos') : t('pet.add_visit')} -{' '}
            {petName}
          </DialogTitle>
          <DialogDescription>
            {showPhotoUpload
              ? t('pet.add_photos_description')
              : t('pet.add_visit_description')}
          </DialogDescription>
        </DialogHeader>

        {!showPhotoUpload ? (
          /* Visit Form */
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="visit_date" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {t('pet.visit_date')}
              </Label>
              <Input
                id="visit_date"
                type="date"
                {...register('visit_date')}
                className={errors.visit_date ? 'border-destructive' : ''}
              />
              {errors.visit_date && (
                <p className="text-sm text-destructive">
                  {errors.visit_date.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                {t('pet.visit_notes')}
              </Label>
              <Textarea
                id="notes"
                rows={6}
                placeholder={t('pet.visit_notes_placeholder')}
                {...register('notes')}
                className={errors.notes ? 'border-destructive' : ''}
              />
              {errors.notes && (
                <p className="text-sm text-destructive">
                  {errors.notes.message}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                {t('pet.notes_char_limit')}
              </p>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                {t('cancel')}
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    {t('pet.adding_visit')}
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4" />
                    {t('pet.add_visit')}
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        ) : (
          /* Photo Upload Section */
          <div className="space-y-6">
            <div className="text-sm text-muted-foreground bg-green-50 border border-green-200 rounded-lg p-3">
              {t('pet.visit_created_successfully')}
            </div>

            <PhotoUpload
              visitId={createdVisitId}
              petId={petId}
              onPhotoUploaded={handlePhotoUploaded}
              maxPhotos={10}
              currentPhotosCount={0}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleFinishAddingPhotos}
              >
                {t('pet.finish_adding_photos')}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
