"use client";

import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import { useUploadThing } from "@/lib/uploadthing";
import { cn } from "@/lib/utils";
import {
  ImageIcon,
  Loader2,
  MousePointerSquareDashed,
  Check,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import Dropzone, { type FileRejection } from "react-dropzone";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Sample recommended images - replace with your actual image URLs
const RECOMMENDED_IMAGES = [
  {
    id: "1",
    url: "https://4mrz4s25za.ufs.sh/f/YS90HED9KVySAzcfC97aOTxYf9Xu8HspbyW3tkgCQDRc7zvo",
    name: "Owl Mandala Design",
    category: "Mandala",
  },
  {
    id: "2",
    url: "https://4mrz4s25za.ufs.sh/f/YS90HED9KVySj4CKP6iIcfWuvOo4lVQSeR8NZwFmY32MysgA",
    name: "Moody Winter Cabin",
    category: "Scenic",
  },
  {
    id: "3",
    url: "https://4mrz4s25za.ufs.sh/f/YS90HED9KVyShfl3UOvyvre8JaDbZQBfcxX9TGIVS5WjRl1s",
    name: "Color Sticker Collage",
    category: "Pop Art",
  },
  {
    id: "4",
    url: "https://4mrz4s25za.ufs.sh/f/YS90HED9KVySzWddTnGibhPf4T0jo9C1OkvtpyHBanDxgVuZ",
    name: "Mystical Owl Emblem",
    category: "Illustration",
  },
  {
    id: "5",
    url: "https://4mrz4s25za.ufs.sh/f/YS90HED9KVySlSuWVFOQ7vDTfqwxtroaYKCj8WGgP3HbXInJ",
    name: "Glowing Leaves & Neon",
    category: "Nature",
  },
  {
    id: "6",
    url: "https://4mrz4s25za.ufs.sh/f/YS90HED9KVyS7Z3Nqz6Jg5V3wnmq2dPceDkUofuJH1ytGp8R",
    name: "Survivor Quote on Dark",
    category: "Inspirational",
  },
  {
    id: "7",
    url: "https://4mrz4s25za.ufs.sh/f/YS90HED9KVySNu9F1ullSXUTKfxyuLd0tosBp57DcYZ48rgF",
    name: "Bad Choice, Good Story Typography",
    category: "Motivational",
  },
  {
    id: "8",
    url: "https://4mrz4s25za.ufs.sh/f/YS90HED9KVySMmdxJVhO1BEPdyKuDJC8oRrHU7TlmVv3aL6n",
    name: "Silhouette Warrior at Sunset",
    category: "Epic",
  },
];

export default function Page() {
  const { toast } = useToast();
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const [isProcessingSelection, setIsProcessingSelection] = useState(false);
  const router = useRouter();

  const { startUpload, isUploading } = useUploadThing("imageUploader", {
    onClientUploadComplete([data]) {
      const configId = data.serverData.configId;
      // Reset processing state when upload completes
      setIsProcessingSelection(false);
      setSelectedImageId(null);
      startTransition(() => {
        router.push(`/configure/design?id=${configId}`);
      });
    },
    onUploadProgress(p) {
      setUploadProgress(p);
    },
    onUploadError: (error) => {
      // Reset processing state on error
      setIsProcessingSelection(false);
      setSelectedImageId(null);
      toast({
        title: "Upload failed",
        description: "Please try again.",
        variant: "destructive",
      });
    },
  });

  const onDropRejected = (rejectedFiles: FileRejection[]) => {
    const [file] = rejectedFiles;
    setIsDragOver(false);

    toast({
      title: `${file.file.type} type is not supported.`,
      description: "Please choose a PNG, JPEG or JPG image instead",
      variant: "destructive",
    });
  };

  const onDropAccepted = (acceptedFiles: File[]) => {
    startUpload(acceptedFiles, { configId: undefined });
    setIsDragOver(false);
  };

  const handleImageSelection = async (imageId: string) => {
    setSelectedImageId(imageId);
    setIsProcessingSelection(true);

    try {
      const selectedImage = RECOMMENDED_IMAGES.find(
        (img) => img.id === imageId,
      );
      if (!selectedImage) {
        throw new Error("Image not found");
      }

      // Fetch the image from the URL
      const response = await fetch(selectedImage.url);
      console.log("Fetching image from URL:", selectedImage.url);
      if (!response.ok) {
        throw new Error("Failed to fetch image");
      }

      // Convert to blob
      const blob = await response.blob();

      // Create a File object from the blob
      const file = new File(
        [blob],
        `${selectedImage.name.replace(/\s+/g, "_")}.png`,
        {
          type: blob.type || "image/png",
        },
      );

      // Use the same upload function as file uploads
      startUpload([file], { configId: undefined });

      toast({
        title: "Image selected!",
        description: `Uploading ${selectedImage.name}...`,
      });
    } catch (error) {
      console.error("Selection failed:", error);
      toast({
        title: "Selection failed",
        description: "Please try again or upload your own image.",
        variant: "destructive",
      });
      setIsProcessingSelection(false);
      setSelectedImageId(null);
    }
  };

  const [isPending, startTransition] = useTransition();

  return (
    <div className="relative my-16 flex h-full w-full flex-1 flex-col items-center justify-center p-4">
      <div className="w-full">
        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="mb-8 grid w-full grid-cols-2">
            <TabsTrigger value="upload">Upload Image</TabsTrigger>
            <TabsTrigger value="gallery">Choose from Gallery</TabsTrigger>
          </TabsList>

          <TabsContent value="upload">
            <div
              className={cn(
                "relative flex h-96 w-full flex-col items-center justify-center rounded-xl bg-gray-900/5 p-2 ring-1 ring-inset ring-gray-900/10 lg:rounded-2xl",
                {
                  "bg-blue-900/10 ring-blue-900/25": isDragOver,
                },
              )}
            >
              <div className="relative flex w-full flex-1 flex-col items-center justify-center">
                <Dropzone
                  onDropRejected={onDropRejected}
                  onDropAccepted={onDropAccepted}
                  accept={{
                    "image/png": [".png"],
                    "image/jpeg": [".jpeg"],
                    "image/jpg": [".jpg"],
                  }}
                  onDragEnter={() => setIsDragOver(true)}
                  onDragLeave={() => setIsDragOver(false)}
                >
                  {({ getRootProps, getInputProps }) => (
                    <div
                      className="flex h-full w-full flex-1 flex-col items-center justify-center"
                      {...getRootProps()}
                    >
                      <input {...getInputProps()} />
                      {isDragOver ? (
                        <MousePointerSquareDashed className="mb-2 h-6 w-6 text-zinc-500" />
                      ) : isUploading || isPending ? (
                        <Loader2 className="mb-2 h-6 w-6 animate-spin text-zinc-500" />
                      ) : (
                        <ImageIcon className="mb-2 h-6 w-6 text-zinc-500" />
                      )}
                      <div className="mt-2 flex flex-col justify-center text-sm text-zinc-700">
                        {isUploading ? (
                          <div className="flex flex-col items-center">
                            <p>Uploading...</p>
                            <Progress
                              value={uploadProgress}
                              className="mt-2 h-2 w-40 bg-gray-300"
                            />
                          </div>
                        ) : isPending ? (
                          <div className="flex flex-col items-center">
                            <p>Redirecting, please wait...</p>
                          </div>
                        ) : isDragOver ? (
                          <p>
                            <span className="font-semibold">Drop file</span> to
                            upload
                          </p>
                        ) : (
                          <p>
                            <span className="font-semibold">
                              Click to upload{" "}
                            </span>
                            or drag and drop
                          </p>
                        )}
                      </div>
                      {isPending ? null : (
                        <p className="text-xs text-zinc-500">PNG, JPG, JPEG</p>
                      )}
                    </div>
                  )}
                </Dropzone>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="gallery">
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900">
                  Choose from our curated collection
                </h3>
                <p className="mt-1 text-sm text-gray-600">
                  Select an image to get started with your design
                </p>
              </div>

              {isProcessingSelection && (
                <div className="flex flex-col items-center justify-center py-8">
                  <Loader2 className="mb-4 h-8 w-8 animate-spin text-blue-600" />
                  <p className="text-sm text-gray-600">
                    {isUploading
                      ? "Preparing selected image..."
                      : "Preparing image..."}
                  </p>
                  {isUploading && (
                    <Progress
                      value={uploadProgress}
                      className="mt-2 h-2 w-40 bg-gray-300"
                    />
                  )}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {RECOMMENDED_IMAGES.map((image) => (
                  <div
                    key={image.id}
                    className={cn(
                      "group relative cursor-pointer overflow-hidden rounded-lg border-2 transition-all duration-200 hover:shadow-lg",
                      selectedImageId === image.id
                        ? "border-blue-500 ring-2 ring-blue-200"
                        : "border-gray-200 hover:border-gray-300",
                    )}
                    onClick={() =>
                      !isProcessingSelection && handleImageSelection(image.id)
                    }
                  >
                    <div className="relative aspect-square">
                      <img
                        src={image.url || "/placeholder.svg"}
                        alt={image.name}
                        className="h-full w-full object-cover"
                      />
                      {selectedImageId === image.id && (
                        <div className="absolute inset-0 flex items-center justify-center bg-blue-500/20">
                          <div className="rounded-full bg-blue-500 p-1">
                            <Check className="h-4 w-4 text-white" />
                          </div>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/0 transition-colors duration-200 group-hover:bg-black/10" />
                    </div>
                    <div className="p-3">
                      <h4 className="truncate text-sm font-medium text-gray-900">
                        {image.name}
                      </h4>
                      <p className="text-xs text-gray-500">{image.category}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-center text-xs text-gray-500">
                Click on any image to use it for your design
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
