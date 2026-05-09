// src/types/fiqh.types.ts

export interface Source {
  name: string;
  author?: string;
  century?: number;
  type: 'matn' | 'mukhtasar' | 'sharh' | 'hashiya' | 'tahqiq';
  reference?: string;
}

export interface Question {
  id: string;
  type: 'multiple-choice' | 'true-false';
  text: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  sources?: Source[];
  xp?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
}

export interface Section {
  id: string;
  title: string;
  icon: string;
  questions: Question[];
  description?: string;
  estimatedTime?: number; // بالدقائق
}

export interface Book {
  id: string;
  categoryId: number;
  title: string;
  icon: string;
  color: string;
  badge: string;
  description?: string;
  sections: Section[];
  sourceRef?: string;
}

export interface Category {
  id: number;
  name: string;
  icon: string;
  color: string;
  description?: string;
}

export const CATEGORIES: Category[] = [
  { id: 1, name: "فقه العبادات", icon: "🕌", color: "from-emerald-700 to-teal-800", description: "الطهارة، الصلاة، الزكاة، الصيام، الحج" },
  { id: 2, name: "فقه الأسرة", icon: "💍", color: "from-rose-500 to-pink-600", description: "النكاح، الطلاق، الرضاع، النفقات، الحضانة" },
  { id: 3, name: "فقه المعاملات", icon: "⚖️", color: "from-orange-500 to-amber-600", description: "البيوع، الربا، الشركات، الإجارات، الأوقاف" },
  { id: 4, name: "فقه الجنايات والقضاء", icon: "🛡️", color: "from-red-600 to-red-800", description: "الحدود، القصاص، الجهاد، القضاء والشهادات" },
  { id: 5, name: "فقه الآداب والأخلاق", icon: "✨", color: "from-yellow-400 to-orange-500", description: "الآداب الشرعية والأخلاق الإسلامية" },
  { id: 6, name: "فقه النوازل", icon: "📜", color: "from-blue-600 to-blue-800", description: "القضايا المعاصرة والمستجدة" },
  { id: 7, name: "أصول الفقه والمقاصد", icon: "📖", color: "from-purple-600 to-indigo-800", description: "قواعد وأصول الفقه المالكي" }
];
