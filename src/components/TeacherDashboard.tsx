import React, { useState } from 'react';
import { useGameStore } from '../store/useGameStore';
import {
  Plus,
  Trash2,
  FileSpreadsheet,
  FileText,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';
import { QuestionPack, Question } from '../types/game';
import * as XLSX from 'xlsx';

export const TeacherDashboard: React.FC = () => {
  const {
    questionPacks,
    selectedPackId,
    addQuestionPack,
    updateQuestionPack,
    deleteQuestionPack,
    setTeacherMode,
  } = useGameStore();

  const [activePackId, setActivePackId] = useState<string>(selectedPackId || questionPacks[0]?.id);
  const [quickText, setQuickText] = useState<string>('');
  const [showQuickTextModal, setShowQuickTextModal] = useState<boolean>(false);
  const [showNewPackModal, setShowNewPackModal] = useState<boolean>(false);
  const [newPackTitle, setNewPackTitle] = useState<string>('');
  const [newPackDesc, setNewPackDesc] = useState<string>('');

  // Câu hỏi mới thủ công
  const [newQPrompt, setNewQPrompt] = useState<string>('');
  const [newQAnswer, setNewQAnswer] = useState<string>('');
  const [newQCategory, setNewQCategory] = useState<string>('');

  const activePack = questionPacks.find(p => p.id === activePackId) || questionPacks[0];

  // Xử lý Thêm bộ câu hỏi mới
  const handleCreatePack = () => {
    if (!newPackTitle.trim()) return;
    const newPack: QuestionPack = {
      id: `pack-${Date.now()}`,
      title: newPackTitle.trim(),
      description: newPackDesc.trim() || 'Bộ câu hỏi tự soạn bởi giáo viên',
      isBuiltIn: false,
      createdAt: new Date().toISOString(),
      questions: [],
    };
    addQuestionPack(newPack);
    setActivePackId(newPack.id);
    setNewPackTitle('');
    setNewPackDesc('');
    setShowNewPackModal(false);
  };

  // Thêm câu hỏi thủ công
  const handleAddSingleQuestion = () => {
    if (!newQPrompt.trim() || !newQAnswer.trim() || !activePack) return;
    const newQ: Question = {
      id: `q-${Date.now()}`,
      type: 'flashcard',
      prompt: newQPrompt.trim(),
      answer: newQAnswer.trim(),
      category: newQCategory.trim() || 'General',
    };
    const updatedPack: QuestionPack = {
      ...activePack,
      questions: [...activePack.questions, newQ],
    };
    updateQuestionPack(updatedPack);
    setNewQPrompt('');
    setNewQAnswer('');
    setNewQCategory('');
  };

  // Xóa câu hỏi
  const handleDeleteQuestion = (qId: string) => {
    if (!activePack) return;
    const updatedPack: QuestionPack = {
      ...activePack,
      questions: activePack.questions.filter(q => q.id !== qId),
    };
    updateQuestionPack(updatedPack);
  };

  // Nhập nhanh văn bản: "Câu hỏi | Đáp án"
  const handleImportQuickText = () => {
    if (!quickText.trim() || !activePack) return;
    const lines = quickText.split('\n');
    const newQuestions: Question[] = [];

    lines.forEach((line, idx) => {
      const parts = line.split('|');
      if (parts.length >= 2) {
        newQuestions.push({
          id: `q-paste-${Date.now()}-${idx}`,
          type: 'flashcard',
          prompt: parts[0].trim(),
          answer: parts[1].trim(),
          category: parts[2]?.trim() || 'Custom',
        });
      }
    });

    if (newQuestions.length > 0) {
      const updatedPack: QuestionPack = {
        ...activePack,
        questions: [...activePack.questions, newQuestions[0]], // fallback safe
      };
      // add all
      updatedPack.questions = [...activePack.questions, ...newQuestions];
      updateQuestionPack(updatedPack);
      setQuickText('');
      setShowQuickTextModal(false);
    }
  };

  // Nhập file Excel (.xlsx / .csv)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activePack) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws, { header: 1 }) as string[][];

        const imported: Question[] = [];
        // Giả định hàng đầu là Header hoặc data trực tiếp
        data.forEach((row, idx) => {
          if (row && row[0] && row[1]) {
            // bỏ qua nếu là dòng header (prompt, question,...)
            const cell0 = String(row[0]).trim();
            const cell1 = String(row[1]).trim();
            if (cell0.toLowerCase() === 'câu hỏi' || cell0.toLowerCase() === 'question') return;

            imported.push({
              id: `q-excel-${Date.now()}-${idx}`,
              type: 'flashcard',
              prompt: cell0,
              answer: cell1,
              category: row[2] ? String(row[2]).trim() : 'Excel Import',
            });
          }
        });

        if (imported.length > 0) {
          const updatedPack: QuestionPack = {
            ...activePack,
            questions: [...activePack.questions, ...imported],
          };
          updateQuestionPack(updatedPack);
          alert(`Đã nhập thành công ${imported.length} câu hỏi từ file!`);
        }
      } catch (err) {
        alert('Lỗi đọc file Excel/CSV! Vui lòng kiểm tra định dạng.');
      }
    };
    reader.readAsBinaryString(file);
  };

  return (
    <div className="w-full min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-8">
      {/* Header */}
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setTeacherMode(false)}
            className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-xl text-slate-300 hover:text-white cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-white flex items-center space-x-2">
              <span>Bảng Điều Phối Giáo Viên</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 font-bold border border-indigo-500/30">
                Teacher Dashboard
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              Quản lý đề thi, câu hỏi tiếng Anh, nhập đề Excel/CSV & Text Paste
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowQuickTextModal(true)}
            className="flex items-center space-x-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 text-xs font-bold cursor-pointer"
          >
            <FileText className="w-4 h-4 text-amber-400" />
            <span>Nhập Nhanh Text</span>
          </button>

          <label className="flex items-center space-x-2 px-3.5 py-2 bg-emerald-700/60 hover:bg-emerald-600 text-white rounded-xl border border-emerald-500/50 text-xs font-bold cursor-pointer">
            <FileSpreadsheet className="w-4 h-4 text-emerald-300" />
            <span>Nhập File Excel/CSV</span>
            <input
              type="file"
              accept=".xlsx, .xls, .csv"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          <button
            onClick={() => setShowNewPackModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs shadow cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tạo Bộ Mới</span>
          </button>
        </div>
      </div>

      {/* Main Layout */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        {/* Danh sách các bộ đề */}
        <div className="space-y-3">
          <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-400">
            Các Bộ Câu Hỏi Hiện Có ({questionPacks.length})
          </h2>

          <div className="space-y-2">
            {questionPacks.map(pack => {
              const isActive = pack.id === activePackId;
              return (
                <div
                  key={pack.id}
                  onClick={() => setActivePackId(pack.id)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    isActive
                      ? 'bg-slate-800 border-indigo-500 text-white shadow-md'
                      : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-sm text-white flex items-center space-x-2">
                        <span>{pack.title}</span>
                        {pack.isBuiltIn && (
                          <span className="text-[10px] px-1.5 py-0.2 bg-amber-500/20 text-amber-300 rounded border border-amber-500/30 font-semibold">
                            Mẫu
                          </span>
                        )}
                      </h3>
                      <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                        {pack.description}
                      </p>
                    </div>

                    {!pack.isBuiltIn && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Bạn có chắc muốn xóa bộ đề "${pack.title}"?`)) {
                            deleteQuestionPack(pack.id);
                          }
                        }}
                        className="text-slate-500 hover:text-rose-400 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="mt-2 text-xs text-indigo-400 font-semibold">
                    {pack.questions.length} câu hỏi
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chi tiết bộ đề & Thêm câu hỏi */}
        <div className="md:col-span-2 space-y-6">
          {activePack && (
            <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div>
                  <h2 className="text-lg font-black text-white">{activePack.title}</h2>
                  <p className="text-xs text-slate-400">{activePack.description}</p>
                </div>
                <div className="text-sm font-bold text-emerald-400 bg-emerald-950/60 px-3 py-1 rounded-lg border border-emerald-500/30">
                  {activePack.questions.length} câu
                </div>
              </div>

              {/* Form thêm câu hỏi đơn */}
              <div className="mt-4 p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  Thêm câu hỏi mới vào bộ này
                </span>

                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Nội dung câu hỏi (tiếng Anh)..."
                    value={newQPrompt}
                    onChange={(e) => setNewQPrompt(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Đáp án chính xác..."
                      value={newQAnswer}
                      onChange={(e) => setNewQAnswer(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500"
                    />
                    <input
                      type="text"
                      placeholder="Chủ đề (Grammar, Vocab...)"
                      value={newQCategory}
                      onChange={(e) => setNewQCategory(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <button
                  onClick={handleAddSingleQuestion}
                  disabled={!newQPrompt.trim() || !newQAnswer.trim()}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold rounded-lg cursor-pointer transition-all"
                >
                  + Thêm câu hỏi
                </button>
              </div>

              {/* Danh sách câu hỏi */}
              <div className="mt-6 space-y-2 max-h-[450px] overflow-y-auto pr-1">
                {activePack.questions.length === 0 ? (
                  <div className="text-center py-10 text-slate-500 text-sm">
                    Chưa có câu hỏi nào trong bộ này. Hãy thêm câu hỏi hoặc nhập file Excel!
                  </div>
                ) : (
                  activePack.questions.map((q, idx) => (
                    <div
                      key={q.id}
                      className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl flex items-start justify-between group hover:border-slate-700"
                    >
                      <div className="space-y-1 pr-3">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-black text-indigo-400">#{idx + 1}</span>
                          {q.category && (
                            <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-semibold">
                              {q.category}
                            </span>
                          )}
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 font-semibold">
                            {q.type === 'multiple_choice' ? 'Trắc nghiệm' : 'Flashcard'}
                          </span>
                        </div>
                        <p className="text-sm font-semibold text-slate-100">{q.prompt}</p>
                        <p className="text-xs text-emerald-400 font-medium">Đáp án: {q.answer}</p>
                      </div>

                      <button
                        onClick={() => handleDeleteQuestion(q.id)}
                        className="text-slate-600 hover:text-rose-400 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MODAL: Nhập nhanh văn bản */}
      {showQuickTextModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-2 flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <span>Nhập Nhanh Câu Hỏi (Text Paste)</span>
            </h3>
            <p className="text-xs text-slate-400 mb-3">
              Mỗi dòng một câu hỏi, định dạng: <code className="text-amber-400">Câu hỏi | Đáp án | Chủ đề</code>
            </p>

            <textarea
              rows={8}
              value={quickText}
              onChange={(e) => setQuickText(e.target.value)}
              placeholder="What is the capital of England? | London | Geography&#10;She (live) in Hanoi. | lives | Tenses"
              className="w-full p-3 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white font-mono focus:outline-none focus:border-indigo-500"
            />

            <div className="mt-4 flex items-center justify-end space-x-3">
              <button
                onClick={() => setShowQuickTextModal(false)}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-bold cursor-pointer"
              >
                Hủy
              </button>
              <button
                onClick={handleImportQuickText}
                disabled={!quickText.trim()}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Nhập Vào Bộ Hiện Tại
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Tạo bộ đề mới */}
      {showNewPackModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-3">Tạo Bộ Câu Hỏi Mới</h3>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Tên bộ đề</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Unit 3 Vocabulary Grade 8..."
                  value={newPackTitle}
                  onChange={(e) => setNewPackTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Mô tả ngắn</label>
                <input
                  type="text"
                  placeholder="Mô tả nội dung kiểm tra..."
                  value={newPackDesc}
                  onChange={(e) => setNewPackDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="mt-5 flex items-center justify-end space-x-3">
              <button
                onClick={() => setShowNewPackModal(false)}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-bold cursor-pointer"
              >
                Hủy
              </button>
              <button
                onClick={handleCreatePack}
                disabled={!newPackTitle.trim()}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Tạo Bộ Đề
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
