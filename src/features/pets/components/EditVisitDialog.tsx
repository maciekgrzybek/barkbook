'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/features/language/contexts/language-context';
import { updatePetVisit } from '../actions/pet-visits';
import { type PetVisit } from '@/lib/types';

interface EditVisitDialogProps {
  visit: PetVisit;
  isOpen: boolean;
  onClose: () => void;
  onVisitUpdated: () => void;
}

export function EditVisitDialog({
  visit,
  isOpen,
  onClose,
  onVisitUpdated,
}: EditVisitDialogProps) {
  const { t } = useLanguage();
  const [visitDate, setVisitDate] = useState(visit.visit_date);
  const [notes, setNotes] = useState(visit.notes);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!notes.trim()) {
      setError(t('pet.notes_required'));
      return;
    }

    try {
      setIsSubmitting(true);
      await updatePetVisit(visit.id, {
        visit_date: visitDate,
        notes: notes.trim(),
      });
      onVisitUpdated();
      onClose();
    } catch (err) {
      console.error('Error updating visit:', err);
      setError(
        err instanceof Error ? err.message : t('pet.error_updating_visit')
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setVisitDate(visit.visit_date);
      setNotes(visit.notes);
      setError('');
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>{t('pet.edit_visit')}</DialogTitle>
          <DialogDescription>
            {t('pet.edit_visit_description')}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="visitDate">{t('pet.visit_date')}</Label>
              <Input
                id="visitDate"
                type="date"
                value={visitDate}
                onChange={(e) => setVisitDate(e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="notes">{t('pet.visit_notes')}</Label>
              <Textarea
                id="notes"
                placeholder={t('pet.visit_notes_placeholder')}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                required
                rows={6}
                disabled={isSubmitting}
                className="resize-none"
              />
            </div>
            {error && (
              <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                {error}
              </div>
            )}
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
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                  {t('saving')}
                </>
              ) : (
                t('save_changes')
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
