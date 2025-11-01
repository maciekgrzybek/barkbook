'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, FileText, Plus, Trash2, Edit } from 'lucide-react';
import { useLanguage } from '@/features/language/contexts/language-context';
import { type PetVisit } from '@/lib/types';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { deletePetVisit } from '../actions/pet-visits';
import { PhotoGallery } from './PhotoGallery';
import { PhotoUpload } from './PhotoUpload';
import { EditVisitDialog } from './EditVisitDialog';
import { useState } from 'react';
import { type VisitPhoto } from '@/lib/types';

interface VisitHistoryProps {
  petId: string;
  visits: PetVisit[];
  onAddVisit: () => void;
  onVisitsChange: () => void;
}

export function VisitHistory({
  petId,
  visits,
  onAddVisit,
  onVisitsChange,
}: VisitHistoryProps) {
  const { t } = useLanguage();
  const [deletingVisitId, setDeletingVisitId] = useState<string | null>(null);
  const [editingVisit, setEditingVisit] = useState<PetVisit | null>(null);
  const [uploadingForVisitId, setUploadingForVisitId] = useState<string | null>(
    null
  );

  const handleDeleteVisit = async (visitId: string) => {
    try {
      setDeletingVisitId(visitId);
      await deletePetVisit(visitId);
      onVisitsChange();
    } catch (error) {
      console.error('Error deleting visit:', error);
      // TODO: Add toast notification for error
    } finally {
      setDeletingVisitId(null);
    }
  };

  const handlePhotoDeleted = (photoPath: string) => {
    // Refresh visits to update photo count
    onVisitsChange();
  };

  const handlePhotoUploaded = (photo: VisitPhoto) => {
    // Refresh visits to show new photo
    onVisitsChange();
  };

  const formatVisitDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd MMMM yyyy', { locale: pl });
    } catch {
      return dateString;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {t('pet.visit_history')}
          </CardTitle>
          <Button
            onClick={onAddVisit}
            size="sm"
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            {t('pet.add_visit')}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {visits.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>{t('pet.no_visits')}</p>
            <p className="text-sm mt-2">{t('pet.no_visits_description')}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {visits.map((visit) => (
              <div
                key={visit.id}
                className="border rounded-lg p-4 space-y-3 hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <Badge variant="outline" className="font-medium">
                      {formatVisitDate(visit.visit_date)}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingVisit(visit)}
                      className="hover:bg-accent"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={deletingVisitId === visit.id}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            {t('are_you_sure')}
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            {t('pet.delete_visit_confirm')}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteVisit(visit.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            {t('delete')}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>

                <div className="prose prose-sm max-w-none">
                  <div className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {visit.notes}
                  </div>
                </div>

                {/* Photos Section */}
                <div className="mt-4 space-y-3">
                  {/* Photos Header with Add Button */}
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium flex items-center gap-2">
                      {visit.photos && visit.photos.length > 0 ? (
                        <Badge variant="secondary">
                          {t('pet.photos_count', {
                            count: visit.photos.length,
                          })}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">
                          {t('pet.no_photos')}
                        </span>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setUploadingForVisitId(
                          uploadingForVisitId === visit.id ? null : visit.id
                        )
                      }
                      className="flex items-center gap-2"
                    >
                      <Plus className="h-3 w-3" />
                      {t('pet.add_photos')}
                    </Button>
                  </div>

                  {/* Photo Upload Area */}
                  {uploadingForVisitId === visit.id && (
                    <PhotoUpload
                      visitId={visit.id}
                      petId={petId}
                      onPhotoUploaded={handlePhotoUploaded}
                      currentPhotosCount={visit.photos?.length || 0}
                    />
                  )}

                  {/* Photos Gallery */}
                  {visit.photos && visit.photos.length > 0 && (
                    <PhotoGallery
                      photos={visit.photos}
                      visitId={visit.id}
                      onPhotoDeleted={handlePhotoDeleted}
                      canDelete={true}
                    />
                  )}
                </div>

                <div className="text-xs text-muted-foreground pt-2 border-t">
                  {t('pet.visit_added_on')}: {formatVisitDate(visit.created_at)}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {/* Edit Visit Dialog */}
      {editingVisit && (
        <EditVisitDialog
          visit={editingVisit}
          isOpen={!!editingVisit}
          onClose={() => setEditingVisit(null)}
          onVisitUpdated={onVisitsChange}
        />
      )}
    </Card>
  );
}
