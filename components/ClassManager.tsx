import React, { useState } from 'react';
import { SchoolClass, Subject } from '../types';
import { Plus, Trash2, BookOpen, Save } from 'lucide-react';

interface ClassManagerProps {
  classes: SchoolClass[];
  setClasses: React.Dispatch<React.SetStateAction<SchoolClass[]>>;
}

export const ClassManager: React.FC<ClassManagerProps> = ({ classes, setClasses }) => {
  const [newClassName, setNewClassName] = useState('');
  const [selectedClassId, setSelectedClassId] = useState<string | null>(classes.length > 0 ? classes[0].id : null);
  
  // New Subject State
  const [newSubjName, setNewSubjName] = useState('');
  const [newSubjMax, setNewSubjMax] = useState<string>('100');

  const addClass = () => {
    if (!newClassName.trim()) return;
    const newClass: SchoolClass = {
      id: Date.now().toString(),
      name: newClassName,
      subjects: []
    };
    setClasses([...classes, newClass]);
    setNewClassName('');
    setSelectedClassId(newClass.id);
  };

  const deleteClass = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا الصف؟ سيتم حذف جميع بيانات الطلاب المرتبطة به.')) {
      setClasses(classes.filter(c => c.id !== id));
      if (selectedClassId === id) setSelectedClassId(null);
    }
  };

  const addSubjectToClass = () => {
    if (!selectedClassId || !newSubjName.trim()) return;
    
    setClasses(classes.map(c => {
      if (c.id === selectedClassId) {
        return {
          ...c,
          subjects: [...c.subjects, {
            id: Date.now().toString(),
            name: newSubjName,
            maxScore: parseFloat(newSubjMax) || 100
          }]
        };
      }
      return c;
    }));
    setNewSubjName('');
    setNewSubjMax('100');
  };

  const removeSubject = (classId: string, subjectId: string) => {
    setClasses(classes.map(c => {
      if (c.id === classId) {
        return {
          ...c,
          subjects: c.subjects.filter(s => s.id !== subjectId)
        };
      }
      return c;
    }));
  };

  const selectedClass = classes.find(c => c.id === selectedClassId);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Sidebar: List of Classes */}
      <div className="md:col-span-1 bg-white p-4 rounded-lg shadow border border-gray-200">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-indigo-800">
          <BookOpen size={20} />
          الصفوف الدراسية
        </h3>
        
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={newClassName}
            onChange={(e) => setNewClassName(e.target.value)}
            placeholder="اسم الصف (مثلاً: الخامس أ)"
            className="flex-1 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 outline-none text-sm text-gray-900"
          />
          <button 
            onClick={addClass}
            className="bg-indigo-700 text-white p-2 rounded hover:bg-indigo-800 transition"
          >
            <Plus size={20} />
          </button>
        </div>

        <ul className="space-y-2">
          {classes.map(cls => (
            <li 
              key={cls.id}
              onClick={() => setSelectedClassId(cls.id)}
              className={`flex justify-between items-center p-3 rounded cursor-pointer transition border ${
                selectedClassId === cls.id 
                ? 'bg-indigo-50 border-indigo-600 shadow-sm' 
                : 'border-transparent hover:bg-gray-100'
              }`}
            >
              <span className={`font-bold ${selectedClassId === cls.id ? 'text-indigo-900' : 'text-gray-700'}`}>
                {cls.name}
              </span>
              <button 
                onClick={(e) => { e.stopPropagation(); deleteClass(cls.id); }}
                className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 transition"
                title="حذف الصف"
              >
                <Trash2 size={18} />
              </button>
            </li>
          ))}
          {classes.length === 0 && (
            <p className="text-gray-500 text-sm text-center py-4">لا توجد صفوف مضافة</p>
          )}
        </ul>
      </div>

      {/* Main Area: Subject Management */}
      <div className="md:col-span-2 bg-white p-4 rounded-lg shadow border border-gray-200">
        {selectedClass ? (
          <>
            <div className="border-b pb-4 mb-4">
              <h2 className="text-xl font-bold text-gray-900">إدارة مواد: {selectedClass.name}</h2>
              <p className="text-gray-600 text-sm mt-1">قم بإضافة المواد الدراسية والدرجة العظمى لكل مادة.</p>
            </div>

            <div className="bg-gray-50 p-4 rounded-md mb-6 border border-gray-200">
              <h4 className="font-bold text-sm mb-3 text-gray-800">إضافة مادة جديدة</h4>
              <div className="flex flex-col md:flex-row gap-3">
                <input 
                  type="text"
                  placeholder="اسم المادة (رياضيات، علوم...)"
                  className="flex-[2] p-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900"
                  value={newSubjName}
                  onChange={(e) => setNewSubjName(e.target.value)}
                />
                <input 
                  type="number"
                  placeholder="الدرجة العظمى"
                  className="flex-1 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900"
                  value={newSubjMax}
                  onChange={(e) => setNewSubjMax(e.target.value)}
                />
                <button 
                  onClick={addSubjectToClass}
                  className="bg-emerald-600 text-white px-4 py-2 rounded hover:bg-emerald-700 flex items-center justify-center gap-2 font-medium shadow-sm"
                >
                  <Plus size={18} />
                  إضافة
                </button>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-gray-800 mb-2">قائمة المواد الحالية</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-right border-collapse">
                  <thead>
                    <tr className="bg-gray-100 text-gray-700 text-sm border-b border-gray-200">
                      <th className="p-3">اسم المادة</th>
                      <th className="p-3">الدرجة العظمى</th>
                      <th className="p-3 w-20">إجراء</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedClass.subjects.map(subj => (
                      <tr key={subj.id} className="border-b hover:bg-gray-50">
                        <td className="p-3 font-semibold text-gray-800">{subj.name}</td>
                        <td className="p-3">
                          <span className="inline-block bg-blue-100 text-blue-900 text-xs px-2.5 py-1 rounded-full font-bold">
                            {subj.maxScore} درجة
                          </span>
                        </td>
                        <td className="p-3">
                          <button 
                            onClick={() => removeSubject(selectedClass.id, subj.id)}
                            className="text-red-600 hover:text-red-800 p-1.5 bg-red-50 rounded hover:bg-red-100 transition"
                            title="حذف المادة"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {selectedClass.subjects.length === 0 && (
                      <tr>
                        <td colSpan={3} className="p-6 text-center text-gray-500">
                          لم يتم إضافة مواد لهذا الصف بعد.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <BookOpen size={48} className="mb-4 opacity-20" />
            <p className="text-gray-500 font-medium">اختر صفاً من القائمة أو أضف صفاً جديداً للبدء</p>
          </div>
        )}
      </div>
    </div>
  );
};