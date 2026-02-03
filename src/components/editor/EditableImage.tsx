import { useState } from "react";
import { Image as ImageIcon, Check, X, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface EditableImageProps {
  src: string;
  alt: string;
  onImageChange: (imageUrl: string) => void;
  className?: string;
  fieldName?: string;
}

const EditableImage = ({
  src,
  alt,
  onImageChange,
  className,
  fieldName = "Image",
}: EditableImageProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editImageUrl, setEditImageUrl] = useState("");

  const handleSave = () => {
    if (editImageUrl.trim()) {
      onImageChange(editImageUrl.trim());
    }
    setIsDialogOpen(false);
    setEditImageUrl("");
  };

  const handleCancel = () => {
    setEditImageUrl("");
    setIsDialogOpen(false);
  };

  return (
    <>
      <div
        className={cn(
          "relative group cursor-pointer",
          className
        )}
        onClick={() => setIsDialogOpen(true)}
      >
        {/* Edit overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 rounded-lg transition-all z-10 flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="bg-white/90 backdrop-blur-sm rounded-lg px-4 py-2 flex items-center gap-2 shadow-lg">
              <Upload className="w-5 h-5 text-primary" />
              <span className="font-medium text-gray-900">Replace Image</span>
            </div>
          </div>
        </div>
        
        {/* Image */}
        <img 
          src={src} 
          alt={alt}
          className="w-full h-auto"
        />
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Replace {fieldName}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Current Image</Label>
              <div className="rounded-lg overflow-hidden bg-muted border">
                <img 
                  src={src} 
                  alt={alt}
                  className="w-full h-auto max-h-48 object-contain"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="imageUrl">New Image URL</Label>
              <Input
                id="imageUrl"
                value={editImageUrl}
                onChange={(e) => setEditImageUrl(e.target.value)}
                placeholder="https://example.com/new-image.png"
              />
              <p className="text-xs text-muted-foreground">
                Enter a URL to a new image to replace the current one
              </p>
            </div>

            {editImageUrl && (
              <div className="space-y-2">
                <Label>Preview</Label>
                <div className="rounded-lg overflow-hidden bg-muted border">
                  <img 
                    src={editImageUrl} 
                    alt="Preview" 
                    className="w-full h-auto max-h-48 object-contain"
                    onError={(e) => {
                      e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'%3E%3Crect x='3' y='3' width='18' height='18' rx='2'/%3E%3Cpath d='M8.5 10a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z'/%3E%3Cpath d='m21 15-5-5L5 21'/%3E%3C/svg%3E";
                    }}
                  />
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={handleCancel}>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={!editImageUrl.trim()}>
                <Check className="w-4 h-4 mr-2" />
                Replace Image
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EditableImage;
