import React, { useState, useEffect, useRef, useCallback } from 'react';
import Modal from '@/components/ui/Modal';
import { Button } from '@/components/ui/button';
import Input from '@/components/ui/Input';
import Label from '@/components/ui/Label';
import { Upload, X, Crop } from 'lucide-react';
import Cropper from 'react-easy-crop';
import type { Area } from 'react-easy-crop';

interface TeacherPhoto {
  id: string;
  filePath: string;
}

interface TeacherModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (teacher: { name: string; url?: string; photoFile?: File | null }) => void;
  initial?: {
    name: string;
    url?: string;
    photo?: TeacherPhoto;
  };
}

export default function TeacherModal({ open, onClose, onSave, initial }: TeacherModalProps) {
  const [name, setName] = useState(initial?.name || '');
  const [url, setUrl] = useState(initial?.url || '');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | undefined>(initial?.photo?.filePath);
  const [showCropper, setShowCropper] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [error, setError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onCropComplete = useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  // Reset form when modal opens/closes or initial changes
  useEffect(() => {
    if (open) {
      setName(initial?.name || '');
      setUrl(initial?.url || '');
      setPhotoFile(null);
      setPreview(initial?.photo?.filePath);
      setShowCropper(false);
      setImageToCrop(null);
      setError('');
      setIsSubmitting(false);
    }
  }, [open, initial]);

  const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const image = new window.Image();
      image.addEventListener('load', () => resolve(image));
      image.addEventListener('error', (error) => reject(error));
      image.src = url;
    });

  const getCroppedImg = async (imageSrc: string, pixelCrop: Area): Promise<Blob> => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('No 2d context');
    }

    // Set canvas size to the cropped area
    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    // Draw the cropped image
    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height
    );

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
      }, 'image/jpeg', 0.95);
    });
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setError('');
    
    if (file) {
      // Validate file size (max 20MB)
      if (file.size > 20 * 1024 * 1024) {
        setError('Image must be less than 20MB');
        return;
      }
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('File must be an image');
        return;
      }

      // Read file and show cropper
      const reader = new FileReader();
      reader.onload = (ev) => {
        const imageDataUrl = ev.target?.result as string;
        setImageToCrop(imageDataUrl);
        setShowCropper(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropSave = async () => {
    if (!imageToCrop || !croppedAreaPixels) return;

    try {
      const croppedBlob = await getCroppedImg(imageToCrop, croppedAreaPixels);
      const croppedFile = new File([croppedBlob], 'cropped-photo.jpg', { type: 'image/jpeg' });
      
      setPhotoFile(croppedFile);
      
      // Create preview URL
      const previewUrl = URL.createObjectURL(croppedBlob);
      setPreview(previewUrl);
      
      setShowCropper(false);
      setImageToCrop(null);
    } catch (error) {
      console.error('Error cropping image:', error);
      setError('Failed to crop image. Please try again.');
    }
  };

  const handleCropCancel = () => {
    setShowCropper(false);
    setImageToCrop(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    
    // Clear file input
    const input = document.getElementById('teacher-photo') as HTMLInputElement;
    if (input) input.value = '';
  };

  const clearPhoto = () => {
    setPhotoFile(null);
    setPreview(initial?.photo?.filePath);
    const input = document.getElementById('teacher-photo') as HTMLInputElement;
    if (input) input.value = '';
  };

  const handleEditCrop = () => {
    if (preview && photoFile) {
      setImageToCrop(preview);
      setShowCropper(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!name.trim()) {
      setError('Name is required');
      return;
    }

    // Validate URL format if provided
    if (url && url.trim()) {
      try {
        new URL(url.trim());
      } catch {
        setError('Please enter a valid URL (e.g., https://example.com)');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      await onSave({ name: name.trim(), url: url.trim() || undefined, photoFile });
    } catch (err) {
      setError('Failed to save teacher. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Image Cropper Modal */}
      {showCropper && imageToCrop && (
        <Modal open={showCropper} onClose={handleCropCancel}>
          <div className="p-6 w-full max-w-2xl">
            <h3 className="text-xl font-bold mb-4">Crop Photo</h3>
            <p className="text-sm text-gray-600 mb-4">
              Adjust the image to fit within the circle. Use the slider to zoom.
            </p>
            
            <div className="relative w-full h-96 bg-gray-100 rounded-lg overflow-hidden">
              <Cropper
                image={imageToCrop}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>
            
            <div className="mt-4">
              <Label htmlFor="zoom-slider" className="text-sm font-medium mb-2 block">
                Zoom
              </Label>
              <input
                id="zoom-slider"
                type="range"
                min={1}
                max={3}
                step={0.1}
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>
            
            <div className="flex gap-3 mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={handleCropCancel}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleCropSave}
                className="flex-1"
              >
                Apply Crop
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Main Form Modal */}
      <Modal open={open && !showCropper} onClose={onClose}>
        <form onSubmit={handleSubmit} className="p-6 w-full max-w-lg">
          <h2 className="text-2xl font-bold mb-6">{initial ? 'Edit Teacher' : 'Add Teacher'}</h2>
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <Label htmlFor="teacher-name" className="text-sm font-medium mb-1.5 block">
                Name <span className="text-red-500">*</span>
              </Label>
              <Input 
                id="teacher-name" 
                value={name} 
                onChange={e => setName(e.target.value)} 
                placeholder="e.g., John Doe or Maria & Flo"
                required 
                disabled={isSubmitting}
              />
              <p className="text-xs text-gray-500 mt-1.5">
                ⚠️ <strong>Case-sensitive!</strong> Must match exactly with CSV teacher names (e.g., "Andre and Daria" ≠ "andre and daria")
              </p>
            </div>

            <div>
              <Label htmlFor="teacher-url" className="text-sm font-medium mb-1.5 block">
                Website URL (optional)
              </Label>
              <Input 
                id="teacher-url" 
                type="url"
                value={url} 
                onChange={e => setUrl(e.target.value)} 
                placeholder="https://example.com"
                disabled={isSubmitting}
              />
            </div>

            <div>
              <Label htmlFor="teacher-photo" className="text-sm font-medium mb-1.5 block">
                Profile Photo
              </Label>
              <div className="flex items-start gap-4">
                {preview ? (
                  <div className="relative flex flex-col items-center gap-2">
                    {/* Circular crop preview */}
                    <div className="relative w-[100px] h-[100px] rounded-full overflow-hidden border-2 border-gray-200">
                      <img 
                        src={preview} 
                        alt="Preview" 
                        className="object-cover w-full h-full"
                      />
                    </div>
                    {!isSubmitting && photoFile && (
                      <button
                        type="button"
                        onClick={handleEditCrop}
                        className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                      >
                        <Crop className="w-3 h-3" />
                        Adjust Crop
                      </button>
                    )}
                    {!isSubmitting && (
                      <button
                        type="button"
                        onClick={clearPhoto}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="w-[100px] h-[100px] rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50">
                    <Upload className="w-8 h-8 text-gray-400" />
                  </div>
                )}
                
                <div className="flex-1">
                  <Input 
                    id="teacher-photo" 
                    type="file" 
                    accept="image/*" 
                    onChange={handlePhotoChange}
                    disabled={isSubmitting}
                  />
                  <p className="text-xs text-gray-500 mt-1.5">
                    JPG, PNG or WEBP. Max 20MB. Photo will be displayed in a circle.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-6 pt-4 border-t">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? 'Saving...' : (initial ? 'Save Changes' : 'Add Teacher')}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
