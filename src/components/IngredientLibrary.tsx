import React, { useState } from 'react';
import { X, BookOpen, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { ingredientsData } from '../data/ingredients';

export function IngredientLibrary({ onClose }: { onClose: () => void }) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredIngredients = ingredientsData.map(group => ({
    ...group,
    items: group.items.filter(item => 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.nutrition.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.process.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(group => group.items.length > 0);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 print:hidden">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white rounded-2xl shadow-xl w-full max-w-3xl overflow-hidden max-h-[85vh] flex flex-col"
      >
        <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
          <h2 className="text-xl font-bold text-stone-800 flex items-center gap-2">
            <BookOpen size={22} className="text-rose-500" />
            辅食食材库
          </h2>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600 p-1.5 rounded-full hover:bg-stone-200 transition-colors">
            <X size={20} />
          </button>
        </div>
        <div className="px-6 py-4 border-b border-stone-100 bg-white">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder="搜索食材、营养或处理方式..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-stone-300 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition-all"
            />
          </div>
        </div>
        <div className="p-6 overflow-y-auto space-y-8 bg-white flex-1">
          {!searchQuery && (
            <p className="text-stone-500 text-sm mb-2">
              这里列出了适合不同月龄宝宝的常见辅食食材。添加新食材时，请遵循“每次只添加一种，观察3天无过敏反应后再添加下一种”的原则。
            </p>
          )}
          {filteredIngredients.length > 0 ? (
            filteredIngredients.map((group, idx) => (
              <div key={idx} className="space-y-4">
                <h3 className="text-lg font-bold text-stone-800 border-l-4 border-rose-500 pl-3 flex items-center">
                  {group.age}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {group.items.map((item, i) => (
                    <div key={i} className="bg-stone-50 rounded-xl p-4 border border-stone-100 hover:border-rose-200 hover:shadow-sm transition-all group">
                      <h4 className="font-semibold text-rose-600 mb-2 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                        {item.name}
                      </h4>
                      <div className="space-y-1.5">
                        <p className="text-sm text-stone-600 leading-relaxed">
                          <span className="font-medium text-stone-700">营养：</span>{item.nutrition}
                        </p>
                        <p className="text-sm text-stone-600 leading-relaxed">
                          <span className="font-medium text-stone-700">处理：</span>{item.process}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-stone-500 py-8">
              未找到相关食材，请尝试其他关键词。
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
