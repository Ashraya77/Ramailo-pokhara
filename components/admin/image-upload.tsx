"use client";

import { useState } from "react";
import { Loader2, Upload, X } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiUpload } from "@/lib/api-client";
import { UploadedImage } from "@/lib/admin-types";
import { useAdminI18n } from "@/components/admin/admin-language-provider";

type ImageUploadProps = {
  value: string | null | undefined;
  onChange: (url: string | null) => void;
  altText: string | null | undefined;
  onAltTextChange: (alt: string | null) => void;
};

export function ImageUpload({
  value,
  onChange,
  altText,
  onAltTextChange,
}: ImageUploadProps) {
  const { dictionary } = useAdminI18n();
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error(dictionary.media.tooLarge);
      return;
    }

    // Validate type
    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      toast.error(dictionary.media.unsupported);
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await apiUpload<UploadedImage>("/api/uploads/images", formData);
      onChange(response.data.url);
      toast.success(dictionary.media.uploaded);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message ?? dictionary.media.uploadError);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    onChange(null);
    onAltTextChange(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2">
        <Label className="text-sm font-medium">{dictionary.media.featuredImage}</Label>

        {value ? (
          /* Preview state */
          <div className="relative border rounded-md overflow-hidden bg-muted aspect-video flex items-center justify-center">
            <Image
              src={value}
              alt={altText ?? dictionary.media.previewAlt}
              fill
              sizes="(max-width: 768px) 100vw, 350px"
              className="object-cover"
            />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              onClick={handleRemove}
              className="absolute top-2 right-2 h-7 w-7 opacity-80 hover:opacity-100"
              title={dictionary.media.removeImage}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          /* Dropzone state */
          <label className="flex flex-col items-center justify-center border border-dashed rounded-md aspect-video cursor-pointer hover:bg-muted/30 transition-colors">
            {uploading ? (
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="text-xs">{dictionary.media.uploading}</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 text-muted-foreground p-4 text-center">
                <div className="rounded-full bg-muted p-2">
                  <Upload className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {dictionary.media.upload}
                  </p>
                  <p className="text-xs">{dictionary.media.formats}</p>
                </div>
              </div>
            )}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
              disabled={uploading}
              className="hidden"
            />
          </label>
        )}
      </div>

      {value && (
        <div className="space-y-1.5">
          <Label htmlFor="imageAlt" className="text-xs font-medium text-muted-foreground">
            {dictionary.media.altText}
          </Label>
          <Input
            id="imageAlt"
            placeholder={dictionary.media.altPlaceholder}
            value={altText ?? ""}
            onChange={(e) => onAltTextChange(e.target.value || null)}
            className="h-8 text-xs"
          />
        </div>
      )}
    </div>
  );
}
