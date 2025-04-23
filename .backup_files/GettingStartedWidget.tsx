'use client'

import { CheckCircle2, Circle } from 'lucide-react'

type OnboardingItem = {
  id: number;
  text: string;
  completed: boolean;
}

const GettingStartedWidget = () => {
  // Use mock data directly
  const checklistItems: OnboardingItem[] = [
    { id: 1, text: 'Connect your first account', completed: true },
    { id: 2, text: 'Set up your first budget', completed: true },
    { id: 3, text: 'Create a savings goal', completed: false },
    { id: 4, text: 'Set up your first recurring expense', completed: false },
    { id: 5, text: 'Link your investment accounts', completed: false },
  ];

  const completedCount = checklistItems.filter(item => item.completed).length;
  const progress = (completedCount / checklistItems.length) * 100;

  return (
    <div className="bg-[#F5F5F5] rounded-lg shadow-sm p-6 w-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-[#1F3A93]">Getting Started</h2>
        <span className="text-sm text-[#4A4A4A]">{completedCount}/{checklistItems.length} completed</span>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2 bg-gray-100 rounded-full mb-6">
        <div 
          className="h-2 bg-[#FFC857] rounded-full"
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      {/* Checklist */}
      <ul className="space-y-3">
        {checklistItems.map((item: OnboardingItem) => (
          <li key={item.id} className="flex items-start">
            {item.completed ? (
              <CheckCircle2 className="h-5 w-5 text-[#FFC857] mr-3 flex-shrink-0 mt-0.5" />
            ) : (
              <Circle className="h-5 w-5 text-gray-300 mr-3 flex-shrink-0 mt-0.5" />
            )}
            <span className={`text-sm ${item.completed ? 'text-[#4A4A4A] line-through' : 'text-[#4A4A4A]'}`}>
              {item.text}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default GettingStartedWidget 