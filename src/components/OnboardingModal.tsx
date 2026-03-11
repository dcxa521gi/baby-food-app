import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Baby, FileText, BookOpen, Star, ChevronRight, Check } from 'lucide-react';

const steps = [
  {
    title: '欢迎使用辅食表生成器',
    description: '只需几步，即可为您的宝宝生成科学、营养的专属辅食时间表。',
    icon: <Baby size={48} className="text-rose-500" />,
  },
  {
    title: '填写宝宝信息',
    description: '在左侧表单中输入宝宝的月龄、性别、过敏情况等。AI 会根据这些信息量身定制食谱。',
    icon: <FileText size={48} className="text-blue-500" />,
  },
  {
    title: '探索食材库',
    description: '点击右上角的“食材库”，可以查看适合不同月龄的常见食材、营养价值和处理方式。',
    icon: <BookOpen size={48} className="text-orange-500" />,
  },
  {
    title: '收藏与导出',
    description: '生成的食谱可以导出为 PDF、图片或 Excel，还可以点击星星图标收藏，方便日后查阅。',
    icon: <Star size={48} className="text-yellow-500" />,
  }
];

export function OnboardingModal({ onClose }: { onClose: () => void }) {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 print:hidden">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col relative"
      >
        {/* Progress bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-stone-100">
          <motion.div 
            className="h-full bg-rose-500"
            initial={{ width: '0%' }}
            animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        <div className="p-8 flex flex-col items-center text-center space-y-6 mt-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col items-center space-y-6 w-full"
            >
              <div className="w-24 h-24 rounded-full bg-stone-50 flex items-center justify-center shadow-inner border border-stone-100">
                {steps[currentStep].icon}
              </div>
              <div className="space-y-3">
                <h2 className="text-2xl font-bold text-stone-800">{steps[currentStep].title}</h2>
                <p className="text-stone-600 leading-relaxed">
                  {steps[currentStep].description}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="flex items-center justify-between w-full pt-6 mt-2 border-t border-stone-100">
            <div className="flex gap-1.5">
              {steps.map((_, idx) => (
                <div 
                  key={idx} 
                  className={`h-2 rounded-full transition-all duration-300 ${idx === currentStep ? 'w-6 bg-rose-500' : 'w-2 bg-stone-200'}`}
                />
              ))}
            </div>
            
            <button
              onClick={handleNext}
              className="bg-rose-500 hover:bg-rose-600 text-white px-6 py-2.5 rounded-xl font-medium transition-colors flex items-center gap-2 shadow-sm shadow-rose-200"
            >
              {currentStep === steps.length - 1 ? (
                <>开始使用 <Check size={18} /></>
              ) : (
                <>下一步 <ChevronRight size={18} /></>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
