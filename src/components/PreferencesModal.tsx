import React, { useState } from 'react';
import { X, Sliders, Check } from 'lucide-react';
import { motion } from 'framer-motion';

export interface Preferences {
  age: number;
  gender: string;
  allergies: string;
  cookingMethod: string;
}

export function PreferencesModal({ 
  onClose, 
  onSave, 
  initialPrefs 
}: { 
  onClose: () => void, 
  onSave: (prefs: Preferences) => void, 
  initialPrefs: Preferences 
}) {
  const [prefs, setPrefs] = useState<Preferences>(initialPrefs);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    onSave(prefs);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 print:hidden">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col"
      >
        <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
          <h2 className="text-xl font-bold text-stone-800 flex items-center gap-2">
            <Sliders size={22} className="text-rose-500" />
            偏好设置
          </h2>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600 p-1.5 rounded-full hover:bg-stone-200 transition-colors">
            <X size={20} />
          </button>
        </div>
        <div className="p-6 space-y-5 bg-white">
          <p className="text-stone-500 text-sm mb-4">
            设置您的默认选项，下次打开应用时将自动填入这些信息。
          </p>
          
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">默认月龄 (个月)</label>
            <input 
              type="number" 
              min="4" max="36"
              value={prefs.age} 
              onChange={e => setPrefs({...prefs, age: parseInt(e.target.value) || 6})} 
              className="w-full px-4 py-2.5 rounded-xl border border-stone-300 focus:ring-2 focus:ring-rose-500 outline-none transition-all" 
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">默认性别</label>
            <select 
              value={prefs.gender} 
              onChange={e => setPrefs({...prefs, gender: e.target.value})} 
              className="w-full px-4 py-2.5 rounded-xl border border-stone-300 focus:ring-2 focus:ring-rose-500 outline-none transition-all"
            >
              <option value="男">男</option>
              <option value="女">女</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">默认过敏情况 (选填)</label>
            <input 
              type="text" 
              placeholder="如：牛奶、鸡蛋"
              value={prefs.allergies} 
              onChange={e => setPrefs({...prefs, allergies: e.target.value})} 
              className="w-full px-4 py-2.5 rounded-xl border border-stone-300 focus:ring-2 focus:ring-rose-500 outline-none transition-all" 
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">默认烹饪方式 (选填)</label>
            <input 
              type="text" 
              placeholder="如：蒸、煮"
              value={prefs.cookingMethod} 
              onChange={e => setPrefs({...prefs, cookingMethod: e.target.value})} 
              className="w-full px-4 py-2.5 rounded-xl border border-stone-300 focus:ring-2 focus:ring-rose-500 outline-none transition-all" 
            />
          </div>
          
          <button 
            onClick={handleSave} 
            className={`w-full font-medium py-3 rounded-xl transition-all flex items-center justify-center gap-2 mt-6 ${
              saved ? 'bg-green-500 hover:bg-green-600 text-white' : 'bg-rose-500 hover:bg-rose-600 text-white shadow-sm shadow-rose-200'
            }`}
          >
            {saved ? (
              <><Check size={20} /> 保存成功</>
            ) : (
              '保存偏好'
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
