export type OptionKey = 'A' | 'B' | 'C' | 'D' | 'E';

export type ExamYear = 2022 | 2023 | 2024 | 2025 | 'ADJ' | 'COMP' | 'MOD' | 'COMPET';

export interface QuestionOptionMap {
  A: string;
  B: string;
  C: string;
  D: string;
  E?: string;
}

export interface OptionBreakdownMap {
  A: string;
  B: string;
  C: string;
  D: string;
  E?: string;
}

export interface RawQuestionItem {
  id: string; // e.g., "2022_Q01", "ADJ_001", "COMP_001", "MOD_001", or "COMPET_001"
  year: ExamYear;
  qNum: number; // 1..60, 1..105, or 1..70
  sessionName: string; // e.g., "دورة نونبر 2022" or "الكفايات ومداخل المنهاج والوضعيات"
  examCode?: string;
  category: string;
  isTextQuestion: boolean; // true for Q1..Q5 of official exams
  question: string;
  options: QuestionOptionMap;
  correctAnswer: OptionKey;
  officialExplanation: string;
  referenceSource: string;
  optionBreakdowns?: Partial<OptionBreakdownMap>;
}

export interface EnrichedQuestionItem extends RawQuestionItem {
  optionBreakdowns: OptionBreakdownMap;
}

export interface StartingText {
  year: 2022 | 2023 | 2024 | 2025;
  sessionTitle: string;
  examTitle: string;
  examCode?: string;
  paragraphs: string[];
  sourceCitation: string;
  centralTheme: string;
  keyPedagogicalConcepts: string[];
  relatedQuestionNumbers: number[];
}

export interface GeneratedReverseQuestion {
  sourceQuestionId: string;
  targetDistractorKey: OptionKey;
  targetDistractorText: string;
  questionStem: string;
  options: QuestionOptionMap;
  correctOption: OptionKey;
  explanation: string;
}

export type FilterCategory =
  | 'ALL'
  | '2022'
  | '2023'
  | '2024'
  | '2025'
  | 'ADJ'
  | 'COMP'
  | 'MOD'
  | 'COMPET'
  | 'TEXT_01_05'
  | 'DIDACTIC_06_60'
  | 'ANSWER_E'
  | 'BOOKMARKS'
  | 'MISTAKES';

export type ActiveTab = 'QUESTIONS' | 'STARTING_TEXTS' | 'ANSWER_KEYS' | 'JSON_DB';
