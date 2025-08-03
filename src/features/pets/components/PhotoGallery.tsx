'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Download,
  Eye,
} from 'lucide-react';
import { useLanguage } from '@/features/language/contexts/language-context';
import { type VisitPhoto } from '@/lib/types';
import { getPhotoUrl, deleteVisitPhoto } from '../actions/visit-photos';
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

interface PhotoGalleryProps {
  photos: VisitPhoto[];
  visitId: string;
  onPhotoDeleted: (photoPath: string) => void;
  canDelete?: boolean;
}

interface PhotoWithUrl extends VisitPhoto {
  signedUrl?: string;
  loading?: boolean;
}

export function PhotoGallery({
  photos,
  visitId,
  onPhotoDeleted,
  canDelete = true,
}: PhotoGalleryProps) {
  const { t } = useLanguage();
  const [photosWithUrls, setPhotosWithUrls] = useState<PhotoWithUrl[]>([]);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [deletingPhoto, setDeletingPhoto] = useState<string>('');

  // Load signed URLs for photos
  useEffect(() => {
    const loadPhotoUrls = async () => {
      const photosWithUrlsPromises = photos.map(async (photo) => {
        try {
          const signedUrl = await getPhotoUrl(photo.path);
          return { ...photo, signedUrl, loading: false };
        } catch (error) {
          console.error(`Error loading photo ${photo.path}:`, error);
          return { ...photo, signedUrl: undefined, loading: false };
        }
      });

      const resolvedPhotos = await Promise.all(photosWithUrlsPromises);
      setPhotosWithUrls(resolvedPhotos);
    };

    if (photos.length > 0) {
      setPhotosWithUrls(photos.map((photo) => ({ ...photo, loading: true })));
      loadPhotoUrls();
    } else {
      setPhotosWithUrls([]);
    }
  }, [photos]);

  const handlePhotoClick = (index: number) => {
    setCurrentPhotoIndex(index);
    setLightboxOpen(true);
  };

  const handlePrevious = () => {
    setCurrentPhotoIndex((prev) =>
      prev === 0 ? photosWithUrls.length - 1 : prev - 1
    );
  };

  const handleNext = () => {
    setCurrentPhotoIndex((prev) =>
      prev === photosWithUrls.length - 1 ? 0 : prev + 1
    );
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (!lightboxOpen) return;

    if (event.key === 'ArrowLeft') {
      handlePrevious();
    } else if (event.key === 'ArrowRight') {
      handleNext();
    } else if (event.key === 'Escape') {
      setLightboxOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen]);

  const handleDeletePhoto = async (photoPath: string) => {
    try {
      setDeletingPhoto(photoPath);
      await deleteVisitPhoto(visitId, photoPath);
      onPhotoDeleted(photoPath);

      // Close lightbox if we're viewing the deleted photo
      if (
        lightboxOpen &&
        photosWithUrls[currentPhotoIndex]?.path === photoPath
      ) {
        setLightboxOpen(false);
      }
    } catch (error) {
      console.error('Error deleting photo:', error);
      // TODO: Add toast notification for error
    } finally {
      setDeletingPhoto('');
    }
  };

  const handleDownload = async (photo: PhotoWithUrl) => {
    if (!photo.signedUrl) return;

    try {
      const response = await fetch(photo.signedUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = photo.filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading photo:', error);
    }
  };

  if (photosWithUrls.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>{t('pet.no_photos')}</p>
      </div>
    );
  }

  const currentPhoto = photosWithUrls[currentPhotoIndex];

  return (
    <>
      {/* Photo Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {photosWithUrls.map((photo, index) => (
          <div key={photo.path} className="relative group">
            <div
              className="aspect-square rounded-lg overflow-hidden bg-muted cursor-pointer transition-transform hover:scale-105"
              onClick={() => handlePhotoClick(index)}
            >
              {photo.loading || !photo.signedUrl ? (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="h-6 w-6 border-2 border-current border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <img
                  src={photo.signedUrl}
                  alt={photo.filename}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              )}
            </div>

            {/* Delete Button */}
            {canDelete && photo.signedUrl && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    disabled={deletingPhoto === photo.path}
                  >
                    {deletingPhoto === photo.path ? (
                      <div className="h-3 w-3 border border-current border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <X className="h-3 w-3" />
                    )}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>{t('are_you_sure')}</AlertDialogTitle>
                    <AlertDialogDescription>
                      {t('pet.delete_photo_confirm')}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleDeletePhoto(photo.path)}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      {t('delete')}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        ))}
      </div>

      {/* Lightbox Dialog */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-4xl w-full h-[90vh] p-0">
          <DialogHeader className="p-4 pb-0">
            <DialogTitle className="text-sm text-muted-foreground">
              {currentPhoto?.filename} ({currentPhotoIndex + 1} /{' '}
              {photosWithUrls.length})
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 relative flex items-center justify-center p-4">
            {currentPhoto?.signedUrl && (
              <img
                src={currentPhoto.signedUrl}
                alt={currentPhoto.filename}
                className="max-w-full max-h-full object-contain rounded-lg"
              />
            )}

            {/* Navigation Buttons */}
            {photosWithUrls.length > 1 && (
              <>
                <Button
                  variant="secondary"
                  size="sm"
                  className="absolute left-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full p-0"
                  onClick={handlePrevious}
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  className="absolute right-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full p-0"
                  onClick={handleNext}
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between p-4 border-t">
            <div className="text-xs text-muted-foreground">
              {t('pet.lightbox_controls')}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => currentPhoto && handleDownload(currentPhoto)}
                disabled={!currentPhoto?.signedUrl}
              >
                <Download className="h-4 w-4 mr-2" />
                {t('download')}
              </Button>
              {canDelete && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      size="sm"
                      disabled={deletingPhoto === currentPhoto?.path}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      {t('delete')}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>{t('are_you_sure')}</AlertDialogTitle>
                      <AlertDialogDescription>
                        {t('pet.delete_photo_confirm')}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() =>
                          currentPhoto && handleDeletePhoto(currentPhoto.path)
                        }
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        {t('delete')}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
