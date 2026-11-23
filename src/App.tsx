/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useMemo, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Download,
  RotateCcw,
  Search,
  X,
} from 'lucide-react';
import { ALL_QUESTIONS } from './data/didacticEngine';
import { STARTING_TEXTS } from './data/startingTexts';
import {
  ActiveTab,
  ExamYear,
  FilterCategory,
  OptionKey,
} from './types/exam';
import { QuestionCard } from './components/QuestionCard';
import {
  AnswerKeysView,
  JsonDatabaseView,
  StartingTextsView,
} from './components/SecondaryViews';
import {
  OfflineIndicator,
  PWAInstallButton,
} from './components/PWAInstallBanner';

const STORAGE_ANSWERS_KEY = 'arabic_didactics_pwa_answers_v1';
const STORAGE_BOOKMARKS_KEY = 'arabic_didactics_pwa_bookmarks_v1';
const ITEMS_PER_PAGE = 15;

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('QUESTIONS');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterCategory>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [showResetModal, setShowResetModal] = useState(false);

  // Persisted User Answers
  const [userAnswers, setUserAnswers] = useState<Record<string, OptionKey>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_ANSWERS_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Persisted Bookmarks
  const [bookmarks, setBookmarks] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_BOOKMARKS_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_ANSWERS_KEY, JSON.stringify(userAnswers));
    } catch {
      // ignore storage quota errors
    }
  }, [userAnswers]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_BOOKMARKS_KEY, JSON.stringify(bookmarks));
    } catch {
      // ignore storage quota errors
    }
  }, [bookmarks]);

  // Score calculation
  const scoreStats = useMemo(() => {
    const answeredIds = Object.keys(userAnswers);
    const totalAnswered = answeredIds.length;
    let correctCount = 0;
    let wrongCount = 0;

    for (const q of ALL_QUESTIONS) {
      const ans = userAnswers[q.id];
      if (ans) {
        if (ans === q.correctAnswer) {
          correctCount++;
        } else {
          wrongCount++;
        }
      }
    }

    return {
      correctCount,
      totalAnswered,
      wrongCount,
    };
  }, [userAnswers]);

  // Counts for dynamic filter labels
  const answerECount = useMemo(
    () => ALL_QUESTIONS.filter((q) => q.correctAnswer === 'E').length,
    []
  );

  // Filtered Questions
  const filteredQuestions = useMemo(() => {
    const qLower = searchQuery.trim().toLowerCase();

    return ALL_QUESTIONS.filter((q) => {
      // Category Filter
      if (activeFilter === '2022' && q.year !== 2022) return false;
      if (activeFilter === '2023' && q.year !== 2023) return false;
      if (activeFilter === '2024' && q.year !== 2024) return false;
      if (activeFilter === '2025' && q.year !== 2025) return false;
      if (activeFilter === 'ADJ' && q.year !== 'ADJ') return false;
      if (activeFilter === 'COMP' && q.year !== 'COMP') return false;
      if (activeFilter === 'MOD' && q.year !== 'MOD') return false;
      if (activeFilter === 'COMPET' && q.year !== 'COMPET') return false;
      if (activeFilter === 'TEXT_01_05' && (typeof q.year !== 'number' || q.qNum < 1 || q.qNum > 5)) return false;
      if (activeFilter === 'DIDACTIC_06_60' && (typeof q.year !== 'number' || q.qNum < 6)) return false;
      if (activeFilter === 'ANSWER_E' && q.correctAnswer !== 'E') return false;
      if (activeFilter === 'BOOKMARKS' && !bookmarks.includes(q.id)) return false;
      if (activeFilter === 'MISTAKES') {
        const uAns = userAnswers[q.id];
        if (!uAns || uAns === q.correctAnswer) return false;
      }

      // Search Query Filter (searches question stem, options, explanations, distractors, ID, category)
      if (qLower) {
        const inId = q.id.toLowerCase().includes(qLower);
        const inStem = q.question.toLowerCase().includes(qLower);
        const inCategory = q.category.toLowerCase().includes(qLower);
        const inSession = q.sessionName.toLowerCase().includes(qLower);
        const inExpl = q.officialExplanation.toLowerCase().includes(qLower);
        const inRef = q.referenceSource.toLowerCase().includes(qLower);
        const inOptions = Object.values(q.options).some((opt) =>
          opt?.toLowerCase().includes(qLower)
        );
        const inBreakdowns = Object.values(q.optionBreakdowns).some((bd) =>
          bd?.toLowerCase().includes(qLower)
        );

        if (
          !inId &&
          !inStem &&
          !inCategory &&
          !inSession &&
          !inExpl &&
          !inRef &&
          !inOptions &&
          !inBreakdowns
        ) {
          return false;
        }
      }

      return true;
    });
  }, [activeFilter, searchQuery, bookmarks, userAnswers]);

  // Reset pagination when filter or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeFilter, searchQuery]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredQuestions.length / ITEMS_PER_PAGE)
  );

  const paginatedQuestions = useMemo(() => {
    const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredQuestions.slice(startIdx, startIdx + ITEMS_PER_PAGE);
  }, [filteredQuestions, currentPage]);

  // Handlers
  const handleSelectOption = (questionId: string, option: OptionKey) => {
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: option,
    }));
  };

  const handleResetSingleQuestion = (questionId: string) => {
    setUserAnswers((prev) => {
      const next = { ...prev };
      delete next[questionId];
      return next;
    });
  };

  const handleToggleBookmark = (questionId: string) => {
    setBookmarks((prev) =>
      prev.includes(questionId)
        ? prev.filter((id) => id !== questionId)
        : [...prev, questionId]
    );
  };

  const handleResetAllAnswers = () => {
    setUserAnswers({});
    setShowResetModal(false);
  };

  const handleDownloadJson = () => {
    const payload = {
      title: 'موسوعة ديدكتيك اللغة العربية',
      subtitle: 'ديدكتيك اللغة العربية — الدورات الرسمية (2022–2025) والتوصيف',
      totalQuestions: ALL_QUESTIONS.length,
      sessions: [2022, 2023, 2024, 2025, 'ADJ', 'COMP', 'MOD', 'COMPET'],
      startingTexts: STARTING_TEXTS,
      questions: ALL_QUESTIONS,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'encyclopedia-didactics-arabic-2022-2026-545q.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleJumpToSessionQuestions = (year: ExamYear) => {
    setActiveTab('QUESTIONS');
    setSearchQuery('');
    setActiveFilter(String(year) as FilterCategory);
    setCurrentPage(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectQuestionFromGrid = (year: ExamYear, qNum: number) => {
    setActiveTab('QUESTIONS');
    setSearchQuery('');
    setActiveFilter(String(year) as FilterCategory);
    const targetPage = Math.ceil(qNum / ITEMS_PER_PAGE);
    setCurrentPage(targetPage);

    const qId =
      year === 'ADJ'
        ? `ADJ_${String(qNum).padStart(3, '0')}`
        : year === 'COMP'
        ? `COMP_${String(qNum).padStart(3, '0')}`
        : year === 'MOD'
        ? `MOD_${String(qNum).padStart(3, '0')}`
        : year === 'COMPET'
        ? `COMPET_${String(qNum).padStart(3, '0')}`
        : `${year}_Q${String(qNum).padStart(2, '0')}`;
    setTimeout(() => {
      const el = document.getElementById(`q-${qId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  };

  const filterButtons: { key: FilterCategory; label: string }[] = [
    { key: 'ALL', label: `جميع الأسئلة (545)` },
    { key: '2022', label: `دورة 2022 (60)` },
    { key: '2023', label: `دورة 2023 (60)` },
    { key: '2024', label: `دورة 2024 (60)` },
    { key: '2025', label: `دورة 2025 (60)` },
    { key: 'ADJ', label: `الأسئلة المستقلة (105)` },
    { key: 'COMP', label: `مراجعة التوصيف والهندسة (60)` },
    { key: 'MOD', label: `هندسة المكونات والحصص والتوزيع (70)` },
    { key: 'COMPET', label: `الكفايات ومداخل المنهاج (70)` },
    { key: 'TEXT_01_05', label: `أسئلة النص (01-05)` },
    { key: 'DIDACTIC_06_60', label: `أسئلة الديدكتيك (06-60)` },
    { key: 'ANSWER_E', label: `أسئلة جوابها E (${answerECount})` },
    { key: 'BOOKMARKS', label: `المفضلة (${bookmarks.length})` },
    { key: 'MISTAKES', label: `مراجعة الأخطاء (${scoreStats.wrongCount})` },
  ];

  // Page numbers array
  const pageNumbers = useMemo(() => {
    const pages: number[] = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }, [totalPages]);

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-[#1E293B]" dir="rtl">
      {/* Top Sticky Header Bar (3-zone layout) */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-[#E2E8F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4 sm:gap-8 overflow-x-auto">
          {/* Right Side: Brand Title in Bold Emerald Green */}
          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('QUESTIONS');
              setActiveFilter('ALL');
            }}
            className="text-base sm:text-lg font-bold text-[#059669] hover:text-emerald-700 transition-colors whitespace-nowrap shrink-0"
          >
            موسوعة ديدكتيك اللغة العربية
          </a>

          {/* Center Navigation Tabs */}
          <nav
            aria-label="التنقل الرئيسي"
            className="flex items-center gap-2 sm:gap-5 text-xs sm:text-sm font-semibold text-slate-600"
          >
            <button
              type="button"
              onClick={() => setActiveTab('QUESTIONS')}
              className={`py-1.5 border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === 'QUESTIONS'
                  ? 'border-[#059669] text-[#059669] font-bold'
                  : 'border-transparent hover:text-slate-900'
              }`}
            >
              بنك الأسئلة (545)
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('STARTING_TEXTS')}
              className={`py-1.5 border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === 'STARTING_TEXTS'
                  ? 'border-[#059669] text-[#059669] font-bold'
                  : 'border-transparent hover:text-slate-900'
              }`}
            >
              نصوص الانطلاق
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('ANSWER_KEYS')}
              className={`py-1.5 border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === 'ANSWER_KEYS'
                  ? 'border-[#059669] text-[#059669] font-bold'
                  : 'border-transparent hover:text-slate-900'
              }`}
            >
              مفاتيح التصحيح
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('JSON_DB')}
              className={`py-1.5 border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === 'JSON_DB'
                  ? 'border-[#059669] text-[#059669] font-bold'
                  : 'border-transparent hover:text-slate-900'
              }`}
            >
              قاعدة بيانات JSON
            </button>
          </nav>

          {/* Left Side: Primary Action Button */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleDownloadJson}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#059669] hover:bg-emerald-700 px-3.5 py-2 text-xs font-bold text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>تحميل قاعدة JSON</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main id="top" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Hero / Subtitle & Score Bar */}
        <section className="bg-white border border-[#E2E8F0] rounded-xl p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#1E293B] text-balance">
              ديدكتيك اللغة العربية — الدورات الرسمية (2022–2025) والتوصيف
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1.5 leading-relaxed">
              البرامج والتوجيهات التربوية للإعدادي (غشت 2009) والتأهيلي (نونبر 2007) والمذكرات الوزارية الرسمية (105، 43، 142، 175، 180) والدليل البيداغوجي (2014).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <PWAInstallButton />

            <div className="text-xs sm:text-sm font-bold text-slate-800 bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-lg tabular-nums whitespace-nowrap">
              <span>النتيجة الحالية: </span>
              <span className="text-[#059669] font-mono">
                {scoreStats.correctCount}
              </span>
              <span className="mx-1 text-slate-400">/</span>
              <span className="font-mono">{scoreStats.totalAnswered}</span>
              <span className="text-slate-500 text-xs mr-1.5 font-normal">
                (من أصل 545)
              </span>
            </div>

            <button
              type="button"
              onClick={() => setShowResetModal(true)}
              disabled={scoreStats.totalAnswered === 0}
              className={`inline-flex items-center gap-1.5 rounded-lg border px-3.5 py-2 text-xs font-bold transition-colors whitespace-nowrap shrink-0 ${
                scoreStats.totalAnswered > 0
                  ? 'border-red-200 bg-red-50 text-[#DC2626] hover:bg-red-100 cursor-pointer'
                  : 'border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed'
              }`}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>إعادة تعيين جميع الإجابات</span>
            </button>
          </div>
        </section>

        {/* Inline Confirmation Modal for Reset All Answers */}
        {showResetModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
            <div className="bg-white border border-slate-200 rounded-xl max-w-md w-full p-6 shadow-xl space-y-4">
              <h3 className="text-base font-bold text-slate-900">
                تأكيد إعادة تعيين جميع الإجابات
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                هل أنت متأكد من رغبتك في مسح جميع إجاباتك المسجلة ({scoreStats.totalAnswered} إجابة) وإعادة العداد إلى الصفر؟ ستظل أسئلتك المحفوظة في المفضلة كما هي.
              </p>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowResetModal(false)}
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  onClick={handleResetAllAnswers}
                  className="rounded-lg bg-[#DC2626] px-4 py-2 text-xs font-bold text-white hover:bg-red-700 cursor-pointer"
                >
                  نعم، إعادة التعيين الآن
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 1: QUESTION BANK (240 QUESTIONS) */}
        {activeTab === 'QUESTIONS' && (
          <>
            {/* Search & Filter Control Bar */}
            <section className="bg-white border border-[#E2E8F0] rounded-xl p-4 sm:p-5 space-y-4">
              {/* Search Input Box */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ابحث في 545 سؤالاً أو التعليلات أو المموهات..."
                  className="w-full rounded-lg border border-slate-300 bg-[#F8FAFC] pr-10 pl-10 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#059669] focus:bg-white transition-colors"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    aria-label="مسح البحث"
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Interactive Filter Controls */}
              <div className="flex flex-wrap items-center gap-2">
                {filterButtons.map((fb) => {
                  const isActive = activeFilter === fb.key;
                  return (
                    <button
                      key={fb.key}
                      type="button"
                      onClick={() => setActiveFilter(fb.key)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors whitespace-nowrap shrink-0 cursor-pointer tabular-nums ${
                        isActive
                          ? 'bg-[#059669] text-white border-[#059669]'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {fb.label}
                    </button>
                  );
                })}
              </div>

              {/* Top Pagination & Count Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs text-slate-600">
                <div className="font-semibold tabular-nums">
                  <span>عدد الأسئلة المعروضة: </span>
                  <span className="font-mono font-bold text-[#059669]">
                    {filteredQuestions.length}
                  </span>
                  <span> سؤالاً </span>
                  {filteredQuestions.length > 0 && (
                    <span className="text-slate-400">
                      (الصفحة {currentPage} من {totalPages} — 15 سؤالاً في الصفحة)
                    </span>
                  )}
                </div>

                {totalPages > 1 && (
                  <div className="flex flex-wrap items-center gap-1">
                    <button
                      type="button"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-slate-200 bg-white text-slate-700 disabled:opacity-40 hover:bg-slate-50 font-semibold cursor-pointer"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                      <span>السابق</span>
                    </button>

                    {pageNumbers.map((pageNum) => (
                      <button
                        key={pageNum}
                        type="button"
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-7 h-7 rounded-md font-mono text-xs font-bold transition-colors cursor-pointer tabular-nums ${
                          currentPage === pageNum
                            ? 'bg-[#059669] text-white'
                            : 'bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {pageNum}
                      </button>
                    ))}

                    <button
                      type="button"
                      disabled={currentPage === totalPages}
                      onClick={() =>
                        setCurrentPage((p) => Math.min(totalPages, p + 1))
                      }
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-slate-200 bg-white text-slate-700 disabled:opacity-40 hover:bg-slate-50 font-semibold cursor-pointer"
                    >
                      <span>التالي</span>
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </section>

            {/* Questions List or Empty State */}
            {paginatedQuestions.length === 0 ? (
              <div className="bg-white border border-[#E2E8F0] rounded-xl p-12 text-center space-y-3">
                <p className="text-base font-bold text-slate-800">
                  لا توجد أسئلة مطابقة لمعايير البحث أو التصفية المحددة حالياً.
                </p>
                <p className="text-xs text-slate-500">
                  {activeFilter === 'MISTAKES'
                    ? 'لم يتم تسجيل أي إجابات خاطئة حتى الآن. أجب عن الأسئلة في بنك الأسئلة لتظهر أخطاؤك هنا للمراجعة.'
                    : activeFilter === 'BOOKMARKS'
                    ? 'قائمة المفضلة فارغة حالياً. اضغط على زر "حفظ السؤال" في أي بطاقة سؤال لإضافته إلى المفضلة.'
                    : 'جرب تغيير كلمات البحث أو العودة إلى جميع الأسئلة (545).'}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setActiveFilter('ALL');
                    setSearchQuery('');
                  }}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#059669] text-white px-4 py-2 text-xs font-bold hover:bg-emerald-700 transition-colors cursor-pointer"
                >
                  عرض جميع الأسئلة (545)
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {paginatedQuestions.map((question) => (
                  <QuestionCard
                    key={question.id}
                    question={question}
                    selectedOption={userAnswers[question.id]}
                    isBookmarked={bookmarks.includes(question.id)}
                    onSelectOption={handleSelectOption}
                    onResetQuestion={handleResetSingleQuestion}
                    onToggleBookmark={handleToggleBookmark}
                  />
                ))}
              </div>
            )}

            {/* Bottom Pagination Bar */}
            {totalPages > 1 && (
              <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs font-semibold text-slate-600 tabular-nums">
                  عرض الأسئلة من {(currentPage - 1) * ITEMS_PER_PAGE + 1} إلى{' '}
                  {Math.min(
                    currentPage * ITEMS_PER_PAGE,
                    filteredQuestions.length
                  )}{' '}
                  من أصل {filteredQuestions.length} سؤالاً
                </span>

                <div className="flex flex-wrap items-center gap-1">
                  <button
                    type="button"
                    disabled={currentPage === 1}
                    onClick={() => {
                      setCurrentPage((p) => Math.max(1, p - 1));
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-700 disabled:opacity-40 hover:bg-slate-50 cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                    <span>السابق</span>
                  </button>

                  {pageNumbers.map((pageNum) => (
                    <button
                      key={pageNum}
                      type="button"
                      onClick={() => {
                        setCurrentPage(pageNum);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className={`w-8 h-8 rounded-lg font-mono text-xs font-bold transition-colors cursor-pointer tabular-nums ${
                        currentPage === pageNum
                          ? 'bg-[#059669] text-white'
                          : 'bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {pageNum}
                    </button>
                  ))}

                  <button
                    type="button"
                    disabled={currentPage === totalPages}
                    onClick={() => {
                      setCurrentPage((p) => Math.min(totalPages, p + 1));
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-700 disabled:opacity-40 hover:bg-slate-50 cursor-pointer"
                  >
                    <span>التالي</span>
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* TAB 2: STARTING TEXTS */}
        {activeTab === 'STARTING_TEXTS' && (
          <StartingTextsView
            onJumpToSessionQuestions={handleJumpToSessionQuestions}
          />
        )}

        {/* TAB 3: ANSWER KEYS */}
        {activeTab === 'ANSWER_KEYS' && (
          <AnswerKeysView
            userAnswers={userAnswers}
            onSelectQuestionFromGrid={handleSelectQuestionFromGrid}
          />
        )}

        {/* TAB 4: JSON DATABASE */}
        {activeTab === 'JSON_DB' && (
          <JsonDatabaseView onDownloadJson={handleDownloadJson} />
        )}
      </main>

      {/* Quiet Editorial Footer */}
      <footer className="bg-white border-t border-[#E2E8F0] mt-12 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <p>
            موسوعة ديدكتيك اللغة العربية — الدورات الرسمية (2022–2025) والتوصيف (545 سؤالاً رسمياً ومستقلاً معللاً).
          </p>
          <p>
            تطبيق ويب تقدمي (PWA) يعمل 100% بدون إنترنت مع حفظ تلقائي للإجابات والمفضلة.
          </p>
        </div>
      </footer>

      <OfflineIndicator />
    </div>
  );
}
