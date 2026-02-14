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
    onStepClick: (stepNumber: number) => void;
}

export default function Stepper({ activeStep, onStepClick }: StepperProps) {
    return (
        <div className="stepper">
            {STEPS.map((step, idx) => (
                <div className="stepper__step" key={step.number}>
                    <div
                        className={`stepper__step-content${activeStep === step.number
                            ? " stepper__step-content--active"
                            : ""
                            }${step.number < activeStep ? " stepper__step-content--completed" : ""}`}
                        onClick={() => onStepClick(step.number)}
                    >
                        <span
                            className={`stepper__step-number${activeStep === step.number
                                ? " stepper__step-number--active"
                                : ""
                                }`}
                        >
                            {step.number}
                        </span>
                        <span
                            className={`stepper__step-label${activeStep === step.number
                                ? " stepper__step-label--active"
                                : ""
                                }`}
                        >
                            {step.label}
                        </span>
                    </div>
                    {idx < STEPS.length - 1 && <div className="stepper__connector" />}
                </div>
            ))}
        </div>
    );
}
