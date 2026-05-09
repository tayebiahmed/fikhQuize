// src/data/fiqhData.ts

import type { Book, Category, Question, Section, Source } from '../types/fiqh.types';

// =====================================================
// استيراد جميع الكتب (بأسماء الملفات الفعلية)
// =====================================================

// فقه العبادات (categoryId: 1)
import BOOK_01_TAHARA from './books/book_01_tahara';
import BOOK_02_SALAH from './books/book_02_salah';
import BOOK_03_JAMAAH from './books/book_03_jamaah';
import BOOK_04_KHAWF from './books/book_04_khawf';
import BOOK_05_JANAIZ from './books/book_05_janaiz';
import BOOK_06_ZAKAH from './books/book_06_zakah';
import BOOK_07_SIYAM from './books/book_07_siyam';
import BOOK_08_HAJJ from './books/book_08_hajj';
import BOOK_09_UDHIYAH from './books/book_09_udhiya';

// فقه الأسرة (categoryId: 2)
import BOOK_10_NIKAH from './books/book_10_nikah';
import BOOK_11_TALAQ from './books/book_11_talaq';
import BOOK_12_RADA from './books/book_12_rada';
import BOOK_13_NAFAQAT from './books/book_13_nafaqat';
import BOOK_14_HADANAH from './books/book_14_hadanah';

// فقه المعاملات (categoryId: 3)
import BOOK_15_BUYU from './books/book_15_buyu';
import BOOK_16_RIBA from './books/book_16_riba';
import BOOK_17_RAHN from './books/book_17_rahn';
import BOOK_18_SHARIKAH from './books/book_18_sharka';
import BOOK_19_IJARAH from './books/book_19_ijarah';
import BOOK_20_GHASB from './books/book_20_ghasb';
import BOOK_21_WAQF from './books/book_21_waqf';

// فقه الجنايات (categoryId: 4)
import BOOK_22_JIHAD from './books/book_22_jihad';
import BOOK_23_HUDUD from './books/book_23_hudud';
import BOOK_24_QISAS from './books/book_24_qisas';
import BOOK_25_QADA from './books/book_25_qada';

// فقه الآداب (categoryId: 5)
import BOOK_26_ADAB from './books/book_26_adab';
import BOOK_27_AKHLAQ from './books/book_27_akhlaq';
import BOOK_28_ZUHD from './books/book_28_zuhd';

// فقه النوازل (categoryId: 6)
import BOOK_29_NAWAZIL_TIB from './books/book_29_nawazil_tibbiya';
import BOOK_30_NAWAZIL_MALIYA from './books/book_30_nawazil_maliya';
import BOOK_31_NAWAZIL_ASR from './books/book_31_nawazil_muasira';

// أصول الفقه والمقاصد (categoryId: 7)
import BOOK_32_USUL from './books/book_32_usul';
import BOOK_33_MAQASID from './books/book_33_maqasid';
import BOOK_34_QAWAID from './books/book_34_qawaid';

// =====================================================
// قاعدة البيانات الرئيسية
// =====================================================

export const FIQH_DATABASE: Book[] = [
  // فقه العبادات (1-9)
  { ...BOOK_01_TAHARA, categoryId: 1 },
  { ...BOOK_02_SALAH, categoryId: 1 },
  { ...BOOK_03_JAMAAH, categoryId: 1 },
  { ...BOOK_04_KHAWF, categoryId: 1 },
  { ...BOOK_05_JANAIZ, categoryId: 1 },
  { ...BOOK_06_ZAKAH, categoryId: 1 },
  { ...BOOK_07_SIYAM, categoryId: 1 },
  { ...BOOK_08_HAJJ, categoryId: 1 },
  { ...BOOK_09_UDHIYAH, categoryId: 1 },
  
  // فقه الأسرة (10-14)
  { ...BOOK_10_NIKAH, categoryId: 2 },
  { ...BOOK_11_TALAQ, categoryId: 2 },
  { ...BOOK_12_RADA, categoryId: 2 },
  { ...BOOK_13_NAFAQAT, categoryId: 2 },
  { ...BOOK_14_HADANAH, categoryId: 2 },
  
  // فقه المعاملات (15-21)
  { ...BOOK_15_BUYU, categoryId: 3 },
  { ...BOOK_16_RIBA, categoryId: 3 },
  { ...BOOK_17_RAHN, categoryId: 3 },
  { ...BOOK_18_SHARIKAH, categoryId: 3 },
  { ...BOOK_19_IJARAH, categoryId: 3 },
  { ...BOOK_20_GHASB, categoryId: 3 },
  { ...BOOK_21_WAQF, categoryId: 3 },
  
  // فقه الجنايات (22-25)
  { ...BOOK_22_JIHAD, categoryId: 4 },
  { ...BOOK_23_HUDUD, categoryId: 4 },
  { ...BOOK_24_QISAS, categoryId: 4 },
  { ...BOOK_25_QADA, categoryId: 4 },
  
  // فقه الآداب (26-28)
  { ...BOOK_26_ADAB, categoryId: 5 },
  { ...BOOK_27_AKHLAQ, categoryId: 5 },
  { ...BOOK_28_ZUHD, categoryId: 5 },
  
  // فقه النوازل (29-31)
  { ...BOOK_29_NAWAZIL_TIB, categoryId: 6 },
  { ...BOOK_30_NAWAZIL_MALIYA, categoryId: 6 },
  { ...BOOK_31_NAWAZIL_ASR, categoryId: 6 },
  
  // أصول الفقه والمقاصد (32-34)
  { ...BOOK_32_USUL, categoryId: 7 },
  { ...BOOK_33_MAQASID, categoryId: 7 },
  { ...BOOK_34_QAWAID, categoryId: 7 },
].map(book => ({
  ...book,
  badge: book.badge || 'باحث',
  description: book.description || `دراسة علمية لـ ${book.title} وفق المذهب المالكي.`
}));

// =====================================================
// التصدير
// =====================================================

export { CATEGORIES } from '../types/fiqh.types';
export type { Book, Category, Section, Question, Source };
