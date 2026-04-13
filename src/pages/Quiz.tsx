import { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type QuizAttempt } from '../lib/db';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { 
  BookOpen, CheckCircle2, XCircle, 
  Timer, Award, ArrowRight, RotateCcw, 
  ChevronLeft, ChevronRight 
} from 'lucide-react';

type QuizState = 'START' | 'QUIZ' | 'RESULT';

export function Quiz() {
  const [state, setState] = useState<QuizState>('START');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [timeSpent, setTimeSpent] = useState(0);
  const [timerActive, setTimerActive] = useState(false);

  const categories = ['TEORI', 'INSTALASI', 'SAFETY', 'TROUBLESHOOTING', 'BISNIS'];

  const questions = useLiveQuery(
    () => selectedCategory 
      ? db.quizQuestions.where('category').equals(selectedCategory).toArray()
      : db.quizQuestions.toArray(),
    [selectedCategory]
  );

  const attempts = useLiveQuery(() => db.quizAttempts.orderBy('createdAt').reverse().limit(5).toArray());

  // Timer logic
  useEffect(() => {
    let interval: any;
    if (timerActive) {
      interval = setInterval(() => {
        setTimeSpent(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerActive]);

  const startQuiz = (category: string | null) => {
    setSelectedCategory(category);
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setTimeSpent(0);
    setState('QUIZ');
    setTimerActive(true);
  };

  const handleAnswer = (questionId: number, answer: string) => {
    setUserAnswers({ ...userAnswers, [questionId]: answer });
  };

  const finishQuiz = async () => {
    if (!questions) return;
    setTimerActive(false);

    let correctCount = 0;
    const answerDetails = questions.map(q => {
      const isCorrect = userAnswers[q.id!] === q.correctAnswer;
      if (isCorrect) correctCount++;
      return {
        questionId: q.id!,
        userAnswer: userAnswers[q.id!] || '',
        correct: isCorrect
      };
    });

    const score = Math.round((correctCount / questions.length) * 100);

    const attempt: QuizAttempt = {
      score,
      totalQuestions: questions.length,
      correctAnswers: correctCount,
      timeSpent,
      answers: answerDetails,
      passed: score >= 80,
      createdAt: new Date()
    };

    await db.quizAttempts.add(attempt);
    setState('RESULT');
  };

  // UI Components
  if (state === 'START') {
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Quiz & Assessment</h1>
            <p className="text-gray-600">Uji kemampuan teknis PLTS Anda untuk mendapatkan sertifikasi.</p>
          </div>
          <Badge variant="outline" className="text-blue-600 bg-blue-50 border-blue-200 py-1 px-3">
            Minimal Pass: 80%
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <Card key={cat} className="hover:shadow-md transition-shadow cursor-default">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-blue-500" />
                  {cat}
                </CardTitle>
                <CardDescription>Uji pengetahuan tentang {cat.toLowerCase()} panel surya.</CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => startQuiz(cat)} 
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  Mulai Quiz <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {attempts && attempts.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm uppercase tracking-wider text-gray-500">Riwayat Terakhir</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {attempts.map((att) => (
                  <div key={att.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${att.passed ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                        {att.passed ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">{att.createdAt.toLocaleDateString()} {att.createdAt.toLocaleTimeString()}</p>
                        <p className="font-bold text-sm">Score: {att.score}% ({att.correctAnswers}/{att.totalQuestions})</p>
                      </div>
                    </div>
                    <Badge variant={att.passed ? "default" : "destructive"}>
                      {att.passed ? 'LULUS' : 'GAGAL'}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  if (state === 'QUIZ' && questions) {
    const currentQ = questions[currentQuestionIndex];
    if (!currentQ) return null;

    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

    return (
      <div className="max-w-3xl mx-auto space-y-6 pt-4">
        <div className="flex justify-between items-center mb-2">
          <Badge variant="secondary" className="px-3 py-1">
            Pertanyaan {currentQuestionIndex + 1} / {questions.length}
          </Badge>
          <div className="flex items-center gap-1 text-gray-500 font-mono text-sm">
            <Timer className="h-4 w-4 text-blue-500" />
            {Math.floor(timeSpent / 60)}:{(timeSpent % 60).toString().padStart(2, '0')}
          </div>
        </div>
        
        <Progress value={progress} className="h-2" />

        <Card className="border-none shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl leading-relaxed">{currentQ.question}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { key: 'A', text: currentQ.optionA },
              { key: 'B', text: currentQ.optionB },
              { key: 'C', text: currentQ.optionC },
              { key: 'D', text: currentQ.optionD },
            ].map((opt) => (
              <button
                key={opt.key}
                onClick={() => handleAnswer(currentQ.id!, opt.key)}
                className={`
                  w-full p-4 text-left rounded-xl border-2 transition-all flex items-center gap-4
                  ${userAnswers[currentQ.id!] === opt.key 
                    ? 'border-blue-600 bg-blue-50 text-blue-900 shadow-sm' 
                    : 'border-gray-100 hover:border-blue-200 bg-white text-gray-700'}
                `}
              >
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center font-bold shrink-0
                  ${userAnswers[currentQ.id!] === opt.key ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'}
                `}>
                  {opt.key}
                </div>
                <span>{opt.text}</span>
              </button>
            ))}
          </CardContent>
        </Card>

        <div className="flex justify-between">
          <Button
            variant="ghost"
            onClick={() => setCurrentQuestionIndex(p => Math.max(0, p - 1))}
            disabled={currentQuestionIndex === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-2" /> Sebelumnya
          </Button>

          {currentQuestionIndex === questions.length - 1 ? (
            <Button 
              className="bg-green-600 hover:bg-green-700 px-8"
              onClick={finishQuiz}
              disabled={!userAnswers[currentQ.id!]}
            >
              Selesai & Lihat Skor
            </Button>
          ) : (
            <Button 
              onClick={() => setCurrentQuestionIndex(p => p + 1)}
              disabled={!userAnswers[currentQ.id!]}
            >
              Lanjut <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    );
  }

  if (state === 'RESULT' && questions) {
    const lastAttempt = attempts?.[0];
    if (!lastAttempt) return null;

    return (
      <div className="max-w-2xl mx-auto space-y-8 pt-6">
        <Card className="text-center overflow-hidden border-none shadow-2xl">
          <div className={lastAttempt.passed ? 'h-2 bg-green-500' : 'h-2 bg-red-500'}></div>
          <CardHeader className="pt-10">
            <div className={`
              mx-auto p-6 rounded-full w-24 h-24 flex items-center justify-center mb-4
              ${lastAttempt.passed ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}
            `}>
              <Award className="h-12 w-12" />
            </div>
            <CardTitle className="text-3xl font-bold">
              {lastAttempt.passed ? 'Selamat! Anda Lulus.' : 'Maaf, Anda Belum Lulus.'}
            </CardTitle>
            <CardDescription className="text-lg">
              Anda menjawab {lastAttempt.correctAnswers} dari {lastAttempt.totalQuestions} pertanyaan dengan benar.
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-10">
            <div className="text-6xl font-black mb-8">
              <span className={lastAttempt.passed ? 'text-green-600' : 'text-red-600'}>
                {lastAttempt.score}%
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto mb-8">
              <div className="text-center p-4 bg-gray-50 rounded-2xl">
                <div className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-1">Waktu</div>
                <div className="text-lg font-bold">
                  {Math.floor(lastAttempt.timeSpent / 60)}m {lastAttempt.timeSpent % 60}s
                </div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-2xl">
                <div className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-1">Status</div>
                <div className={`text-lg font-bold ${lastAttempt.passed ? 'text-green-600' : 'text-red-600'}`}>
                  {lastAttempt.passed ? 'PASS' : 'FAIL'}
                </div>
              </div>
            </div>

            <div className="flex gap-4 justify-center">
              <Button onClick={() => setState('START')} variant="outline">
                <ChevronLeft className="h-4 w-4 mr-2" /> Kembali ke Menu
              </Button>
              <Button onClick={() => startQuiz(selectedCategory)} className="bg-blue-600">
                <RotateCcw className="h-4 w-4 mr-2" /> Ulangi Quiz
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Review */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-gray-400" />
            Review Jawaban
          </h3>
          {questions.map((q, i) => {
            const userAnswer = lastAttempt.answers.find(a => a.questionId === q.id);
            return (
              <Card key={q.id} className="overflow-hidden border-l-4" style={{ 
                borderLeftColor: userAnswer?.correct ? '#22c55e' : '#ef4444' 
              }}>
                <CardContent className="p-4 space-y-3">
                  <div className="flex justify-between items-start gap-4">
                    <p className="font-medium text-gray-900 leading-snug">{i + 1}. {q.question}</p>
                    {userAnswer?.correct ? 
                      <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none">Benar</Badge> : 
                      <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-none">Salah</Badge>
                    }
                  </div>
                  <div className="text-sm space-y-1">
                    <p className="text-gray-600">Jawaban Anda: <span className="font-bold underline">{userAnswer?.userAnswer}</span></p>
                    <p className="text-green-700 font-medium">Jawaban Benar: {q.correctAnswer}</p>
                  </div>
                  <div className="mt-2 text-xs bg-gray-50 p-3 rounded-lg text-gray-500 italic border-l-2 border-gray-300">
                    <strong>Penjelasan:</strong> {q.explanation}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    );
  }

  return null;
}
