import React, { useState } from 'react';
import { X, Sliders, Check } from 'lucide-react';
import { motion } from 'framer-motion';

export interface Preferences {
  age: number;
  gender: string;
  allergies: string;
  cookingMethod: string;
  goals: {
    protein: number;
    iron: number;
    calcium: number;
  };
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
            <div className="space-y-2">
              <input 
                type="text" 
                placeholder="如：牛奶、鸡蛋、花生等，用逗号分隔"
                value={prefs.allergies} 
                onChange={e => setPrefs({...prefs, allergies: e.target.value})} 
                className="w-full px-4 py-2.5 rounded-xl border border-stone-300 focus:ring-2 focus:ring-rose-500 outline-none transition-all" 
              />
              <div className="flex flex-wrap gap-2">
                {['牛奶', '鸡蛋', '花生', '大豆', '小麦', '坚果', '鱼类', '虾蟹'].map(allergen => {
                  const isSelected = prefs.allergies.includes(allergen);
                  return (
                    <button
                      key={allergen}
                      type="button"
                      onClick={() => {
                        let current = prefs.allergies.split(/[,，、\s]+/).filter(Boolean);
                        if (isSelected) {
                          current = current.filter(a => a !== allergen);
                        } else {
                          current.push(allergen);
                        }
                        setPrefs({...prefs, allergies: current.join('，')});
                      }}
                      className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                        isSelected 
                          ? 'bg-rose-100 border-rose-200 text-rose-700' 
                          : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                      }`}
                    >
                      {allergen}
                    </button>
                  );
                })}
              </div>
            </div>
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

          <div className="pt-4 border-t border-stone-100">
            <h3 className="text-sm font-bold text-stone-800 mb-3">每日营养目标</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-stone-500 mb-1">蛋白质 (g)</label>
                <input 
                  type="number" 
                  value={prefs.goals.protein} 
                  onChange={e => setPrefs({...prefs, goals: {...prefs.goals, protein: parseInt(e.target.value) || 0}})} 
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:ring-2 focus:ring-rose-500 outline-none transition-all text-sm" 
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-500 mb-1">铁 (mg)</label>
                <input 
                  type="number" 
                  value={prefs.goals.iron} 
                  onChange={e => setPrefs({...prefs, goals: {...prefs.goals, iron: parseInt(e.target.value) || 0}})} 
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:ring-2 focus:ring-rose-500 outline-none transition-all text-sm" 
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-500 mb-1">钙 (mg)</label>
                <input 
                  type="number" 
                  value={prefs.goals.calcium} 
                  onChange={e => setPrefs({...prefs, goals: {...prefs.goals, calcium: parseInt(e.target.value) || 0}})} 
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:ring-2 focus:ring-rose-500 outline-none transition-all text-sm" 
                />
              </div>
            </div>
            {(() => {
              let rec = { p: 15, i: 10, c: 250, desc: '6-12月龄建议：蛋白质15g、铁10mg、钙250mg' };
              if (prefs.age >= 13 && prefs.age <= 36) {
                rec = { p: 25, i: 9, c: 600, desc: '1-3岁建议：蛋白质25g、铁9mg、钙600mg' };
              } else if (prefs.age > 36) {
                rec = { p: 30, i: 10, c: 800, desc: '3岁以上建议：蛋白质30g、铁10mg、钙800mg' };
              }
              return (
                <div className="mt-3 p-3 bg-rose-50 rounded-xl border border-rose-100 flex items-start justify-between gap-2">
                  <div className="text-xs text-rose-700">
                    <span className="font-semibold block mb-1 flex items-center gap-1"><Sliders size={12}/> AI 推荐 ({prefs.age}个月):</span>
                    {rec.desc}
                  </div>
                  <button 
                    onClick={() => setPrefs({...prefs, goals: { protein: rec.p, iron: rec.i, calcium: rec.c }})}
                    className="shrink-0 px-2.5 py-1 bg-white text-rose-600 border border-rose-200 rounded-lg text-xs font-medium hover:bg-rose-50 transition-colors"
                  >
                    一键应用
                  </button>
                </div>
              );
            })()}
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
