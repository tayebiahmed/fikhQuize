// src/types/fiqh.types.ts

export interface Source {
  book: string;
  chapter: string;
  reference?: string;
  scholar?: string;
  note?: string;
}

export interface Question {
  id: string;
  text: string;
  options: string[];
  correct: number;
  explanation: string;
  xp: number;
  fawaid?: string;
  tags: string[];
  source: Source;
  difficulty?: 'easy' | 'medium' | 'hard';
  fiqhText?: string;
}

export interface Section {
  id: string;
  title: string;
  icon: string;
  description?: string;
  estimatedTime?: number;
  questionsCount: number;
  questions: Question[];
}

export interface Book {
  id: string;
  categoryId: number;
  title: string;
  icon: any;
  color: string;
  badge: string;
  description: string;
  sections: Section[];
  totalQuestions?: number;
}

export interface Category {
  id: number;
  name: string;
  icon: string;
  color: string;
  description: string;
}

export const CATEGORIES: Category[] = [
  {
    id: 1,
    name: "فقه العبادات",
    icon: "🕋",
    color: "bg-emerald-600",
    description: "الطهارة، الصلاة، الزكاة، الصيام، الحج"
  },
  {
    id: 2,
    name: "فقه الأسرة",
    icon: "👨‍👩‍👧",
    color: "bg-pink-600",
    description: "النكاح، الطلاق، الرضاع، النفقات، الحضانة"
  },
  {
    id: 3,
    name: "فقه المعاملات",
    icon: "🤝",
    color: "bg-amber-600",
    description: "البيوع، الربا، الرهن، الشركة، الإجارة"
  },
  {
    id: 4,
    name: "فقه الجنايات",
    icon: "⚖️",
    color: "bg-red-700",
    description: "الجهاد، الحدود، القصاص والدية"
  },
  {
    id: 5,
    name: "فقه الآداب",
    icon: "✨",
    color: "bg-yellow-500",
    description: "الآداب، الأخلاق، الزهد والرقائق"
  },
  {
    id: 6,
    name: "فقه النوازل",
    icon: "🔬",
    color: "bg-blue-600",
    description: "النوازل الطبية، المالية، المعاصرة"
  },
  {
    id: 7,
    name: "أصول الفقه والمقاصد",
    icon: "📖",
    color: "bg-teal-600",
    description: "أصول الفقه، مقاصد الشريعة، القواعد الفقهية"
  }
];