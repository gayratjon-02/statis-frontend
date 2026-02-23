import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/router";
import toast from "react-hot-toast";
import AuthGuard from "../../libs/auth/AuthGuard";
import {
  getBrands,
  createBrand,
  uploadBrandLogo,
  importBrandFromUrl,
} from "../../server/user/brand";
import {
  getProducts,
  createProduct,
  uploadProductPhoto,
  importProductFromUrl,
  removeProductBackground,
} from "../../server/user/product";
import {
  getConcepts,
  getCategories,
  getRecommendedConcepts,
  getConceptConfig,
  incrementUsage,
} from "../../server/user/concept";
import {
  createGeneration,
  getGenerationStatus,
  getGenerationBatchStatus,
  exportRatiosRequest,
  cancelBatchRequest,
  downloadAdImage,
  regenerateSingleRequest,
  fixErrorRequest,
} from "../../server/user/generation";
import { createCanvaCheckoutRequest } from "../../server/user/billing";
import {
  getBrandConfig,
  type IndustryItem,
  type VoiceItem,
} from "../../server/user/config";
import { getUsageRequest } from "../../server/user/login";
import API_BASE_URL from "../../libs/config/api.config";
import { useGenerationSocket } from "../../libs/hooks/useGenerationSocket";
import type { Brand, CreateBrandInput } from "../../libs/types/brand.type";
import { BrandIndustry, BrandVoice } from "../../libs/types/brand.type";
import type {
  Product,
  CreateProductInput,
} from "../../libs/types/product.type";
import type {
  AdConcept,
  ConceptCategoryItem,
} from "../../libs/types/concept.type";

const USP_PLACEHOLDERS = [
  'e.g., "Clinically proven results in 14 days"',
  'e.g., "100% natural, cruelty-free ingredients"',
  'e.g., "30-day money-back guarantee"',
  'e.g., "Dermatologist recommended formula"',
  'e.g., "Visible results or your money back"',
];

const AD_COLORS = [
  "#1a3a4a",
  "#2a1a3a",
  "#1a2a3a",
  "#3a2a1a",
  "#1a3a2a",
  "#2a3a1a",
];

/** Resolve relative /uploads/ paths to absolute backend URLs */
const resolveImageUrl = (url: string | null | undefined): string => {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  if (url.startsWith("/uploads/")) return `${API_BASE_URL}${url}`;
  return url;
};

interface BrandState {
  _id?: string; // If set, it's an existing brand
  name: string;
  description: string;
  url: string;
  industry: string;
  logo: File | null;
  logoPreview: string | null;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  voiceTags: string[];
  targetAudience: string;
  competitors: string;
}

interface ProductState {
  _id?: string; // If set, it's an existing product
  name: string;
  description: string;
  usps: string[];
  photo: File | null;
  photoPreview: string | null;
  noPhysicalProduct: boolean;
  price: string;
  productUrl: string;
  starRating: string;
  reviewCount: string;
  offer: string;
  ingredientsFeatures: string;
  beforeDescription: string;
  afterDescription: string;
}

function GeneratePageContent() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Data from API
  const [brands, setBrands] = useState<Brand[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [concepts, setConcepts] = useState<AdConcept[]>([]);
  const [conceptCategories, setConceptCategories] = useState<
    ConceptCategoryItem[]
  >([]);

  // Config from backend (dynamic dropdowns)
  const [industries, setIndustries] = useState<IndustryItem[]>([]);
  const [voiceTags, setVoiceTags] = useState<VoiceItem[]>([]);

  /** Helper: get industry label from fetched config */
  const getIndustryLabel = (id: string) =>
    industries.find((i) => i.id === id)?.label || id;

  const [brand, setBrand] = useState<BrandState>({
    name: "",
    description: "",
    url: "https://",
    industry: "",
    logo: null,
    logoPreview: null,
    primaryColor: "",
    secondaryColor: "",
    accentColor: "",
    backgroundColor: "",
    voiceTags: [],
    targetAudience: "",
    competitors: "",
  });
  const [product, setProduct] = useState<ProductState>({
    name: "",
    description: "",
    usps: ["", "", ""],
    photo: null,
    photoPreview: null,
    noPhysicalProduct: false,
    price: "",
    productUrl: "",
    starRating: "",
    reviewCount: "",
    offer: "",
    ingredientsFeatures: "",
    beforeDescription: "",
    afterDescription: "",
  });
  const [selectedConcept, setSelectedConcept] = useState<string | null>(null);
  const [conceptFilter, setConceptFilter] = useState("All");
  const [notes, setNotes] = useState("");
  const [generatingAds, setGeneratingAds] = useState([
    false,
    false,
    false,
    false,
    false,
    false,
  ]);
  const [completedAds, setCompletedAds] = useState([
    false,
    false,
    false,
    false,
    false,
    false,
  ]);
  const [savedAds, setSavedAds] = useState([
    false,
    false,
    false,
    false,
    false,
    false,
  ]);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  // Track active batch so we can cancel it if user leaves
  const activeBatchIdRef = useRef<string | null>(null);
  const generationInProgressRef = useRef(false);

  const [ratioModal, setRatioModal] = useState<{
    adId: string;
    adName: string | null;
    image_url_1x1: string | null;
    image_url_9x16: string | null;
    image_url_16x9: string | null;
  } | null>(null);
  const [ratioModalLoading, setRatioModalLoading] = useState(false);
  const [zipDownloading, setZipDownloading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzingStep, setAnalyzingStep] = useState(0);
  const [analyzingPercent, setAnalyzingPercent] = useState(0);
  const [socketEnabled, setSocketEnabled] = useState(false);
  const [displayPercent, setDisplayPercent] = useState(0);
  const analyzingSteps = [
    "Analyzing brand identity",
    "Crafting ad copy",
    "Preparing image prompts",
  ];

  // WebSocket real-time progress
  const storedMember = typeof window !== "undefined"
    ? JSON.parse(localStorage.getItem("se_member") || "null")
    : null;
  const memberId: string | null = storedMember?._id || null;
  const {
    overallPercent: socketPercent,
    latestMessage: socketMessage,
    reset: resetSocket,
  } = useGenerationSocket(memberId, socketEnabled);

  // Real generation results from backend
  interface GeneratedResult {
    _id: string;
    image_url_1x1: string | null;
    image_url_9x16: string | null;
    image_url_16x9: string | null;
    ad_copy_json: any;
    ad_name: string | null;
  }
  const [generatedResults, setGeneratedResults] = useState<GeneratedResult[]>(
    [],
  );
  const [showCreateBrandModal, setShowCreateBrandModal] = useState(false);
  const [importUrl, setImportUrl] = useState("");
  const [importLoading, setImportLoading] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  // Inline field validation errors
  const [brandErrors, setBrandErrors] = useState<Record<string, string>>({});
  const [productErrors, setProductErrors] = useState<Record<string, string>>(
    {},
  );

  const handleImportUrl = async () => {
    if (!importUrl.trim()) return;
    setImportLoading(true);
    setImportError(null);
    try {
      const data = await importBrandFromUrl(importUrl.trim());
      setBrand((prev) => ({
        ...prev,
        name: data.name || prev.name,
        description: data.description || prev.description,
        url: data.website_url || prev.url,
        industry: data.industry || prev.industry,
        logoPreview: data.logo_url
          ? resolveImageUrl(data.logo_url)
          : prev.logoPreview,
        primaryColor: data.primary_color || prev.primaryColor,
        secondaryColor: data.secondary_color || prev.secondaryColor,
        accentColor: data.accent_color || prev.accentColor,
        backgroundColor: data.background_color || prev.backgroundColor,
      }));

      // FIX: Convert imported logo URL to File object so form validation passes
      if (data.logo_url) {
        const logoUrl = resolveImageUrl(data.logo_url);
        try {
          const response = await fetch(logoUrl);
          if (response.ok) {
            const blob = await response.blob();
            const extension = blob.type.split("/")[1] || "png";
            const logoFile = new File([blob], `brand-logo.${extension}`, {
              type: blob.type,
            });
            setBrand((prev) => ({ ...prev, logo: logoFile }));
          }
        } catch {
          // Logo preview is still set, user can upload manually
          console.warn(
            "Could not convert imported logo to File, user can upload manually",
          );
        }
      }
    } catch (err: any) {
      setImportError(err.message || "Import failed");
    } finally {
      setImportLoading(false);
    }
  };

  // Product URL Import State
  const [productImportUrl, setProductImportUrl] = useState("");
  const [productImportLoading, setProductImportLoading] = useState(false);
  const [productImportError, setProductImportError] = useState<string | null>(
    null,
  );

  const handleProductImportUrl = async () => {
    if (!productImportUrl.trim()) return;
    setProductImportLoading(true);
    setProductImportError(null);
    try {
      const data = await importProductFromUrl(productImportUrl.trim());
      setProduct((prev) => ({
        ...prev,
        name: data.name || prev.name,
        description: data.description || prev.description,
        productUrl: data.product_url || prev.productUrl,
        price: data.price_text || prev.price,
        photoPreview: data.photo_url
          ? resolveImageUrl(data.photo_url)
          : prev.photoPreview,
        noPhysicalProduct: data.photo_url ? false : prev.noPhysicalProduct,
        ingredientsFeatures: data.ingredients_features || prev.ingredientsFeatures,
        beforeDescription: data.before_description || prev.beforeDescription,
        afterDescription: data.after_description || prev.afterDescription,
      }));

      // FIX: Convert imported photo URL to File object so form validation passes
      if (data.photo_url) {
        const photoUrl = resolveImageUrl(data.photo_url);
        try {
          const response = await fetch(photoUrl);
          if (response.ok) {
            const blob = await response.blob();
            if (blob.type.startsWith("image/")) {
              const extension = blob.type.split("/")[1] || "png";
              const photoFile = new File([blob], `product-photo.${extension}`, {
                type: blob.type,
              });
              setProduct((prev) => ({ ...prev, photo: photoFile }));
            }
          }
        } catch {
          console.warn(
            "Could not convert imported product photo to File, user can upload manually",
          );
        }
      }
    } catch (err: any) {
      setProductImportError(err.message || "Import failed");
    } finally {
      setProductImportLoading(false);
    }
  };

  const [bgRemoving, setBgRemoving] = useState(false);
  const handleRemoveBg = async (e: React.MouseEvent) => {
    e.stopPropagation(); // prevent triggering the file input click
    if (!product._id || bgRemoving) return;
    setBgRemoving(true);
    try {
      const data = await removeProductBackground(product._id);
      setProduct((prev) => ({
        ...prev,
        photoPreview: resolveImageUrl(data.photo_url),
      }));
    } catch (err: any) {
      toast.error(err.message || "Failed to remove background");
    } finally {
      setBgRemoving(false);
    }
  };

  const [credits, setCredits] = useState({ used: 0, limit: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const productFileRef = useRef<HTMLInputElement>(null);

  const steps = [
    { label: "Brand" },
    { label: "Product" },
    { label: "Concept" },
    { label: "Notes" },
    { label: "Generate" },
  ];

  useEffect(() => {
    // Fetch Brands, Concepts & Categories on mount
    getBrands(1, 100)
      .then((res) => setBrands(res.list))
      .catch(console.error);
    getConcepts()
      .then((res) => setConcepts(res.list))
      .catch(console.error);
    getCategories()
      .then((res) => setConceptCategories(res.list))
      .catch(console.error);
    getBrandConfig()
      .then((cfg) => {
        setIndustries(cfg.industries);
        setVoiceTags(cfg.voices);
      })
      .catch(console.error);
    getUsageRequest()
      .then((usage: any) => {
        setCredits({
          used: usage.credits_used || 0,
          limit: usage.credits_limit || 0,
        });
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (brand._id) {
      getProducts(brand._id)
        .then((res) => setProducts(res.list))
        .catch(console.error);
    } else {
      setProducts([]);
    }
  }, [brand._id]);

  // Cancel active batch if user refreshes or navigates away mid-generation
  useEffect(() => {
    const handleUnload = () => {
      if (generationInProgressRef.current && activeBatchIdRef.current) {
        cancelBatchRequest(activeBatchIdRef.current);
      }
    };
    window.addEventListener("beforeunload", handleUnload);
    return () => {
      window.removeEventListener("beforeunload", handleUnload);
      // Also cancel on React unmount (SPA navigation)
      if (generationInProgressRef.current && activeBatchIdRef.current) {
        cancelBatchRequest(activeBatchIdRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isAnalyzing) {
      setAnalyzingStep(0);
      setAnalyzingPercent(0);
      return;
    }
    const stepTimer = setInterval(() => {
      setAnalyzingStep((prev) =>
        prev < analyzingSteps.length - 1 ? prev + 1 : prev,
      );
    }, 3000);
    // Smooth percentage animation: 0→15% over ~10s during analyzing phase
    const percentTimer = setInterval(() => {
      setAnalyzingPercent((prev) => (prev < 15 ? prev + 1 : prev));
    }, 666);
    return () => {
      clearInterval(stepTimer);
      clearInterval(percentTimer);
    };
  }, [isAnalyzing]);

  // Smooth progress interpolation: combines analyzing phase + socket real-time progress
  useEffect(() => {
    // During analyzing: use analyzingPercent directly (0→15)
    // After analyzing: 15 + socket progress scaled to 15-100 range
    const targetPercent = isAnalyzing
      ? analyzingPercent
      : socketPercent > 0
        ? Math.min(100, Math.round(15 + socketPercent * 0.85))
        : Math.round(15 + (completedAds.filter(Boolean).length / 6) * 85); // polling fallback

    if (displayPercent >= targetPercent) return;

    const timer = setInterval(() => {
      setDisplayPercent((prev) => {
        if (prev >= targetPercent) {
          clearInterval(timer);
          return prev;
        }
        return prev + 1;
      });
    }, 50);

    return () => clearInterval(timer);
  }, [isAnalyzing, analyzingPercent, socketPercent, completedAds]);

  /** Fetch image blob via backend proxy */
  const fetchRatioBlob = async (
    adId: string,
    ratio: string,
  ): Promise<Blob | null> => {
    const token = localStorage.getItem("se_access_token");
    try {
      const res = await fetch(
        `${API_BASE_URL}/generation/download/${adId}/${ratio}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (!res.ok) return null;
      return await res.blob();
    } catch {
      return null;
    }
  };

  /** Download all 3 ratios as a ZIP file (browser-side) */
  const downloadAllAsZip = async () => {
    if (!ratioModal || zipDownloading) return;
    setZipDownloading(true);
    try {
      const JSZip = (await import("jszip")).default;
      const zip = new JSZip();
      const adName = (ratioModal.adName || "ad").replace(
        /[^a-zA-Z0-9_-]/g,
        "_",
      );
      const entries = [
        { ratio: "1x1", url: ratioModal.image_url_1x1 },
        { ratio: "9x16", url: ratioModal.image_url_9x16 },
        { ratio: "16x9", url: ratioModal.image_url_16x9 },
      ];
      for (const { ratio, url } of entries) {
        if (!url) continue;
        const blob = await fetchRatioBlob(ratioModal.adId, ratio);
        if (blob) zip.file(`${adName}_${ratio}.png`, blob);
      }
      const zipBlob = await zip.generateAsync({ type: "blob" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(zipBlob);
      a.download = `${adName}_all_ratios.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (e) {
      console.error("ZIP download failed", e);
      toast.error("Failed to create ZIP");
    } finally {
      setZipDownloading(false);
    }
  };

  /** Download image as JPG at 85% quality using Canvas */
  const downloadAsJpg = async (
    adId: string,
    ratio: string,
    adName: string | null,
  ) => {
    const blob = await fetchRatioBlob(adId, ratio);
    if (!blob) {
      toast.error("Image not available");
      return;
    }
    const blobUrl = URL.createObjectURL(blob);
    await new Promise<void>((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        canvas.getContext("2d")!.drawImage(img, 0, 0);
        canvas.toBlob(
          (jpgBlob) => {
            if (jpgBlob) {
              const safeName = (adName || "ad").replace(/[^a-zA-Z0-9_-]/g, "_");
              const a = document.createElement("a");
              a.href = URL.createObjectURL(jpgBlob);
              a.download = `${safeName}_${ratio}.jpg`;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
            }
            URL.revokeObjectURL(blobUrl);
            resolve();
          },
          "image/jpeg",
          0.85,
        );
      };
      img.onerror = () => {
        URL.revokeObjectURL(blobUrl);
        resolve();
      };
      img.src = blobUrl;
    });
  };

  /** Download image at 2x resolution using Canvas upscale */
  const downloadAs2x = async (
    adId: string,
    ratio: string,
    adName: string | null,
  ) => {
    const blob = await fetchRatioBlob(adId, ratio);
    if (!blob) {
      toast.error("Image not available");
      return;
    }
    const blobUrl = URL.createObjectURL(blob);
    await new Promise<void>((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width * 2;
        canvas.height = img.height * 2;
        const ctx = canvas.getContext("2d")!;
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((pngBlob) => {
          if (pngBlob) {
            const safeName = (adName || "ad").replace(/[^a-zA-Z0-9_-]/g, "_");
            const a = document.createElement("a");
            a.href = URL.createObjectURL(pngBlob);
            a.download = `${safeName}_${ratio}@2x.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
          }
          URL.revokeObjectURL(blobUrl);
          resolve();
        }, "image/png");
      };
      img.onerror = () => {
        URL.revokeObjectURL(blobUrl);
        resolve();
      };
      img.src = blobUrl;
    });
  };

  const startGeneration = async () => {
    if (!brand._id || !product._id || !selectedConcept) return;

    setStep(4);
    setIsAnalyzing(true);
    setDisplayPercent(0);
    resetSocket();
    setSocketEnabled(true);
    setGeneratingAds([false, false, false, false, false, false]);
    setCompletedAds([false, false, false, false, false, false]);
    setSavedAds([false, false, false, false, false, false]);
    setGeneratedResults([]);

    try {
      const result = await createGeneration({
        brand_id: brand._id,
        product_id: product._id,
        concept_id: selectedConcept,
        important_notes: notes,
      });

      // Claude finished, Gemini jobs queued — show skeleton cards
      setIsAnalyzing(false);
      setGeneratingAds([true, true, true, true, true, true]);

      // Update credits in real-time (5 credits deducted per generation)
      setCredits((prev) => ({ ...prev, used: prev.used + 5 }));

      const jobId = result.job_id;
      const batchId = result.batch_id || jobId; // Fallback to jobId if batch_id is missing (backward compat)

      // Track for cancellation if user leaves
      activeBatchIdRef.current = batchId;
      generationInProgressRef.current = true;

      // Increment usage count now that generation is confirmed
      if (selectedConcept) {
        incrementUsage(selectedConcept).catch(() => {
          /* silent */
        });
      }

      // Poll for generation status every 3 seconds (Batch Mode)
      const pollInterval = setInterval(async () => {
        try {
          // Use batch status endpoint
          const batchStatus = await getGenerationBatchStatus(batchId);

          // Update Results State
          // Map variations to GeneratedResult format
          const currentResults = batchStatus.variations.map((v) => ({
            _id: v._id,
            image_url_1x1: v.image_url_1x1,
            image_url_9x16: v.image_url_9x16,
            image_url_16x9: v.image_url_16x9,
            ad_copy_json: v.ad_copy_json,
            ad_name: v.ad_name,
          }));

          setGeneratedResults(currentResults);

          // Update Loading/Completed State Grid
          const nextGenCheck = [false, false, false, false, false, false];
          const nextCompCheck = [false, false, false, false, false, false];

          // We expect 6 variations. If fewer, default to loading?
          // The batch initialization creates 6 pending records, so we should receive 6.

          batchStatus.variations.forEach((v, idx) => {
            if (idx >= 6) return; // Safety

            if (v.generation_status === "completed") {
              nextCompCheck[idx] = true;
            } else if (v.generation_status === "failed") {
              nextCompCheck[idx] = true; // Treat failed as done for spinner purposes (maybe show error icon later)
            } else {
              nextGenCheck[idx] = true; // Pending/Processing
            }
          });

          // If we have fewer than 6 variations returned (e.g. strict filtering or error),
          // ensure the remaining slots show as processing or something.
          // But our backend creates 6.
          for (let i = batchStatus.variations.length; i < 6; i++) {
            nextGenCheck[i] = true;
          }

          setGeneratingAds(nextGenCheck);
          setCompletedAds(nextCompCheck);

          // Check Overall Status
          if (
            batchStatus.status === "completed" ||
            batchStatus.status === "failed"
          ) {
            clearInterval(pollInterval);
            generationInProgressRef.current = false;
            activeBatchIdRef.current = null;
            setSocketEnabled(false);
            setDisplayPercent(100);

            if (batchStatus.status === "completed") {
              setTimeout(() => setStep(5), 1000);
            } else {
              const anySuccess = batchStatus.variations.some(
                (v) => v.generation_status === "completed",
              );
              if (!anySuccess) {
                toast.error("Generation failed. Please try again.");
                setStep(3);
              } else {
                setTimeout(() => setStep(5), 1000);
              }
            }
          }
        } catch (pollErr) {
          console.error("Polling error:", pollErr);
        }
      }, 3000);
    } catch (error: any) {
      console.error("Failed to start generation", error);
      setIsAnalyzing(false);
      setSocketEnabled(false);
      setStep(3);

      const msg = error?.message || "";
      if (
        msg.toLowerCase().includes("insufficient credits") ||
        msg.toLowerCase().includes("credit")
      ) {
        const goToBilling = confirm(
          "You don't have enough credits to generate ads.\n\nWould you like to top up your account?",
        );
        if (goToBilling) {
          router.push("/dashboard");
        }
      } else {
        toast.error("Failed to start generation. Please try again.");
      }
    }
  };

  const toggleVoiceTag = (tag: string) => {
    setBrand((prev) => ({
      ...prev,
      voiceTags: prev.voiceTags.includes(tag)
        ? prev.voiceTags.filter((t) => t !== tag)
        : [...prev.voiceTags, tag],
    }));
  };

  const addUsp = () => {
    if (product.usps.length < 5)
      setProduct((p) => ({ ...p, usps: [...p.usps, ""] }));
  };

  const removeUsp = (index: number) => {
    if (product.usps.length > 1)
      setProduct((p) => ({ ...p, usps: p.usps.filter((_, i) => i !== index) }));
  };

  const handleBrandNext = async () => {
    if (brand._id) {
      setStep(1);
      return;
    }

    // Basic Validation
    const errors: Record<string, string> = {};
    if (!brand.name) errors.name = "Brand name is required";
    if (!brand.description)
      errors.description = "Brand description is required (min 10 characters)";
    else if (brand.description.length < 10)
      errors.description = "Brand description must be at least 10 characters";
    if (!brand.url || brand.url === "https://")
      errors.url = "Website URL is required";
    if (!brand.industry) errors.industry = "Please select an industry";
    if (!brand.logo && !brand.logoPreview)
      errors.logo = "Brand logo is required. Please upload a PNG file.";
    if (brand.voiceTags.length === 0)
      errors.voiceTags = "Please select at least one voice/tone option";
    if (!brand.targetAudience)
      errors.targetAudience = "Target audience is required";
    if (!brand.primaryColor)
      errors.primaryColor = "Primary color is required";
    if (!brand.secondaryColor)
      errors.secondaryColor = "Secondary color is required";

    setBrandErrors(errors);
    if (Object.keys(errors).length > 0) {
      toast.error("Please fix the highlighted fields before continuing");
      return;
    }

    setIsLoading(true);
    try {
      let logoUrl = "";
      if (brand.logo) {
        const { logo_url } = await uploadBrandLogo(brand.logo);
        logoUrl = logo_url;
      } else if (brand.logoPreview && brand.logoPreview.startsWith("http")) {
        // Use the imported logo URL directly if File conversion failed
        logoUrl = brand.logoPreview;
      }
      const newBrand = await createBrand({
        name: brand.name,
        description: brand.description,
        website_url: brand.url,
        industry: brand.industry as BrandIndustry,
        logo_url: logoUrl,
        primary_color: brand.primaryColor,
        secondary_color: brand.secondaryColor,
        accent_color: brand.accentColor,
        background_color: brand.backgroundColor,
        voice_tags: brand.voiceTags as BrandVoice[],
        target_audience: brand.targetAudience,
        competitors: brand.competitors,
      });
      setBrand((prev) => ({ ...prev, _id: newBrand._id }));
      // Refresh brands list
      getBrands(1, 100).then((res) => setBrands(res.list));
      setStep(1);
      setShowCreateBrandModal(false);
    } catch (e: any) {
      console.error("  ❌ handleBrandNext ERROR:", e.message || e);
      toast.error(`Failed to create brand: ${e.message || "Unknown error"}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProductNext = async () => {
    if (product._id) {
      setStep(2);
      return;
    }

    // Basic Validation
    const errors: Record<string, string> = {};
    if (!product.name) errors.name = "Product name is required";
    if (!product.description)
      errors.description = "Product description is required";
    if (!product.noPhysicalProduct && !product.photo && !product.photoPreview)
      errors.photo = "Product photo is required for physical products";

    setProductErrors(errors);
    if (Object.keys(errors).length > 0) {
      toast.error("Please fix the highlighted fields before continuing");
      return;
    }

    setIsLoading(true);
    try {
      let photoUrl = "";
      if (product.photo) {
        const { photo_url } = await uploadProductPhoto(product.photo);
        photoUrl = photo_url;
      }

      const newProduct = await createProduct({
        brand_id: brand._id!,
        name: product.name,
        description: product.description,
        usps: product.usps.filter((u) => u.trim() !== ""),
        photo_url: photoUrl,
        has_physical_product: !product.noPhysicalProduct,
        price_text: product.price || undefined,
        product_url: product.productUrl || undefined,
        star_rating: product.starRating
          ? parseFloat(product.starRating)
          : undefined,
        review_count: product.reviewCount
          ? parseInt(product.reviewCount)
          : undefined,
        offer_text: product.offer || undefined,
        ingredients_features: product.ingredientsFeatures || undefined,
        before_description: product.beforeDescription || undefined,
        after_description: product.afterDescription || undefined,
      });

      setProduct((prev) => ({ ...prev, _id: newProduct._id }));
      // Refresh products list
      if (brand._id)
        getProducts(brand._id).then((res) => setProducts(res.list));
      setStep(2);
    } catch (e) {
      console.error(e);
      toast.error("Failed to create product");
    } finally {
      setIsLoading(false);
    }
  };

  const updateUsp = (index: number, value: string) => {
    setProduct((p) => ({
      ...p,
      usps: p.usps.map((u, i) => (i === index ? value : u)),
    }));
  };

  const filteredConcepts =
    conceptFilter === "All"
      ? concepts
      : concepts.filter((c) => c.category_id === conceptFilter);
  const remaining = credits.limit - credits.used;

  return (
    <div className="gen-page">
      {/* ===== TOP BAR ===== */}
      <div className="gen-topbar">
        <div className="gen-topbar__brand">
          <span
            className="gen-topbar__logo grad-text"
            style={{ cursor: "pointer" }}
            onClick={() => router.push("/dashboard")}
          >
            Static Engine
          </span>
          <span className="gen-topbar__beta">BETA</span>
          <button
            onClick={() => router.push("/dashboard")}
            style={{
              marginLeft: 16,
              padding: "6px 14px",
              fontSize: 13,
              fontWeight: 500,
              color: "var(--muted)",
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 8,
              cursor: "pointer",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.12)";
              e.currentTarget.style.color = "var(--text)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.06)";
              e.currentTarget.style.color = "var(--muted)";
            }}
          >
            ← Dashboard
          </button>
        </div>
        <div className="gen-topbar__right">
          <div className="gen-credits">
            <span className="gen-credits__label">Credits</span>
            <div className="gen-credits__bar-wrap">
              <div className="gen-credits__bar">
                <div
                  className="gen-credits__bar-fill"
                  style={{ width: `${(remaining / credits.limit) * 100}% ` }}
                />
              </div>
              <span className="gen-credits__val">{remaining}</span>
              <span className="gen-credits__max">/ {credits.limit}</span>
            </div>
          </div>
          <div className="gen-avatar">B</div>
        </div>
      </div>

      {/* ===== STEP INDICATOR ===== */}
      {step < 5 &&
        (() => {
          const generationLocked =
            step === 4 &&
            (isAnalyzing ||
              generatingAds.some(Boolean) ||
              completedAds.some(Boolean));
          return (
            <div className="gen-steps">
              {steps.map((s, i) => (
                <div key={i} className="gen-step">
                  <div
                    className={`gen-step__btn ${
                      i === step ? "gen-step__btn--active" : ""
                    } ${
                      i < step && !generationLocked ? "gen-step__btn--done" : ""
                    } ${
                      generationLocked && i < step
                        ? "gen-step__btn--locked"
                        : ""
                    }`}
                    onClick={() => {
                      if (!generationLocked && i < step) setStep(i);
                    }}
                  >
                    <div
                      className={`gen-step__num ${
                        i === step
                          ? "gen-step__num--active"
                          : i < step
                          ? "gen-step__num--done"
                          : "gen-step__num--pending"
                      }`}
                    >
                      {i < step ? "✓" : i + 1}
                    </div>
                    <span
                      className="gen-step__label"
                      style={{
                        fontWeight: i === step ? 600 : 400,
                        color:
                          i === step
                            ? "var(--text)"
                            : i < step
                            ? "var(--accent)"
                            : "var(--dim)",
                      }}
                    >
                      {s.label}
                    </span>
                  </div>
                  {i < steps.length - 1 && (
                    <div
                      className="gen-step__line"
                      style={{
                        background:
                          i < step ? "var(--accent)" : "var(--border)",
                      }}
                    />
                  )}
                </div>
              ))}
            </div>
          );
        })()}

      {/* ===== CONTENT ===== */}
      <div
        className={`gen-content ${
          step === 2
            ? "gen-content--medium"
            : step >= 4
            ? "gen-content--wide"
            : "gen-content--narrow"
        }`}
      >
        {/* ══════ STEP 0: BRAND ══════ */}
        {step === 0 && (
          <div style={{ animation: "fadeIn 0.4s ease" }}>
            <div className="gen-brand-selector">
              <div className="gen-brand-selector__title">
                Select an existing brand
              </div>
              <div className="gen-brand-list">
                {brands.map((b) => (
                  <div
                    key={b._id}
                    className="gen-brand-item"
                    onClick={() => {
                      setBrand({
                        _id: b._id,
                        name: b.name,
                        description: b.description,
                        url: b.website_url,
                        industry: b.industry,
                        logo: null,
                        logoPreview: resolveImageUrl(b.logo_url),
                        primaryColor: b.primary_color,
                        secondaryColor: b.secondary_color,
                        accentColor: b.accent_color,
                        backgroundColor: b.background_color || "",
                        voiceTags: b.voice_tags, // Assuming strings match enum values
                        targetAudience: b.target_audience,
                        competitors: b.competitors,
                      });
                      setStep(1);
                    }}
                  >
                    <div
                      className="gen-brand-item__icon"
                      style={{
                        background: b.logo_url
                          ? "transparent"
                          : `${b.primary_color}33`,
                        color: b.primary_color,
                      }}
                    >
                      {b.logo_url ? (
                        <img
                          src={resolveImageUrl(b.logo_url)}
                          alt={b.name}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "contain",
                            borderRadius: "inherit",
                          }}
                        />
                      ) : (
                        b.name[0]
                      )}
                    </div>
                    <span style={{ fontWeight: 500 }}>{b.name}</span>
                  </div>
                ))}
              </div>
              <div
                className="gen-or-divider"
                onClick={() => setShowCreateBrandModal(true)}
              >
                <div className="gen-or-divider__line" />
                <span className="gen-or-divider__text">or create new +</span>
                <div className="gen-or-divider__line" />
              </div>
            </div>

            {showCreateBrandModal && (
              <div
                className="gen-modal-overlay"
                onClick={() => setShowCreateBrandModal(false)}
              >
                <div className="gen-modal" onClick={(e) => e.stopPropagation()}>
                  <div
                    className="gen-card"
                    style={{
                      border: "none",
                      boxShadow: "none",
                      background: "transparent",
                    }}
                  >
                    <div className="gen-card__title">Create Brand Profile</div>
                    <div className="gen-card__desc">
                      Your brand details power the AI to create on-brand ads.
                    </div>

                    <div className="gen-section">
                      <span className="gen-section__num">01</span> Brand
                      Identity
                    </div>

                    {/* URL Import UI */}
                    <div
                      style={{
                        background: "rgba(255,255,255,0.03)",
                        border: "1px dashed #30363d",
                        padding: 16,
                        borderRadius: 8,
                        marginBottom: 24,
                      }}
                    >
                      <div
                        style={{
                          fontSize: 13,
                          color: "#8b949e",
                          marginBottom: 4,
                        }}
                      >
                        Auto fill from home page URL
                      </div>
                      <div
                        style={{
                          fontSize: 11,
                          color: "#6e7681",
                          marginBottom: 8,
                        }}
                      >
                        Paste your brand's main homepage URL (not a product page).
                      </div>
                      <div style={{ display: "flex", gap: 8 }}>
                        <input
                          className="gen-input"
                          placeholder="https://yourbrand.com"
                          value={importUrl}
                          onChange={(e) => setImportUrl(e.target.value)}
                          onKeyDown={(e) =>
                            e.key === "Enter" && handleImportUrl()
                          }
                        />
                        <button
                          onClick={handleImportUrl}
                          disabled={importLoading || !importUrl.trim()}
                          style={{
                            background: "#238636",
                            color: "#fff",
                            border: "none",
                            borderRadius: 8,
                            padding: "0 16px",
                            cursor: importLoading ? "not-allowed" : "pointer",
                            fontWeight: 500,
                            whiteSpace: "nowrap",
                          }}
                        >
                          {importLoading ? "..." : "Import"}
                        </button>
                      </div>
                      {importError && (
                        <div
                          style={{
                            color: "#f85149",
                            fontSize: 12,
                            marginTop: 6,
                          }}
                        >
                          {importError}
                        </div>
                      )}
                    </div>

                    <div className="gen-grid-2">
                      <div>
                        <label className="gen-label">Brand Name *</label>
                        <input
                          className="gen-input"
                          placeholder="e.g., GlowVita, FreshPaws"
                          value={brand.name}
                          style={
                            brandErrors.name ? { borderColor: "#f85149" } : {}
                          }
                          onChange={(e) => {
                            setBrand((p) => ({ ...p, name: e.target.value }));
                            setBrandErrors((prev) => {
                              const { name, ...rest } = prev;
                              return rest;
                            });
                          }}
                        />
                        {brandErrors.name && (
                          <div
                            style={{
                              color: "#f85149",
                              fontSize: 12,
                              marginTop: 4,
                            }}
                          >
                            {brandErrors.name}
                          </div>
                        )}
                      </div>
                      <div>
                        <label className="gen-label">Industry *</label>
                        <select
                          className="gen-select"
                          value={brand.industry}
                          style={
                            brandErrors.industry
                              ? { borderColor: "#f85149" }
                              : {}
                          }
                          onChange={(e) => {
                            setBrand((p) => ({
                              ...p,
                              industry: e.target.value,
                            }));
                            setBrandErrors((prev) => {
                              const { industry, ...rest } = prev;
                              return rest;
                            });
                          }}
                        >
                          <option value="">Select industry</option>
                          {industries.map((item) => (
                            <option key={item.id} value={item.id}>
                              {item.label}
                            </option>
                          ))}
                        </select>
                        {brandErrors.industry && (
                          <div
                            style={{
                              color: "#f85149",
                              fontSize: 12,
                              marginTop: 4,
                            }}
                          >
                            {brandErrors.industry}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="gen-mb-20">
                      <label className="gen-label">Brand Description *</label>
                      <textarea
                        className="gen-textarea"
                        style={{
                          height: 80,
                          ...(brandErrors.description
                            ? { borderColor: "#f85149" }
                            : {}),
                        }}
                        placeholder="What does your brand do? Who does it serve?"
                        value={brand.description}
                        onChange={(e) => {
                          setBrand((p) => ({
                            ...p,
                            description: e.target.value,
                          }));
                          setBrandErrors((prev) => {
                            const { description, ...rest } = prev;
                            return rest;
                          });
                        }}
                      />
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        {brandErrors.description ? (
                          <div
                            style={{
                              color: "#f85149",
                              fontSize: 12,
                              marginTop: 4,
                            }}
                          >
                            {brandErrors.description}
                          </div>
                        ) : (
                          <span />
                        )}
                        <div className="gen-char-count">
                          {brand.description.length}/500
                        </div>
                      </div>
                    </div>

                    <div className="gen-mb-28">
                      <label className="gen-label">Website URL *</label>
                      <input
                        className="gen-input"
                        placeholder="https://yourbrand.com"
                        value={brand.url}
                        style={
                          brandErrors.url ? { borderColor: "#f85149" } : {}
                        }
                        onChange={(e) => {
                          setBrand((p) => ({ ...p, url: e.target.value }));
                          setBrandErrors((prev) => {
                            const { url, ...rest } = prev;
                            return rest;
                          });
                        }}
                      />
                      {brandErrors.url && (
                        <div
                          style={{
                            color: "#f85149",
                            fontSize: 12,
                            marginTop: 4,
                          }}
                        >
                          {brandErrors.url}
                        </div>
                      )}
                    </div>

                    <div className="gen-section">
                      <span className="gen-section__num">02</span> Brand Visuals
                    </div>

                    <div className="gen-mb-20">
                      <label className="gen-label">Logo (PNG) *</label>
                      <div
                        className="gen-upload"
                        onClick={() => fileInputRef.current?.click()}
                        style={{
                          ...(brand.logoPreview
                            ? {
                                backgroundImage: `url(${brand.logoPreview})`,
                                backgroundSize: "contain",
                                backgroundPosition: "center",
                                backgroundRepeat: "no-repeat",
                                minHeight: 120,
                              }
                            : {}),
                          ...(brandErrors.logo
                            ? { borderColor: "#f85149" }
                            : {}),
                        }}
                      >
                        {!brand.logoPreview && (
                          <>
                            <div className="gen-upload__icon">⬆</div>
                            <div className="gen-upload__label">
                              Click to upload PNG logo
                            </div>
                            <div className="gen-upload__hint">
                              Transparent background preferred · Max 5MB
                            </div>
                          </>
                        )}
                      </div>
                      {brandErrors.logo && (
                        <div
                          style={{
                            color: "#f85149",
                            fontSize: 12,
                            marginTop: 4,
                          }}
                        >
                          {brandErrors.logo}
                        </div>
                      )}
                      {brand.logoPreview && !brand.logo && (
                        <div
                          style={{
                            color: "#e3b341",
                            fontSize: 12,
                            marginTop: 4,
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                          }}
                        >
                          <span>⚠️</span> Imported from website — verify this is
                          your logo
                        </div>
                      )}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".png,.jpg,.jpeg,.webp"
                        style={{ display: "none" }}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const url = URL.createObjectURL(file);
                            setBrand((p) => ({
                              ...p,
                              logo: file,
                              logoPreview: url,
                            }));
                            setBrandErrors((prev) => {
                              const { logo, ...rest } = prev;
                              return rest;
                            });
                          }
                        }}
                      />
                    </div>

                    <div className="gen-grid-2">
                      {[
                        {
                          label: "Primary Color *",
                          key: "primaryColor" as const,
                        },
                        {
                          label: "Secondary Color *",
                          key: "secondaryColor" as const,
                        },
                        { label: "Accent Color", key: "accentColor" as const },
                        { label: "Background Color", key: "backgroundColor" as const },
                      ].map(({ label, key }) => (
                        <div key={key}>
                          <label className="gen-label">{label}</label>
                          <div className="gen-color-row" style={brandErrors[key] ? { border: "1px solid #f85149", borderRadius: 8, padding: 4 } : {}}>
                            <input
                              type="color"
                              value={brand[key] || "#FFFFFF"}
                              className="gen-color-picker"
                              onChange={(e) => {
                                setBrand((p) => ({
                                  ...p,
                                  [key]: e.target.value,
                                }));
                                setBrandErrors((prev) => {
                                  const { [key]: _, ...rest } = prev;
                                  return rest;
                                });
                              }}
                            />
                            <input
                              className="gen-input"
                              style={{
                                flex: 1,
                                fontFamily: "monospace",
                                fontSize: 13,
                              }}
                              placeholder="#000000"
                              value={brand[key]}
                              onChange={(e) => {
                                setBrand((p) => ({
                                  ...p,
                                  [key]: e.target.value,
                                }));
                                setBrandErrors((prev) => {
                                  const { [key]: _, ...rest } = prev;
                                  return rest;
                                });
                              }}
                            />
                          </div>
                          {brandErrors[key] && (
                            <div style={{ color: "#f85149", fontSize: 12, marginTop: 4 }}>{brandErrors[key]}</div>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="gen-section">
                      <span className="gen-section__num">03</span> Brand Voice
                    </div>

                    <div className="gen-mb-20">
                      <label className="gen-label">Voice & Tone *</label>
                      <div
                        className="gen-tags"
                        style={
                          brandErrors.voiceTags
                            ? {
                                border: "1px solid #f85149",
                                borderRadius: 8,
                                padding: 8,
                              }
                            : {}
                        }
                      >
                        {voiceTags.map((item) => (
                          <div
                            key={item.id}
                            className={`gen-tag ${
                              brand.voiceTags.includes(item.id)
                                ? "gen-tag--active"
                                : ""
                            }`}
                            onClick={() => {
                              toggleVoiceTag(item.id);
                              setBrandErrors((prev) => {
                                const { voiceTags, ...rest } = prev;
                                return rest;
                              });
                            }}
                          >
                            {item.label}
                          </div>
                        ))}
                      </div>
                      {brandErrors.voiceTags && (
                        <div
                          style={{
                            color: "#f85149",
                            fontSize: 12,
                            marginTop: 4,
                          }}
                        >
                          {brandErrors.voiceTags}
                        </div>
                      )}
                    </div>

                    <div className="gen-mb-20">
                      <label className="gen-label">Target Audience *</label>
                      <textarea
                        className="gen-textarea"
                        style={{
                          height: 60,
                          ...(brandErrors.targetAudience
                            ? { borderColor: "#f85149" }
                            : {}),
                        }}
                        placeholder='e.g., "Health-conscious women aged 25-45 who prefer clean beauty products"'
                        value={brand.targetAudience}
                        onChange={(e) => {
                          setBrand((p) => ({
                            ...p,
                            targetAudience: e.target.value,
                          }));
                          setBrandErrors((prev) => {
                            const { targetAudience, ...rest } = prev;
                            return rest;
                          });
                        }}
                      />
                      {brandErrors.targetAudience && (
                        <div
                          style={{
                            color: "#f85149",
                            fontSize: 12,
                            marginTop: 4,
                          }}
                        >
                          {brandErrors.targetAudience}
                        </div>
                      )}
                    </div>

                    <div className="gen-mb-20">
                      <label className="gen-label">
                        Competitor Brands (Optional)
                      </label>
                      <input
                        className="gen-input"
                        placeholder="e.g., Brand X, Brand Y, Brand Z"
                        value={brand.competitors}
                        onChange={(e) =>
                          setBrand((p) => ({
                            ...p,
                            competitors: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>

                  <div
                    className="gen-nav gen-nav--right"
                    style={{ padding: "0 32px 32px" }}
                  >
                    <button
                      className="gen-btn-next"
                      onClick={handleBrandNext}
                      disabled={isLoading}
                    >
                      {isLoading ? "Creating..." : "Create Brand →"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══════ STEP 1: PRODUCT ══════ */}
        {step === 1 && (
          <div style={{ animation: "fadeIn 0.4s ease" }}>
            <div className="gen-card">
              <div className="gen-card__title">Choose a Product</div>
              <div className="gen-card__desc">
                Select an existing product or add a new one.
              </div>

              {products.length > 0 && (
                <div className="gen-brand-list" style={{ marginBottom: 20 }}>
                  {products.map((p) => (
                    <div
                      key={p._id}
                      className="gen-brand-item"
                      onClick={() => {
                        setProduct({
                          _id: p._id,
                          name: p.name,
                          description: p.description,
                          usps: p.usps,
                          photo: null,
                          photoPreview: resolveImageUrl(p.photo_url),
                          noPhysicalProduct: !p.has_physical_product,
                          price: p.price_text,
                          productUrl: p.product_url,
                          starRating: p.star_rating?.toString() || "",
                          reviewCount: p.review_count?.toString() || "",
                          offer: p.offer_text,
                          ingredientsFeatures: p.ingredients_features || "",
                          beforeDescription: p.before_description || "",
                          afterDescription: p.after_description || "",
                        });
                        setStep(2);
                      }}
                    >
                      <div
                        className="gen-brand-item__icon"
                        style={
                          p.photo_url
                            ? {
                                backgroundImage: `url(${resolveImageUrl(
                                  p.photo_url,
                                )})`,
                                backgroundSize: "contain",
                                backgroundPosition: "center",
                                backgroundRepeat: "no-repeat",
                              }
                            : {
                                background: "#3ECFCF33",
                                color: "#3ECFCF",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }
                        }
                      >
                        {!p.photo_url && p.name[0]}
                      </div>
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <span style={{ fontWeight: 500 }}>{p.name}</span>
                        <span style={{ fontSize: 12, color: "var(--muted)" }}>
                          {p.has_physical_product ? "Physical" : "Digital"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="gen-or-divider">
                <div className="gen-or-divider__line" />
                <span className="gen-or-divider__text">
                  or add new product +
                </span>
                <div className="gen-or-divider__line" />
              </div>

              {/* URL Import UI for Product */}
              <div
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px dashed #30363d",
                  padding: 16,
                  borderRadius: 8,
                  marginBottom: 20,
                }}
              >
                <div
                  style={{ fontSize: 13, color: "#8b949e", marginBottom: 4 }}
                >
                  Auto-fill from product page URL
                </div>
                <div
                  style={{ fontSize: 11, color: "#6e7681", marginBottom: 8 }}
                >
                  Paste a direct link to your product page. We'll extract the name, description, price, and photo.
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <input
                    className="gen-input"
                    placeholder="https://yourbrand.com/products/vitamin-c-serum"
                    value={productImportUrl}
                    onChange={(e) => setProductImportUrl(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === "Enter" && handleProductImportUrl()
                    }
                  />
                  <button
                    onClick={handleProductImportUrl}
                    disabled={productImportLoading || !productImportUrl.trim()}
                    style={{
                      background: "#238636",
                      color: "#fff",
                      border: "none",
                      borderRadius: 8,
                      padding: "0 16px",
                      cursor: productImportLoading ? "not-allowed" : "pointer",
                      fontWeight: 500,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {productImportLoading ? "..." : "Import"}
                  </button>
                </div>
                {productImportError && (
                  <div style={{ color: "#f85149", fontSize: 12, marginTop: 6 }}>
                    {productImportError}
                  </div>
                )}
              </div>

              <div className="gen-toggle-row">
                <div
                  className="gen-toggle"
                  onClick={() =>
                    setProduct((p) => ({
                      ...p,
                      noPhysicalProduct: !p.noPhysicalProduct,
                    }))
                  }
                  style={{
                    background: product.noPhysicalProduct
                      ? "#3B82F6"
                      : "var(--border)",
                  }}
                >
                  <div
                    className="gen-toggle__knob"
                    style={{
                      transform: product.noPhysicalProduct
                        ? "translateX(20px)"
                        : "translateX(0)",
                    }}
                  />
                </div>
                <span
                  style={{
                    fontSize: 14,
                    color: product.noPhysicalProduct ? "#fff" : "var(--muted)",
                    fontWeight: product.noPhysicalProduct ? 500 : 400,
                  }}
                >
                  No physical product (SaaS, service, digital product)
                </span>
              </div>

              <div className="gen-grid-2">
                <div>
                  <label className="gen-label">Product Name *</label>
                  <input
                    className="gen-input"
                    placeholder="e.g., Vitamin C Serum"
                    value={product.name}
                    style={productErrors.name ? { borderColor: "#f85149" } : {}}
                    onChange={(e) => {
                      setProduct((p) => ({ ...p, name: e.target.value }));
                      setProductErrors((prev) => {
                        const { name, ...rest } = prev;
                        return rest;
                      });
                    }}
                  />
                  {productErrors.name && (
                    <div
                      style={{ color: "#f85149", fontSize: 12, marginTop: 4 }}
                    >
                      {productErrors.name}
                    </div>
                  )}
                </div>
                <div>
                  <label className="gen-label">Price Point <span style={{ color: "#6e7681", fontWeight: 400, textTransform: "none" }}>(optional)</span></label>
                  <input
                    className="gen-input"
                    placeholder="e.g., $29.99"
                    value={product.price}
                    onChange={(e) =>
                      setProduct((p) => ({ ...p, price: e.target.value }))
                    }
                  />
                </div>
              </div>

              <div className="gen-mb-20">
                <label className="gen-label">Product Description *</label>
                <textarea
                  className="gen-textarea"
                  style={{
                    height: 80,
                    ...(productErrors.description
                      ? { borderColor: "#f85149" }
                      : {}),
                  }}
                  placeholder="What is it, what does it do, who is it for?"
                  value={product.description}
                  onChange={(e) => {
                    setProduct((p) => ({ ...p, description: e.target.value }));
                    setProductErrors((prev) => {
                      const { description, ...rest } = prev;
                      return rest;
                    });
                  }}
                />
                {productErrors.description && (
                  <div style={{ color: "#f85149", fontSize: 12, marginTop: 4 }}>
                    {productErrors.description}
                  </div>
                )}
              </div>

              <div className="gen-mb-20">
                <label className="gen-label">Unique Selling Points *</label>
                {product.usps.map((usp, i) => (
                  <div key={i} className="gen-usp-row">
                    <div className="gen-usp-num">{i + 1}</div>
                    <input
                      className="gen-input"
                      style={{ flex: 1 }}
                      placeholder={USP_PLACEHOLDERS[i] || USP_PLACEHOLDERS[0]}
                      value={usp}
                      onChange={(e) => updateUsp(i, e.target.value)}
                    />
                    {product.usps.length > 1 && (
                      <button
                        className="gen-usp-remove"
                        onClick={() => removeUsp(i)}
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
                {product.usps.length < 5 && (
                  <button className="gen-usp-add" onClick={addUsp}>
                    + Add USP
                  </button>
                )}
              </div>

              <div className="gen-mb-20">
                <label className="gen-label">
                  {product.noPhysicalProduct
                    ? "Hero Image (Optional)"
                    : "Product Photo *"}
                </label>
                <div
                  className="gen-upload"
                  onClick={() => productFileRef.current?.click()}
                  style={{
                    ...(product.photoPreview
                      ? {
                          backgroundImage: `url(${product.photoPreview})`,
                          backgroundSize: "contain",
                          backgroundPosition: "center",
                          backgroundRepeat: "no-repeat",
                          minHeight: 160,
                          position: "relative",
                        }
                      : {}),
                    ...(productErrors.photo ? { borderColor: "#f85149" } : {}),
                  }}
                >
                  {!product.photoPreview && (
                    <>
                      <div className="gen-upload__icon">📷</div>
                      <div className="gen-upload__label">
                        {product.noPhysicalProduct
                          ? "Upload a screenshot, mockup, or lifestyle image"
                          : "Upload product photo with clean/white background"}
                      </div>
                      <div className="gen-upload__hint">
                        PNG or JPG · Max 10MB
                      </div>
                    </>
                  )}
                  {product.photoPreview &&
                    product._id &&
                    !product.noPhysicalProduct && (
                      <button
                        onClick={handleRemoveBg}
                        disabled={bgRemoving}
                        style={{
                          position: "absolute",
                          bottom: 12,
                          right: 12,
                          background: "rgba(0,0,0,0.7)",
                          color: "#fff",
                          border: "1px solid rgba(255,255,255,0.2)",
                          borderRadius: 6,
                          padding: "6px 12px",
                          fontSize: 12,
                          cursor: bgRemoving ? "not-allowed" : "pointer",
                          backdropFilter: "blur(4px)",
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        {bgRemoving ? (
                          <span
                            className="gen-loading-spinner"
                            style={{ width: 14, height: 14, borderWidth: 2 }}
                          />
                        ) : (
                          "✨"
                        )}
                        {bgRemoving ? "Removing..." : "Remove Background"}
                      </button>
                    )}
                </div>
                {productErrors.photo && (
                  <div style={{ color: "#f85149", fontSize: 12, marginTop: 4 }}>
                    {productErrors.photo}
                  </div>
                )}
                <input
                  ref={productFileRef}
                  type="file"
                  accept=".png,.jpg,.jpeg"
                  style={{ display: "none" }}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const url = URL.createObjectURL(file);
                      setProduct((p) => ({
                        ...p,
                        photo: file,
                        photoPreview: url,
                      }));
                      setProductErrors((prev) => {
                        const { photo, ...rest } = prev;
                        return rest;
                      });
                    }
                  }}
                />
              </div>

              <div className="gen-divider">
                <div className="gen-divider__line" />
                <span>OPTIONAL ENRICHMENT</span>
                <div className="gen-divider__line" />
              </div>

              <div className="gen-grid-3" style={{ marginBottom: 16 }}>
                <div>
                  <label className="gen-label">Star Rating <span style={{ color: "#6e7681", fontWeight: 400, textTransform: "none" }}>(optional)</span></label>
                  <select
                    className="gen-select"
                    value={product.starRating}
                    onChange={(e) =>
                      setProduct((p) => ({ ...p, starRating: e.target.value }))
                    }
                  >
                    <option value="">Select</option>
                    {[
                      5.0, 4.9, 4.8, 4.7, 4.6, 4.5, 4.4, 4.3, 4.2, 4.1, 4.0,
                    ].map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="gen-label">Review Count <span style={{ color: "#6e7681", fontWeight: 400, textTransform: "none" }}>(optional)</span></label>
                  <input
                    className="gen-input"
                    placeholder="e.g., 2400"
                    value={product.reviewCount}
                    onChange={(e) =>
                      setProduct((p) => ({ ...p, reviewCount: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <label className="gen-label">Offer / Discount <span style={{ color: "#6e7681", fontWeight: 400, textTransform: "none" }}>(optional)</span></label>
                  <input
                    className="gen-input"
                    placeholder="e.g., 20% off first order"
                    value={product.offer}
                    onChange={(e) =>
                      setProduct((p) => ({ ...p, offer: e.target.value }))
                    }
                  />
                </div>
              </div>

              {/* Product URL */}
              <div className="gen-mb-20">
                <label className="gen-label">Product URL <span style={{ color: "#6e7681", fontWeight: 400, textTransform: "none" }}>(optional)</span></label>
                <input
                  className="gen-input"
                  placeholder="https://yourbrand.com/products/your-product"
                  value={product.productUrl}
                  onChange={(e) =>
                    setProduct((p) => ({ ...p, productUrl: e.target.value }))
                  }
                />
              </div>

              {/* Key Ingredients / Features */}
              <div className="gen-mb-20">
                <label className="gen-label">Key Ingredients / Features <span style={{ color: "#6e7681", fontWeight: 400, textTransform: "none" }}>(optional)</span></label>
                <input
                  className="gen-input"
                  placeholder="e.g., Vitamin C, Hyaluronic Acid, Niacinamide, SPF 30"
                  value={product.ingredientsFeatures}
                  onChange={(e) =>
                    setProduct((p) => ({ ...p, ingredientsFeatures: e.target.value }))
                  }
                />
                <div style={{ fontSize: 11, color: "#6e7681", marginTop: 4 }}>
                  Separate with commas. Used for ingredient spotlight and feature pointer ads.
                </div>
              </div>

              {/* Before / After Description */}
              <div className="gen-mb-20">
                <label className="gen-label">Before / After Description <span style={{ color: "#6e7681", fontWeight: 400, textTransform: "none" }}>(optional)</span></label>
                <div style={{ fontSize: 11, color: "#6e7681", marginBottom: 8 }}>
                  For transformation-style ads. Describe the problem state and the result after using your product.
                </div>
                <div className="gen-grid-2">
                  <div>
                    <label className="gen-label" style={{ fontSize: 11 }}>Before (Problem)</label>
                    <textarea
                      className="gen-input"
                      style={{ height: 80, resize: "none" }}
                      placeholder='e.g., Dull, uneven skin tone with visible dark spots'
                      value={product.beforeDescription}
                      onChange={(e) =>
                        setProduct((p) => ({ ...p, beforeDescription: e.target.value }))
                      }
                    />
                  </div>
                  <div>
                    <label className="gen-label" style={{ fontSize: 11 }}>After (Result)</label>
                    <textarea
                      className="gen-input"
                      style={{ height: 80, resize: "none" }}
                      placeholder='e.g., Radiant, glowing complexion with reduced dark spots'
                      value={product.afterDescription}
                      onChange={(e) =>
                        setProduct((p) => ({ ...p, afterDescription: e.target.value }))
                      }
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="gen-nav">
              <button className="gen-btn-back" onClick={() => setStep(0)}>
                ← Back
              </button>
              <button
                className="gen-btn-next"
                onClick={handleProductNext}
                disabled={isLoading}
              >
                {isLoading ? "Creating..." : "Next: Choose Concept →"}
              </button>
            </div>
          </div>
        )}

        {/* ══════ STEP 2: CONCEPT ══════ */}
        {step === 2 && (
          <div style={{ animation: "fadeIn 0.4s ease" }}>
            <div className="gen-card__title">Choose Your Ad Concept</div>
            <div className="gen-card__desc">
              Select a template style. The AI will generate your ad in this
              format.
            </div>

            <div className="gen-concept-filter">
              <button
                className={`gen-concept-filter-btn ${
                  conceptFilter === "All"
                    ? "gen-concept-filter-btn--active"
                    : ""
                }`}
                onClick={() => setConceptFilter("All")}
              >
                All
              </button>
              {conceptCategories.map((cat) => (
                <button
                  key={cat._id}
                  className={`gen-concept-filter-btn ${
                    conceptFilter === cat._id
                      ? "gen-concept-filter-btn--active"
                      : ""
                  }`}
                  onClick={() => setConceptFilter(cat._id)}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            <div className="gen-concepts-grid">
              {filteredConcepts.map((concept) => (
                <div
                  key={concept._id}
                  className={`gen-concept-card ${
                    selectedConcept === concept._id
                      ? "gen-concept-card--selected"
                      : ""
                  }`}
                  onClick={() => setSelectedConcept(concept._id)}
                >
                  <div
                    className="gen-concept-card__preview"
                    style={{
                      backgroundImage: `url(${resolveImageUrl(
                        concept.image_url,
                      )})`,
                      backgroundSize: "cover",
                    }}
                  >
                    <div className="gen-concept-card__placeholder">▣</div>
                    {concept.usage_count > 100 && (
                      <div className="gen-concept-card__popular">POPULAR</div>
                    )}
                    {selectedConcept === concept._id && (
                      <div className="gen-concept-card__check">✓</div>
                    )}
                  </div>
                  <div className="gen-concept-card__info">
                    <div className="gen-concept-card__name">
                      {concept.category_name || concept.name}
                    </div>
                    <div className="gen-concept-card__uses">
                      {concept.usage_count} uses
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="gen-nav">
              <button className="gen-btn-back" onClick={() => setStep(1)}>
                ← Back
              </button>
              <button
                className="gen-btn-next"
                disabled={!selectedConcept}
                onClick={() => {
                  if (selectedConcept) setStep(3);
                }}
              >
                Next: Add Notes →
              </button>
            </div>
          </div>
        )}

        {/* ══════ STEP 3: NOTES ══════ */}
        {step === 3 && (
          <div style={{ animation: "fadeIn 0.4s ease" }}>
            <div className="gen-card">
              <div className="gen-card__title">Important Notes</div>
              <div className="gen-card__desc">
                Any special instructions for the AI? This is optional but helps
                fine-tune your results.
              </div>

              <textarea
                className="gen-textarea"
                style={{ height: 160, fontSize: 15, lineHeight: 1.6 }}
                placeholder={`Examples: \n• "Make sure the ad mentions the color blue"\n• "Use a dark, moody background"\n• "Target audience is men 30-50 who play golf"\n• "Ad should feel premium and luxurious"`}
                maxLength={2000}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
              <div className="gen-char-count">{notes.length}/2000</div>

              <div className="gen-summary">
                <div className="gen-summary__title">GENERATION SUMMARY</div>
                <div className="gen-summary__grid">
                  {[
                    { label: "Brand", value: brand.name || "Not set" },
                    { label: "Product", value: product.name || "Not set" },
                    {
                      label: "Concept",
                      value: selectedConcept
                        ? concepts.find((c) => c._id === selectedConcept)
                            ?.category_name ||
                          concepts.find((c) => c._id === selectedConcept)?.name
                        : "Not selected",
                    },
                    { label: "Credit Cost", value: "5 credits (6 variations)" },
                  ].map(({ label, value }) => (
                    <div key={label} className="gen-summary__row">
                      <span className="gen-summary__label">{label}</span>
                      <span className="gen-summary__value">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="gen-nav">
              <button className="gen-btn-back" onClick={() => setStep(2)}>
                ← Back
              </button>
              <button className="gen-btn-generate" onClick={startGeneration}>
                ⚡ Generate Ads
              </button>
            </div>
          </div>
        )}

        {/* ══════ STEP 4: GENERATING ══════ */}
        {step === 4 && (
          <div style={{ animation: "fadeIn 0.4s ease" }}>
            {isAnalyzing ? (
              <div className="gen-analyzing">
                {/* Progress circle with percentage */}
                <div
                  style={{
                    position: "relative",
                    width: 120,
                    height: 120,
                    margin: "0 auto 20px",
                  }}
                >
                  <svg
                    width="120"
                    height="120"
                    viewBox="0 0 120 120"
                    style={{ transform: "rotate(-90deg)" }}
                  >
                    <circle
                      cx="60"
                      cy="60"
                      r="54"
                      fill="none"
                      stroke="rgba(255,255,255,0.05)"
                      strokeWidth="8"
                    />
                    <circle
                      cx="60"
                      cy="60"
                      r="54"
                      fill="none"
                      stroke="url(#analyzeGrad)"
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 54}`}
                      strokeDashoffset={`${
                        2 * Math.PI * 54 * (1 - displayPercent / 100)
                      }`}
                      style={{ transition: "stroke-dashoffset 0.3s ease" }}
                    />
                    <defs>
                      <linearGradient
                        id="analyzeGrad"
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="100%"
                      >
                        <stop offset="0%" stopColor="#3B82F6" />
                        <stop offset="100%" stopColor="#3ECFCF" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <span
                      style={{
                        fontSize: 28,
                        fontWeight: 700,
                        color: "#fff",
                        fontVariantNumeric: "tabular-nums",
                      }}
                    >
                      {displayPercent}%
                    </span>
                  </div>
                </div>
                <h2 className="gen-analyzing__title">
                  {analyzingSteps[analyzingStep]}...
                </h2>
                <p className="gen-analyzing__desc">
                  Our AI is studying your brand, product, and concept to craft
                  the perfect ad variations.
                </p>
                {/* Progress bar */}
                <div
                  style={{
                    width: "100%",
                    maxWidth: 400,
                    margin: "16px auto 0",
                  }}
                >
                  <div
                    style={{
                      height: 6,
                      background: "rgba(255,255,255,0.06)",
                      borderRadius: 3,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        borderRadius: 3,
                        background: "linear-gradient(90deg, #3B82F6, #3ECFCF)",
                        width: `${displayPercent}%`,
                        transition: "width 0.3s ease",
                      }}
                    />
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginTop: 6,
                      fontSize: 11,
                      color: "#6B7194",
                    }}
                  >
                    <span>{displayPercent}% complete</span>
                    <span>Preparing ad copy...</span>
                  </div>
                </div>
                <div className="gen-analyzing__steps">
                  {analyzingSteps.map((label, idx) => (
                    <div
                      key={idx}
                      className={`gen-analyzing__step ${
                        idx <= analyzingStep
                          ? "gen-analyzing__step--active"
                          : ""
                      } ${
                        idx < analyzingStep ? "gen-analyzing__step--done" : ""
                      }`}
                    >
                      {idx < analyzingStep ? "\u2713 " : ""}
                      {label}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <>
                <div className="gen-progress-title">
                  <h2>Generating Your Ads</h2>
                  <p style={{ fontVariantNumeric: "tabular-nums" }}>
                    {completedAds.filter(Boolean).length} of 6 variations
                    complete &middot;{" "}
                    {displayPercent}%
                  </p>
                  <div className="gen-progress-bar">
                    <div
                      className="gen-progress-bar__fill"
                      style={{
                        width: `${displayPercent}%`,
                        transition: "width 0.5s ease",
                      }}
                    />
                  </div>
                  {socketMessage && socketPercent > 0 && socketPercent < 100 && (
                    <p style={{
                      fontSize: 12,
                      color: "rgba(255,255,255,0.45)",
                      marginTop: 6,
                      fontVariantNumeric: "tabular-nums",
                    }}>
                      {socketMessage}
                    </p>
                  )}
                </div>

                <div className="gen-ad-grid">
                  {Array.from({ length: 6 }).map((_, i) => {
                    const result = generatedResults[i];
                    const isCompleted = completedAds[i];
                    const isGenerating = generatingAds[i];
                    const hasImage = result?.image_url_1x1;

                    return (
                      <div
                        key={result?._id || `slot-${i}`}
                        className={`gen-ad-card ${
                          isCompleted ? "gen-ad-card--complete" : ""
                        }`}
                        style={{
                          animation:
                            isCompleted && hasImage
                              ? "cardReveal 0.5s ease"
                              : undefined,
                        }}
                      >
                        <div
                          className="gen-ad-card__preview"
                          style={{
                            height: 280,
                            position: "relative",
                            overflow: "hidden",
                          }}
                        >
                          {isCompleted && hasImage ? (
                            <>
                              <img
                                src={result.image_url_1x1!}
                                alt={result?.ad_name || `Variation ${i + 1}`}
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "cover",
                                  borderRadius: 12,
                                }}
                              />
                              <div
                                className="gen-ad-card__overlay"
                                onClick={() =>
                                  setLightboxImage(result.image_url_1x1)
                                }
                              >
                                <div className="gen-ad-card__eye">👁</div>
                              </div>
                            </>
                          ) : isCompleted && !hasImage ? (
                            <div
                              className="gen-ad-card__failed"
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                justifyContent: "center",
                                height: "100%",
                              }}
                            >
                              <div style={{ fontSize: 28, marginBottom: 8 }}>
                                ⚠️
                              </div>
                              <div
                                style={{ fontSize: 13, color: "var(--muted)" }}
                              >
                                Image not available
                              </div>
                              <div
                                style={{
                                  fontSize: 11,
                                  color: "var(--dim)",
                                  marginTop: 4,
                                }}
                              >
                                Generation failed for this variation
                              </div>
                            </div>
                          ) : (
                            <div className="gen-ad-card__skeleton">
                              <div className="gen-ad-card__skeleton-shimmer" />
                              <div className="gen-ad-card__skeleton-content">
                                <div
                                  className="gen-loading-spinner"
                                  style={{
                                    width: 32,
                                    height: 32,
                                    borderWidth: 2,
                                  }}
                                />
                                <div
                                  style={{
                                    fontSize: 12,
                                    color: "var(--dim)",
                                    marginTop: 10,
                                  }}
                                >
                                  Variation {i + 1}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                        {isCompleted && result?.ad_copy_json && (
                          <div
                            style={{ padding: "10px 12px 8px", fontSize: 13 }}
                          >
                            <div
                              style={{
                                fontWeight: 700,
                                color: "#e6f1ff",
                                marginBottom: 2,
                              }}
                            >
                              {result.ad_copy_json.headline}
                            </div>
                            <div style={{ color: "#8892b0", fontSize: 11 }}>
                              {result.ad_copy_json.subheadline}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}

        {/* ══════ STEP 5: RESULTS ══════ */}
        {step === 5 && (
          <div style={{ animation: "fadeIn 0.4s ease" }}>
            <div className="gen-results-header">
              <div>
                <h2>Your Ad Variations</h2>
                <p>
                  {generatedResults.length} variation(s) generated · 5 credits
                  used
                </p>
              </div>
              <button
                className="gen-results-regen"
                onClick={() => {
                  setStep(4);
                  startGeneration();
                }}
              >
                🔄 Regenerate All (5 credits)
              </button>
            </div>

            <div className="gen-ad-grid">
              {generatedResults.length > 0 ? (
                generatedResults.map((result, i) => (
                  <div
                    key={result._id}
                    className={`gen-ad-card ${
                      savedAds[i] ? "gen-ad-card--saved" : ""
                    }`}
                  >
                    <div
                      className="gen-ad-card__preview"
                      style={{
                        height: 280,
                        position: "relative",
                        overflow: "hidden",
                      }}
                    >
                      {result.image_url_1x1 ? (
                        <img
                          src={result.image_url_1x1}
                          alt={result.ad_name || `Variation ${i + 1} `}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            borderRadius: 12,
                          }}
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display =
                              "none";
                            const next = (e.target as HTMLImageElement)
                              .nextElementSibling as HTMLElement;
                            if (next) next.style.display = "flex";
                          }}
                        />
                      ) : null}
                      {!result.image_url_1x1 && (
                        <div
                          style={{
                            background: `linear-gradient(135deg, ${
                              AD_COLORS[i % 6]
                            }dd, ${AD_COLORS[(i + 3) % 6]}aa)`,
                            width: "100%",
                            height: "100%",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            borderRadius: 12,
                            gap: 10,
                          }}
                        >
                          <div style={{ fontSize: 32, opacity: 0.5 }}>⚠️</div>
                          <div style={{ fontSize: 14, opacity: 0.7 }}>
                            Image not available
                          </div>
                          <button
                            className="gen-ad-btn"
                            style={{
                              marginTop: 4,
                              padding: "6px 16px",
                              fontSize: 12,
                            }}
                            onClick={async () => {
                              if (!result._id) return;
                              try {
                                toast.loading("Retrying generation...", {
                                  id: "retry",
                                });
                                await regenerateSingleRequest(result._id);
                                toast.success(
                                  "Retry started! (2 credits used)",
                                  { id: "retry" },
                                );
                              } catch (e: any) {
                                toast.error(e.message || "Retry failed", {
                                  id: "retry",
                                });
                              }
                            }}
                          >
                            Retry (2 credits)
                          </button>
                        </div>
                      )}
                      {savedAds[i] && (
                        <div className="gen-ad-card__saved-badge">SAVED</div>
                      )}
                      {result.image_url_1x1 && (
                        <div
                          className="gen-ad-card__overlay"
                          onClick={() => setLightboxImage(result.image_url_1x1)}
                        >
                          <div className="gen-ad-card__eye">👁</div>
                        </div>
                      )}
                    </div>

                    {/* Ad copy info */}
                    {result.ad_copy_json && (
                      <div style={{ padding: "10px 12px 4px", fontSize: 13 }}>
                        <div
                          style={{
                            fontWeight: 700,
                            color: "#e6f1ff",
                            marginBottom: 4,
                          }}
                        >
                          {result.ad_copy_json.headline}
                        </div>
                        <div style={{ color: "#8892b0", fontSize: 11 }}>
                          {result.ad_copy_json.subheadline}
                        </div>
                      </div>
                    )}

                    <div className="gen-ad-card__actions-full">
                      <div style={{ display: "flex", gap: 6 }}>
                        <button
                          className="gen-ad-btn"
                          onClick={async () => {
                            if (!result._id) return;
                            const desc = prompt(
                              "Describe the issue (optional):",
                            );
                            try {
                              toast.loading("Fixing errors...", { id: "fix" });
                              await fixErrorRequest(result._id, desc || "");
                              toast.success("Fix started! (2 credits used)", {
                                id: "fix",
                              });
                            } catch (e: any) {
                              toast.error(e.message || "Fix failed", {
                                id: "fix",
                              });
                            }
                          }}
                        >
                          Fix Errors
                        </button>
                        <button
                          className="gen-ad-btn"
                          onClick={async () => {
                            if (!result._id) return;
                            try {
                              toast.loading("Regenerating...", { id: "redo" });
                              await regenerateSingleRequest(result._id);
                              toast.success("Redo started! (2 credits used)", {
                                id: "redo",
                              });
                            } catch (e: any) {
                              toast.error(e.message || "Redo failed", {
                                id: "redo",
                              });
                            }
                          }}
                        >
                          ↻ Redo
                        </button>
                        <button
                          className="gen-ad-btn"
                          onClick={async () => {
                            if (!result._id) return;
                            try {
                              await downloadAdImage(
                                result._id,
                                `${result.ad_name || "ad"}_1x1.png`,
                              );
                            } catch {
                              // Fallback: open image in new tab
                              if (result.image_url_1x1)
                                window.open(result.image_url_1x1, "_blank");
                            }
                          }}
                        >
                          ⤓ Download
                        </button>
                      </div>

                      {!savedAds[i] ? (
                        <button
                          className="gen-ad-btn--save"
                          onClick={() =>
                            setSavedAds((prev) => {
                              const n = [...prev];
                              n[i] = true;
                              return n;
                            })
                          }
                        >
                          Save Ad
                        </button>
                      ) : (
                        <div style={{ display: "flex", gap: 6 }}>
                          <button
                            className="gen-ad-btn--ratio"
                            disabled={ratioModalLoading}
                            onClick={async () => {
                              if (!result._id) return;
                              setRatioModalLoading(true);
                              try {
                                const data = await exportRatiosRequest(
                                  result._id,
                                );
                                setRatioModal({
                                  adId: data._id,
                                  adName: data.ad_name,
                                  image_url_1x1: data.image_url_1x1,
                                  image_url_9x16: data.image_url_9x16,
                                  image_url_16x9: data.image_url_16x9,
                                });
                              } catch (e: any) {
                                toast.error(
                                  e.message || "Failed to load ratios",
                                );
                              } finally {
                                setRatioModalLoading(false);
                              }
                            }}
                          >
                            {ratioModalLoading
                              ? "Loading..."
                              : "Get All Ratios"}
                          </button>
                          <button
                            className="gen-ad-btn--canva"
                            onClick={async () => {
                              if (!result._id) return;
                              try {
                                toast.loading("Redirecting to checkout...", {
                                  id: "canva",
                                });
                                const data = await createCanvaCheckoutRequest(
                                  result._id,
                                );
                                if (data.checkout_url) {
                                  window.location.href = data.checkout_url;
                                }
                              } catch (e: any) {
                                toast.error(e.message || "Checkout failed", {
                                  id: "canva",
                                });
                              }
                            }}
                          >
                            Buy Canva Template
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div
                  style={{
                    gridColumn: "1 / -1",
                    textAlign: "center",
                    padding: 60,
                  }}
                >
                  <p style={{ color: "#8892b0" }}>
                    No results yet. Generate some ads first!
                  </p>
                </div>
              )}
            </div>

            <div className="gen-results-footer">
              <span>Not what you&apos;re looking for? </span>
              <button onClick={() => setStep(3)}>
                Edit notes &amp; regenerate
              </button>
              <span> or </span>
              <button onClick={() => setStep(2)}>
                try a different concept
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ===== LIGHTBOX ===== */}
      {lightboxImage && (
        <div className="gen-lightbox" onClick={() => setLightboxImage(null)}>
          <div
            className="gen-lightbox__close"
            onClick={() => setLightboxImage(null)}
          >
            ×
          </div>
          <img
            src={lightboxImage}
            className="gen-lightbox__content"
            alt="Full view"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* ===== RATIO MODAL ===== */}
      {ratioModal && (
        <div className="gen-lightbox" onClick={() => setRatioModal(null)}>
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#0d1117",
              border: "1px solid #30363d",
              borderRadius: 12,
              padding: 28,
              maxWidth: 900,
              width: "95%",
              position: "relative",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            <div
              className="gen-lightbox__close"
              onClick={() => setRatioModal(null)}
            >
              ×
            </div>
            <h3 style={{ color: "#e6edf3", marginBottom: 4, fontSize: 18 }}>
              All Ratios — {ratioModal.adName || "Ad"}
            </h3>
            <p style={{ color: "#8b949e", marginBottom: 20, fontSize: 13 }}>
              Preview and export for every platform
            </p>

            {/* Download All ZIP button */}
            <div style={{ marginBottom: 24 }}>
              <button
                onClick={downloadAllAsZip}
                disabled={zipDownloading}
                style={{
                  background: zipDownloading
                    ? "#30363d"
                    : "linear-gradient(135deg, #3ECFCF, #3B82F6)",
                  color: "#fff",
                  border: "none",
                  borderRadius: 8,
                  padding: "10px 22px",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: zipDownloading ? "not-allowed" : "pointer",
                  opacity: zipDownloading ? 0.7 : 1,
                }}
              >
                {zipDownloading ? "⏳ Creating ZIP..." : "⤓ Download All (ZIP)"}
              </button>
              <span style={{ color: "#6e7681", fontSize: 12, marginLeft: 12 }}>
                All 3 formats in one file
              </span>
            </div>

            {/* 3 Ratio Comparison View */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 16,
                marginBottom: 24,
              }}
            >
              {[
                {
                  label: "1:1",
                  sublabel: "Instagram / Facebook",
                  ratio: "1x1",
                  url: ratioModal.image_url_1x1,
                  size: "1080×1080",
                  aspect: "1/1",
                },
                {
                  label: "9:16",
                  sublabel: "Stories / Reels / TikTok",
                  ratio: "9x16",
                  url: ratioModal.image_url_9x16,
                  size: "1080×1920",
                  aspect: "9/16",
                },
                {
                  label: "16:9",
                  sublabel: "YouTube / LinkedIn",
                  ratio: "16x9",
                  url: ratioModal.image_url_16x9,
                  size: "1920×1080",
                  aspect: "16/9",
                },
              ].map(({ label, sublabel, ratio, url, size, aspect }) => (
                <div
                  key={ratio}
                  style={{
                    background: "#161b22",
                    border: "1px solid #21262d",
                    borderRadius: 10,
                    overflow: "hidden",
                  }}
                >
                  {/* Thumbnail preview */}
                  <div
                    style={{
                      position: "relative",
                      background: "#0d1117",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "12px",
                      minHeight: 140,
                    }}
                  >
                    {url ? (
                      <img
                        src={url}
                        alt={`${label} preview`}
                        style={{
                          maxWidth: "100%",
                          maxHeight: 180,
                          objectFit: "contain",
                          borderRadius: 6,
                          cursor: "pointer",
                        }}
                        onClick={() => setLightboxImage(url)}
                      />
                    ) : (
                      <div
                        style={{
                          color: "#6e7681",
                          fontSize: 12,
                          textAlign: "center",
                        }}
                      >
                        <div style={{ fontSize: 28, marginBottom: 6 }}>🖼</div>
                        Not generated
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div style={{ padding: "10px 12px 6px" }}>
                    <div
                      style={{
                        color: "#e6edf3",
                        fontSize: 13,
                        fontWeight: 600,
                      }}
                    >
                      {label}
                    </div>
                    <div
                      style={{
                        color: "#8b949e",
                        fontSize: 11,
                        marginBottom: 4,
                      }}
                    >
                      {sublabel}
                    </div>
                    <div
                      style={{
                        color: "#6e7681",
                        fontSize: 11,
                        fontFamily: "monospace",
                      }}
                    >
                      {size}
                    </div>
                  </div>

                  {/* Download buttons */}
                  {url ? (
                    <div
                      style={{
                        padding: "6px 12px 12px",
                        display: "flex",
                        gap: 6,
                        flexWrap: "wrap",
                      }}
                    >
                      <button
                        onClick={async () => {
                          const blob = await fetchRatioBlob(
                            ratioModal.adId,
                            ratio,
                          );
                          if (!blob) return;
                          const blobUrl = URL.createObjectURL(blob);
                          const a = document.createElement("a");
                          a.href = blobUrl;
                          a.download = `${(ratioModal.adName || "ad").replace(
                            /[^a-zA-Z0-9_-]/g,
                            "_",
                          )}_${ratio}.png`;
                          document.body.appendChild(a);
                          a.click();
                          document.body.removeChild(a);
                          URL.revokeObjectURL(blobUrl);
                        }}
                        style={{
                          flex: 1,
                          background: "#238636",
                          color: "#fff",
                          border: "none",
                          borderRadius: 5,
                          padding: "5px 0",
                          fontSize: 12,
                          cursor: "pointer",
                        }}
                      >
                        PNG
                      </button>
                      <button
                        onClick={() =>
                          downloadAsJpg(
                            ratioModal.adId,
                            ratio,
                            ratioModal.adName,
                          )
                        }
                        style={{
                          flex: 1,
                          background: "#1f6feb",
                          color: "#fff",
                          border: "none",
                          borderRadius: 5,
                          padding: "5px 0",
                          fontSize: 12,
                          cursor: "pointer",
                        }}
                      >
                        JPG 85%
                      </button>
                      <button
                        onClick={() =>
                          downloadAs2x(
                            ratioModal.adId,
                            ratio,
                            ratioModal.adName,
                          )
                        }
                        style={{
                          flex: 1,
                          background: "#6e40c9",
                          color: "#fff",
                          border: "none",
                          borderRadius: 5,
                          padding: "5px 0",
                          fontSize: 12,
                          cursor: "pointer",
                        }}
                      >
                        @2x
                      </button>
                    </div>
                  ) : (
                    <div style={{ padding: "6px 12px 12px" }}>
                      <span style={{ color: "#6e7681", fontSize: 12 }}>
                        Not available
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function GeneratePage() {
  return (
    <AuthGuard>
      <GeneratePageContent />
    </AuthGuard>
  );
}
