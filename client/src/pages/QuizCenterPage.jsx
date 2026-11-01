import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { quizAPI, subjectsAPI, conceptsAPI, graphsAPI } from '../services/api';
import { useNotification } from '../context/NotificationContext';
import confetti from 'canvas-confetti';
import {
  HelpCircle,
  Clock,
  Sparkles,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Plus,
  History,
  Award,
  ChevronRight,
  AlertCircle,
  BookOpen,
  ArrowRight,
  Layers,
  BrainCircuit,
  Filter,
} from 'lucide-react';

const CANONICAL_SUBJECTS = [
  'Computer Networks',
  'DBMS',
  'Operating Systems',
  'Data Structures & Algorithms',
  'Java Programming',
  'Python Programming',
  'JavaScript / Web Technologies',
  'Machine Learning & Data Science',
  'Artificial Intelligence',
  'Full-Stack Web Development',
];

const QuizCenterPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useNotification();

  const [activeTab, setActiveTab] = useState('quizzes'); // 'quizzes' | 'history'
  const [quizzes, setQuizzes] = useState([]);
  const [history, setHistory] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [topicsMap, setTopicsMap] = useState({});
  const [userConcepts, setUserConcepts] = useState([]);

  // Active Quiz Runner State
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({}); // questionIndex -> optionIndex
  const [timeRemaining, setTimeRemaining] = useState(600);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);

  // Modal Generator State
  const [showGenModal, setShowGenModal] = useState(false);
  const [generationMode, setGenerationMode] = useState('topic'); // 'topic' (Option A) | 'concepts' (Option B)
  const [selectedSubjectName, setSelectedSubjectName] = useState(CANONICAL_SUBJECTS[0]);
  const [selectedTopicName, setSelectedTopicName] = useState('');
  const [customTopicInput, setCustomTopicInput] = useState('');
  const [selectedConceptIds, setSelectedConceptIds] = useState([]);
  const [difficulty, setDifficulty] = useState('intermediate');
  const [questionCount, setQuestionCount] = useState(10); // Standard 10 Questions
  const [timeLimit, setTimeLimit] = useState(15);
  const [quizTitle, setQuizTitle] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Load quizzes, history, topics, and concepts on mount
  useEffect(() => {
    fetchInitialData();
  }, []);

  // Update topic choices when subject changes
  useEffect(() => {
    const available = topicsMap[selectedSubjectName] || [];
    if (available.length > 0) {
      setSelectedTopicName(available[0]);
    } else {
      setSelectedTopicName('custom');
    }
  }, [selectedSubjectName, topicsMap]);

  // Adjust default timer when question count changes
  useEffect(() => {
    const qCount = parseInt(questionCount) || 10;
    if (qCount === 5) setTimeLimit(8);
    else if (qCount === 10) setTimeLimit(15);
    else if (qCount === 15) setTimeLimit(22);
    else if (qCount === 20) setTimeLimit(30);
  }, [questionCount]);

  // Timer countdown for active quiz
  useEffect(() => {
    if (!activeQuiz || quizSubmitted) return;
    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleSubmitQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [activeQuiz, quizSubmitted, userAnswers]);

  const fetchInitialData = async () => {
    try {
      const [qRes, hRes, sRes, tRes, cRes] = await Promise.all([
        quizAPI.getAll(),
        quizAPI.getHistory(),
        subjectsAPI.getAll(),
        graphsAPI.getTopicsMap().catch(() => ({ data: { data: {} } })),
        conceptsAPI.getAll().catch(() => ({ data: { data: [] } })),
      ]);
      setQuizzes(qRes.data.data || []);
      setHistory(hRes.data.data || []);
      setSubjects(sRes.data.data || []);
      if (tRes.data?.data) {
        setTopicsMap(tRes.data.data);
      }
      if (cRes.data?.data) {
        setUserConcepts(cRes.data.data);
      }
    } catch (err) {
      console.warn('Quiz center data load warning', err);
    }
  };

  const startQuiz = (quiz) => {
    setActiveQuiz(quiz);
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setTimeRemaining((quiz.timeLimitMinutes || 15) * 60);
    setQuizSubmitted(false);
    setSubmissionResult(null);
  };

  const handleSelectOption = (questionIndex, optionIndex) => {
    if (quizSubmitted) return;
    setUserAnswers((prev) => ({
      ...prev,
      [questionIndex]: optionIndex,
    }));
  };

  const handleSubmitQuiz = async () => {
    if (!activeQuiz) return;

    const formattedAnswers = Object.entries(userAnswers).map(([k, v]) => ({
      questionIndex: parseInt(k),
      selectedOption: v,
    }));

    try {
      const res = await quizAPI.submit(activeQuiz._id, { userAnswers: formattedAnswers });
      setSubmissionResult(res.data.data);
      setQuizSubmitted(true);

      if (res.data.data.percentage >= 70) {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 },
        });
      }

      showToast(`Quiz completed! Score: ${res.data.data.score}/${res.data.data.totalQuestions} (${res.data.data.percentage}%)`, 'success');
      const hRes = await quizAPI.getHistory();
      setHistory(hRes.data.data || []);
    } catch (err) {
      showToast('Error submitting quiz answers', 'error');
    }
  };

  const handleToggleConceptSelect = (conceptId) => {
    setSelectedConceptIds((prev) =>
      prev.includes(conceptId) ? prev.filter((id) => id !== conceptId) : [...prev, conceptId]
    );
  };

  const handleGenerateQuiz = async (e) => {
    e.preventDefault();
    if (isGenerating) return;

    setIsGenerating(true);

    try {
      let payload;
      if (generationMode === 'topic') {
        const finalTopic = selectedTopicName === 'custom' ? customTopicInput.trim() : selectedTopicName;
        if (!finalTopic) {
          showToast('Please enter or select a specific topic', 'warning');
          setIsGenerating(false);
          return;
        }

        payload = {
          subjectName: selectedSubjectName,
          topicName: finalTopic,
          difficulty,
          questionCount: parseInt(questionCount) || 10,
          timeLimitMinutes: parseInt(timeLimit) || 15,
          title: quizTitle.trim() || `${finalTopic} Assessment`,
        };
      } else {
        // Option B: From Concepts
        if (selectedConceptIds.length === 0) {
          showToast('Please select at least one concept for the quiz', 'warning');
          setIsGenerating(false);
          return;
        }

        payload = {
          conceptIds: selectedConceptIds,
          difficulty,
          questionCount: parseInt(questionCount) || 10,
          timeLimitMinutes: parseInt(timeLimit) || 15,
          title: quizTitle.trim() || `Concept Assessment (${selectedConceptIds.length} Concepts)`,
        };
      }

      const res = await quizAPI.generate(payload);
      const qCount = res.data.data.questions?.length || questionCount;
      showToast(`Generated ${qCount}-question assessment successfully!`, 'success');
      setShowGenModal(false);
      fetchInitialData();
      startQuiz(res.data.data);
    } catch (err) {
      console.error('Quiz generation error:', err);
      const errMsg = err.response?.data?.message || err.message || 'Failed to generate quiz';
      showToast(errMsg, 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const currentSubjectTopics = topicsMap[selectedSubjectName] || [];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cosmic-violet/20 border border-cosmic-violet/30 text-cosmic-violet text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Algorithmic Assessment Module</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">AI Quiz Center</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Validate mental models with customizable 5, 10, 15, or 20-question assessments and sync mastery.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowGenModal(true)}
            className="px-5 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-cosmic-indigo to-cosmic-violet text-white shadow-cosmic-md hover:scale-105 transition-all flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Generate Assessment</span>
          </button>
        </div>
      </div>

      {/* ACTIVE QUIZ RUNNER / REVIEW */}
      {activeQuiz ? (
        <div className="cosmic-panel p-6 sm:p-8 rounded-3xl border border-cosmic-border shadow-2xl space-y-6 animate-scale-up">
          {/* Active Quiz Header Bar */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-cosmic-violet/20 text-cosmic-violet border border-cosmic-violet/30 capitalize">
                  {activeQuiz.difficulty} Assessment
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  {activeQuiz.questions?.length || 10} Questions
                </span>
              </div>
              <h2 className="text-lg font-bold text-white mt-1">{activeQuiz.title}</h2>
            </div>

            <div className="flex items-center space-x-4">
              {!quizSubmitted && (
                <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono font-bold text-amber-400">
                  <Clock className="w-4 h-4" />
                  <span>{formatTime(timeRemaining)}</span>
                </div>
              )}
              <button
                onClick={() => setActiveQuiz(null)}
                className="text-xs font-semibold text-slate-400 hover:text-white"
              >
                Exit Quiz
              </button>
            </div>
          </div>

          {/* If NOT submitted: Active question interface */}
          {!quizSubmitted ? (
            <div className="space-y-6">
              {/* Question Navigation Tracker (1 to N) */}
              <div className="flex items-center justify-between flex-wrap gap-2 pb-2">
                <div className="flex items-center space-x-1.5 flex-wrap gap-y-1.5">
                  {activeQuiz.questions.map((_, qIdx) => {
                    const isAnswered = userAnswers[qIdx] !== undefined;
                    const isCurrent = currentQuestionIndex === qIdx;
                    return (
                      <button
                        key={qIdx}
                        onClick={() => setCurrentQuestionIndex(qIdx)}
                        className={`w-7 h-7 rounded-lg text-xs font-mono font-bold transition-all ${
                          isCurrent
                            ? 'bg-cosmic-violet text-white ring-2 ring-white/50 shadow-cosmic-sm'
                            : isAnswered
                            ? 'bg-emerald-950/70 border border-emerald-500/50 text-emerald-300'
                            : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {qIdx + 1}
                      </button>
                    );
                  })}
                </div>
                <div className="text-xs text-slate-400">
                  <span className="text-white font-bold">{Object.keys(userAnswers).length}</span> of {activeQuiz.questions.length} answered
                </div>
              </div>

              {/* Current Question */}
              {activeQuiz.questions[currentQuestionIndex] && (
                <div className="space-y-4 pt-2">
                  <div className="flex items-center space-x-2 text-xs font-bold text-cosmic-cyan">
                    <span>QUESTION {currentQuestionIndex + 1} OF {activeQuiz.questions.length}</span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-100 leading-snug">
                    {activeQuiz.questions[currentQuestionIndex].question}
                  </h3>

                  <div className="space-y-2.5 pt-2">
                    {activeQuiz.questions[currentQuestionIndex].options.map((option, optIdx) => {
                      const isSelected = userAnswers[currentQuestionIndex] === optIdx;
                      return (
                        <button
                          key={optIdx}
                          onClick={() => handleSelectOption(currentQuestionIndex, optIdx)}
                          className={`w-full p-4 rounded-2xl text-left text-xs sm:text-sm font-medium transition-all flex items-center justify-between border ${
                            isSelected
                              ? 'bg-cosmic-violet/20 border-cosmic-violet text-white shadow-cosmic-sm'
                              : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:bg-slate-900 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <span className={`w-6 h-6 rounded-lg flex items-center justify-center font-mono font-bold text-xs ${
                              isSelected ? 'bg-cosmic-violet text-white' : 'bg-slate-800 text-slate-400'
                            }`}>
                              {String.fromCharCode(65 + optIdx)}
                            </span>
                            <span>{option}</span>
                          </div>
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-cosmic-cyan" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Navigation and Submit */}
              <div className="flex items-center justify-between pt-6 border-t border-slate-800">
                <button
                  onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                  disabled={currentQuestionIndex === 0}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white disabled:opacity-30"
                >
                  Previous
                </button>

                <div className="flex items-center space-x-3">
                  {currentQuestionIndex < activeQuiz.questions.length - 1 ? (
                    <button
                      onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
                      className="px-5 py-2.5 rounded-xl font-bold text-xs bg-slate-800 hover:bg-slate-700 text-white transition-colors"
                    >
                      Next Question
                    </button>
                  ) : null}

                  <button
                    onClick={handleSubmitQuiz}
                    className="px-6 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-emerald-glow hover:scale-105 transition-all"
                  >
                    Submit Assessment
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* SUBMISSION RESULTS REVIEW SCREEN */
            <div className="space-y-8 animate-fade-in">
              {/* Score Header Card */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-950/80 to-purple-950/80 border border-cosmic-violet/40 text-center">
                <div className="text-4xl sm:text-5xl font-black text-white mb-2">
                  {submissionResult?.score} / {submissionResult?.totalQuestions}
                </div>
                <div className="text-base text-cosmic-cyan font-bold mb-1">
                  {submissionResult?.percentage}% Accuracy
                </div>
                <div className="text-xs text-slate-300 font-medium">
                  {submissionResult?.percentage >= 70
                    ? '🎉 Excellent mastery demonstrated! Keep refining your cosmic mental models.'
                    : '💡 Solid attempt! Review the explanations and weak topics below.'}
                </div>
                <div className="mt-4 inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-semibold">
                  <Award className="w-4 h-4" />
                  <span>+{submissionResult?.xpEarned} XP Earned • Concept Mastery Synchronized to Database!</span>
                </div>
              </div>

              {/* WEAK TOPICS BREAKDOWN */}
              {submissionResult?.weakTopics && submissionResult.weakTopics.length > 0 && (
                <div className="p-5 rounded-2xl bg-amber-950/20 border border-amber-500/40 space-y-3">
                  <div className="flex items-center space-x-2 text-amber-400 font-bold text-sm">
                    <AlertCircle className="w-4 h-4" />
                    <span>Recommended Revision Topics (Identified Weak Areas)</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Based on incorrect question choices, the system recommends reviewing these concepts in your Knowledge Universe or Spaced Repetition queue:
                  </p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {submissionResult.weakTopics.map((wt, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 rounded-xl text-xs font-semibold bg-amber-900/40 border border-amber-600/40 text-amber-200"
                      >
                        {wt}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Detailed Question Review */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Answer Review & Detailed Explanations ({submissionResult?.totalQuestions} Questions)
                </h3>
                {submissionResult?.answers.map((ans, idx) => (
                  <div
                    key={idx}
                    className={`p-5 rounded-2xl border text-xs leading-relaxed space-y-2 ${
                      ans.isCorrect
                        ? 'bg-emerald-950/20 border-emerald-500/40 text-slate-200'
                        : 'bg-rose-950/20 border-rose-500/40 text-slate-200'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="font-bold text-white text-sm">
                        {idx + 1}. {ans.question}
                      </div>
                      {ans.isCorrect ? (
                        <span className="flex items-center space-x-1 text-emerald-400 font-semibold shrink-0">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Correct</span>
                        </span>
                      ) : (
                        <span className="flex items-center space-x-1 text-rose-400 font-semibold shrink-0">
                          <XCircle className="w-4 h-4" />
                          <span>Incorrect</span>
                        </span>
                      )}
                    </div>

                    <div className="text-slate-300 pt-1">
                      <span className="font-semibold text-slate-400">Your choice: </span>
                      <span>
                        {ans.selectedOption >= 0 ? ans.options[ans.selectedOption] : 'Unanswered'}
                      </span>
                    </div>

                    {!ans.isCorrect && (
                      <div className="text-emerald-300">
                        <span className="font-semibold text-emerald-400">Correct answer: </span>
                        <span>{ans.options[ans.correctAnswerIndex]}</span>
                      </div>
                    )}

                    {ans.explanation && (
                      <div className="mt-2 p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-300">
                        <span className="font-semibold text-cosmic-cyan">Explanation: </span>
                        {ans.explanation}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => startQuiz(activeQuiz)}
                  className="px-4 py-2.5 rounded-xl font-semibold text-xs bg-slate-900 text-slate-200 hover:bg-slate-800 border border-slate-700 flex items-center space-x-1.5"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Retake Assessment</span>
                </button>
                <button
                  onClick={() => setActiveQuiz(null)}
                  className="px-5 py-2.5 rounded-xl font-bold text-xs bg-cosmic-violet text-white shadow-cosmic-sm hover:opacity-90"
                >
                  Return to Quiz Center
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* QUIZ DASHBOARD (Available Quizzes & History) */
        <div className="space-y-6">
          <div className="flex border-b border-slate-800 pb-2 space-x-4">
            <button
              onClick={() => setActiveTab('quizzes')}
              className={`text-xs font-bold pb-2 transition-all ${
                activeTab === 'quizzes'
                  ? 'text-cosmic-violet border-b-2 border-cosmic-violet'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Available Assessments ({quizzes.length})
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`text-xs font-bold pb-2 transition-all ${
                activeTab === 'history'
                  ? 'text-cosmic-violet border-b-2 border-cosmic-violet'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Assessment History ({history.length})
            </button>
          </div>

          {activeTab === 'quizzes' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {quizzes.map((quiz) => (
                <div
                  key={quiz._id}
                  className="cosmic-panel p-6 rounded-3xl cosmic-panel-hover flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-slate-300">
                        {quiz.subjectId?.name || 'General CS'}
                      </span>
                      <span className="text-xs font-mono text-amber-400 flex items-center space-x-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{quiz.timeLimitMinutes || 15}m</span>
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-white mb-2">{quiz.title}</h3>
                    <div className="text-xs text-slate-400">
                      Standard assessment containing {quiz.questions?.length || 10} multiple-choice questions with verified explanations.
                    </div>
                  </div>

                  <button
                    onClick={() => startQuiz(quiz)}
                    className="mt-6 w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-gradient-to-r from-cosmic-indigo to-cosmic-violet text-white shadow-cosmic-sm hover:scale-102 transition-all flex items-center justify-center space-x-2"
                  >
                    <span>Start Assessment</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            /* Historical Attempts */
            <div className="cosmic-panel rounded-3xl overflow-hidden border border-cosmic-border">
              <div className="p-4 border-b border-slate-800 text-xs font-bold text-slate-300">
                Recent Submissions & Scores
              </div>
              <div className="divide-y divide-slate-800/80">
                {history.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-500">No attempts logged yet.</div>
                ) : (
                  history.map((att) => (
                    <div key={att._id} className="p-4 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-white">{att.quizId?.title || 'Knowledge Assessment'}</div>
                        <div className="text-[11px] text-slate-400">
                          {new Date(att.completedAt).toLocaleDateString()} • {att.quizId?.subjectId?.name || 'CS'}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`font-mono font-bold text-sm ${
                          att.percentage >= 80 ? 'text-emerald-400' : att.percentage >= 50 ? 'text-amber-400' : 'text-rose-400'
                        }`}>
                          {att.percentage}% ({att.score}/{att.totalQuestions || 10})
                        </div>
                        <div className="text-[10px] text-slate-500">+{att.xpEarned} XP</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* GENERATE ASSESSMENT MODAL (Supports Option A & Option B) */}
      {showGenModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-lg w-full cosmic-panel p-6 sm:p-7 rounded-3xl border border-cosmic-border shadow-2xl animate-scale-up max-h-[90vh] overflow-y-auto">
            {/* Modal Title */}
            <h3 className="text-base font-bold text-white mb-4 flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-cosmic-violet" />
              <span>Configure Academic Assessment</span>
            </h3>

            {/* Mode Selector Tabs: Option A vs Option B */}
            <div className="flex rounded-xl bg-slate-900 p-1 border border-slate-800 mb-5">
              <button
                type="button"
                onClick={() => setGenerationMode('topic')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  generationMode === 'topic'
                    ? 'bg-cosmic-violet text-white shadow-cosmic-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Option A: By Subject & Topic
              </button>
              <button
                type="button"
                onClick={() => setGenerationMode('concepts')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  generationMode === 'concepts'
                    ? 'bg-cosmic-violet text-white shadow-cosmic-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Option B: From Saved Concepts
              </button>
            </div>

            <form onSubmit={handleGenerateQuiz} className="space-y-4">
              {generationMode === 'topic' ? (
                <>
                  {/* OPTION A: Subject & Topic */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Target Subject</label>
                    <select
                      value={selectedSubjectName}
                      onChange={(e) => setSelectedSubjectName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white outline-none"
                    >
                      {CANONICAL_SUBJECTS.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Specific Topic</label>
                    {currentSubjectTopics.length > 0 ? (
                      <select
                        value={selectedTopicName}
                        onChange={(e) => setSelectedTopicName(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white outline-none"
                      >
                        {currentSubjectTopics.map((top) => (
                          <option key={top} value={top}>{top}</option>
                        ))}
                        <option value="custom">✏️ Custom Topic (Enter below)</option>
                      </select>
                    ) : null}

                    {(selectedTopicName === 'custom' || currentSubjectTopics.length === 0) && (
                      <input
                        type="text"
                        required
                        placeholder="e.g. TCP, Deadlocks, Normalization, Closures..."
                        value={customTopicInput}
                        onChange={(e) => setCustomTopicInput(e.target.value)}
                        className="w-full mt-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-cosmic-violet/60 text-xs text-white outline-none"
                      />
                    )}
                  </div>
                </>
              ) : (
                /* OPTION B: Existing Concepts */
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-300">
                      Select Concepts ({selectedConceptIds.length} selected)
                    </label>
                    {userConcepts.length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          if (selectedConceptIds.length === userConcepts.length) setSelectedConceptIds([]);
                          else setSelectedConceptIds(userConcepts.map((c) => c._id));
                        }}
                        className="text-[10px] text-cosmic-cyan hover:underline"
                      >
                        {selectedConceptIds.length === userConcepts.length ? 'Deselect All' : 'Select All'}
                      </button>
                    )}
                  </div>

                  {userConcepts.length === 0 ? (
                    <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-center text-xs text-slate-400">
                      No saved concepts found in your universe yet. You can use <strong>Option A (By Subject & Topic)</strong> to generate a quiz immediately without pre-creating concepts!
                    </div>
                  ) : (
                    <div className="max-h-48 overflow-y-auto space-y-1.5 p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                      {userConcepts.map((c) => {
                        const isChecked = selectedConceptIds.includes(c._id);
                        return (
                          <label
                            key={c._id}
                            className={`flex items-center space-x-2.5 p-2 rounded-lg text-xs cursor-pointer transition-colors ${
                              isChecked ? 'bg-cosmic-violet/20 text-white' : 'text-slate-300 hover:bg-slate-800'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleToggleConceptSelect(c._id)}
                              className="rounded border-slate-700 text-cosmic-violet focus:ring-0"
                            />
                            <span className="truncate flex-1 font-medium">{c.name}</span>
                            <span className="text-[10px] text-slate-500 font-mono">{c.category || 'concept'}</span>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Common Configuration: Difficulty, Question Count, Timer */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Difficulty Level</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white outline-none capitalize"
                >
                  <option value="beginner">Beginner (Foundations)</option>
                  <option value="intermediate">Intermediate (Standard)</option>
                  <option value="advanced">Advanced (Deep Dive)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Number of Questions</label>
                  <select
                    value={questionCount}
                    onChange={(e) => setQuestionCount(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white outline-none font-semibold"
                  >
                    <option value="5">5 Questions (Quick Check)</option>
                    <option value="10">10 Questions (Standard)</option>
                    <option value="15">15 Questions (Comprehensive)</option>
                    <option value="20">20 Questions (Exam Practice)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Timer (Minutes)</label>
                  <input
                    type="number"
                    min="3"
                    max="60"
                    value={timeLimit}
                    onChange={(e) => setTimeLimit(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Assessment Title (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. TCP Handshake & Flow Control Assessment"
                  value={quizTitle}
                  onChange={(e) => setQuizTitle(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowGenModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isGenerating}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-cosmic-indigo to-cosmic-violet text-white shadow-cosmic-sm hover:opacity-95 disabled:opacity-50"
                >
                  {isGenerating ? `Synthesizing ${questionCount} MCQs...` : `Generate ${questionCount}-Question Quiz`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizCenterPage;
