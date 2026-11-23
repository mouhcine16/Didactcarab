import React, { useState } from 'react';
import {
  Bookmark,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Code2,
  RotateCcw,
  Sparkles,
  XCircle,
} from 'lucide-react';
import {
  EnrichedQuestionItem,
  GeneratedReverseQuestion,
  OptionKey,
} from '../types/exam';
import { STARTING_TEXTS } from '../data/startingTexts';
import { generateReverseQuestion } from '../data/didacticEngine';

interface QuestionCardProps {
  question: EnrichedQuestionItem;
  selectedOption?: OptionKey;
  isBookmarked: boolean;
  onSelectOption: (questionId: string, option: OptionKey) => void;
  onResetQuestion: (questionId: string) => void;
  onToggleBookmark: (questionId: string) => void;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  selectedOption,
  isBookmarked,
  onSelectOption,
  onResetQuestion,
  onToggleBookmark,
}) => {
  const [showStartingText, setShowStartingText] = useState(false);
  const [showJson, setShowJson] = useState(false);
  const [distractorTarget, setDistractorTarget] = useState<OptionKey | 'RANDOM'>('RANDOM');
  const [reverseQuiz, setReverseQuiz] = useState<GeneratedReverseQuestion | null>(null);
  const [reverseUserAnswer, setReverseUserAnswer] = useState<OptionKey | null>(null);

  const isAnswered = !!selectedOption;
  const isCorrect = isAnswered && selectedOption === question.correctAnswer;

  const optionKeys: OptionKey[] = question.options.E
    ? ['A', 'B', 'C', 'D', 'E']
    : ['A', 'B', 'C', 'D'];

  const distractorKeys: OptionKey[] = (['A', 'B', 'C', 'D'] as OptionKey[]).filter(
    (k) => k !== question.correctAnswer
  );

  const startingTextData =
    typeof question.year === 'number' ? STARTING_TEXTS[question.year] : undefined;

  const handleGenerateReverse = () => {
    const generated = generateReverseQuestion(question, distractorTarget);
    setReverseQuiz(generated);
    setReverseUserAnswer(null);
  };

  const jsonPreviewData = isAnswered
    ? question
    : {
        id: question.id,
        year: question.year,
        qNum: question.qNum,
        sessionName: question.sessionName,
        category: question.category,
        question: question.question,
        options: question.options,
        note: 'أجب عن السؤال أولاً لإظهار الجواب الصحيح والتعليل الديدكتيكي وتفكيك المموهات',
      };

  return (
    <article
      id={`q-${question.id}`}
      className="bg-white border border-[#E2E8F0] rounded-xl p-5 sm:p-6 transition-colors"
    >
      {/* Top Meta Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-100">
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
          <span className="font-mono font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md tabular-nums">
            {question.id}
          </span>
          <span aria-hidden="true" className="text-slate-300">·</span>
          <span className="font-semibold text-slate-800">{question.sessionName}</span>
          {question.examCode && (
            <>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span className="font-mono text-slate-500">{question.examCode}</span>
            </>
          )}
          <span aria-hidden="true" className="text-slate-300">·</span>
          <span className="text-slate-600 font-medium">{question.category}</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {question.isTextQuestion && startingTextData && (
            <button
              type="button"
              onClick={() => setShowStartingText((prev) => !prev)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                showStartingText
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>عرض نص الانطلاق</span>
              {showStartingText ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </button>
          )}

          <button
            type="button"
            onClick={() => onToggleBookmark(question.id)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              isBookmarked
                ? 'bg-amber-50 text-amber-800 border-amber-300'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Bookmark
              className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-amber-500 text-amber-600' : ''}`}
            />
            <span>{isBookmarked ? 'محفوظ في المفضلة' : 'حفظ السؤال'}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowJson((prev) => !prev)}
            className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-mono font-semibold border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              showJson
                ? 'bg-slate-800 text-white border-slate-800'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>JSON</span>
          </button>
        </div>
      </div>

      {/* Collapsible Starting Text Accordion (for Q01-Q05) */}
      {question.isTextQuestion && showStartingText && startingTextData && (
        <div className="mb-5 rounded-xl bg-slate-50 border border-slate-200 p-4 sm:p-5 text-right">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-200">
            <h4 className="text-sm font-bold text-emerald-800">
              نص الانطلاق الرسمي — {startingTextData.sessionTitle}
            </h4>
            <span className="text-xs text-slate-500">{startingTextData.examTitle}</span>
          </div>
          <div className="space-y-3 text-sm text-slate-800 leading-8">
            {startingTextData.paragraphs.map((para, idx) => (
              <p key={idx} className="whitespace-pre-line text-justify">
                {para}
              </p>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-slate-200 text-xs text-slate-500 font-medium">
            المرجع: {startingTextData.sourceCitation}
          </div>
        </div>
      )}

      {/* JSON Inspector Box */}
      {showJson && (
        <div className="mb-5 rounded-xl bg-slate-900 text-slate-100 p-4 overflow-x-auto text-left" dir="ltr">
          <pre className="text-xs font-mono leading-relaxed">
            {JSON.stringify(jsonPreviewData, null, 2)}
          </pre>
        </div>
      )}

      {/* Question Stem */}
      <h3 className="text-base sm:text-lg font-bold text-[#1E293B] leading-relaxed mb-4">
        <span className="text-emerald-700 ml-1.5 font-mono tabular-nums">
          س{question.qNum}.
        </span>
        {question.question}
      </h3>

      {/* Options List */}
      <div className="space-y-2.5">
        {optionKeys.map((optKey) => {
          const optText = question.options[optKey];
          if (!optText) return null;

          const isThisSelected = selectedOption === optKey;
          const isThisCorrect = question.correctAnswer === optKey;

          let containerClasses =
            'w-full text-right rounded-lg border px-4 py-3 transition-colors flex items-start justify-between gap-3 cursor-pointer ';
          let badgeClasses =
            'w-7 h-7 rounded-md flex items-center justify-center text-xs font-mono font-bold shrink-0 mt-0.5 ';

          if (!isAnswered) {
            // STATE A: Clean neutral light-gray option boxes, zero colors/spoilers
            containerClasses +=
              'bg-[#F8FAFC] hover:bg-slate-100 border-[#E2E8F0] text-[#1E293B]';
            badgeClasses += 'bg-white border border-slate-300 text-slate-700';
          } else if (isThisCorrect) {
            // STATE B: Official correct answer in emerald green
            containerClasses +=
              'bg-emerald-50/90 border-emerald-600 text-emerald-950 font-semibold';
            badgeClasses += 'bg-emerald-600 text-white';
          } else if (isThisSelected && !isThisCorrect) {
            // STATE B: Wrong user selection in red
            containerClasses +=
              'bg-red-50/90 border-red-600 text-red-950 font-semibold';
            badgeClasses += 'bg-red-600 text-white';
          } else {
            // STATE B: Unselected distractor
            containerClasses += 'bg-slate-50/60 border-slate-200 text-slate-600';
            badgeClasses += 'bg-slate-200 text-slate-600';
          }

          return (
            <button
              key={optKey}
              type="button"
              onClick={() => onSelectOption(question.id, optKey)}
              className={containerClasses}
            >
              <div className="flex items-start gap-3 min-w-0 flex-1">
                <span className={badgeClasses}>{optKey}</span>
                <span className="text-sm sm:text-base leading-relaxed break-words">
                  {optText}
                </span>
              </div>

              {isAnswered && isThisCorrect && (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100 border border-emerald-300 px-2.5 py-1 rounded-md whitespace-nowrap shrink-0 mt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>✓ الجواب الصحيح</span>
                </span>
              )}

              {isAnswered && isThisSelected && !isThisCorrect && (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-red-700 bg-red-100 border border-red-300 px-2.5 py-1 rounded-md whitespace-nowrap shrink-0 mt-0.5">
                  <XCircle className="w-3.5 h-3.5" />
                  <span>✗ اختيارك خاطئ</span>
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* STATE B: Revealed Only After User Clicks an Option */}
      {isAnswered && (
        <div className="mt-6 pt-5 border-t border-slate-200 space-y-5">
          {/* Full-width Status Banner + Reset Button */}
          <div
            className={`flex flex-wrap items-center justify-between gap-3 rounded-xl px-4 py-3 border ${
              isCorrect
                ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                : 'bg-red-50 border-red-300 text-red-950'
            }`}
          >
            <div className="flex items-center gap-2 text-sm font-bold">
              {isCorrect ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>
                    ✓ أحسنت! إجابتك صحيحة ({question.correctAnswer}) — مطابقة للتوجيهات التربوية الرسمية.
                  </span>
                </>
              ) : (
                <>
                  <XCircle className="w-5 h-5 text-red-600 shrink-0" />
                  <span>
                    ✗ إجابة غير موفقة (اخترت {selectedOption}) — الجواب الرسمي الصحيح هو ({question.correctAnswer}).
                  </span>
                </>
              )}
            </div>

            <button
              type="button"
              onClick={() => {
                setReverseQuiz(null);
                setReverseUserAnswer(null);
                onResetQuestion(question.id);
              }}
              className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-slate-700 border border-slate-300 hover:bg-slate-100 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>إخفاء / إعادة المحاولة</span>
            </button>
          </div>

          {/* Section 1 — Official Explanation Box */}
          <div className="rounded-xl bg-emerald-50/50 border border-emerald-200 p-4 sm:p-5">
            <h4 className="text-sm font-bold text-emerald-900 mb-2">
              التعليل الديدكتيكي الرسمي (وفق التوجيهات التربوية والمذكرات الوزارية)
            </h4>
            <p className="text-sm text-slate-800 leading-7">
              {question.officialExplanation}
            </p>
            <div className="mt-2.5 pt-2.5 border-t border-emerald-200/70 text-xs text-emerald-800 font-semibold">
              المرجع المعتمد: {question.referenceSource}
            </div>
          </div>

          {/* Section 2 — Horizontal Review Card (2x2 Grid breaking down all options) */}
          <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <h4 className="text-sm font-bold text-slate-900">
                بطاقة المراجعة الأفقية — تفكيك جميع الاختيارات
              </h4>
              <span className="text-xs text-slate-500">
                تحليل الجواب الصحيح وتفكيك المفهوم الديدكتيكي لكل مموه
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {optionKeys.map((optKey) => {
                const breakdown = question.optionBreakdowns[optKey];
                if (!breakdown) return null;
                const isOptCorrect = optKey === question.correctAnswer;

                return (
                  <div
                    key={optKey}
                    className={`rounded-lg p-3.5 border text-xs sm:text-sm leading-relaxed ${
                      isOptCorrect
                        ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950'
                        : 'bg-white border-slate-200 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span
                        className={`font-mono font-bold px-2 py-0.5 rounded text-xs ${
                          isOptCorrect
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        الاختيار {optKey}
                      </span>
                      <span
                        className={`text-xs font-bold ${
                          isOptCorrect ? 'text-emerald-700' : 'text-red-600'
                        }`}
                      >
                        {isOptCorrect ? '✓ الصحيح' : 'خاطئ (مموه)'}
                      </span>
                    </div>
                    <p className="text-slate-800 leading-6">{breakdown}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 3 — Reverse & Horizontal Training Footer */}
          <div className="rounded-xl bg-slate-100/80 border border-slate-200 p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h5 className="text-xs sm:text-sm font-bold text-slate-900">
                  التدريب العكسي والأفقي على المموهات (تحويل المموه إلى جواب صحيح)
                </h5>
                <p className="text-xs text-slate-600 mt-0.5">
                  اختر أحد المموهات لتوليد سؤال ديدكتيكي تفاعلي جديد يكون فيه ذلك المموه هو الجواب الصحيح:
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <select
                  aria-label="اختيار المموه لتوليد سؤال عكسي"
                  value={distractorTarget}
                  onChange={(e) =>
                    setDistractorTarget(e.target.value as OptionKey | 'RANDOM')
                  }
                  className="rounded-lg bg-white border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-emerald-600 cursor-pointer"
                >
                  <option value="RANDOM">اختيار عشوائي لأحد المموهات</option>
                  {distractorKeys.map((dk) => (
                    <option key={dk} value={dk}>
                      المموه ({dk}): {question.options[dk]?.slice(0, 38)}...
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={handleGenerateReverse}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 text-xs font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>ولّد سؤالاً عكسياً الآن</span>
                </button>
              </div>
            </div>

            {/* Dynamically Generated Interactive Reverse QCM Card */}
            {reverseQuiz && (
              <div className="mt-4 rounded-xl bg-white border border-emerald-300 p-4 sm:p-5">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 mb-3 border-b border-slate-100">
                  <span className="text-xs font-bold text-emerald-800">
                    سؤال عكسي مولّد من ({reverseQuiz.sourceQuestionId}) — يستهدف المموه ({reverseQuiz.targetDistractorKey})
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setReverseQuiz(null);
                      setReverseUserAnswer(null);
                    }}
                    className="text-xs text-slate-500 hover:text-slate-800 font-semibold cursor-pointer"
                  >
                    إغلاق التدريب العكسي
                  </button>
                </div>

                <p className="text-sm sm:text-base font-bold text-slate-900 mb-3 leading-relaxed">
                  {reverseQuiz.questionStem}
                </p>

                <div className="space-y-2">
                  {(['A', 'B', 'C', 'D'] as OptionKey[]).map((rKey) => {
                    const rText = reverseQuiz.options[rKey];
                    if (!rText) return null;
                    const isRevAnswered = !!reverseUserAnswer;
                    const isRevCorrect = reverseQuiz.correctOption === rKey;
                    const isRevSelected = reverseUserAnswer === rKey;

                    let revBtnClass =
                      'w-full text-right rounded-lg border px-3.5 py-2.5 text-xs sm:text-sm transition-colors flex items-center justify-between gap-2 cursor-pointer ';

                    if (!isRevAnswered) {
                      revBtnClass +=
                        'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800';
                    } else if (isRevCorrect) {
                      revBtnClass +=
                        'bg-emerald-50 border-emerald-600 text-emerald-950 font-bold';
                    } else if (isRevSelected) {
                      revBtnClass +=
                        'bg-red-50 border-red-600 text-red-950 font-bold';
                    } else {
                      revBtnClass += 'bg-white border-slate-200 text-slate-500';
                    }

                    return (
                      <button
                        key={rKey}
                        type="button"
                        onClick={() => setReverseUserAnswer(rKey)}
                        className={revBtnClass}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="font-mono font-bold">{rKey}.</span>
                          <span>{rText}</span>
                        </div>
                        {isRevAnswered && isRevCorrect && (
                          <span className="text-xs font-bold text-emerald-700 shrink-0">
                            ✓ الجواب الصحيح (المموه المستهدف)
                          </span>
                        )}
                        {isRevAnswered && isRevSelected && !isRevCorrect && (
                          <span className="text-xs font-bold text-red-700 shrink-0">
                            ✗ اختيار خاطئ
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {reverseUserAnswer && (
                  <div className="mt-3 rounded-lg bg-emerald-50/70 border border-emerald-200 p-3 text-xs sm:text-sm text-slate-800 leading-relaxed">
                    <strong className="text-emerald-900">تعليل السؤال العكسي: </strong>
                    {reverseQuiz.explanation}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </article>
  );
};
