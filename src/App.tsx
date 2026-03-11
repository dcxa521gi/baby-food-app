import React, { useState, useRef, useEffect } from 'react';
import { Printer, Download, FileImage, FileSpreadsheet, Loader2, Baby, Settings, X, Check, History, Trash2, HelpCircle, MessageSquare, Mail, QrCode, Info, BookOpen, Sliders, Star, Calendar, Copy } from 'lucide-react';
import * as htmlToImage from 'html-to-image';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import { motion, AnimatePresence } from 'framer-motion';
import { IngredientLibrary } from './components/IngredientLibrary';
import { PreferencesModal, Preferences } from './components/PreferencesModal';
import { FoodDetailModal } from './components/FoodDetailModal';
import { OnboardingModal } from './components/OnboardingModal';
import { ChangelogModal } from './components/ChangelogModal';
import { findIngredient } from './data/ingredients';

interface Meal {
  type: string;
  time: string;
  food: string;
  amount: string;
  recipe: string;
}

interface DaySchedule {
  day: number;
  summary: string;
  nutritionEstimates?: {
    protein: string;
    iron: string;
    calcium: string;
  };
  meals: Meal[];
}

interface ScheduleData {
  babyInfo: string;
  dailyMilk: string;
  schedule: DaySchedule[];
}

interface ApiConfig {
  apiKey: string;
  baseUrl: string;
  model: string;
}

interface HistoryItem {
  id: string;
  timestamp: number;
  params: {
    age: number;
    gender: string;
    healthCondition: string;
    allergies: string;
    cookingMethod: string;
    days: number;
    startDate?: string;
  };
  data: ScheduleData;
  note?: string;
}

const TooltipLabel = ({ label, tooltip }: { label: string, tooltip: string }) => (
  <div className="flex items-center gap-1.5 mb-1 group relative">
    <label className="block text-sm font-medium text-stone-700">{label}</label>
    <div className="text-stone-400 hover:text-rose-500 cursor-help">
      <HelpCircle size={14} />
    </div>
    <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-64 p-2.5 bg-stone-800 text-white text-xs leading-relaxed rounded-xl shadow-xl z-10">
      {tooltip}
      <div className="absolute left-4 top-full w-2 h-2 bg-stone-800 transform rotate-45 -mt-1"></div>
    </div>
  </div>
);

export default function App() {
  const [age, setAge] = useState<number>(6);
  const [gender, setGender] = useState<string>('男');
  const [healthCondition, setHealthCondition] = useState<string>('');
  const [allergies, setAllergies] = useState<string>('');
  const [cookingMethod, setCookingMethod] = useState<string>('');
  const [days, setDays] = useState<number>(3);
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [dateMode, setDateMode] = useState<'day' | 'week' | 'month'>('day');
  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toISOString().slice(0, 7));
  const [selectedWeek, setSelectedWeek] = useState<string>('');
  const [goals, setGoals] = useState({ protein: 15, iron: 10, calcium: 250 });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ScheduleData | null>(null);

  // Settings & Feedback state
  const [showSettings, setShowSettings] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showLibrary, setShowLibrary] = useState(false);
  const [showPrefs, setShowPrefs] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showChangelog, setShowChangelog] = useState(false);
  const [selectedFood, setSelectedFood] = useState<{ name: string, nutrition: string, process: string } | null>(null);
  
  const [apiConfig, setApiConfig] = useState<ApiConfig>({
    apiKey: '',
    baseUrl: 'https://api.openai.com/v1',
    model: 'gpt-3.5-turbo'
  });
  const [models, setModels] = useState<string[]>([]);
  const [loadingModels, setLoadingModels] = useState(false);
  const [settingsError, setSettingsError] = useState<string | null>(null);
  const [settingsSuccess, setSettingsSuccess] = useState(false);

  // History & Favorites state
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [favorites, setFavorites] = useState<HistoryItem[]>([]);
  const [activeTab, setActiveTab] = useState<'history' | 'favorites'>('history');
  const [historyPage, setHistoryPage] = useState(1);
  const [favoritesPage, setFavoritesPage] = useState(1);
  const ITEMS_PER_PAGE = 6;

  const [completedMeals, setCompletedMeals] = useState<Record<string, boolean>>({});

  const [activePlanId, setActivePlanId] = useState<string | null>(null);

  const printRef = useRef<HTMLDivElement>(null);

  // Load settings, history, and prefs from local storage on mount
  useEffect(() => {
    const isFirstTime = localStorage.getItem('babyFoodOnboardingDone') !== 'true';
    if (isFirstTime) {
      setShowOnboarding(true);
    }

    const savedConfig = localStorage.getItem('babyFoodApiConfig');
    if (savedConfig) {
      try {
        setApiConfig(JSON.parse(savedConfig));
      } catch (e) {
        console.error('Failed to parse saved config');
      }
    }

    const savedHistory = localStorage.getItem('babyFoodHistory');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error('Failed to parse saved history');
      }
    }

    const savedFavorites = localStorage.getItem('babyFoodFavorites');
    if (savedFavorites) {
      try {
        setFavorites(JSON.parse(savedFavorites));
      } catch (e) {
        console.error('Failed to parse saved favorites');
      }
    }

    const savedPrefs = localStorage.getItem('babyFoodPrefs');
    if (savedPrefs) {
      try {
        const prefs = JSON.parse(savedPrefs);
        setAge(prefs.age || 6);
        setGender(prefs.gender || '男');
        setAllergies(prefs.allergies || '');
        setCookingMethod(prefs.cookingMethod || '');
        if (prefs.goals) {
          setGoals(prefs.goals);
        }
      } catch (e) {
        console.error('Failed to parse saved prefs');
      }
    }

    const savedCompleted = localStorage.getItem('babyFoodCompletedMeals');
    if (savedCompleted) {
      try {
        setCompletedMeals(JSON.parse(savedCompleted));
      } catch (e) {
        console.error('Failed to parse completed meals');
      }
    }

    const savedActivePlanId = localStorage.getItem('babyFoodActivePlanId');
    if (savedActivePlanId) {
      setActivePlanId(savedActivePlanId);
    }
  }, []);

  const handleCloseOnboarding = () => {
    localStorage.setItem('babyFoodOnboardingDone', 'true');
    setShowOnboarding(false);
  };

  const getTodayDayIndex = () => {
    if (!startDate) return -1;
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffTime = today.getTime() - start.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays + 1; // day 1 is diffDays 0
  };

  const toggleMealCompletion = (dayIndex: number, mealIndex: number) => {
    if (!activePlanId) return;
    const key = `${activePlanId}-${dayIndex}-${mealIndex}`;
    setCompletedMeals(prev => {
      const next = { ...prev, [key]: !prev[key] };
      localStorage.setItem('babyFoodCompletedMeals', JSON.stringify(next));
      return next;
    });
  };

  const handleFoodClick = (foodName: string) => {
    const ingredient = findIngredient(foodName);
    if (ingredient) {
      setSelectedFood(ingredient);
    }
  };

  const getDisplayDate = (dayOffset: number) => {
    const date = new Date(startDate);
    date.setDate(date.getDate() + dayOffset - 1);
    return `${date.getMonth() + 1}月${date.getDate()}日`;
  };

  const fetchModels = async (configToUse = apiConfig) => {
    if (!configToUse.apiKey) {
      setSettingsError('请先输入 API Key');
      return;
    }

    setLoadingModels(true);
    setSettingsError(null);
    
    try {
      const response = await fetch('/api/models', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey: configToUse.apiKey,
          baseUrl: configToUse.baseUrl
        }),
      });

      if (!response.ok) {
        throw new Error('获取模型列表失败，请检查 API Key 和 Base URL');
      }

      const result = await response.json();
      if (result.data && Array.isArray(result.data)) {
        const modelIds = result.data.map((m: any) => m.id).sort();
        setModels(modelIds);
        
        // If current model is not in the list, select the first one or default
        if (modelIds.length > 0 && !modelIds.includes(configToUse.model)) {
          setApiConfig(prev => ({ ...prev, model: modelIds.includes('gpt-3.5-turbo') ? 'gpt-3.5-turbo' : modelIds[0] }));
        }
      } else {
        throw new Error('返回的模型数据格式不正确');
      }
    } catch (err: any) {
      setSettingsError(err.message);
    } finally {
      setLoadingModels(false);
    }
  };

  const handleSaveSettings = () => {
    localStorage.setItem('babyFoodApiConfig', JSON.stringify(apiConfig));
    setSettingsSuccess(true);
    setTimeout(() => {
      setSettingsSuccess(false);
      setShowSettings(false);
    }, 1500);
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!apiConfig.apiKey) {
      setShowSettings(true);
      setSettingsError('请先配置 API Key');
      return;
    }

    if (age < 4 || age > 36) {
      setError('月龄必须在 4 到 36 个月之间');
      return;
    }
    if (days < 1 || days > 31) {
      setError('生成天数必须在 1 到 31 天之间');
      return;
    }
    if (!startDate) {
      setError('请选择开始日期');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/generate-schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          age, 
          gender, 
          healthCondition,
          allergies, 
          cookingMethod, 
          days,
          apiConfig
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || '生成失败');
      }

      const result = await response.json();
      setData(result);

      // Save to history
      const newId = Date.now().toString();
      const newItem: HistoryItem = {
        id: newId,
        timestamp: Date.now(),
        params: { age, gender, healthCondition, allergies, cookingMethod, days, startDate },
        data: result
      };
      
      setActivePlanId(newId);
      localStorage.setItem('babyFoodActivePlanId', newId);

      setHistory(prev => {
        const newHistory = [newItem, ...prev].slice(0, 50); // Keep last 50 items
        localStorage.setItem('babyFoodHistory', JSON.stringify(newHistory));
        return newHistory;
      });

    } catch (err: any) {
      setError(err.message || '发生未知错误');
    } finally {
      setLoading(false);
    }
  };

  const loadHistoryItem = (item: HistoryItem) => {
    setAge(item.params.age);
    setGender(item.params.gender);
    setHealthCondition(item.params.healthCondition || '');
    setAllergies(item.params.allergies);
    setCookingMethod(item.params.cookingMethod);
    setDays(item.params.days);
    if (item.params.startDate) {
      setStartDate(item.params.startDate);
    }
    setData(item.data);
    setActivePlanId(item.id);
    localStorage.setItem('babyFoodActivePlanId', item.id);
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const deleteHistoryItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setHistory(prev => {
      const newHistory = prev.filter(item => item.id !== id);
      localStorage.setItem('babyFoodHistory', JSON.stringify(newHistory));
      return newHistory;
    });
  };

  const deleteFavoriteItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites(prev => {
      const newFavorites = prev.filter(item => item.id !== id);
      localStorage.setItem('babyFoodFavorites', JSON.stringify(newFavorites));
      return newFavorites;
    });
  };

  const updateFavoriteNote = (id: string, note: string) => {
    setFavorites(prev => {
      const newFavorites = prev.map(item => item.id === id ? { ...item, note } : item);
      localStorage.setItem('babyFoodFavorites', JSON.stringify(newFavorites));
      return newFavorites;
    });
  };

  const copyHistoryParams = (item: HistoryItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setAge(item.params.age);
    setGender(item.params.gender);
    setHealthCondition(item.params.healthCondition || '');
    setAllergies(item.params.allergies);
    setCookingMethod(item.params.cookingMethod);
    setDays(item.params.days);
    if (item.params.startDate) {
      setStartDate(item.params.startDate);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return `${date.getMonth() + 1}月${date.getDate()}日 ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  const handlePrint = () => {
    alert('即将打开打印预览，请在打印设置中选择“横向”并勾选“背景图形”以获得最佳效果。');
    window.print();
  };

  const handleExportPNG = async () => {
    if (!printRef.current) return;
    try {
      const dataUrl = await htmlToImage.toPng(printRef.current, { pixelRatio: 2, backgroundColor: '#ffffff' });
      const link = document.createElement('a');
      link.download = `宝宝辅食表_${age}个月_${days}天.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Export PNG failed:', err);
      alert('导出PNG失败');
    }
  };

  const toggleFavorite = (item: HistoryItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites(prev => {
      const isFav = prev.some(fav => fav.id === item.id);
      let newFavs;
      if (isFav) {
        newFavs = prev.filter(fav => fav.id !== item.id);
      } else {
        newFavs = [item, ...prev];
      }
      localStorage.setItem('babyFoodFavorites', JSON.stringify(newFavs));
      return newFavs;
    });
  };

  const handleSavePrefs = (prefs: Preferences) => {
    localStorage.setItem('babyFoodPrefs', JSON.stringify(prefs));
    setAge(prefs.age);
    setGender(prefs.gender);
    setAllergies(prefs.allergies);
    setCookingMethod(prefs.cookingMethod);
    setGoals(prefs.goals);
  };

  const handleExportPDF = async () => {
    if (!printRef.current) return;
    try {
      // Temporarily remove max-height/overflow if any, to capture full content
      const originalStyle = printRef.current.style.cssText;
      printRef.current.style.height = 'auto';
      printRef.current.style.overflow = 'visible';

      const rect = printRef.current.getBoundingClientRect();
      const dataUrl = await htmlToImage.toPng(printRef.current, { 
        pixelRatio: 2, 
        backgroundColor: '#ffffff',
        width: printRef.current.scrollWidth,
        height: printRef.current.scrollHeight,
        style: {
          transform: 'scale(1)',
          transformOrigin: 'top left'
        }
      });
      
      // Restore original style
      printRef.current.style.cssText = originalStyle;

      const pdf = new jsPDF({
        orientation: printRef.current.scrollWidth > printRef.current.scrollHeight ? 'landscape' : 'portrait',
        unit: 'px',
        format: [printRef.current.scrollWidth, printRef.current.scrollHeight]
      });
      pdf.addImage(dataUrl, 'PNG', 0, 0, printRef.current.scrollWidth, printRef.current.scrollHeight);
      pdf.save(`宝宝辅食表_${age}个月_${days}天.pdf`);
    } catch (err) {
      console.error('Export PDF failed:', err);
      alert('导出PDF失败');
    }
  };

  const handleExportXLSX = () => {
    if (!data) return;
    
    const wsData: any[][] = [];
    wsData.push(['宝宝基本情况', data.babyInfo]);
    wsData.push(['每日奶量推荐', data.dailyMilk]);
    wsData.push([]);
    wsData.push(['天数', '餐次', '时间', '食物名称', '用量', '做法说明']);

    data.schedule.forEach((daySchedule) => {
      daySchedule.meals.forEach((meal) => {
        wsData.push([
          `第${daySchedule.day}天`,
          meal.type,
          meal.time,
          meal.food,
          meal.amount,
          meal.recipe
        ]);
      });
      wsData.push(['', '', '', '', '', `总结: ${daySchedule.summary}`]);
      wsData.push([]); // Empty row between days
    });

    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '辅食表');
    XLSX.writeFile(wb, `宝宝辅食表_${age}个月_${days}天.xlsx`);
  };

  const handleBatchExportExcel = () => {
    const listToExport = activeTab === 'history' ? history : favorites;
    if (listToExport.length === 0) {
      alert('没有可导出的数据');
      return;
    }

    const wb = XLSX.utils.book_new();

    listToExport.forEach((item, index) => {
      const wsData: any[][] = [];
      wsData.push(['宝宝辅食表']);
      wsData.push([`月龄: ${item.params.age}个月`, `性别: ${item.params.gender}`, `天数: ${item.params.days}天`, `生成时间: ${formatDate(item.timestamp)}`]);
      if (item.params.allergies) wsData.push([`规避过敏原: ${item.params.allergies}`]);
      wsData.push([]);
      wsData.push(['第几天', '餐次', '时间', '食物名称', '用量', '做法说明']);

      item.data.schedule.forEach(day => {
        day.meals.forEach((meal, mIdx) => {
          wsData.push([
            mIdx === 0 ? `第 ${day.day} 天` : '',
            meal.type,
            meal.time,
            meal.food,
            meal.amount,
            meal.recipe
          ]);
        });
      });

      const ws = XLSX.utils.aoa_to_sheet(wsData);
      
      // Auto-size columns
      const colWidths = [
        { wch: 10 }, // 第几天
        { wch: 10 }, // 餐次
        { wch: 10 }, // 时间
        { wch: 20 }, // 食物名称
        { wch: 15 }, // 用量
        { wch: 40 }  // 做法说明
      ];
      ws['!cols'] = colWidths;

      let sheetName = `${item.params.age}个月_${formatDate(item.timestamp).split(' ')[0]}`;
      // Ensure unique sheet names and limit to 31 chars
      sheetName = `${index + 1}_${sheetName}`.substring(0, 31);
      XLSX.utils.book_append_sheet(wb, ws, sheetName);
    });

    XLSX.writeFile(wb, `宝宝辅食表_批量导出_${activeTab === 'history' ? '历史' : '收藏'}.xlsx`);
  };

  return (
    <div className="min-h-screen bg-[#fff9f5] bg-[radial-gradient(#ffe4e6_1px,transparent_1px)] [background-size:20px_20px] text-stone-900 font-sans">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-40 print:hidden border-b border-rose-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-rose-100 to-orange-100 p-2.5 rounded-2xl text-rose-500 shadow-sm border border-rose-200/50">
              <Baby size={28} />
            </div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-rose-500 to-orange-400 bg-clip-text text-transparent">儿童辅食表生成器</h1>
              <button 
                onClick={() => setShowChangelog(true)}
                className="px-2 py-0.5 text-[10px] font-bold bg-rose-50 text-rose-600 rounded-full border border-rose-200 hover:bg-rose-100 transition-colors cursor-pointer"
                title="查看版本更新与部署指南"
              >
                v1.2.0
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setShowLibrary(true)}
              className="p-2 text-stone-500 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-colors flex items-center gap-1 text-sm font-medium"
              title="食材库"
            >
              <BookOpen size={20} />
              <span className="hidden sm:inline">食材库</span>
            </button>
            <button 
              onClick={() => setShowPrefs(true)}
              className="p-2 text-stone-500 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-colors flex items-center gap-1 text-sm font-medium"
              title="偏好设置"
            >
              <Sliders size={20} />
              <span className="hidden sm:inline">偏好</span>
            </button>
            <button 
              onClick={() => setShowFeedback(true)}
              className="p-2 text-stone-500 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-colors flex items-center gap-1 text-sm font-medium"
              title="反馈建议"
            >
              <MessageSquare size={20} />
              <span className="hidden sm:inline">反馈</span>
            </button>
            <button 
              onClick={() => setShowSettings(true)}
              className="p-2 text-stone-500 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-colors"
              title="API 设置"
            >
              <Settings size={24} />
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {showOnboarding && <OnboardingModal onClose={handleCloseOnboarding} />}
        {showLibrary && <IngredientLibrary onClose={() => setShowLibrary(false)} />}
        {showChangelog && <ChangelogModal onClose={() => setShowChangelog(false)} />}
        {showPrefs && (
          <PreferencesModal 
            onClose={() => setShowPrefs(false)} 
            onSave={handleSavePrefs} 
            initialPrefs={{ age, gender, allergies, cookingMethod, goals }} 
          />
        )}
        {selectedFood && (
          <FoodDetailModal food={selectedFood} onClose={() => setSelectedFood(null)} />
        )}
      </AnimatePresence>

      {/* Feedback Modal */}
      {showFeedback && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 print:hidden">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-stone-800 flex items-center gap-2">
                <MessageSquare size={20} className="text-rose-500" />
                意见反馈
              </h2>
              <button 
                onClick={() => setShowFeedback(false)}
                className="text-stone-400 hover:text-stone-600 p-1 rounded-full hover:bg-stone-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 text-center space-y-6">
              <p className="text-stone-600 text-sm">
                欢迎提供您的宝贵建议或反馈使用中遇到的问题，帮助我们持续改进应用。
              </p>
              
              <div className="bg-stone-50 p-4 rounded-xl border border-stone-100 flex flex-col items-center justify-center gap-3">
                <div className="bg-white p-3 rounded-lg shadow-sm border border-stone-200">
                  <QrCode size={120} className="text-stone-800" />
                </div>
                <p className="text-xs text-stone-500">扫码添加客服微信</p>
              </div>

              <div className="flex items-center justify-center gap-2 text-stone-700 bg-rose-50 py-3 rounded-xl border border-rose-100">
                <Mail size={18} className="text-rose-500" />
                <a href="mailto:feedback@example.com" className="text-sm font-medium hover:text-rose-600 transition-colors">
                  feedback@example.com
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 print:hidden">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-stone-800 flex items-center gap-2">
                <Settings size={20} className="text-rose-500" />
                API 设置
              </h2>
              <button 
                onClick={() => setShowSettings(false)}
                className="text-stone-400 hover:text-stone-600 p-1 rounded-full hover:bg-stone-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">API Key</label>
                <input
                  type="password"
                  value={apiConfig.apiKey}
                  onChange={(e) => setApiConfig({...apiConfig, apiKey: e.target.value})}
                  placeholder="sk-..."
                  className="w-full px-4 py-2 rounded-xl border border-stone-300 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition-all"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Base URL</label>
                <input
                  type="text"
                  value={apiConfig.baseUrl}
                  onChange={(e) => setApiConfig({...apiConfig, baseUrl: e.target.value})}
                  placeholder="https://api.openai.com/v1"
                  className="w-full px-4 py-2 rounded-xl border border-stone-300 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition-all"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-stone-700">模型</label>
                  <button 
                    type="button"
                    onClick={() => fetchModels()}
                    disabled={loadingModels || !apiConfig.apiKey}
                    className="text-xs text-rose-500 hover:text-rose-600 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                  >
                    {loadingModels && <Loader2 size={12} className="animate-spin" />}
                    获取模型列表
                  </button>
                </div>
                
                {loadingModels ? (
                  <div className="w-full px-4 py-2 rounded-xl border border-stone-200 bg-stone-50 text-stone-500 flex items-center gap-2">
                    <Loader2 size={16} className="animate-spin text-rose-500" />
                    <span className="text-sm">正在获取模型列表...</span>
                  </div>
                ) : models.length > 0 ? (
                  <select
                    value={apiConfig.model}
                    onChange={(e) => setApiConfig({...apiConfig, model: e.target.value})}
                    className="w-full px-4 py-2 rounded-xl border border-stone-300 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition-all"
                  >
                    {models.map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={apiConfig.model}
                    onChange={(e) => setApiConfig({...apiConfig, model: e.target.value})}
                    placeholder="gpt-3.5-turbo"
                    className="w-full px-4 py-2 rounded-xl border border-stone-300 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition-all"
                  />
                )}
              </div>

              {settingsError && (
                <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100">
                  {settingsError}
                </div>
              )}

              <button
                onClick={handleSaveSettings}
                className={`w-full py-2.5 px-4 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                  settingsSuccess 
                    ? 'bg-green-500 hover:bg-green-600 text-white' 
                    : 'bg-stone-800 hover:bg-stone-900 text-white'
                }`}
              >
                {settingsSuccess ? (
                  <>
                    <Check size={18} />
                    保存成功
                  </>
                ) : (
                  '保存设置'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Form Section */}
          <div className="lg:col-span-4 print:hidden">
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-sm border border-rose-100 p-6 sticky top-24">
              <h2 className="text-lg font-semibold mb-6 flex items-center gap-2 text-stone-800">
                填写宝宝信息
              </h2>
              <form onSubmit={handleGenerate} className="space-y-5">
                <div>
                  <TooltipLabel 
                    label="月龄 (个月)" 
                    tooltip="宝宝当前的月龄。不同月龄的宝宝辅食性状（泥糊、颗粒、块状）和可引入的食材种类不同。" 
                  />
                  <input
                    type="number"
                    min="4"
                    max="36"
                    required
                    value={age}
                    onChange={(e) => setAge(parseInt(e.target.value))}
                    className="w-full px-4 py-2 rounded-xl border border-stone-300 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition-all"
                  />
                </div>
                
                <div>
                  <TooltipLabel 
                    label="性别" 
                    tooltip="男宝和女宝在生长发育曲线上有细微差别，这会影响每日推荐的总奶量和热量需求。" 
                  />
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl border border-stone-300 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition-all"
                  >
                    <option value="男">男</option>
                    <option value="女">女</option>
                  </select>
                </div>

                <div>
                  <TooltipLabel 
                    label="身体状态 (选填)" 
                    tooltip="宝宝近期的身体状况，如肠胃弱、拉肚子、便秘、积食等。AI将据此调整食材，如腹泻时避免高纤维食物，便秘时增加膳食纤维。" 
                  />
                  <input
                    type="text"
                    placeholder="如：肠胃弱、拉肚子、便秘等"
                    value={healthCondition}
                    onChange={(e) => setHealthCondition(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl border border-stone-300 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition-all"
                  />
                </div>

                <div>
                  <TooltipLabel 
                    label="过敏情况 (选填)" 
                    tooltip="宝宝已知的过敏食物。生成的食谱将严格规避这些食材，确保宝宝饮食安全。" 
                  />
                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder="如：牛奶、鸡蛋、花生等，用逗号分隔"
                      value={allergies}
                      onChange={(e) => setAllergies(e.target.value)}
                      className="w-full px-4 py-2 rounded-xl border border-stone-300 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition-all"
                    />
                    <div className="flex flex-wrap gap-2">
                      {['牛奶', '鸡蛋', '花生', '大豆', '小麦', '坚果', '鱼类', '虾蟹'].map(allergen => {
                        const isSelected = allergies.includes(allergen);
                        return (
                          <button
                            key={allergen}
                            type="button"
                            onClick={() => {
                              let current = allergies.split(/[,，、\s]+/).filter(Boolean);
                              if (isSelected) {
                                current = current.filter(a => a !== allergen);
                              } else {
                                current.push(allergen);
                              }
                              setAllergies(current.join('，'));
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
                    {(() => {
                      const allergenSuggestions: Record<string, { title: string, desc: string, alts: string[] }> = {
                        '牛奶': { title: '牛奶', desc: '建议使用深度水解或氨基酸配方奶替代；1岁以上可尝试植物奶。', alts: ['深度水解奶', '氨基酸奶', '无糖豆奶', '燕麦奶'] },
                        '鸡蛋': { title: '鸡蛋', desc: '缺乏蛋类蛋白时，可增加肉类或豆制品；烘焙可用亚麻籽糊替代。', alts: ['禽肉', '畜肉', '鱼类', '豆腐', '亚麻籽糊'] },
                        '花生': { title: '花生', desc: '规避所有含花生碎的零食，可使用其他健康油脂替代。', alts: ['牛油果', '橄榄油', '核桃油'] },
                        '大豆': { title: '大豆', desc: '规避豆腐、豆浆、酱油等，可多吃其他豆类或肉类补充蛋白。', alts: ['红豆', '绿豆', '猪肉', '牛肉'] },
                        '小麦': { title: '小麦', desc: '选择无麸质主食，避免普通面条、馒头和面包。', alts: ['大米', '小米', '玉米', '藜麦', '纯燕麦'] },
                        '坚果': { title: '坚果', desc: '避免混合坚果酱，可使用安全的种子类或植物油补充不饱和脂肪酸。', alts: ['南瓜籽', '葵花籽油', '亚麻籽油'] },
                        '鱼类': { title: '鱼类', desc: '缺乏海鱼摄入时，建议通过富含ALA的植物油补充，或咨询医生。', alts: ['核桃油', '亚麻籽油', 'DHA制剂'] },
                        '虾蟹': { title: '虾蟹', desc: '规避海鲜，通过红肉补充优质蛋白和锌元素。', alts: ['牛肉', '猪肉', '动物肝脏'] }
                      };
                      const currentAllergens = allergies.split(/[,，、\s]+/).filter(Boolean);
                      const suggestions = currentAllergens.map(a => allergenSuggestions[a]).filter(Boolean);
                      if (suggestions.length === 0) return null;
                      return (
                        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {suggestions.map((s, i) => (
                            <div key={i} className="p-3 bg-blue-50/50 rounded-xl border border-blue-100 shadow-sm">
                              <div className="font-semibold text-blue-800 text-sm mb-1.5 flex items-center gap-1.5">
                                <Info size={14} className="text-blue-500"/> {s.title} 替代方案
                              </div>
                              <p className="text-xs text-stone-600 mb-2.5 leading-relaxed">{s.desc}</p>
                              <div className="flex flex-wrap gap-1.5">
                                {s.alts.map((alt, j) => (
                                  <span key={j} className="px-2 py-0.5 bg-white text-blue-600 rounded-md text-[11px] border border-blue-100 shadow-sm">{alt}</span>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                  </div>
                </div>

                <div>
                  <TooltipLabel 
                    label="烹饪方式偏好 (选填)" 
                    tooltip="您倾向或方便使用的烹饪方式，如只能蒸煮、或者可以使用烤箱、少油炒等。" 
                  />
                  <input
                    type="text"
                    placeholder="如：蒸、煮、少油等"
                    value={cookingMethod}
                    onChange={(e) => setCookingMethod(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl border border-stone-300 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition-all"
                  />
                </div>

                <div>
                  <TooltipLabel 
                    label="开始日期" 
                    tooltip="选择辅食表的第一天日期，生成的食谱将包含具体的日期，方便您按日历执行。" 
                  />
                  <div className="flex items-center gap-2 mb-2">
                    <button
                      type="button"
                      onClick={() => setDateMode('day')}
                      className={`px-3 py-1 text-xs rounded-full border transition-colors ${dateMode === 'day' ? 'bg-rose-100 border-rose-200 text-rose-700' : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'}`}
                    >
                      按日选择
                    </button>
                    <button
                      type="button"
                      onClick={() => setDateMode('week')}
                      className={`px-3 py-1 text-xs rounded-full border transition-colors ${dateMode === 'week' ? 'bg-rose-100 border-rose-200 text-rose-700' : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'}`}
                    >
                      按周选择
                    </button>
                    <button
                      type="button"
                      onClick={() => setDateMode('month')}
                      className={`px-3 py-1 text-xs rounded-full border transition-colors ${dateMode === 'month' ? 'bg-rose-100 border-rose-200 text-rose-700' : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'}`}
                    >
                      按月选择
                    </button>
                  </div>
                  <div className="relative">
                    <Calendar size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                    {dateMode === 'day' ? (
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-xl border border-stone-300 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition-all"
                      />
                    ) : dateMode === 'week' ? (
                      <input
                        type="week"
                        value={selectedWeek}
                        onChange={(e) => {
                          const val = e.target.value;
                          setSelectedWeek(val);
                          if (val) {
                            const [yearStr, weekStr] = val.split('-W');
                            const y = parseInt(yearStr);
                            const w = parseInt(weekStr);
                            const jan4 = new Date(y, 0, 4);
                            const jan4Day = jan4.getDay() || 7;
                            const mondayOfJan4Week = new Date(y, 0, 4 - jan4Day + 1);
                            const targetMonday = new Date(mondayOfJan4Week.getTime() + (w - 1) * 7 * 24 * 60 * 60 * 1000);
                            const offset = targetMonday.getTimezoneOffset() * 60000;
                            const localISOTime = (new Date(targetMonday.getTime() - offset)).toISOString().split('T')[0];
                            setStartDate(localISOTime);
                            setDays(7);
                          }
                        }}
                        className="w-full pl-10 pr-4 py-2 rounded-xl border border-stone-300 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition-all"
                      />
                    ) : (
                      <input
                        type="month"
                        value={selectedMonth}
                        onChange={(e) => {
                          setSelectedMonth(e.target.value);
                          if (e.target.value) {
                            const [year, month] = e.target.value.split('-');
                            const daysInMonth = new Date(parseInt(year), parseInt(month), 0).getDate();
                            setDays(daysInMonth);
                            setStartDate(`${e.target.value}-01`);
                          }
                        }}
                        className="w-full pl-10 pr-4 py-2 rounded-xl border border-stone-300 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition-all"
                      />
                    )}
                  </div>
                </div>

                <div>
                  <TooltipLabel 
                    label="食谱天数" 
                    tooltip={dateMode === 'day' ? "希望一次性生成的食谱天数。建议不要太长（如3-5天），以便根据宝宝的接受程度随时调整。" : "按周或按月选择时，天数将自动计算。"} 
                  />
                  {dateMode === 'day' ? (
                    <select
                      value={days}
                      onChange={(e) => setDays(parseInt(e.target.value))}
                      className="w-full px-4 py-2 rounded-xl border border-stone-300 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition-all"
                    >
                      {Array.from(new Set([1, 3, 5, 7, 15, 30, days])).sort((a, b) => a - b).map(d => (
                        <option key={d} value={d}>{d} 天</option>
                      ))}
                    </select>
                  ) : (
                    <div className="w-full px-4 py-2 rounded-xl border border-stone-200 bg-stone-50 text-stone-500 cursor-not-allowed">
                      {days} 天 (自动计算)
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-rose-500 hover:bg-rose-600 text-white font-medium py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-4 shadow-sm shadow-rose-200"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      正在生成专属食谱...
                    </>
                  ) : (
                    '生成辅食表'
                  )}
                </button>

                {error && (
                  <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100">
                    {error}
                  </div>
                )}
              </form>
            </div>
          </div>

          {/* Result Section */}
          <div className="lg:col-span-8">
            {loading ? (
              <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-stone-500 bg-white/50 backdrop-blur-sm rounded-3xl border border-rose-100 shadow-sm print:hidden">
                <div className="relative w-20 h-20 mb-6">
                  <div className="absolute inset-0 border-4 border-rose-100 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-rose-500 rounded-full border-t-transparent animate-spin"></div>
                  <Baby size={32} className="absolute inset-0 m-auto text-rose-500 animate-pulse" />
                </div>
                <h3 className="text-xl font-bold text-stone-800 mb-2">正在为您生成专属辅食表...</h3>
                <p className="text-stone-500 text-sm text-center max-w-xs">
                  AI 正在根据宝宝的月龄、性别和偏好，为您精心搭配营养均衡的食谱，请稍候。
                </p>
              </div>
            ) : data ? (
              <div className="space-y-6">
                {/* Today's Recipe Module */}
                {(() => {
                  const todayIndex = getTodayDayIndex();
                  if (todayIndex >= 1 && todayIndex <= data.schedule.length) {
                    const todaySchedule = data.schedule[todayIndex - 1];
                    return (
                      <div className="bg-rose-50/80 rounded-3xl border border-rose-200 p-6 shadow-sm print:hidden">
                        <h3 className="text-xl font-bold text-rose-800 mb-4 flex items-center gap-2">
                          <span className="w-2 h-6 bg-rose-400 rounded-full inline-block"></span>
                          今日食谱 ({getDisplayDate(todayIndex)})
                        </h3>
                        <div className="space-y-3">
                          {todaySchedule.meals.map((meal, mIdx) => {
                            const isCompleted = completedMeals[`${activePlanId}-${todayIndex}-${mIdx}`];
                            return (
                              <div key={mIdx} className={`flex items-start gap-4 p-4 rounded-2xl border transition-all ${isCompleted ? 'bg-stone-50 border-stone-200 opacity-60' : 'bg-white border-rose-100 shadow-sm'}`}>
                                <button 
                                  onClick={() => toggleMealCompletion(todayIndex, mIdx)}
                                  className={`mt-1 shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${isCompleted ? 'bg-green-500 border-green-500 text-white' : 'border-stone-300 hover:border-rose-400'}`}
                                >
                                  {isCompleted && <Check size={14} />}
                                </button>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className={`text-sm font-bold ${meal.type.includes('加餐') ? 'text-orange-600' : 'text-stone-800'}`}>{meal.type}</span>
                                    <span className="text-xs text-stone-500">{meal.time}</span>
                                  </div>
                                  <p className={`font-medium ${isCompleted ? 'text-stone-500 line-through' : 'text-stone-800'}`}>{meal.food} <span className="text-stone-500 text-sm font-normal">({meal.amount})</span></p>
                                  <p className="text-sm text-stone-500 mt-1">{meal.recipe}</p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  }
                  return null;
                })()}

                {/* Actions */}
                <div className="flex flex-wrap gap-3 print:hidden">
                  <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 bg-white border border-stone-200 rounded-lg hover:bg-stone-50 transition-colors text-sm font-medium text-stone-700 shadow-sm">
                    <Printer size={16} /> 打印 (A4横向)
                  </button>
                  <button onClick={handleExportPNG} className="flex items-center gap-2 px-4 py-2 bg-white border border-stone-200 rounded-lg hover:bg-stone-50 transition-colors text-sm font-medium text-stone-700 shadow-sm">
                    <FileImage size={16} /> 导出 PNG
                  </button>
                  <button onClick={handleExportPDF} className="flex items-center gap-2 px-4 py-2 bg-white border border-stone-200 rounded-lg hover:bg-stone-50 transition-colors text-sm font-medium text-stone-700 shadow-sm">
                    <Download size={16} /> 导出 PDF
                  </button>
                  <button onClick={handleExportXLSX} className="flex items-center gap-2 px-4 py-2 bg-white border border-stone-200 rounded-lg hover:bg-stone-50 transition-colors text-sm font-medium text-stone-700 shadow-sm">
                    <FileSpreadsheet size={16} /> 导出 Excel
                  </button>
                </div>

                {/* Printable Area */}
                <div 
                  ref={printRef} 
                  className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-sm border border-rose-100 p-8 print:shadow-none print:border-none print:p-0"
                >
                  <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-stone-800 mb-2">宝宝专属辅食表</h2>
                    <p className="text-stone-500">
                      {age}个月 | {gender} | {days}天食谱 {allergies ? `| 规避: ${allergies}` : ''}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="bg-rose-50/50 rounded-2xl p-5 border border-rose-100">
                      <h3 className="font-semibold text-rose-800 mb-2 flex items-center gap-2">
                        <span className="w-1.5 h-4 bg-rose-400 rounded-full inline-block"></span>
                        宝宝情况
                      </h3>
                      <p className="text-stone-700 text-sm leading-relaxed">{data.babyInfo}</p>
                    </div>
                    <div className="bg-teal-50/50 rounded-2xl p-5 border border-teal-100">
                      <h3 className="font-semibold text-teal-800 mb-2 flex items-center gap-2">
                        <span className="w-1.5 h-4 bg-teal-400 rounded-full inline-block"></span>
                        奶量建议
                      </h3>
                      <p className="text-stone-700 text-sm leading-relaxed">{data.dailyMilk}</p>
                    </div>
                  </div>

                  {/* Overall Nutrition Report */}
                  {(() => {
                    const validDays = data.schedule.filter(d => d.nutritionEstimates);
                    if (validDays.length === 0) return null;
                    
                    const avgProtein = validDays.reduce((acc, d) => acc + parseFloat(d.nutritionEstimates!.protein), 0) / validDays.length;
                    const avgIron = validDays.reduce((acc, d) => acc + parseFloat(d.nutritionEstimates!.iron), 0) / validDays.length;
                    const avgCalcium = validDays.reduce((acc, d) => acc + parseFloat(d.nutritionEstimates!.calcium), 0) / validDays.length;
                    
                    return (
                      <div className="bg-blue-50/50 rounded-2xl p-5 border border-blue-100 mb-8">
                        <h3 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
                          <span className="w-1.5 h-4 bg-blue-400 rounded-full inline-block"></span>
                          食谱周期营养报告 (日均)
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div className="bg-white p-3 rounded-xl border border-blue-50 shadow-sm">
                            <div className="text-xs text-stone-500 mb-1">蛋白质</div>
                            <div className="flex items-end gap-2">
                              <span className="text-lg font-bold text-stone-800">{avgProtein.toFixed(1)}g</span>
                              <span className="text-xs text-stone-400 mb-1">/ 目标 {goals.protein}g</span>
                            </div>
                            <div className="w-full h-1.5 bg-stone-100 rounded-full mt-2 overflow-hidden">
                              <div className="h-full bg-blue-400 rounded-full" style={{ width: `${Math.min(100, (avgProtein / goals.protein) * 100)}%` }}></div>
                            </div>
                          </div>
                          <div className="bg-white p-3 rounded-xl border border-blue-50 shadow-sm">
                            <div className="text-xs text-stone-500 mb-1">铁</div>
                            <div className="flex items-end gap-2">
                              <span className="text-lg font-bold text-stone-800">{avgIron.toFixed(1)}mg</span>
                              <span className="text-xs text-stone-400 mb-1">/ 目标 {goals.iron}mg</span>
                            </div>
                            <div className="w-full h-1.5 bg-stone-100 rounded-full mt-2 overflow-hidden">
                              <div className="h-full bg-rose-400 rounded-full" style={{ width: `${Math.min(100, (avgIron / goals.iron) * 100)}%` }}></div>
                            </div>
                          </div>
                          <div className="bg-white p-3 rounded-xl border border-blue-50 shadow-sm">
                            <div className="text-xs text-stone-500 mb-1">钙</div>
                            <div className="flex items-end gap-2">
                              <span className="text-lg font-bold text-stone-800">{avgCalcium.toFixed(1)}mg</span>
                              <span className="text-xs text-stone-400 mb-1">/ 目标 {goals.calcium}mg</span>
                            </div>
                            <div className="w-full h-1.5 bg-stone-100 rounded-full mt-2 overflow-hidden">
                              <div className="h-full bg-teal-400 rounded-full" style={{ width: `${Math.min(100, (avgCalcium / goals.calcium) * 100)}%` }}></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  <div className="space-y-8">
                    {data.schedule.map((day, idx) => (
                      <div key={idx} className="break-inside-avoid">
                        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-4 pb-2 border-b border-stone-200 gap-2">
                          <h3 className="text-lg font-bold text-stone-800 flex items-center gap-2">
                            第 {day.day} 天 <span className="text-sm font-normal text-stone-500">({getDisplayDate(day.day)})</span>
                          </h3>
                          {day.nutritionEstimates && (
                            <div className="flex gap-4 text-xs">
                              <div className="flex flex-col">
                                <span className="text-stone-500 mb-0.5">蛋白质</span>
                                <div className="flex items-center gap-1.5">
                                  <div className="w-16 h-1.5 bg-stone-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-400 rounded-full" style={{ width: `${Math.min(100, (parseFloat(day.nutritionEstimates.protein) / goals.protein) * 100)}%` }}></div>
                                  </div>
                                  <span className="text-stone-700 font-medium">{day.nutritionEstimates.protein}g <span className="text-stone-400 font-normal">/ {goals.protein}g</span></span>
                                </div>
                              </div>
                              <div className="flex flex-col">
                                <span className="text-stone-500 mb-0.5">铁</span>
                                <div className="flex items-center gap-1.5">
                                  <div className="w-16 h-1.5 bg-stone-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-rose-400 rounded-full" style={{ width: `${Math.min(100, (parseFloat(day.nutritionEstimates.iron) / goals.iron) * 100)}%` }}></div>
                                  </div>
                                  <span className="text-stone-700 font-medium">{day.nutritionEstimates.iron}mg <span className="text-stone-400 font-normal">/ {goals.iron}mg</span></span>
                                </div>
                              </div>
                              <div className="flex flex-col">
                                <span className="text-stone-500 mb-0.5">钙</span>
                                <div className="flex items-center gap-1.5">
                                  <div className="w-16 h-1.5 bg-stone-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-teal-400 rounded-full" style={{ width: `${Math.min(100, (parseFloat(day.nutritionEstimates.calcium) / goals.calcium) * 100)}%` }}></div>
                                  </div>
                                  <span className="text-stone-700 font-medium">{day.nutritionEstimates.calcium}mg <span className="text-stone-400 font-normal">/ {goals.calcium}mg</span></span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="bg-stone-50 text-stone-600 text-sm">
                                <th className="py-3 px-4 font-medium border-y border-stone-200 w-24">餐次</th>
                                <th className="py-3 px-4 font-medium border-y border-stone-200 w-24">时间</th>
                                <th className="py-3 px-4 font-medium border-y border-stone-200 w-48">食物</th>
                                <th className="py-3 px-4 font-medium border-y border-stone-200 w-32">用量</th>
                                <th className="py-3 px-4 font-medium border-y border-stone-200">做法说明</th>
                              </tr>
                            </thead>
                            <tbody className="text-sm">
                              {day.meals.map((meal, mIdx) => {
                                const isClickable = findIngredient(meal.food) !== null;
                                return (
                                  <tr key={`meal-${mIdx}`} className={`border-b border-stone-100 ${meal.type.includes('加餐') ? 'bg-orange-50/30 hover:bg-orange-50/50' : 'hover:bg-stone-50/50'}`}>
                                    <td className={`py-3 px-4 font-medium ${meal.type.includes('加餐') ? 'text-orange-700' : 'text-stone-800'}`}>{meal.type}</td>
                                    <td className="py-3 px-4 text-stone-500">{meal.time}</td>
                                    <td className="py-3 px-4 text-stone-700 font-medium">
                                      {isClickable ? (
                                        <button 
                                          onClick={() => handleFoodClick(meal.food)}
                                          className="text-rose-500 hover:text-rose-600 hover:underline underline-offset-2 decoration-rose-300 transition-all text-left"
                                        >
                                          {meal.food}
                                        </button>
                                      ) : (
                                        meal.food
                                      )}
                                    </td>
                                    <td className="py-3 px-4 text-stone-600">{meal.amount}</td>
                                    <td className="py-3 px-4 text-stone-600 leading-relaxed">{meal.recipe}</td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                        {day.summary && (
                          <div className="mt-4 bg-stone-50 rounded-xl p-4 border border-stone-100 flex gap-3">
                            <Info size={20} className="text-rose-400 shrink-0 mt-0.5" />
                            <div>
                              <h4 className="text-sm font-bold text-stone-800 mb-1">今日辅食总结</h4>
                              <p className="text-sm text-stone-600 leading-relaxed">{day.summary}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-stone-400 bg-white rounded-2xl border border-stone-200 border-dashed print:hidden">
                <Baby size={48} className="mb-4 text-stone-300" />
                <p>填写左侧信息，生成专属辅食表</p>
              </div>
            )}
          </div>
        </div>

        {/* History & Favorites Section */}
        {(history.length > 0 || favorites.length > 0) && (
          <div className="mt-8 print:hidden">
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-sm border border-rose-100 p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-rose-100 mb-6 pb-2 gap-4">
                <div className="flex items-center gap-6">
                  <button 
                    onClick={() => setActiveTab('history')}
                    className={`text-lg font-semibold flex items-center gap-2 pb-2 -mb-[9px] transition-colors ${activeTab === 'history' ? 'text-rose-500 border-b-2 border-rose-500' : 'text-stone-400 hover:text-stone-600'}`}
                  >
                    <History size={20} />
                    生成历史
                  </button>
                  <button 
                    onClick={() => setActiveTab('favorites')}
                    className={`text-lg font-semibold flex items-center gap-2 pb-2 -mb-[9px] transition-colors ${activeTab === 'favorites' ? 'text-rose-500 border-b-2 border-rose-500' : 'text-stone-400 hover:text-stone-600'}`}
                  >
                    <Star size={20} className={activeTab === 'favorites' ? 'fill-rose-500' : ''} />
                    我的收藏 ({favorites.length})
                  </button>
                </div>
                
                <button
                  onClick={handleBatchExportExcel}
                  className="flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-medium text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors border border-rose-100"
                >
                  <FileSpreadsheet size={16} />
                  批量导出 Excel
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {(() => {
                  const currentList = activeTab === 'history' ? history : favorites;
                  const currentPage = activeTab === 'history' ? historyPage : favoritesPage;
                  const paginatedList = currentList.slice(0, currentPage * ITEMS_PER_PAGE);
                  
                  return paginatedList.map((item) => {
                    const isFav = favorites.some(fav => fav.id === item.id);
                    return (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        key={item.id}
                        onClick={() => loadHistoryItem(item)}
                        className="group relative bg-white hover:bg-rose-50/50 border border-stone-100 hover:border-rose-200 rounded-2xl p-4 cursor-pointer transition-all shadow-sm hover:shadow-md"
                      >
                        <div className="flex justify-between items-start mb-2 pr-14">
                          <span className="text-sm font-medium text-stone-800">
                            {item.params.age}个月 | {item.params.days}天
                          </span>
                          <span className="text-xs text-stone-500">
                            {formatDate(item.timestamp)}
                          </span>
                        </div>
                        <div className="text-xs text-stone-600 space-y-1 pr-14">
                          <p>性别: {item.params.gender}</p>
                          {item.params.allergies && <p className="truncate">规避: {item.params.allergies}</p>}
                        </div>
                        
                        <div className="absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                          <button
                            onClick={(e) => copyHistoryParams(item, e)}
                            className="p-1.5 text-stone-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                            title="复制参数"
                          >
                            <Copy size={16} />
                          </button>
                          <button
                            onClick={(e) => toggleFavorite(item, e)}
                            className={`p-1.5 rounded-lg transition-colors ${isFav ? 'text-yellow-500 hover:bg-yellow-50' : 'text-stone-400 hover:text-yellow-500 hover:bg-yellow-50'}`}
                            title={isFav ? "取消收藏" : "收藏"}
                          >
                            <Star size={16} className={isFav ? "fill-yellow-500" : ""} />
                          </button>
                          {activeTab === 'history' ? (
                            <button
                              onClick={(e) => deleteHistoryItem(item.id, e)}
                              className="p-1.5 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              title="删除记录"
                            >
                              <Trash2 size={16} />
                            </button>
                          ) : (
                            <button
                              onClick={(e) => deleteFavoriteItem(item.id, e)}
                              className="p-1.5 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              title="移除收藏"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                        {activeTab === 'favorites' && (
                          <div className="mt-3 pt-3 border-t border-rose-100/50">
                            <input
                              type="text"
                              placeholder="添加备注 (如：宝宝很喜欢这份食谱)..."
                              value={item.note || ''}
                              onChange={(e) => updateFavoriteNote(item.id, e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                              className="w-full text-sm px-3 py-2 rounded-xl border border-rose-100 bg-white/50 focus:bg-white focus:ring-1 focus:ring-rose-300 outline-none transition-all placeholder:text-stone-400"
                            />
                          </div>
                        )}
                      </motion.div>
                    );
                  });
                })()}
                {(activeTab === 'history' ? history : favorites).length === 0 && (
                  <div className="col-span-full py-8 text-center text-stone-400 text-sm">
                    {activeTab === 'history' ? '暂无生成历史' : '暂无收藏记录'}
                  </div>
                )}
              </div>
              
              {/* Pagination Controls */}
              {(() => {
                const currentList = activeTab === 'history' ? history : favorites;
                const totalPages = Math.ceil(currentList.length / ITEMS_PER_PAGE);
                const currentPage = activeTab === 'history' ? historyPage : favoritesPage;
                const setPage = activeTab === 'history' ? setHistoryPage : setFavoritesPage;
                
                if (currentPage >= totalPages) return null;
                
                return (
                  <div className="flex justify-center mt-8">
                    <button
                      onClick={() => setPage(p => p + 1)}
                      className="px-6 py-2.5 bg-white border border-stone-200 text-stone-600 rounded-full hover:bg-stone-50 hover:text-stone-900 transition-colors text-sm font-medium shadow-sm"
                    >
                      加载更多
                    </button>
                  </div>
                );
              })()}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
