import React from "react";

const STEPS = [
    { number: 1, label: "Brand" },
    { number: 2, label: "Product" },
    { number: 3, label: "Concept" },
    { number: 4, label: "Notes" },
    { number: 5, label: "Generate" },
];

interface StepperProps {
    activeStep: number;
    completedSteps: number; // highest step that has been completed (e.g. 2 = brand + product done)
    onStepClick: (stepNumber: number) => void;
}

export default function Stepper({ activeStep, completedSteps, onStepClick }: StepperProps) {
    return (
        <div className="stepper">
            {STEPS.map((step, idx) => {
                const isActive = activeStep === step.number;
                const isCompleted = step.number <= completedSteps;
                const isUnlocked = step.number <= completedSteps + 1; // can go to next step after last completed

                return (
                    <div className="stepper__step" key={step.number}>
                        <div
                            className={[
                                "stepper__step-content",
                                isActive ? "stepper__step-content--active" : "",
                                isCompleted ? "stepper__step-content--completed" : "",
                                !isUnlocked ? "stepper__step-content--locked" : "",
                            ].filter(Boolean).join(" ")}
                            onClick={() => isUnlocked && onStepClick(step.number)}
                        >
                            <span
                                className={[
                                    "stepper__step-number",
                                    isActive ? "stepper__step-number--active" : "",
                                    isCompleted && !isActive ? "stepper__step-number--completed" : "",
                                    !isUnlocked ? "stepper__step-number--locked" : "",
                                ].filter(Boolean).join(" ")}
                            >
                                {isCompleted && !isActive ? (
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                                        <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                ) : !isUnlocked ? (
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                                        <rect x="5" y="11" width="14" height="11" rx="2" stroke="currentColor" strokeWidth="2" />
                                        <path d="M8 11V7a4 4 0 118 0v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                    </svg>
                                ) : (
                                    step.number
                                )}
                            </span>
                            <span
                                className={[
                                    "stepper__step-label",
                                    isActive ? "stepper__step-label--active" : "",
                                    isCompleted && !isActive ? "stepper__step-label--completed" : "",
                                    !isUnlocked ? "stepper__step-label--locked" : "",
                                ].filter(Boolean).join(" ")}
                            >
                                {step.label}
                            </span>
                        </div>
                        {idx < STEPS.length - 1 && (
                            <div className={`stepper__connector${isCompleted ? " stepper__connector--completed" : ""}`} />
                        )}
                    </div>
                );
            })}
        </div>
    );
}
