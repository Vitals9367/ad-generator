"use client";

import type React from "react";
import { useState, useRef, useTransition, memo, useCallback } from "react";
import Image from "next/image";
import {
  Upload,
  X,
  ImageIcon,
  Sparkles,
  Download,
  Share2,
  Expand,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { generateAd } from "../actions/generate-ad";
import { useToast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Skeleton } from "@/components/ui/skeleton";
import { Canvas } from "@/components/ui/canvas";
import { ORIENTATION_CONFIGS } from "../config/image-configs";

const ImageSkeleton = () => (
  <div className="relative aspect-square w-full animate-pulse rounded-lg bg-muted">
    <div className="absolute inset-0 flex items-center justify-center">
      <ImageIcon className="h-8 w-8 text-muted-foreground/50" />
    </div>
  </div>
);

const FullScreenImageSkeleton = () => (
  <div className="relative h-full w-full animate-pulse bg-muted">
    <div className="absolute inset-0 flex items-center justify-center">
      <ImageIcon className="h-12 w-12 text-muted-foreground/50" />
    </div>
  </div>
);

const AdCard = memo(
  ({
    ad,
    textOverlay,
    index,
    removeBackground,
    prompt,
    onDownload,
    onView,
    orientation = "square",
  }: {
    ad: string;
    textOverlay?: string;
    index: number;
    removeBackground: boolean;
    prompt: string;
    onDownload: (url: string) => void;
    onView: (url: string) => void;
    orientation?: keyof typeof ORIENTATION_CONFIGS;
  }) => {
    const [isImageLoading, setIsImageLoading] = useState(true);

    return (
      <Card className="group overflow-hidden">
        <div
          className={cn(
            "relative",
            orientation === "square"
              ? "aspect-square"
              : orientation === "portrait"
                ? "aspect-[3/4]"
                : "aspect-[4/3]",
          )}
        >
          {isImageLoading && <ImageSkeleton />}
          <div
            className={cn(
              "relative h-full w-full",
              removeBackground
                ? "bg-white"
                : "bg-gradient-to-b from-gray-50 to-gray-100",
            )}
          >
            <Image
              src={ad}
              alt={`Generated Ad ${index + 1}`}
              width={ORIENTATION_CONFIGS[orientation].width}
              height={ORIENTATION_CONFIGS[orientation].height}
              className={cn(
                "h-full w-full object-contain transition-opacity duration-300",
                isImageLoading ? "opacity-0" : "opacity-100",
              )}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              onLoadingComplete={() => setIsImageLoading(false)}
              priority={index < 6}
            />
          </div>
          <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onDownload(ad)}
            >
              <Download className="mr-1 h-4 w-4" />
              Download
            </Button>
            <Button variant="secondary" size="sm" onClick={() => onView(ad)}>
              <Expand className="mr-1 h-4 w-4" />
              View
            </Button>
          </div>
        </div>
        <div className="border-t bg-muted/20 p-3">
          <p className="text-sm font-medium">Ad Variation {index + 1}</p>
          {textOverlay && (
            <p className="mt-1 text-sm text-muted-foreground">{textOverlay}</p>
          )}
        </div>
      </Card>
    );
  },
);

AdCard.displayName = "AdCard";

const PLACEHOLDER_PROMPT =
  "Create a compelling ad that highlights our product's unique selling points. Focus on showcasing the premium materials and craftsmanship. Include a clear value proposition and emphasize how it solves customer pain points. Consider mentioning any special features, sustainability aspects, or limited-time offers.";

export default function AdGenerator() {
  const [image, setImage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [removeBackground, setRemoveBackground] = useState(false);
  const [prompt, setPrompt] = useState(PLACEHOLDER_PROMPT);
  const [generatedAds, setGeneratedAds] = useState<
    Array<{ image: string; textOverlay?: string }>
  >([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const [adStyle, setAdStyle] = useState("modern");
  const [platform, setPlatform] = useState("instagram");
  const [targetAudience, setTargetAudience] = useState("general");
  const [mood, setMood] = useState("professional");
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [variations, setVariations] = useState("1");
  const [isViewLoading, setIsViewLoading] = useState(false);
  const [model, setModel] = useState<"dall-e-2" | "dall-e-3" | "epicrealism">(
    "dall-e-3",
  );
  const [orientation, setOrientation] = useState<
    "square" | "portrait" | "landscape"
  >("square");
  const [quality, setQuality] = useState<"standard" | "hd">("standard");
  const [style, setStyle] = useState<"natural" | "vivid">("natural");
  const [textPlacement, setTextPlacement] = useState<any>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const clearImage = () => {
    setImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const generateStructuredPrompt = () => {
    const styleGuide = {
      modern:
        "modern digital advertisement with clean typography and minimalist design principles",
      luxury:
        "high-end advertisement with elegant typography and premium branding elements",
      casual:
        "friendly and approachable advertisement with modern sans-serif typography",
      dynamic: "bold and energetic advertisement with impactful text hierarchy",
    }[adStyle];

    const platformGuide = {
      instagram: `Create a professional Instagram ad in square format (1:1). Include:
- Clear headline text at the top
- Product image as the main focus
- Short, compelling marketing copy
- Brand logo in bottom right
- Call-to-action button at the bottom
Style it like a real Instagram sponsored post with proper text placement and branding.`,
      facebook: `Design a Facebook feed advertisement that looks native to the platform. Include:
- Attention-grabbing headline
- Product image with marketing message
- Descriptive body text
- Brand elements and logo
- Clear call-to-action button
Follow Facebook's ad design best practices with proper text-to-image ratio.`,
      pinterest: `Create a Pinterest-style promotional pin in vertical format (2:3). Include:
- Bold headline text overlay
- Product showcase with lifestyle context
- Brand name and logo
- Call-to-action text
Design it to look like a professional Pinterest promoted pin with proper text hierarchy.`,
      amazon: `Create a professional e-commerce product advertisement suitable for Amazon. Include:
- Clean product presentation
- Key features as text overlay
- Product benefits highlighted
- Professional branding elements
- Price positioning (optional)
Follow e-commerce advertising best practices with clear value proposition.`,
    }[platform];

    const audienceGuide = {
      general:
        "Use universal, benefit-focused advertising copy that appeals to a broad market",
      luxury:
        "Include sophisticated, premium-focused messaging that emphasizes exclusivity and quality",
      youth:
        "Incorporate trendy, dynamic text with contemporary marketing language",
      professional:
        "Use professional, business-focused copy that emphasizes efficiency and quality",
    }[targetAudience];

    const moodGuide = {
      professional:
        "corporate and trustworthy advertising style with professional typography",
      playful:
        "energetic and engaging advertising style with vibrant text elements",
      elegant:
        "sophisticated advertising style with refined typography and spacing",
      natural: "authentic advertising style with relatable messaging",
    }[mood];

    const basePrompt = prompt.trim();
    return `Create a professional digital advertisement. ${platformGuide}

Style and Branding:
- ${styleGuide}
- ${audienceGuide}
- ${moodGuide}

Design Requirements:
- Professional advertising layout with proper text hierarchy
- Marketing copy that follows advertising best practices
- Balanced composition between text and imagery
- High-quality typography and text placement
- Professional branding integration
- Clear call-to-action
${removeBackground ? "- Clean white background (RGB: 255, 255, 255)" : "- Contextually relevant background that enhances readability"}

Additional Requirements: ${basePrompt}

Note: Generate the ad with all text and graphic elements integrated into the final image, making it look like a real, ready-to-use advertisement.`;
  };

  const handleGenerateAd = async () => {
    if (!image || !prompt) {
      toast({
        title: "Missing Information",
        description: "Please provide both an image and a prompt.",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData();
    formData.append("image", image);
    formData.append("prompt", generateStructuredPrompt());
    formData.append("removeBackground", removeBackground.toString());
    formData.append("orientation", orientation);

    startTransition(async () => {
      const result = await generateAd({}, formData);

      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
        return;
      }

      if (result.imageUrl) {
        setGeneratedAds((prev) => [
          {
            image: result.imageUrl as string,
            textOverlay: result.textImageUrl || undefined,
          },
          ...prev,
        ]);
        toast({
          title: "Success",
          description: "Ad generated successfully!",
        });
      }
    });
  };

  const handleDownload = useCallback(
    async (imageUrl: string) => {
      try {
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `generated-ad-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } catch (error) {
        toast({
          title: "Download Failed",
          description: "Failed to download the image. Please try again.",
          variant: "destructive",
        });
      }
    },
    [toast],
  );

  const handleViewImage = useCallback((imageUrl: string) => {
    setSelectedImage(imageUrl);
  }, []);

  return (
    <>
      <div className="flex flex-1 flex-col">
        <Tabs defaultValue="configure" className="flex flex-1 flex-col">
          <TabsList className="mb-6 self-center">
            <TabsTrigger value="configure">Configure</TabsTrigger>
            <TabsTrigger value="all">All Ads</TabsTrigger>
          </TabsList>

          <TabsContent value="configure" className="flex flex-1 flex-col">
            <Card className="mb-8">
              <CardContent className="p-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="flex flex-col">
                    <h2 className="mb-4 text-xl font-semibold">
                      Product Image
                    </h2>

                    {!image ? (
                      <div
                        className="flex flex-1 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 text-center transition-colors hover:bg-muted/50"
                        onClick={() => fileInputRef.current?.click()}
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                      >
                        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                          <Upload className="h-8 w-8 text-primary" />
                        </div>
                        <h3 className="mb-1 font-medium">
                          Upload product image
                        </h3>
                        <p className="mb-4 text-sm text-muted-foreground">
                          Drag and drop or click to browse
                        </p>
                        <Button variant="secondary" size="sm">
                          Select Image
                        </Button>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageUpload}
                        />
                      </div>
                    ) : (
                      <div className="relative flex h-[200px] items-center justify-center overflow-hidden rounded-lg border bg-muted/30">
                        {isImageLoading && <ImageSkeleton />}
                        <Image
                          src={image}
                          alt="Product"
                          width={ORIENTATION_CONFIGS[orientation].width}
                          height={ORIENTATION_CONFIGS[orientation].height}
                          className={cn(
                            "object-contain p-4 transition-opacity duration-300",
                            isImageLoading ? "opacity-0" : "opacity-100",
                          )}
                          onLoadingComplete={() => setIsImageLoading(false)}
                        />
                        <Button
                          variant="secondary"
                          size="icon"
                          className="absolute right-2 top-2 rounded-full"
                          onClick={clearImage}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col">
                    <h2 className="mb-4 text-xl font-semibold">
                      Ad Configuration
                    </h2>

                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Platform</Label>
                          <Select value={platform} onValueChange={setPlatform}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select platform" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="instagram">
                                Instagram
                              </SelectItem>
                              <SelectItem value="facebook">Facebook</SelectItem>
                              <SelectItem value="pinterest">
                                Pinterest
                              </SelectItem>
                              <SelectItem value="amazon">
                                Amazon/E-commerce
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>Orientation</Label>
                          <Select
                            value={orientation}
                            onValueChange={(
                              value: "square" | "portrait" | "landscape",
                            ) => setOrientation(value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select orientation" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="square">
                                Square (1:1)
                              </SelectItem>
                              <SelectItem value="portrait">
                                Portrait (2:3)
                              </SelectItem>
                              <SelectItem value="landscape">
                                Landscape (3:2)
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Target Audience</Label>
                          <Select
                            value={targetAudience}
                            onValueChange={setTargetAudience}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select audience" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="general">General</SelectItem>
                              <SelectItem value="luxury">Luxury</SelectItem>
                              <SelectItem value="youth">Youth</SelectItem>
                              <SelectItem value="professional">
                                Professional
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>Variations</Label>
                          <Select
                            value={variations}
                            onValueChange={setVariations}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Number of variations" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1">1 Variation</SelectItem>
                              <SelectItem value="2">2 Variations</SelectItem>
                              <SelectItem value="3">3 Variations</SelectItem>
                              <SelectItem value="4">4 Variations</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Ad Style</Label>
                        <RadioGroup
                          className="grid grid-cols-2 gap-4"
                          value={adStyle}
                          onValueChange={setAdStyle}
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="modern" id="modern" />
                            <Label htmlFor="modern">Modern & Minimal</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="luxury" id="luxury" />
                            <Label htmlFor="luxury">Luxury & Premium</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="casual" id="casual" />
                            <Label htmlFor="casual">Casual & Friendly</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="dynamic" id="dynamic" />
                            <Label htmlFor="dynamic">Dynamic & Bold</Label>
                          </div>
                        </RadioGroup>
                      </div>

                      <div className="space-y-2">
                        <Label>Mood</Label>
                        <RadioGroup
                          className="grid grid-cols-2 gap-4"
                          value={mood}
                          onValueChange={setMood}
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem
                              value="professional"
                              id="professional"
                            />
                            <Label htmlFor="professional">Professional</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="playful" id="playful" />
                            <Label htmlFor="playful">Playful</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="elegant" id="elegant" />
                            <Label htmlFor="elegant">Elegant</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="natural" id="natural" />
                            <Label htmlFor="natural">Natural</Label>
                          </div>
                        </RadioGroup>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch
                          id="remove-bg"
                          checked={removeBackground}
                          onCheckedChange={setRemoveBackground}
                        />
                        <Label htmlFor="remove-bg">Remove background</Label>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="prompt" className="mb-2 block">
                          Additional Details
                        </Label>
                        <Textarea
                          id="prompt"
                          placeholder="Add specific requirements for your ad (e.g., 'Show the product being used in a modern office setting' or 'Emphasize the eco-friendly packaging')"
                          className="h-32 resize-none"
                          value={prompt}
                          onChange={(e) => setPrompt(e.target.value)}
                        />
                      </div>

                      <Button
                        className="w-full"
                        size="lg"
                        disabled={!image || !prompt || isPending}
                        onClick={handleGenerateAd}
                      >
                        {isPending ? (
                          <>
                            <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Sparkles className="mr-2 h-4 w-4" />
                            Generate Ad
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex-1">
              <h2 className="mb-4 text-xl font-semibold">Generated Ads</h2>

              {generatedAds.length > 0 ? (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
                  {generatedAds.map((ad, index) => (
                    <AdCard
                      key={ad.image}
                      ad={ad.image}
                      textOverlay={ad.textOverlay}
                      index={index}
                      removeBackground={removeBackground}
                      prompt={prompt}
                      onDownload={handleDownload}
                      onView={handleViewImage}
                      orientation={orientation}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 text-center">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                    <ImageIcon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="mb-1 font-medium">No ads generated yet</h3>
                  <p className="mb-4 text-sm text-muted-foreground">
                    Upload a product image and click "Generate Ad" to create
                    your first ad
                  </p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="all" className="flex-1">
            <div className="flex h-full flex-col">
              <h2 className="mb-4 text-xl font-semibold">All Generated Ads</h2>

              {generatedAds.length > 0 ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {generatedAds.map((ad, index) => (
                    <AdCard
                      key={ad.image}
                      ad={ad.image}
                      textOverlay={ad.textOverlay}
                      index={index}
                      removeBackground={removeBackground}
                      prompt={prompt}
                      onDownload={handleDownload}
                      onView={handleViewImage}
                      orientation={orientation}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 text-center">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                    <ImageIcon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="mb-1 font-medium">No ads generated yet</h3>
                  <p className="mb-4 text-sm text-muted-foreground">
                    Go to the Configure tab to upload a product image and
                    generate ads
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog
        open={!!selectedImage}
        onOpenChange={() => setSelectedImage(null)}
      >
        <DialogContent className="h-[80vh] max-w-screen-lg overflow-hidden p-0">
          {selectedImage && (
            <div className="relative h-full w-full">
              {isViewLoading && <FullScreenImageSkeleton />}
              <div
                className={cn(
                  "relative h-full w-full",
                  removeBackground
                    ? "bg-white"
                    : "bg-gradient-to-b from-gray-50 to-gray-100",
                )}
              >
                <Image
                  src={selectedImage}
                  alt="Full size ad"
                  width={ORIENTATION_CONFIGS[orientation].width}
                  height={ORIENTATION_CONFIGS[orientation].height}
                  className={cn(
                    "h-full w-full object-contain transition-all duration-300",
                    isViewLoading
                      ? "scale-[1.02] opacity-0"
                      : "scale-100 opacity-100",
                  )}
                  sizes="100vw"
                  priority
                  onLoadingComplete={() => setIsViewLoading(false)}
                  onLoad={() => setIsViewLoading(true)}
                />
              </div>
              <div className="absolute inset-x-0 top-0 flex items-center justify-between bg-gradient-to-b from-black/20 to-transparent p-4">
                <p className="text-sm font-medium text-white">
                  Viewing Ad Preview
                </p>
                <Button
                  variant="secondary"
                  size="icon"
                  className="rounded-full bg-black/20 hover:bg-black/40"
                  onClick={() => setSelectedImage(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-end bg-gradient-to-t from-black/20 to-transparent p-4">
                <Button
                  variant="secondary"
                  size="sm"
                  className="rounded-full bg-black/20 hover:bg-black/40"
                  onClick={() => handleDownload(selectedImage)}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
