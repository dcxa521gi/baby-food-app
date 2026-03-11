import React from 'react';
import { X, Info } from 'lucide-react';
import { motion } from 'framer-motion';

interface FoodDetail {
  name: string;
  nutrition: string;
  process: string;
}

export function FoodDetailModal({ food, onClose }: { food: FoodDetail, onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 print:hidden" onClick={onClose}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        onClick={e => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden flex flex-col"
      >
        <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between bg-rose-50/50">
          <h2 className="text-lg font-bold text-stone-800 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
            {food.name}
          </h2>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600 p-1.5 rounded-full hover:bg-stone-200 transition-colors">
            <X size={20} />
          </button>
        </div>
        <div className="p-6 space-y-4 bg-white">
          <div className="bg-stone-50 rounded-xl p-4 border border-stone-100">
            <h4 className="text-sm font-semibold text-stone-800 mb-1.5 flex items-center gap-1.5">
              <Info size={16} className="text-rose-500" />
              营养价值
            </h4>
            <p className="text-sm text-stone-600 leading-relaxed">{food.nutrition}</p>
          </div>
          <div className="bg-stone-50 rounded-xl p-4 border border-stone-100">
            <h4 className="text-sm font-semibold text-stone-800 mb-1.5 flex items-center gap-1.5">
              <Info size={16} className="text-blue-600" />
              处理方式
            </h4>
            <p className="text-sm text-stone-600 leading-relaxed">{food.process}</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
