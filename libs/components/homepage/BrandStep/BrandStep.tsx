import React from "react";

const BRANDS = [
    { id: 1, name: "Bron", initial: "B" },
    { id: 2, name: "Fairway Fuel", initial: "F" },
];

interface BrandStepProps {
    selectedBrand: number | null;
    onBrandSelect: (brandId: number) => void;
    onCreateNew: () => void;
}

export default function BrandStep({ selectedBrand, onBrandSelect, onCreateNew }: BrandStepProps) {
    return (
        <div className="brand-card">
            <h2 className="brand-card__title">Select an existing brand</h2>
            <div className="brand-card__list">
                {BRANDS.map((brand) => (
                    <div
                        className={`brand-card__item${selectedBrand === brand.id ? " brand-card__item--selected" : ""}`}
                        key={brand.id}
                        onClick={() => onBrandSelect(brand.id)}
                    >
                        <div className="brand-card__item-icon">{brand.initial}</div>
                        <span className="brand-card__item-name">{brand.name}</span>
                    </div>
                ))}
            </div>
            <div className="brand-card__divider" />
            <div className="brand-card__create">
                <button
                    className="brand-card__create-btn"
                    onClick={onCreateNew}
                >
                    or create new +
                </button>
            </div>
        </div>
    );
}
