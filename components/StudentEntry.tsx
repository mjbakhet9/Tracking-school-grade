import React, { useState, useEffect, useRef } from 'react';
import { SchoolClass, Student } from '../types';
import { calculateStudentStats } from '../utils';
import { Save, UserPlus, Calculator, Edit2, X, AlertCircle } from 'lucide-react';

interface StudentEntryProps {
  classes: SchoolClass[];
  students: Student[];
  setStudents: React.Dispatch<React.SetStateAction<Student[]>>;
  editingStudent: Student | null;
  setEditingStudent: React.Dispatch<React.SetStateAction<Student | null>>;
}

export const StudentEntry: React.FC<StudentEntryProps> = ({ 
  classes, 
  students, 
  setStudents,
  editingStudent,
  setEditingStudent 
}) => {
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [studentName, setStudentName] = useState('');
  const [scores, setScores] = useState<Record<string, string>>({});
  const [successMsg, setSuccessMsg] = useState('');
  
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (classes.length > 0 && !selectedClassId && !editingStudent) {
      setSelectedClassId(classes[0].id);
    }
  }, [classes]);

  useEffect(() => {
    if (editingStudent) {
      setSelectedClassId(editingStudent.classId);
      setStudentName(editingStudent.name);
      
      const strScores: Record<string, string> = {};
      if (editingStudent.scores) {
        Object.entries(editingStudent.scores).forEach(([key, val]) => {
          strScores[key] = String(val);
        });
      }
      setScores(strScores);
      
      setSuccessMsg('');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setStudentName('');
      setScores({});
    }
  }, [editingStudent]);

  const selectedClass = classes.find(c => c.id === selectedClassId);

  const handleScoreChange = (subjectId: string, value: string) => {
    setScores(prev => ({
      ...prev,
      [subjectId]: value
    }));
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const nextInput = inputRefs.current[index + 1];
      if (nextInput) {
        nextInput.focus();
      }
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClass || !studentName.trim()) return;

    const numericScores: Record<string, number> = {};
    Object.keys(scores).forEach(key => {
      const val = parseFloat(scores[key]);
      numericScores[key] = isNaN(val) ? 0 : val;
    });

    if (editingStudent) {
      const updatedStudent: Student = {
        ...editingStudent,
        name: studentName,
        classId: selectedClass.id,
        scores: numericScores
      };
      const studentWithStats = calculateStudentStats(updatedStudent, selectedClass);
      
      setStudents(prev => prev.map(s => s.id === editingStudent.id ? studentWithStats : s));
      setSuccessMsg('تم تعديل بيانات الطالب بنجاح!');
      setEditingStudent(null);
    } else {
      const newStudent: Student = {
        id: Date.now().toString(),
        name: studentName,
        classId: selectedClass.id,
        scores: numericScores
      };
      const studentWithStats = calculateStudentStats(newStudent, selectedClass);
      setStudents(prev => [...prev, studentWithStats]);
      setSuccessMsg('تم حفظ بيانات الطالب بنجاح!');
      setStudentName('');
      setScores({});
      if (inputRefs.current[0]) inputRefs.current[0].focus();
    }

    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const cancelEdit = () => {
    setEditingStudent(null);
    setStudentName('');
    setScores({});
  };

  const handleEditClick = (student: Student) => {
    setEditingStudent(student);
  };

  if (classes.length === 0) {
    return (
      <div className="text-center p-10 bg-white rounded shadow border border-gray-200">
        <p className="text-gray-600 text-lg font-medium">يرجى إضافة صفوف ومواد أولاً من قائمة "إدارة الصفوف".</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className={`rounded-lg shadow-lg border border-gray-200 overflow-hidden transition-colors ${editingStudent ? 'ring-2 ring-amber-400' : ''}`}>
        <div className={`${editingStudent ? 'bg-amber-700' : 'bg-indigo-800'} p-4 text-white flex justify-between items-center transition-colors`}>
          <h2 className="text-xl font-bold flex items-center gap-2">
            {editingStudent ? <Edit2 size={24} className="text-amber-200" /> : <UserPlus size={24} className="text-indigo-200" />}
            {editingStudent ? 'تعديل درجة الطالب' : 'رصد الدرجات'}
          </h2>
          <select
            value={selectedClassId}
            onChange={(e) => {
              if(!editingStudent || confirm('تغيير الصف سيؤدي إلى تصفير الدرجات المسجلة للمواد غير المتطابقة. هل أنت متأكد؟')) {
                setSelectedClassId(e.target.value);
                setScores({});
              }
            }}
            className="text-gray-900 text-sm p-2 rounded outline-none w-48 font-medium bg-white border-2 border-transparent focus:border-indigo-300"
          >
            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        <form onSubmit={handleSave} className="p-6 bg-white">
          {selectedClass && selectedClass.subjects.length === 0 && (
             <div className="bg-yellow-50 border-r-4 border-yellow-500 p-4 mb-4 text-yellow-800 font-medium flex items-center gap-2">
               <AlertCircle size={20} />
               تنبيه: هذا الصف لا يحتوي على أي مواد دراسية. يرجى إضافة مواد أولاً.
             </div>
          )}

          <div className="mb-6">
            <label className="block text-gray-800 font-bold mb-2">اسم الطالب</label>
            <input
              type="text"
              required
              ref={el => inputRefs.current[0] = el}
              onKeyDown={(e) => handleKeyDown(e, 0)}
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              placeholder="الاسم الثلاثي أو الرباعي"
              className="w-full p-3 border border-gray-300 rounded focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition text-gray-900"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {selectedClass?.subjects.map((subject, idx) => {
               const currentVal = scores[subject.id] ? parseFloat(scores[subject.id]) : 0;
               const isOverLimit = currentVal > subject.maxScore;

               return (
                <div key={subject.id} className={`bg-gray-50 p-3 rounded border transition ${isOverLimit ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-indigo-200'}`}>
                  <label className="block text-sm font-bold text-gray-700 mb-2 flex justify-between items-center">
                    <span>{subject.name}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${isOverLimit ? 'bg-red-200 text-red-800' : 'bg-gray-200 text-gray-800'}`}>
                      من {subject.maxScore}
                    </span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    ref={el => inputRefs.current[idx + 1] = el}
                    onKeyDown={(e) => handleKeyDown(e, idx + 1)}
                    value={scores[subject.id] !== undefined ? scores[subject.id] : ''}
                    onChange={(e) => handleScoreChange(subject.id, e.target.value)}
                    className={`w-full p-2 border rounded focus:ring-1 outline-none text-left font-mono font-bold text-gray-800 ${isOverLimit ? 'border-red-500 focus:ring-red-200 focus:border-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'}`}
                    placeholder="0"
                  />
                  {isOverLimit && <p className="text-xs text-red-600 mt-1 font-bold">تجاوز الحد المسموح!</p>}
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
             <div className="flex gap-2 items-center">
               {successMsg ? (
                 <span className="text-green-700 font-bold animate-pulse bg-green-50 px-3 py-1 rounded">{successMsg}</span>
               ) : (
                 <span className="text-gray-500 text-sm font-medium">اضغط Enter للانتقال للمربع التالي</span>
               )}
             </div>
            
            <div className="flex gap-3">
              {editingStudent && (
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="bg-gray-500 text-white px-6 py-3 rounded-lg font-bold shadow hover:bg-gray-600 transition flex items-center gap-2"
                >
                  <X size={20} />
                  إلغاء
                </button>
              )}
              <button
                type="submit"
                ref={el => inputRefs.current[selectedClass ? selectedClass.subjects.length + 1 : 1] = el}
                disabled={!selectedClass || selectedClass.subjects.length === 0}
                className={`${editingStudent ? 'bg-amber-600 hover:bg-amber-700' : 'bg-indigo-700 hover:bg-indigo-800'} text-white px-8 py-3 rounded-lg font-bold shadow transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <Save size={20} />
                {editingStudent ? 'تعديل وحفظ التغييرات' : 'حفظ الطالب وحساب النتيجة'}
              </button>
            </div>
          </div>
        </form>
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
          <Calculator size={20} className="text-gray-600"/>
          آخر الطلاب المضافين ({selectedClass?.name})
        </h3>
        <div className="bg-white rounded shadow overflow-hidden border border-gray-200">
          <table className="w-full text-right text-sm">
            <thead className="bg-gray-100 text-gray-700 font-semibold">
              <tr>
                <th className="p-3">الاسم</th>
                <th className="p-3">المجموع</th>
                <th className="p-3">التقدير</th>
                <th className="p-3 text-center w-24">تعديل</th>
              </tr>
            </thead>
            <tbody>
              {students
                .filter(s => s.classId === selectedClassId)
                .slice(-5)
                .reverse()
                .map(s => (
                <tr key={s.id} className={`border-t border-gray-100 hover:bg-gray-50 text-gray-800 ${editingStudent?.id === s.id ? 'bg-amber-50' : ''}`}>
                  <td className="p-3 font-medium">{s.name}</td>
                  <td className="p-3 font-semibold">{s.totalScore}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      (s.percentage || 0) >= 90 ? 'bg-emerald-100 text-emerald-900' :
                      (s.percentage || 0) >= 75 ? 'bg-blue-100 text-blue-900' :
                      (s.percentage || 0) >= 60 ? 'bg-cyan-100 text-cyan-900' :
                      (s.percentage || 0) >= 50 ? 'bg-amber-100 text-amber-900' :
                      'bg-red-100 text-red-900'
                    }`}>
                      {s.gradeLabel} ({s.percentage}%)
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <button 
                      onClick={() => handleEditClick(s)}
                      className="text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 p-1.5 rounded transition"
                      title="تعديل الدرجات"
                    >
                      <Edit2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {students.filter(s => s.classId === selectedClassId).length === 0 && (
                <tr>
                  <td colSpan={4} className="p-4 text-center text-gray-500">لا توجد بيانات مضافة حديثاً</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};