/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Source {
  book: string;
  page?: string;
  chapter?: string;
}

export interface Question {
  id: string;
  text: string;
  options: string[];
  correct: number;
  fawaid?: string;
  explanation?: string;
  xp?: number;
  source?: Source;
}

export interface Section {
  id: string;
  title: string;
  questions: Question[];
}

export interface Book {
  id: string;
  title: string;
  icon: string;
  color: string;
  sections: Section[];
  unlocked?: boolean;
}

export interface Category {
  id: string;
  name: string;
  books: string[]; // IDs of books
}
