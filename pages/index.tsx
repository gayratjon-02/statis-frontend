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

const CONCEPTS = [
  { id: 1, name: "Feature Pointers" },
  { id: 2, name: "Testimonial" },
  { id: 3, name: "Before & After" },
  { id: 4, name: "Us vs Them" },
  { id: 5, name: "Lifestyle" },
  { id: 6, name: "Stat Callout" },
  { id: 7, name: "Social Proof" },
  { id: 8, name: "Offer / Promo" },
  { id: 9, name: "Problem → Solution" },
  { id: 10, name: "Comparison Chart" },
  { id: 11, name: "Ingredient Spotlight" },
];

export default function Home() {
  const { member, logout } = useAuth();
  const [activeStep, setActiveStep] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [selectedBrandName, setSelectedBrandName] = useState("");
  const [selectedConcept, setSelectedConcept] = useState<number | null>(null);
  const [productName, setProductName] = useState("");
  const [refreshBrands, setRefreshBrands] = useState(0);

  // Name lookups for summary
  const conceptName = CONCEPTS.find((c) => c.id === selectedConcept)?.name || "";

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

  // Stepper navigation guard
  const handleStepClick = (stepNumber: number) => {
    if (stepNumber <= 3 || selectedBrand) {
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

      <Stepper activeStep={activeStep} onStepClick={handleStepClick} />

      <div className="content">
        {activeStep === 1 && (
          <BrandStep
            selectedBrand={selectedBrand}
            onBrandSelect={handleBrandSelect}
            onCreateNew={() => setShowModal(true)}
            refreshTrigger={refreshBrands}
          />
        )}

        {activeStep === 2 && (
          <ProductStep
            onBack={() => setActiveStep(1)}
            onNext={() => setActiveStep(3)}
          />
        )}

        {activeStep === 3 && (
          <ConceptStep
            onBack={() => setActiveStep(2)}
            onNext={() => setActiveStep(4)}
            selectedConcept={selectedConcept}
            onSelectConcept={(id) => setSelectedConcept(id)}
          />
        )}

        {activeStep === 4 && (
          <NotesStep
            onBack={() => setActiveStep(3)}
            onGenerate={() => setActiveStep(5)}
            brandName={selectedBrandName}
            productName={productName || "Not set"}
            conceptName={conceptName}
          />
        )}

        {activeStep === 5 && (
          <GenerateStep
            onEditNotes={() => setActiveStep(4)}
            onTryConcept={() => setActiveStep(3)}
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
