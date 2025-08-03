'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { useLanguage } from '@/features/language/contexts/language-context';
import { uploadVisitPhoto } from '../actions/visit-photos';
import { type VisitPhoto } from '@/lib/types';

interface PhotoUploadProps {
  visitId: string;
  petId: string;
  onPhotoUploaded: (photo: VisitPhoto) => void;
  maxPhotos?: number;
  currentPhotosCount?: number;
}

interface UploadingFile {
  file: File;
  progress: number;
  preview: string;
}

export function PhotoUpload({
  visitId,
  petId,
  onPhotoUploaded,
  maxPhotos = 10,
  currentPhotosCount = 0,
}: PhotoUploadProps) {
  const { t } = useLanguage();
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [error, setError] = useState<string>('');

  const canUploadMore = currentPhotosCount < maxPhotos;
  const remainingSlots = maxPhotos - currentPhotosCount;

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (!canUploadMore) {
        setError(t('pet.max_photos_reached', { max: maxPhotos }));
        return;
      }

      // Limit files to remaining slots
      const filesToUpload = acceptedFiles.slice(0, remainingSlots);

      if (acceptedFiles.length > remainingSlots) {
        setError(t('pet.too_many_photos', { max: remainingSlots }));
      } else {
        setError('');
      }

      // Add files to uploading state
      const uploadingFiles: UploadingFile[] = filesToUpload.map((file) => ({
        file,
        progress: 0,
        preview: URL.createObjectURL(file),
      }));

      setUploadingFiles((prev) => [...prev, ...uploadingFiles]);

      // Upload files sequentially
      for (let i = 0; i < filesToUpload.length; i++) {
        const file = filesToUpload[i];
        try {
          console.log('Starting upload for file:', file.name);

          // Update progress
          setUploadingFiles((prev) =>
            prev.map((item, index) =>
              item.file === file ? { ...item, progress: 50 } : item
            )
          );

          const photo = await uploadVisitPhoto(visitId, petId, file);

          console.log('Upload successful:', photo);

          // Update progress to complete
          setUploadingFiles((prev) =>
            prev.map((item) =>
              item.file === file ? { ...item, progress: 100 } : item
            )
          );

          onPhotoUploaded(photo);

          // Remove from uploading state after a brief delay
          setTimeout(() => {
            setUploadingFiles((prev) =>
              prev.filter((item) => item.file !== file)
            );
          }, 1000);
        } catch (error) {
          console.error('Error uploading photo:', error);
          const errorMessage =
            error instanceof Error ? error.message : 'Upload failed';
          console.error('Detailed error:', errorMessage);
          setError(errorMessage);

          // Remove failed upload
          setUploadingFiles((prev) =>
            prev.filter((item) => item.file !== file)
          );
        }
      }
    },
    [
      visitId,
      petId,
      onPhotoUploaded,
      canUploadMore,
      remainingSlots,
      maxPhotos,
      t,
    ]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp'],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    disabled: !canUploadMore,
  });

  const removeUploadingFile = (file: File) => {
    setUploadingFiles((prev) => {
      const item = prev.find((item) => item.file === file);
      if (item) {
        URL.revokeObjectURL(item.preview);
      }
      return prev.filter((item) => item.file !== file);
    });
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      {canUploadMore && (
        <Card
          {...getRootProps()}
          className={`cursor-pointer transition-colors ${
            isDragActive
              ? 'border-primary bg-primary/5'
              : 'border-dashed border-muted-foreground/25 hover:border-muted-foreground/50'
          }`}
        >
          <CardContent className="flex flex-col items-center justify-center py-8">
            <input {...getInputProps()} />
            <div className="flex flex-col items-center text-center">
              <Upload className="h-10 w-10 text-muted-foreground mb-4" />
              <div className="text-sm font-medium mb-2">
                {isDragActive
                  ? t('pet.drop_photos_here')
                  : t('pet.drag_photos_or_click')}
              </div>
              <div className="text-xs text-muted-foreground">
                {t('pet.photo_requirements')}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {t('pet.photos_remaining', { count: remainingSlots })}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Message */}
      {error && (
        <div className="text-sm text-destructive bg-destructive/10 p-2 rounded">
          {error}
        </div>
      )}

      {/* Uploading Files Preview */}
      {uploadingFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">{t('pet.uploading_photos')}</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {uploadingFiles.map((item, index) => (
              <div key={index} className="relative">
                <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                  <img
                    src={item.preview}
                    alt={`Uploading ${item.file.name}`}
                    className="w-full h-full object-cover"
                  />

                  {/* Upload Progress Overlay */}
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    {item.progress < 100 ? (
                      <div className="flex flex-col items-center text-white">
                        <Loader2 className="h-6 w-6 animate-spin mb-1" />
                        <span className="text-xs">{item.progress}%</span>
                      </div>
                    ) : (
                      <div className="text-white">
                        <ImageIcon className="h-6 w-6" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Remove Button */}
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                  onClick={() => removeUploadingFile(item.file)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Max Photos Reached Message */}
      {!canUploadMore && (
        <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded text-center">
          {t('pet.max_photos_reached_message', { max: maxPhotos })}
        </div>
      )}
    </div>
  );
}
