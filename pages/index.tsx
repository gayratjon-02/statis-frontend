import React, { useState, useEffect } from "react";
import Navbar from "../libs/components/homepage/Navbar/Navbar";
import Stepper from "../libs/components/homepage/Stepper/Stepper";
import BrandStep from "../libs/components/homepage/BrandStep/BrandStep";
import ProductStep from "../libs/components/homepage/ProductStep/ProductStep";
import ConceptStep from "../libs/components/homepage/ConceptStep/ConceptStep";
import NotesStep from "../libs/components/homepage/NotesStep/NotesStep";
import GenerateStep from "../libs/components/homepage/GenerateStep/GenerateStep";
import CreateBrandModal from "../libs/components/homepage/CreateBrandModal/CreateBrandModal";
import { useAuth } from "../libs/hooks/useAuth";
import type { Brand } from "../libs/types/brand.type";
import type { Product } from "../libs/types/product.type";
import type { AdConcept } from "../libs/types/concept.type";

export default function Home() {
  const { member, logout } = useAuth();
  const [activeStep, setActiveStep] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [selectedBrandName, setSelectedBrandName] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedConcept, setSelectedConcept] = useState<AdConcept | null>(null);
  const [productName, setProductName] = useState("");
  const [importantNotes, setImportantNotes] = useState<string | null>(null);
  const [refreshBrands, setRefreshBrands] = useState(0);

  // Name lookups for summary
  const conceptName = selectedConcept?.name || "";

  // Determine highest completed step
  // Step 1 complete = brand selected
  // Step 2 complete = product created
  // Step 3 complete = concept selected
  // Step 4 complete = notes passed (auto-complete on reaching step 4)
  const completedSteps = (() => {
    if (importantNotes !== null) return 4;
    if (selectedConcept) return 3;
    if (selectedProduct) return 2;
    if (selectedBrand) return 1;
    return 0;
  })();

  // Credits Calculation
  const creditsLimit = (member?.credits_limit || 0) + (member?.addon_credits_remaining || 0);
  const creditsUsed = member?.credits_used || 0;
  const credits = Math.max(0, creditsLimit - creditsUsed);
  const maxCredits = creditsLimit > 0 ? creditsLimit : 50;

  // User Initial
  const userInitial = member?.full_name ? member.full_name.charAt(0).toUpperCase() : "U";

  // Theme
  const toggleTheme = () => {
    setIsDark((prev) => {
      const next = !prev;
      document.documentElement.setAttribute("data-theme", next ? "dark" : "light");
      return next;
    });
  };

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light");
  }, []);

  // Brand selection
  const handleBrandSelect = (brandId: string) => {
    setSelectedBrand(brandId);
    setActiveStep(2);
  };

  // Brand created via modal — auto-select and advance
  const handleBrandCreated = (brand: Brand) => {
    setSelectedBrand(brand._id);
    setSelectedBrandName(brand.name);
    setRefreshBrands((prev) => prev + 1);
    setActiveStep(2);
  };

  // Stepper navigation guard — strict step-by-step
  const handleStepClick = (stepNumber: number) => {
    // Can only navigate to completed steps or the next unlocked step
    if (stepNumber <= completedSteps + 1) {
      setActiveStep(stepNumber);
    }
  };

  return (
    <div className="home-page">
      <Navbar
        isDark={isDark}
        toggleTheme={toggleTheme}
        credits={credits}
        maxCredits={maxCredits}
        member={member}
        onLogout={logout}
      />

      <Stepper activeStep={activeStep} completedSteps={completedSteps} onStepClick={handleStepClick} />

      <div className="content">
        {activeStep === 1 && (
          <BrandStep
            selectedBrand={selectedBrand}
            onBrandSelect={handleBrandSelect}
            onCreateNew={() => setShowModal(true)}
            refreshTrigger={refreshBrands}
          />
        )}

        {activeStep === 2 && selectedBrand && (
          <ProductStep
            brandId={selectedBrand}
            onBack={() => setActiveStep(1)}
            onNext={(product: Product) => {
              setSelectedProduct(product);
              setProductName(product.name);
              setActiveStep(3);
            }}
          />
        )}

        {activeStep === 3 && (
          <ConceptStep
            onBack={() => setActiveStep(2)}
            onNext={() => setActiveStep(4)}
            selectedConcept={selectedConcept}
            onSelectConcept={(concept: AdConcept) => setSelectedConcept(concept)}
          />
        )}

        {activeStep === 4 && (
          <NotesStep
            onBack={() => setActiveStep(3)}
            onGenerate={(notes: string) => {
              setImportantNotes(notes);
              setActiveStep(5);
            }}
            brandName={selectedBrandName}
            productName={productName || "Not set"}
            conceptName={conceptName}
          />
        )}

        {activeStep === 5 && selectedBrand && selectedProduct && selectedConcept && (
          <GenerateStep
            onEditNotes={() => setActiveStep(4)}
            onTryConcept={() => setActiveStep(3)}
            brandId={selectedBrand}
            productId={selectedProduct._id}
            conceptId={selectedConcept._id}
            importantNotes={importantNotes || ""}
          />
        )}
      </div>

      {/* Footer icon */}
      <div className="footer-icon">?</div>

      <CreateBrandModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onBrandCreated={handleBrandCreated}
      />
    </div>
  );
}
