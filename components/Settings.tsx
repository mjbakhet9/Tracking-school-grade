import React, { useRef, useState } from 'react';
import { SchoolSettings, SchoolClass, Student } from '../types';
import { Save, Upload, Download, Trash2, Settings as SettingsIcon, Image as ImageIcon, RefreshCw, Calendar } from 'lucide-react';

interface SettingsProps {
  settings: SchoolSettings;
  setSettings: React.Dispatch<React.SetStateAction<SchoolSettings>>;
  classes: SchoolClass[];
  students: Student[];
  setClasses: React.Dispatch<React.SetStateAction<SchoolClass[]>>;
  setStudents: React.Dispatch<React.SetStateAction<Student[]>>;
}

export const Settings: React.FC<SettingsProps> = ({ 
  settings, 
  setSettings, 
  classes, 
  students,
  setClasses,
  setStudents
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const restoreInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setSettings(prev => ({ ...prev, logoUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBackup = () => {
    const data = {
      timestamp: new Date().toISOString(),
      settings,
      classes,
      students
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `backup_school_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target?.result as string);
          if (data.classes && data.students) {
            if(confirm('سيتم استبدال جميع البيانات الحالية بالبيانات الموجودة في ملف النسخة الاحتياطية. هل أنت متأكد؟')) {
              setClasses(data.classes);
              setStudents(data.students);
              if (data.settings) setSettings(data.settings);
              alert('تم استعادة البيانات بنجاح!');
            }
          } else {
            alert('ملف غير صالح. تأكد من اختيار ملف النسخة الاحتياطية الصحيح.');
          }
        } catch (error) {
          alert('حدث خطأ أثناء قراءة الملف.');
        }
      };
      reader.readAsText(file);
    }
    e.target.value = ''; // Reset input
  };

  const handleClearData = () => {
    if (confirm('تحذير خطير: هل أنت متأكد من حذف جميع الطلاب والصفوف؟ لا يمكن التراجع عن هذا الإجراء.')) {
      if(confirm('تأكيد نهائي: سيتم مسح كل شيء!')) {
        setClasses([]);
        setStudents([]);
        // We do NOT clear localStorage globally here anymore, just the state passed down
        // The parent component handles the syncing to the user-specific storage key
        alert('تم تصفير النظام بنجاح.');
      }
    }
  };

  // Generate Year Options
  const currentYear = new Date().getFullYear();
  const yearOptions = [
    `${currentYear - 1} - ${currentYear}`,
    `${currentYear} - ${currentYear + 1}`,
    `${currentYear + 1} - ${currentYear + 2}`,
  ];

  const HijriYear = 1446; // Approximate current Hijri
  const hijriOptions = [
    `${HijriYear - 1} - ${HijriYear} هـ`,
    `${HijriYear} - ${HijriYear + 1} هـ`,
    `${HijriYear + 1} - ${HijriYear + 2} هـ`,
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-10">
      
      {/* School Info Section */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2 border-b pb-2">
          <SettingsIcon className="text-indigo-600" />
          بيانات المدرسة والطباعة
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-gray-700 font-bold mb-1">اسم المدرسة</label>
              <input 
                type="text" 
                value={settings.schoolName}
                onChange={(e) => setSettings({...settings, schoolName: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="مثال: مدرسة النور الابتدائية"
              />
            </div>
            
            <div>
              <label className="block text-gray-700 font-bold mb-1">العام الدراسي</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={settings.academicYear}
                  onChange={(e) => setSettings({...settings, academicYear: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="اختر أو اكتب السنة"
                />
                <select 
                  className="p-2 border border-gray-300 rounded bg-gray-50 text-sm w-32 outline-none"
                  onChange={(e) => {
                    if (e.target.value) setSettings({...settings, academicYear: e.target.value})
                  }}
                  value=""
                >
                  <option value="" disabled>اختر...</option>
                  <optgroup label="ميلادي">
                    {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
                  </optgroup>
                  <optgroup label="هجري">
                    {hijriOptions.map(y => <option key={y} value={y}>{y}</option>)}
                  </optgroup>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-gray-700 font-bold mb-1">اسم مدير المدرسة (للتوقيع)</label>
              <input 
                type="text" 
                value={settings.principalName}
                onChange={(e) => setSettings({...settings, principalName: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="الاسم الكريم"
              />
            </div>
          </div>

          <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50">
            {settings.logoUrl ? (
              <div className="relative mb-4">
                <img src={settings.logoUrl} alt="School Logo" className="h-32 object-contain" />
                <button 
                  onClick={() => setSettings({...settings, logoUrl: undefined})}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ) : (
              <div className="text-center text-gray-400 mb-4">
                <ImageIcon size={48} className="mx-auto mb-2" />
                <p>لا يوجد شعار</p>
              </div>
            )}
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleLogoUpload} 
              accept="image/*" 
              className="hidden" 
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="bg-indigo-600 text-white px-4 py-2 rounded shadow hover:bg-indigo-700 transition flex items-center gap-2"
            >
              <Upload size={18} />
              رفع شعار المدرسة
            </button>
            <p className="text-xs text-gray-500 mt-2">يفضل صورة مربعة أو شفافة (PNG) بحجم صغير.</p>
          </div>
        </div>
      </div>

      {/* Backup & Restore Section */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2 border-b pb-2">
          <RefreshCw className="text-emerald-600" />
          النسخ الاحتياطي واستعادة البيانات
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-emerald-50 rounded border border-emerald-100">
            <h4 className="font-bold text-emerald-800 mb-2">حفظ نسخة احتياطية</h4>
            <p className="text-sm text-emerald-700 mb-4">قم بتنزيل ملف يحتوي على كافة الصفوف والطلاب والدرجات والإعدادات لحفظها في مكان آمن.</p>
            <button 
              onClick={handleBackup}
              className="w-full bg-emerald-600 text-white px-4 py-2 rounded shadow hover:bg-emerald-700 transition flex items-center justify-center gap-2"
            >
              <Download size={18} />
              تحميل ملف النسخة الاحتياطية
            </button>
          </div>

          <div className="p-4 bg-blue-50 rounded border border-blue-100">
            <h4 className="font-bold text-blue-800 mb-2">استعادة نسخة سابقة</h4>
            <p className="text-sm text-blue-700 mb-4">استرجع بياناتك من ملف قمت بحفظه سابقاً. (سيتم حذف البيانات الحالية).</p>
            <input 
              type="file" 
              ref={restoreInputRef} 
              onChange={handleRestore} 
              accept=".json" 
              className="hidden" 
            />
            <button 
              onClick={() => restoreInputRef.current?.click()}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 transition flex items-center justify-center gap-2"
            >
              <Upload size={18} />
              رفع ملف واستعادة البيانات
            </button>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-white rounded-lg shadow border border-red-200 p-6">
        <h3 className="text-xl font-bold text-red-600 mb-4 flex items-center gap-2 border-b pb-2 border-red-100">
          <Trash2 className="text-red-600" />
          منطقة الخطر
        </h3>
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
           <div>
             <h4 className="font-bold text-gray-800">تصفير النظام بالكامل</h4>
             <p className="text-sm text-gray-600">حذف جميع الصفوف والطلاب والبدء من جديد. استخدم هذا الخيار بحذر شديد.</p>
           </div>
           <button 
             onClick={handleClearData}
             className="bg-red-50 text-red-600 border border-red-200 px-6 py-2 rounded hover:bg-red-600 hover:text-white transition font-bold"
           >
             حذف جميع البيانات
           </button>
        </div>
      </div>

    </div>
  );
};