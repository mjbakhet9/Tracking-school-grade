import React, { useState, useMemo } from 'react';
import { SchoolClass, Student, SchoolSettings } from '../types';
import { calculateRankings, generateExcelHTML, parseCSV, calculateStudentStats } from '../utils';
import { Download, Upload, Trash, Medal, Search, FileSpreadsheet, Edit, Printer, FileText, ArrowLeft } from 'lucide-react';

interface ResultsTableProps {
  classes: SchoolClass[];
  students: Student[];
  setStudents: React.Dispatch<React.SetStateAction<Student[]>>;
  onEditStudent: (student: Student) => void;
  settings?: SchoolSettings;
}

export const ResultsTable: React.FC<ResultsTableProps> = ({ 
  classes, 
  students, 
  setStudents, 
  onEditStudent,
  settings 
}) => {
  const [selectedClassId, setSelectedClassId] = useState<string>(classes[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'TABLE' | 'CERTIFICATES'>('TABLE');
  
  const selectedClass = classes.find(c => c.id === selectedClassId);

  // Filter students for the selected class
  const classStudents = useMemo(() => {
    return students.filter(s => s.classId === selectedClassId);
  }, [students, selectedClassId]);

  // Calculate stats and rank for display
  const rankedStudents = useMemo(() => {
    if (!selectedClass) return [];
    
    // Recalculate stats first to ensure consistency
    const withStats = classStudents.map(s => calculateStudentStats(s, selectedClass));
    
    // Calculate rankings with ties
    return calculateRankings(withStats);
  }, [classStudents, selectedClass]);

  // Filter by search query
  const filteredStudents = rankedStudents.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleExport = () => {
    if (!selectedClass) return;
    const excelContent = generateExcelHTML(rankedStudents, selectedClass);
    const blob = new Blob([excelContent], { type: 'application/vnd.ms-excel;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${selectedClass.name}_نتائج.xls`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !selectedClass) return;
    
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const importedData = parseCSV(text, selectedClass);
      
      const newStudents = importedData.map(partial => {
         const student: Student = {
             id: Date.now().toString() + Math.random().toString(),
             name: partial.name || 'Unknown',
             classId: selectedClass.id,
             scores: partial.scores || {}
         };
         return calculateStudentStats(student, selectedClass);
      });

      // Append new students
      setStudents(prev => [...prev, ...newStudents]);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleDeleteStudent = (id: string) => {
    if(confirm('هل تريد حذف هذا الطالب؟')) {
      setStudents(students.filter(s => s.id !== id));
    }
  }

  const getGradeColor = (label?: string) => {
    switch(label) {
      case 'ممتاز': return 'bg-emerald-100 text-emerald-900 border-emerald-200 print:border-black print:text-black';
      case 'جيد جداً': return 'bg-blue-100 text-blue-900 border-blue-200 print:border-black print:text-black';
      case 'جيد': return 'bg-cyan-100 text-cyan-900 border-cyan-200 print:border-black print:text-black';
      case 'مقبول': return 'bg-yellow-100 text-yellow-900 border-yellow-200 print:border-black print:text-black';
      default: return 'bg-red-100 text-red-900 border-red-200 print:border-black print:text-black';
    }
  };

  if (!selectedClass) {
    return <div className="p-8 text-center text-gray-600 font-medium">لا توجد صفوف لعرض النتائج.</div>;
  }

  // --------------- Certificate View Logic ---------------
  if (viewMode === 'CERTIFICATES') {
    return (
      <div className="bg-gray-100 min-h-screen">
        {/* Controls Bar */}
        <div className="p-4 bg-white shadow mb-6 flex justify-between items-center print:hidden sticky top-0 z-20">
          <div className="flex items-center gap-4">
             <button 
               onClick={() => setViewMode('TABLE')}
               className="flex items-center gap-2 text-gray-600 hover:text-gray-900 bg-gray-100 px-3 py-2 rounded-lg hover:bg-gray-200 transition"
             >
               <ArrowLeft size={20} />
               عودة للجدول
             </button>
             <h2 className="font-bold text-xl">طباعة الشهادات ({filteredStudents.length} طالب)</h2>
          </div>
          <button 
             onClick={handlePrint}
             className="bg-indigo-700 text-white px-6 py-2 rounded shadow hover:bg-indigo-800 flex items-center gap-2 text-lg font-bold transition"
           >
             <Printer size={20} />
             طباعة الشهادات (PDF)
           </button>
        </div>

        {/* Certificates List */}
        <div className="flex flex-col items-center gap-8 pb-10 print:block print:p-0 print:gap-0">
          {filteredStudents.map((student) => (
            <div 
              key={student.id} 
              className="bg-white w-[210mm] min-h-[297mm] p-10 shadow-lg print:shadow-none print:w-full print:h-screen print:break-after-page relative flex flex-col"
              style={{ border: '1px solid #e5e7eb' }}
            >
              {/* Certificate Header */}
              <div className="border-b-4 border-double border-black pb-4 mb-6 flex justify-between items-center">
                 <div className="text-center w-1/3">
                    <h3 className="font-bold text-lg mb-1 print:text-black">{settings?.schoolName || 'اسم المدرسة'}</h3>
                    <p className="text-sm text-gray-600 print:text-black">العام الدراسي: {settings?.academicYear || '.... / ....'}</p>
                 </div>
                 <div className="w-1/3 flex justify-center">
                    {settings?.logoUrl ? (
                      <img src={settings.logoUrl} alt="Logo" className="h-24 object-contain grayscale-0 print:grayscale" />
                    ) : (
                      <div className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-full flex items-center justify-center text-gray-300 print:border-black print:text-black">
                        <span className="text-xs">الشعار</span>
                      </div>
                    )}
                 </div>
                 <div className="text-center w-1/3">
                    <h2 className="font-bold text-2xl text-gray-900 mb-1 print:text-black">إشعار درجات</h2>
                    <p className="text-sm font-bold bg-gray-100 inline-block px-3 py-1 rounded border border-gray-300 print:bg-transparent print:border-black print:text-black">
                      {selectedClass.name}
                    </p>
                 </div>
              </div>

              {/* Student Info */}
              <div className="bg-gray-50 p-4 rounded border border-gray-200 mb-6 flex justify-between items-center print:bg-transparent print:border-black">
                 <div>
                   <span className="text-gray-500 font-medium ml-2 print:text-black">اسم الطالب:</span>
                   <span className="text-xl font-bold text-gray-900 print:text-black">{student.name}</span>
                 </div>
                 <div>
                   <span className="text-gray-500 font-medium ml-2 print:text-black">الترتيب:</span>
                   <span className="text-lg font-bold text-indigo-900 border border-indigo-200 bg-indigo-50 px-3 py-1 rounded print:text-black print:border-black print:bg-transparent">
                     {student.rankLabel}
                   </span>
                 </div>
              </div>

              {/* Grades Table */}
              <div className="flex-1">
                <table className="w-full border-collapse border border-black mb-6">
                  <thead>
                    <tr className="bg-gray-100 text-gray-900 print:bg-transparent print:text-black">
                      <th className="border border-black p-3 text-right print:text-black">المادة</th>
                      <th className="border border-black p-3 text-center w-32 print:text-black">الدرجة العظمى</th>
                      <th className="border border-black p-3 text-center w-32 print:text-black">درجة الطالب</th>
                      <th className="border border-black p-3 text-center w-40 print:text-black">التقدير</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedClass.subjects.map(subj => {
                      const score = student.scores[subj.id] || 0;
                      const percentage = (score / subj.maxScore) * 100;
                      let gradeText = "";
                      if(percentage >= 90) gradeText = "ممتاز";
                      else if(percentage >= 75) gradeText = "جيد جدا";
                      else if(percentage >= 60) gradeText = "جيد";
                      else if(percentage >= 50) gradeText = "مقبول";
                      else gradeText = "ضعيف";

                      return (
                        <tr key={subj.id}>
                          <td className="border border-black p-3 font-bold print:text-black">{subj.name}</td>
                          <td className="border border-black p-3 text-center text-gray-600 print:text-black">{subj.maxScore}</td>
                          <td className={`border border-black p-3 text-center font-bold text-lg print:text-black ${percentage < 50 ? 'text-red-600 print:text-black' : 'text-gray-900'}`}>
                            {score}
                          </td>
                          <td className="border border-black p-3 text-center text-sm print:text-black">{gradeText}</td>
                        </tr>
                      );
                    })}
                    <tr className="bg-gray-100 font-bold print:bg-transparent print:text-black">
                      <td className="border border-black p-3 text-left pl-6 print:text-black">المجموع الكلي</td>
                      <td className="border border-black p-3 text-center text-lg print:text-black">
                        {selectedClass.subjects.reduce((a,b) => a + b.maxScore, 0)}
                      </td>
                      <td className="border border-black p-3 text-center text-lg print:text-black">{student.totalScore}</td>
                      <td className="border border-black p-3 text-center print:text-black">{student.gradeLabel} ({student.percentage}%)</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Footer / Signatures */}
              <div className="mt-auto pt-10">
                <div className="flex justify-between text-center px-10">
                   <div className="flex flex-col items-center gap-16">
                     <p className="font-bold text-gray-800 print:text-black">ولي الأمر</p>
                     <p className="w-48 border-b border-dashed border-gray-400 print:border-black"></p>
                   </div>
                   <div className="flex flex-col items-center gap-16">
                     <p className="font-bold text-gray-800 print:text-black">مدير المدرسة</p>
                     <div className="relative">
                        {settings?.principalName && <p className="absolute -top-6 w-full text-center font-handwriting text-2xl text-blue-800 opacity-80 rotate-[-5deg] print:text-black print:opacity-100">{settings.principalName}</p>}
                        <p className="font-bold text-gray-900 print:text-black">{settings?.principalName || '.....................'}</p>
                     </div>
                   </div>
                </div>
                <div className="text-center text-xs text-gray-400 mt-8 border-t pt-2 print:text-black print:border-black">
                   تم إصدار النتيجة بتاريخ: {new Date().toLocaleDateString('ar-EG')} | نظام رصد الدرجات
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // --------------- Standard Table View ---------------
  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 h-full flex flex-col print:shadow-none print:border-none">
      
      {/* Print-only Header (For Table View) */}
      <div className="hidden print:block text-center mb-6">
        <h1 className="text-2xl font-bold text-black">كشف درجات: {selectedClass.name}</h1>
        <h2 className="text-lg text-black">{settings?.schoolName}</h2>
        <p className="text-black text-sm mt-1">تاريخ الطباعة: {new Date().toLocaleDateString('ar-EG')}</p>
      </div>

      {/* Controls */}
      <div className="p-4 border-b border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4 bg-gray-50 print:hidden">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <label className="font-bold text-gray-800">الصف:</label>
          <select 
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="p-2 border border-gray-300 rounded shadow-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 font-medium"
          >
            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        <div className="relative w-full md:w-64">
           <Search className="absolute right-3 top-2.5 text-gray-500" size={18} />
           <input 
             type="text" 
             placeholder="بحث عن طالب..." 
             className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-full text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 text-gray-800 placeholder-gray-500"
             value={searchQuery}
             onChange={(e) => setSearchQuery(e.target.value)}
           />
        </div>

        <div className="flex flex-wrap gap-2 w-full md:w-auto justify-end">
           <label className="cursor-pointer bg-emerald-700 text-white px-3 py-2 rounded shadow hover:bg-emerald-800 flex items-center gap-2 text-sm font-medium transition">
             <Upload size={16} />
             <span>استيراد</span>
             <input type="file" accept=".csv" className="hidden" onChange={handleImport} />
           </label>

           <button 
             onClick={handleExport}
             className="bg-blue-700 text-white px-3 py-2 rounded shadow hover:bg-blue-800 flex items-center gap-2 text-sm font-medium transition"
           >
             <Download size={16} />
             <span>إكسل</span>
           </button>

           <div className="bg-gray-300 w-px h-8 mx-1 hidden md:block"></div>

           <button 
             onClick={handlePrint}
             className="bg-gray-700 text-white px-3 py-2 rounded shadow hover:bg-gray-800 flex items-center gap-2 text-sm font-medium transition"
             title="طباعة الجدول الحالي"
           >
             <Printer size={16} />
             <span>طباعة القائمة</span>
           </button>

           <button 
             onClick={() => setViewMode('CERTIFICATES')}
             className="bg-indigo-700 text-white px-3 py-2 rounded shadow hover:bg-indigo-800 flex items-center gap-2 text-sm font-medium transition"
             title="طباعة شهادات فردية لكل طالب"
           >
             <FileText size={16} />
             <span>الشهادات</span>
           </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-auto flex-1 p-1 print:overflow-visible">
        <table className="w-full text-right border-collapse">
          <thead className="bg-gray-800 text-white sticky top-0 shadow z-10 print:static print:shadow-none print:bg-white print:text-black">
            <tr>
              <th className="p-3 w-24 border-b border-gray-700 print:border-black print:text-black">الترتيب</th>
              <th className="p-3 border-b border-gray-700 print:border-black print:text-black">اسم الطالب</th>
              {selectedClass.subjects.map(s => (
                <th key={s.id} className="p-3 text-center text-xs md:text-sm bg-gray-700 border-l border-gray-600 print:bg-white print:border-black print:text-black print:font-bold">
                  <span className="font-semibold text-gray-100 print:text-black">{s.name}</span> <br/> 
                  <span className="text-gray-300 font-normal print:text-black">({s.maxScore})</span>
                </th>
              ))}
              <th className="p-3 text-center bg-indigo-900 border-l border-indigo-700 border-b border-indigo-800 print:bg-white print:border-black print:text-black">المجموع</th>
              <th className="p-3 text-center bg-indigo-900 border-l border-indigo-700 border-b border-indigo-800 print:bg-white print:border-black print:text-black">النسبة</th>
              <th className="p-3 text-center bg-indigo-900 border-l border-indigo-700 border-b border-indigo-800 print:bg-white print:border-black print:text-black">التقدير</th>
              <th className="p-3 w-24 text-center border-b border-gray-700 print:hidden">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.length > 0 ? (
              filteredStudents.map((student, idx) => (
                <tr 
                  key={student.id} 
                  className={`border-b border-gray-200 hover:bg-blue-50 transition print:break-inside-avoid print:border-black ${idx < 3 ? 'bg-yellow-50 print:bg-transparent' : ''}`}
                >
                  <td className="p-3 font-bold text-indigo-900 print:text-black print:border print:border-black">
                    <div className="flex items-center gap-1">
                      {student.rank === 1 && <Medal size={16} className="text-yellow-600 print:hidden" />}
                      {student.rankLabel}
                    </div>
                  </td>
                  <td className="p-3 font-bold text-gray-800 print:text-black print:border print:border-black">{student.name}</td>
                  {selectedClass.subjects.map(s => (
                    <td key={s.id} className="p-3 text-center text-gray-700 border-l border-gray-100 font-mono print:border print:border-black print:text-black">
                      {student.scores[s.id] || 0}
                    </td>
                  ))}
                  <td className="p-3 text-center font-bold text-gray-900 bg-gray-50 border-l border-gray-200 print:bg-transparent print:border print:border-black print:text-black">
                    {student.totalScore}
                  </td>
                  <td className="p-3 text-center border-l border-gray-200 print:border print:border-black">
                     <span className="text-sm font-bold text-gray-700 print:text-black">
                       {student.percentage}%
                     </span>
                  </td>
                  <td className="p-3 text-center border-l border-gray-200 print:border print:border-black">
                     <span className={`px-2 py-1 rounded border text-xs font-bold whitespace-nowrap print:border-none print:px-0 print:text-black ${getGradeColor(student.gradeLabel)}`}>
                       {student.gradeLabel}
                     </span>
                  </td>
                  <td className="p-3 text-center print:hidden">
                    <div className="flex justify-center gap-2">
                      <button 
                        onClick={() => onEditStudent(student)} 
                        className="text-blue-600 hover:text-blue-800 p-1.5 rounded hover:bg-blue-50 transition" 
                        title="تعديل"
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        onClick={() => handleDeleteStudent(student.id)} 
                        className="text-red-500 hover:text-red-700 p-1.5 rounded hover:bg-red-50 transition" 
                        title="حذف"
                      >
                        <Trash size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7 + selectedClass.subjects.length} className="p-10 text-center text-gray-500 flex flex-col items-center justify-center">
                   <FileSpreadsheet size={48} className="mb-2 opacity-20 text-gray-400" />
                   {searchQuery ? 'لا توجد نتائج مطابقة للبحث' : 'لم يتم إضافة طلاب في هذا الصف بعد'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};