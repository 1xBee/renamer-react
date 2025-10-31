// ===== components/OnboardingModal.jsx =====
import React from 'react';
import { useFileRenamer } from '../context/FileRenamerContext';

export default function OnboardingModal() {
  const { onboarding, setOnboarding } = useFileRenamer();

  if (!onboarding.visible) return null;

  const steps = [
    {
      title: "Welcome to AI File Renamer Pro! 🎉",
      content: "Automatically rename your files using AI. Let's walk through the key features.",
      icon: "🚀"
    },
    {
      title: "1. Configure Your AI",
      content: "Choose your AI model and add your API key. Gemini Flash is fast and affordable, while Pro is more accurate for complex files.",
      icon: "🤖"
    },
    {
      title: "2. Select Your Files",
      content: "Click the drop zone or drag a folder to load your files. We support PDFs, images, and documents.",
      icon: "📁"
    },
    {
      title: "3. Create a Prompt",
      content: "Use a template or write custom instructions. Tell the AI what information to extract and how to format filenames.",
      icon: "✏️"
    },
    {
      title: "4. Process & Rename",
      content: "Click Process to generate new names. Review them, then click Rename Files to apply changes.",
      icon: "✨"
    }
  ];

  const nextStep = () => {
    if (onboarding.currentStep < steps.length - 1) {
      setOnboarding(prev => ({ ...prev, currentStep: prev.currentStep + 1 }));
    } else {
      setOnboarding({ visible: false, currentStep: 0 });
      localStorage.setItem('hasSeenOnboarding', 'true');
    }
  };

  const skip = () => {
    setOnboarding({ visible: false, currentStep: 0 });
    localStorage.setItem('hasSeenOnboarding', 'true');
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 max-w-lg w-11/12 p-8 rounded-2xl text-center">
        <div className="text-6xl mb-4">{steps[onboarding.currentStep].icon}</div>
        <h3 className="text-2xl font-bold mb-3">{steps[onboarding.currentStep].title}</h3>
        <p className="opacity-70 leading-relaxed mb-6">{steps[onboarding.currentStep].content}</p>
        
        <div className="flex gap-2 justify-center mb-6">
          {steps.map((_, index) => (
            <div key={index} className={`h-2 rounded-full transition-all ${index === onboarding.currentStep ? 'w-6 bg-blue-500' : 'w-2 bg-gray-500'}`} />
          ))}
        </div>
        
        <div className="flex gap-3">
          <button onClick={skip} className="flex-1 px-4 py-2 rounded-lg border border-gray-700 hover:bg-gray-700 transition">
            Skip
          </button>
          <button onClick={nextStep} className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition">
            {onboarding.currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
}