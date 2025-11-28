import React, { useState, useEffect } from 'react';
import { SchoolClass, Student, TabView, SchoolSettings } from './types';
import { ClassManager } from './components/ClassManager';
import { StudentEntry } from './components/StudentEntry';
import { ResultsTable } from './components/ResultsTable';
import { Dashboard } from './components/Dashboard';
import { Settings } from './components/Settings';
import { LayoutDashboard, Users, BookOpen, GraduationCap, School, Settings as SettingsIcon } from 'lucide-react';

const App: React.FC = () => {
  // Load initial state from local storage or defaults
  const [classes, setClasses] = useState<SchoolClass[]>(() => {
    const saved = localStorage.getItem('classes');
    return saved ? JSON.parse(saved) : [];
  });

  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem('students');
    return saved ? JSON.parse(saved) : [];
  });

  const [settings, setSettings] = useState<SchoolSettings>(() => {
    const saved = localStorage.getItem('settings');
    return saved ? JSON.parse(saved) : {
      schoolName: '',
      principalName: '',
      academicYear: '',
    };
  });

  const [activeTab, setActiveTab] = useState<TabView>(TabView.DASHBOARD);
  
  // State to track the student being edited
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  // Persistence
  useEffect(() => {
    localStorage.setItem('classes', JSON.stringify(classes));
  }, [classes]);

  useEffect(() => {
    localStorage.setItem('students', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem('settings', JSON.stringify(settings));
  }, [settings]);

  // Handler to start editing a student
  const handleEditStudent = (student: Student) => {
    setEditingStudent(student);
    setActiveTab(TabView.ENTRY);
  };

  // Navigation Items
  const navItems = [
    { id: TabView.DASHBOARD, label: 'لوحة المعلومات', icon: <LayoutDashboard size={20} /> },
    { id: TabView.CLASSES, label: 'إدارة الصفوف والمواد', icon: <BookOpen size={20} /> },
    { id: TabView.ENTRY, label: 'إدخال الدرجات', icon: <Users size={20} /> },
    { id: TabView.RESULTS, label: 'النتائج والترتيب', icon: <GraduationCap size={20} /> },
    { id: TabView.SETTINGS, label: 'الإعدادات والطباعة', icon: <SettingsIcon size={20} /> },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row text-gray-800 font-sans bg-gray-100">
      
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-slate-900 text-slate-100 flex flex-col shadow-xl shrink-0 print:hidden">
        <div className="p-6 flex items-center gap-3 border-b border-slate-700">
          <div className="bg-indigo-600 p-2 rounded-lg">
            <School size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold leading-tight text-white">نظام رصد</h1>
            <p className="text-xs text-slate-300">الإصدار 2.0</p>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                activeTab === item.id 
                  ? 'bg-indigo-600 text-white shadow-lg translate-x-[-4px]' 
                  : 'text-slate-200 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {item.icon}
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 text-center text-xs text-slate-400 border-t border-slate-800">
          &copy; {new Date().getFullYear()} نظام مدرستي
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-gray-100 print:h-auto print:overflow-visible">
        {/* Header */}
        <header className="bg-white shadow-sm px-6 py-4 flex justify-between items-center z-10 border-b border-gray-200 print:hidden">
          <h2 className="text-xl font-bold text-gray-800">
            {navItems.find(n => n.id === activeTab)?.label}
          </h2>
          <div className="flex items-center gap-4">
            {settings.schoolName && <span className="text-sm font-bold text-indigo-900 px-3 py-1 bg-indigo-50 rounded-full">{settings.schoolName}</span>}
            <div className="text-sm text-gray-500 font-medium">
               {classes.length} صفوف | {students.length} طالب
            </div>
          </div>
        </header>

        {/* Content Body */}
        <div className="flex-1 overflow-auto p-6 print:p-0 print:overflow-visible">
          {activeTab === TabView.DASHBOARD && (
            <Dashboard classes={classes} students={students} />
          )}
          {activeTab === TabView.CLASSES && (
            <ClassManager classes={classes} setClasses={setClasses} />
          )}
          {activeTab === TabView.ENTRY && (
            <StudentEntry 
              classes={classes} 
              students={students} 
              setStudents={setStudents}
              editingStudent={editingStudent}
              setEditingStudent={setEditingStudent}
            />
          )}
          {activeTab === TabView.RESULTS && (
            <ResultsTable 
              classes={classes} 
              students={students} 
              setStudents={setStudents}
              onEditStudent={handleEditStudent}
              settings={settings}
            />
          )}
          {activeTab === TabView.SETTINGS && (
            <Settings 
              settings={settings} 
              setSettings={setSettings}
              classes={classes}
              students={students}
              setClasses={setClasses}
              setStudents={setStudents}
            />
          )}
        </div>
      </main>

    </div>
  );
};

export default App;