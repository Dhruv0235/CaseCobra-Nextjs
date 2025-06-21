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
  Sparkles,
  Wand2,
  RefreshCw,
  Download,
  Eye,
  Palette,
  Camera,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import Dropzone, { type FileRejection } from "react-dropzone";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { generateImage } from "./action";
import { RECOMMENDED_IMAGES } from "./images";
import { Textarea } from "@/components/ui/textarea";

export default function Page() {
  const { toast } = useToast();
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const [isProcessingSelection, setIsProcessingSelection] = useState(false);

  // AI Generation states
  const [aiPrompt, setAiPrompt] = useState("");
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [generatedImageBase64, setGeneratedImageBase64] = useState<
    string | null
  >(null);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(
    null,
  );
  const [isUploadingGenerated, setIsUploadingGenerated] = useState(false);

  const router = useRouter();

  const { startUpload, isUploading } = useUploadThing("imageUploader", {
    onClientUploadComplete([data]) {
      const configId = data.serverData.configId;
      // Reset all states when upload completes
      setIsProcessingSelection(false);
      setSelectedImageId(null);
      setGeneratedImageBase64(null);
      setGeneratedImageUrl(null);
      setIsUploadingGenerated(false);

      toast({
        title: "🎉 Upload successful!",
        description: "Your image is ready. Redirecting to design studio...",
      });

      startTransition(() => {
        router.push(`/configure/design?id=${configId}`);
      });
    },
    onUploadProgress(p) {
      setUploadProgress(p);
    },
    onUploadError: (error) => {
      // Reset states on error
      setIsProcessingSelection(false);
      setSelectedImageId(null);
      setIsUploadingGenerated(false);
      toast({
        title: "❌ Upload failed",
        description:
          "Something went wrong. Please try again or contact support if the issue persists.",
        variant: "destructive",
      });
    },
  });

  const onDropRejected = (rejectedFiles: FileRejection[]) => {
    const [file] = rejectedFiles;
    setIsDragOver(false);

    toast({
      title: `🚫 ${file.file.type} format not supported`,
      description:
        "Please choose a PNG, JPEG or JPG image instead. We support high-quality images up to 10MB.",
      variant: "destructive",
    });
  };

  const onDropAccepted = (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    toast({
      title: "📤 Starting upload...",
      description: `Uploading "${file.name}" (${(file.size / 1024 / 1024).toFixed(1)}MB)`,
    });
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

      toast({
        title: "🖼️ Great choice!",
        description: `Preparing "${selectedImage.name}" for your phone case...`,
      });

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
    } catch (error) {
      console.error("Selection failed:", error);
      toast({
        title: "❌ Selection failed",
        description:
          "Couldn't load the selected image. Please try another one or upload your own.",
        variant: "destructive",
      });
      setIsProcessingSelection(false);
      setSelectedImageId(null);
    }
  };

  const handleGenerateAIImage = async () => {
    if (!aiPrompt.trim()) {
      toast({
        title: "💭 Prompt needed",
        description:
          "Please describe what you'd like to create. Be as detailed as possible for better results!",
        variant: "destructive",
      });
      return;
    }

    setIsGeneratingAI(true);

    toast({
      title: "🎨 AI is creating your image...",
      description:
        "This usually takes 15-30 seconds. We're crafting something unique for you!",
    });

    try {
      const imageBase64 = await generateImage(aiPrompt);
      console.log(
        "Received base64 from server:",
        imageBase64.substring(0, 50) + "...",
      );

      // Create data URL for preview
      const dataUrl = `data:image/png;base64,${imageBase64}`;
      console.log("Created data URL:", dataUrl.substring(0, 50) + "...");

      setGeneratedImageBase64(imageBase64);
      setGeneratedImageUrl(dataUrl);

      toast({
        title: "✨ AI image created!",
        description:
          "Your unique design is ready! Take a look and decide if you'd like to use it.",
      });
    } catch (error) {
      console.error("AI generation failed:", error);
      toast({
        title: "🤖 AI generation failed",
        description:
          "The AI couldn't create your image. Try a different prompt or simpler description.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleUseGeneratedImage = () => {
    if (!generatedImageBase64) return;

    setIsUploadingGenerated(true);

    toast({
      title: "🚀 Perfect choice!",
      description: "Uploading your AI-generated masterpiece...",
    });

    try {
      // Convert base64 to blob
      const byteCharacters = atob(generatedImageBase64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: "image/png" });

      // Create File object
      const file = new File([blob], `ai-generated-${Date.now()}.png`, {
        type: "image/png",
      });

      // Upload using the same function
      startUpload([file], { configId: undefined });
    } catch (error) {
      console.error("Upload failed:", error);
      setIsUploadingGenerated(false);
      toast({
        title: "❌ Upload failed",
        description:
          "Couldn't upload your AI image. Please try generating it again.",
        variant: "destructive",
      });
    }
  };

  const handleDiscardGenerated = () => {
    setGeneratedImageBase64(null);
    setGeneratedImageUrl(null);
    setAiPrompt("");

    toast({
      title: "🔄 Ready for new creation",
      description: "Enter a new prompt to generate another unique image!",
    });
  };

  const [isPending, startTransition] = useTransition();

  return (
    <div className="relative my-16 flex h-full w-full flex-1 flex-col items-center justify-center p-4">
      <div className="w-full">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-bold text-gray-900">
            Create Your Phone Case
          </h1>
          <p className="text-gray-600">
            Upload your own image, choose from our gallery, or generate
            something unique with AI
          </p>
        </div>

        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="mb-8 grid h-12 w-full grid-cols-3">
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <ImageIcon className="hidden h-4 w-4 sm:block" />
              Upload Image
            </TabsTrigger>
            <TabsTrigger value="gallery" className="flex items-center gap-2">
              <Palette className="hidden h-4 w-4 sm:block" />
              Gallery
            </TabsTrigger>
            <TabsTrigger
              value="ai-generate"
              className="flex items-center gap-2"
            >
              <Sparkles className="hidden h-4 w-4 sm:block" />
              AI Generate
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload">
            <div
              className={cn(
                "relative flex h-96 w-full flex-col items-center justify-center rounded-xl p-2 ring-1 ring-inset ring-green-900/10 transition-all duration-300 lg:rounded-2xl",
                {
                  "bg-gradient-to-br from-green-100 to-emerald-100 ring-2 ring-green-500/50":
                    isDragOver,
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
                      className="flex h-full w-full flex-1 cursor-pointer flex-col items-center justify-center"
                      {...getRootProps()}
                    >
                      <input {...getInputProps()} />
                      {isDragOver ? (
                        <MousePointerSquareDashed className="mb-4 h-12 w-12 animate-bounce text-green-500" />
                      ) : isUploading || isPending ? (
                        <Loader2 className="mb-4 h-12 w-12 animate-spin text-green-500" />
                      ) : (
                        <div className="mb-4 rounded-full bg-green-100 p-4">
                          <ImageIcon className="h-8 w-8 text-green-600" />
                        </div>
                      )}
                      <div className="mt-2 flex flex-col justify-center text-center">
                        {isUploading ? (
                          <div className="flex flex-col items-center">
                            <p className="text-lg font-medium text-gray-700">
                              Uploading your image...
                            </p>
                            <p className="mt-1 text-sm text-gray-500">
                              Please wait while we process your file
                            </p>
                            <Progress
                              value={uploadProgress}
                              className="mt-4 h-3 w-64 bg-gray-200"
                            />
                            <p className="mt-2 text-xs text-gray-500">
                              {uploadProgress}% complete
                            </p>
                          </div>
                        ) : isPending ? (
                          <div className="flex flex-col items-center">
                            <p className="text-lg font-medium text-gray-700">
                              Almost there!
                            </p>
                            <p className="mt-1 text-sm text-gray-500">
                              Redirecting you to the design studio...
                            </p>
                          </div>
                        ) : isDragOver ? (
                          <div>
                            <p className="text-lg font-semibold text-green-600">
                              Drop your image here
                            </p>
                            <p className="mt-1 text-sm text-green-500">
                              Release to start uploading
                            </p>
                          </div>
                        ) : (
                          <div>
                            <p className="text-lg font-semibold text-gray-700">
                              Click to upload or drag and drop
                            </p>
                            <p className="mt-1 text-sm text-gray-500">
                              Choose your favorite image for your phone case
                            </p>
                          </div>
                        )}
                      </div>
                      {isPending ? null : (
                        <div className="mt-4 rounded-lg bg-white/50 px-3 py-1">
                          <p className="text-xs text-gray-600">
                            Supports PNG, JPG, JPEG • Max 10MB
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </Dropzone>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="gallery">
            <div className="space-y-8">
              {" "}
              {isProcessingSelection && (
                <div className="flex flex-col items-center justify-center rounded-xl bg-green-50 py-12">
                  <div className="mb-4 rounded-full bg-green-100 p-4">
                    <Loader2 className="h-8 w-8 animate-spin text-green-600" />
                  </div>
                  <h4 className="mb-2 text-lg font-medium text-gray-900">
                    Preparing your selection
                  </h4>
                  <p className="max-w-md text-center text-sm text-gray-600">
                    {isUploading
                      ? "Optimizing image quality and uploading to our servers..."
                      : "Getting your chosen image ready for customization..."}
                  </p>
                  {isUploading && (
                    <div className="mt-4 w-full max-w-xs">
                      <Progress
                        value={uploadProgress}
                        className="h-2 bg-green-200"
                      />
                      <p className="mt-1 text-center text-xs text-green-600">
                        {uploadProgress}% uploaded
                      </p>
                    </div>
                  )}
                </div>
              )}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {RECOMMENDED_IMAGES.map((image) => (
                  <div
                    key={image.id}
                    className={cn(
                      "group relative cursor-pointer overflow-hidden rounded-xl border-2 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl",
                      selectedImageId === image.id
                        ? "border-green-500 shadow-lg ring-4 ring-green-200"
                        : "border-gray-200 hover:border-gray-300",
                      isProcessingSelection && "pointer-events-none opacity-50",
                    )}
                    onClick={() =>
                      !isProcessingSelection && handleImageSelection(image.id)
                    }
                  >
                    <div className="relative aspect-square">
                      <img
                        src={image.url || "/placeholder.svg"}
                        alt={image.name}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      {selectedImageId === image.id && (
                        <div className="absolute inset-0 flex items-center justify-center bg-green-500/30 backdrop-blur-sm">
                          <div className="rounded-full bg-green-500 p-2 shadow-lg">
                            <Check className="h-5 w-5 text-white" />
                          </div>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                      <div className="absolute bottom-2 left-2 right-2 translate-y-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                        <div className="flex items-center gap-2">
                          <Eye className="h-4 w-4 text-white" />
                          <span className="text-sm font-medium text-white">
                            Preview
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white p-4">
                      <h4 className="truncate font-semibold text-gray-900">
                        {image.name}
                      </h4>
                      <div className="mt-1 flex items-center justify-between">
                        <p className="text-sm text-gray-500">
                          {image.category}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="text-center">
                <div className="inline-flex items-center gap-2 rounded-full bg-gray-50 px-4 py-2 text-sm text-gray-500">
                  <Camera className="h-4 w-4" />
                  All images are high-resolution and phone case optimized
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="ai-generate">
            <div className="space-y-8">
              {!generatedImageUrl ? (
                <div className="space-y-6">
                  <div className="space-y-3">
                    <label
                      htmlFor="ai-prompt"
                      className="flex items-center gap-2 text-sm font-semibold text-gray-800"
                    >
                      <Wand2 className="h-4 w-4" />
                      Describe your ideal phone case design
                    </label>
                    <Textarea
                      id="ai-prompt"
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      placeholder="e.g., A vibrant sunset over mountains with geometric patterns, neon cyberpunk cityscape, minimalist botanical illustration..."
                      rows={10}
                      className="w-full text-base"
                      disabled={isGeneratingAI}
                    />
                    <div className="rounded-lg bg-gray-50 p-3 text-xs text-gray-500">
                      <strong>Pro tip:</strong> Be specific! Mention colors,
                      styles, objects, and mood for better results.
                    </div>
                  </div>

                  <Button
                    onClick={handleGenerateAIImage}
                    disabled={isGeneratingAI || !aiPrompt.trim()}
                    className="h-12 w-full bg-gradient-to-r from-green-600 to-emerald-600 text-base hover:from-green-700 hover:to-emerald-700"
                    size="lg"
                  >
                    {isGeneratingAI ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        AI is creating your image...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-5 w-5" />
                        Generate Unique Image
                      </>
                    )}
                  </Button>

                  {isGeneratingAI && (
                    <div className="flex flex-col items-center justify-center rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 py-16">
                      <div className="relative mb-6">
                        <div className="rounded-full bg-gradient-to-r from-green-500 to-emerald-500 p-4">
                          <Loader2 className="h-12 w-12 animate-spin text-white" />
                        </div>
                        <div className="absolute -inset-2 animate-pulse rounded-full border-2 border-green-200"></div>
                      </div>
                      <h4 className="mb-2 text-lg font-semibold text-gray-900">
                        🎨 Crafting your masterpiece...
                      </h4>
                      <p className="max-w-md text-center text-gray-600">
                        Our AI is analyzing your prompt and creating something
                        unique. This usually takes 15-30 seconds.
                      </p>
                      <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
                        <div className="flex space-x-1">
                          <div className="h-2 w-2 animate-bounce rounded-full bg-green-400"></div>
                          <div
                            className="h-2 w-2 animate-bounce rounded-full bg-emerald-400"
                            style={{ animationDelay: "0.1s" }}
                          ></div>
                          <div
                            className="h-2 w-2 animate-bounce rounded-full bg-teal-400"
                            style={{ animationDelay: "0.2s" }}
                          ></div>
                        </div>
                        <span>Processing your creative vision</span>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-8">
                  <div className="text-center">
                    <h4 className="mb-2 flex items-center justify-center gap-2 text-xl font-semibold text-gray-900">
                      <Sparkles className="h-5 w-5 text-green-500" />
                      Your AI Creation is Ready!
                    </h4>
                    <p className="text-gray-600">
                      Here's your unique AI-generated design. Love it? Use it
                      for your phone case!
                    </p>
                  </div>

                  <div className="flex justify-center">
                    <div className="border-gradient-to-r relative max-w-lg overflow-hidden rounded-2xl border-4 from-green-200 to-emerald-200 shadow-2xl">
                      <img
                        src={generatedImageUrl}
                        alt="AI Generated Design"
                        className="h-auto w-full"
                      />
                      <div className="absolute right-3 top-3">
                        <div className="rounded-full bg-black/20 px-3 py-1 backdrop-blur-sm">
                          <span className="text-xs font-medium text-white">
                            AI Generated
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col justify-center gap-4 sm:flex-row">
                    <Button
                      onClick={handleUseGeneratedImage}
                      disabled={isUploadingGenerated || isUploading}
                      className="h-12 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 sm:max-w-xs"
                      size="lg"
                    >
                      {isUploadingGenerated || isUploading ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Check className="mr-2 h-4 w-4" />
                          Perfect! Use This Design
                        </>
                      )}
                    </Button>

                    <Button
                      variant="outline"
                      onClick={handleDiscardGenerated}
                      disabled={isUploadingGenerated || isUploading}
                      className="h-12 border-2 hover:bg-gray-50 sm:max-w-xs"
                      size="lg"
                    >
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Generate Another
                    </Button>
                  </div>

                  {(isUploadingGenerated || isUploading) && (
                    <div className="flex flex-col items-center justify-center rounded-xl bg-green-50 p-6">
                      <div className="mb-4 rounded-full bg-green-100 p-3">
                        <Download className="h-6 w-6 text-green-600" />
                      </div>
                      <h4 className="mb-2 text-lg font-medium text-gray-900">
                        Uploading your AI masterpiece
                      </h4>
                      <Progress
                        value={uploadProgress}
                        className="mb-2 h-3 w-64 bg-green-200"
                      />
                      <p className="text-sm text-gray-600">
                        {uploadProgress}% complete • Preparing for design
                        studio...
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
