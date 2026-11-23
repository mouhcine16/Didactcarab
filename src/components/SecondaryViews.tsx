import React, { useState } from 'react';
import {
  BookOpen,
  Check,
  Copy,
  Download,
  ExternalLink,
  FileJson,
  KeyRound,
} from 'lucide-react';
import { STARTING_TEXTS } from '../data/startingTexts';
import { ALL_QUESTIONS } from '../data/didacticEngine';
import { ExamYear, OptionKey } from '../types/exam';

interface StartingTextsViewProps {
  onJumpToSessionQuestions: (year: ExamYear) => void;
}

export const StartingTextsView: React.FC<StartingTextsViewProps> = ({
  onJumpToSessionQuestions,
}) => {
  const years: (2022 | 2023 | 2024 | 2025)[] = [2022, 2023, 2024, 2025];

  return (
    <div className="space-y-6">
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-6">
        <h2 className="text-lg sm:text-xl font-bold text-[#1E293B] mb-2">
          نصوص الانطلاق الرسمية للدورات الأربع (2022–2025)
        </h2>
        <p className="text-sm text-slate-600 leading-relaxed">
          تتضمن هذه الواجهة نصوص الانطلاق الكاملة المعتمدة في مباريات توظيف أساتذة التعليم الثانوي لمادة اللغة العربية (دورة نونبر 2022، دورة دجنبر 2023، دورة أكتوبر 2024، ودورة نونبر 2025) مرفقة بتوثيقها المرجعي ومفاهيمها الديدكتيكية المؤطرة للأسئلة (Q01–Q05).
        </p>
      </div>

      {years.map((year) => {
        const textObj = STARTING_TEXTS[year];
        if (!textObj) return null;

        return (
          <section
            key={year}
            className="bg-white border border-[#E2E8F0] rounded-xl p-6 space-y-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200">
              <div>
                <div className="flex items-center gap-2 text-xs text-emerald-700 font-bold mb-1">
                  <BookOpen className="w-4 h-4" />
                  <span>{textObj.sessionTitle}</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono">{textObj.examCode}</span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  {textObj.examTitle}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => onJumpToSessionQuestions(year)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 text-xs font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <span>عرض أسئلة {textObj.sessionTitle} (60 سؤالاً)</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="rounded-xl bg-slate-50 border border-slate-200 p-5 space-y-4 text-slate-800 leading-8 text-sm sm:text-base">
              {textObj.paragraphs.map((p, idx) => (
                <p key={idx} className="whitespace-pre-line text-justify">
                  <span className="font-mono text-xs font-bold text-emerald-700 ml-2">
                    [الفقرة {idx + 1}]
                  </span>
                  {p}
                </p>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="rounded-lg bg-emerald-50/60 border border-emerald-200 p-4">
                <h4 className="text-xs font-bold text-emerald-900 mb-1.5">
                  القضية المركزية لنص الانطلاق والمرجع الرسمي
                </h4>
                <p className="text-xs sm:text-sm text-slate-800 leading-relaxed mb-2">
                  {textObj.centralTheme}
                </p>
                <p className="text-xs text-emerald-800 font-semibold">
                  المصدر: {textObj.sourceCitation}
                </p>
              </div>

              <div className="rounded-lg bg-slate-50 border border-slate-200 p-4">
                <h4 className="text-xs font-bold text-slate-900 mb-2">
                  المفاهيم الديدكتيكية المفتاحية المؤطرة للأسئلة (Q01–Q05)
                </h4>
                <ul className="space-y-1 text-xs text-slate-700 list-disc list-inside">
                  {textObj.keyPedagogicalConcepts.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        );
      })}
    </div>
  );
};

interface AnswerKeysViewProps {
  userAnswers: Record<string, OptionKey>;
  onSelectQuestionFromGrid: (year: ExamYear, qNum: number) => void;
}

export const AnswerKeysView: React.FC<AnswerKeysViewProps> = ({
  userAnswers,
  onSelectQuestionFromGrid,
}) => {
  const sessions: { year: ExamYear; title: string; subtitle: string }[] = [
    {
      year: 2022,
      title: '1) دورة نونبر 2022 (60 سؤالاً)',
      subtitle: 'مطابق حرفياً للتوجيهات التربوية 2007 و2009',
    },
    {
      year: 2023,
      title: '2) دورة دجنبر 2023 (60 سؤالاً)',
      subtitle: 'مدقق ومطابق للتوجيهات التربوية 2007 و2009',
    },
    {
      year: 2024,
      title: '3) دورة أكتوبر 2024 - SCAR12s22 (60 سؤالاً)',
      subtitle: 'مدقق ومطابق للتوجيهات التربوية 2007 و2009 (تتضمن أسئلة جوابها E)',
    },
    {
      year: 2025,
      title: '4) دورة نونبر 2025 - Sec_AR87 S22 (60 سؤالاً)',
      subtitle: 'مدقق ومطابق للتوجيهات التربوية 2007 و2009 (تتضمن أسئلة جوابها E)',
    },
    {
      year: 'ADJ',
      title: '5) الأسئلة المستقلة والمفاهيم المجاورة (105 سؤالاً)',
      subtitle: 'بنك المفاهيم الديدكتيكية والبيداغوجية المستقلة والمجاورة (ADJ_001 – ADJ_105)',
    },
    {
      year: 'COMP',
      title: '6) مراجعة التوصيف وهندسة المكونات (60 سؤالاً)',
      subtitle: 'توصيف مباراة نونبر 2026 وهندسة المكونات والبرامج والتقويم (COMP_001 – COMP_060)',
    },
    {
      year: 'MOD',
      title: '7) هندسة المكونات والحصص والتوزيع (70 سؤالاً)',
      subtitle: 'مستخلصات حرفية من التوجيهات التربوية للإعدادي 2009 والتأهيلي 2007 والمذكرة 142 (MOD_001 – MOD_070)',
    },
    {
      year: 'COMPET',
      title: '8) الكفايات ومداخل المنهاج والوضعيات (70 سؤالاً)',
      subtitle: 'مدخل الكفايات والقيم والتربية على الاختيار والوضعيات الديدكتيكية (COMPET_001 – COMPET_070)',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-[#1E293B]">
              مفاتيح التصحيح الرسمية المعتمدة (545 سؤالاً)
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              مفاتيح التصحيح الرسمية للدورات الأربع (2022–2025)، والأسئلة المستقلة (105)، ومراجعة التوصيف (60)، وهندسة المكونات والحصص والتوزيع (70)، والكفايات ومداخل المنهاج والوضعيات (70) مطابقة 100% للبرامج والتوجيهات التربوية الرسمية. اضغط على أي رقم سؤال للانتقال إليه مباشرة في بنك الأسئلة.
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-semibold">
            <span className="text-emerald-700">✓ أخضر: أجبت عنه بشكل صحيح</span>
            <span className="text-red-600">✗ أحمر: أجبت عنه بشكل خاطئ</span>
            <span className="text-slate-500">رمادي: لم تتم الإجابة بعد</span>
          </div>
        </div>
      </div>

      {sessions.map(({ year, title, subtitle }) => {
        const sessionQuestions = ALL_QUESTIONS.filter((q) => q.year === year);

        return (
          <section
            key={year}
            className="bg-white border border-[#E2E8F0] rounded-xl p-6"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 pb-4 mb-4 border-b border-slate-200">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-emerald-600" />
                  <span>{title}</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
              </div>
              <span className="text-xs font-mono font-semibold text-slate-600 tabular-nums">
                عدد الأسئلة: {sessionQuestions.length}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 md:grid-cols-10 gap-2.5">
              {sessionQuestions.map((q) => {
                const uAns = userAnswers[q.id];
                const isAnswered = !!uAns;
                const isRight = uAns === q.correctAnswer;

                let cellClass =
                  'rounded-lg border px-2.5 py-2 text-center font-mono text-xs transition-colors cursor-pointer flex flex-col items-center justify-center gap-0.5 tabular-nums ';
                if (!isAnswered) {
                  cellClass +=
                    'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800';
                } else if (isRight) {
                  cellClass +=
                    'bg-emerald-50 border-emerald-500 text-emerald-900 font-bold';
                } else {
                  cellClass += 'bg-red-50 border-red-500 text-red-900 font-bold';
                }

                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => onSelectQuestionFromGrid(year, q.qNum)}
                    className={cellClass}
                    title={`${q.id}: ${q.question}`}
                  >
                    <span className="text-slate-500 text-[11px]">
                      {typeof year === 'number' ? `Q${q.qNum}` : q.id}
                    </span>
                    <span className="text-sm font-bold text-emerald-700">
                      {q.correctAnswer}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
};

interface JsonDatabaseViewProps {
  onDownloadJson: () => void;
}

export const JsonDatabaseView: React.FC<JsonDatabaseViewProps> = ({
  onDownloadJson,
}) => {
  const [selectedYear, setSelectedYear] = useState<ExamYear | 'ALL'>('ALL');
  const [copied, setCopied] = useState(false);

  const filteredData =
    selectedYear === 'ALL'
      ? ALL_QUESTIONS
      : ALL_QUESTIONS.filter((q) => q.year === selectedYear);

  const jsonString = JSON.stringify(
    {
      title: 'موسوعة ديدكتيك اللغة العربية — الدورات الرسمية (2022–2025) والتوصيف',
      totalQuestions: filteredData.length,
      sessionsIncluded:
        selectedYear === 'ALL'
          ? [2022, 2023, 2024, 2025, 'ADJ', 'COMP', 'MOD', 'COMPET']
          : [selectedYear],
      startingTexts:
        selectedYear === 'ALL'
          ? STARTING_TEXTS
          : typeof selectedYear === 'number'
          ? { [selectedYear]: STARTING_TEXTS[selectedYear] }
          : {},
      questions: filteredData,
    },
    null,
    2
  );

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-[#1E293B] flex items-center gap-2">
              <FileJson className="w-5 h-5 text-emerald-600" />
              <span>قاعدة بيانات الموسوعة الكاملة بصيغة JSON (545 سؤالاً)</span>
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              تضم قاعدة البيانات جميع الأسئلة الـ 545 (240 سؤالاً رسمياً + 105 أسئلة مستقلة + 60 سؤالاً للتوصيف + 70 سؤالاً لهندسة المكونات والحصص والتوزيع + 70 سؤالاً للكفايات ومداخل المنهاج والوضعيات)، ونصوص الانطلاق الأربعة، ومفاتيح التصحيح الرسمية، والتعليلات الديدكتيكية، وبطاقات المراجعة الأفقية لتفكيك المموهات.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              aria-label="تصفية قاعدة بيانات JSON حسب الدورة"
              value={selectedYear}
              onChange={(e) => {
                const val = e.target.value;
                setSelectedYear(
                  val === 'ALL'
                    ? 'ALL'
                    : val === 'ADJ' || val === 'COMP' || val === 'MOD' || val === 'COMPET'
                    ? val
                    : (Number(val) as ExamYear)
                );
              }}
              className="rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-800 cursor-pointer"
            >
              <option value="ALL">جميع الأسئلة والدورات (545 سؤالاً)</option>
              <option value="2022">دورة نونبر 2022 (60 سؤالاً)</option>
              <option value="2023">دورة دجنبر 2023 (60 سؤالاً)</option>
              <option value="2024">دورة أكتوبر 2024 (60 سؤالاً)</option>
              <option value="2025">دورة نونبر 2025 (60 سؤالاً)</option>
              <option value="ADJ">الأسئلة المستقلة والمفاهيم المجاورة (105 سؤالاً)</option>
              <option value="COMP">مراجعة التوصيف وهندسة المكونات (60 سؤالاً)</option>
              <option value="MOD">هندسة المكونات والحصص والتوزيع (70 سؤالاً)</option>
              <option value="COMPET">الكفايات ومداخل المنهاج والوضعيات (70 سؤالاً)</option>
            </select>

            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 px-3.5 py-2 text-xs font-bold text-slate-700 transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-700">تم نسخ JSON</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>نسخ JSON</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onDownloadJson}
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 px-4 py-2 text-xs font-bold text-white transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>تحميل قاعدة JSON</span>
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-xl bg-slate-900 border border-slate-800 p-5 overflow-x-auto text-left" dir="ltr">
        <pre className="text-xs font-mono text-slate-100 leading-relaxed max-h-[650px] overflow-y-auto">
          {jsonString}
        </pre>
      </div>
    </div>
  );
};
