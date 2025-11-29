import React, { useState, useEffect } from 'react';
import { SchoolClass, Student, TabView, SchoolSettings, User } from './types';
import { ClassManager } from './components/ClassManager';
import { StudentEntry } from './components/StudentEntry';
import { ResultsTable } from './components/ResultsTable';
import { Dashboard } from './components/Dashboard';
import { Settings } from './components/Settings';
import { Login } from './components/Login';
import { AdminPanel } from './components/AdminPanel';
import { LayoutDashboard, Users, BookOpen, GraduationCap, School, Settings as SettingsIcon, LogOut, Shield } from 'lucide-react';

const App: React.FC = () => {
  // --- AUTH STATE ---
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('currentUser');
    return saved ? JSON.parse(saved) : null;
  });

  const [registeredUsers, setRegisteredUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('system_users');
    return saved ? JSON.parse(saved) : [];
  });

  // --- APP DATA STATE (Empty initially, loaded after login) ---
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [settings, setSettings] = useState<SchoolSettings>({
    schoolName: '',
    principalName: '',
    academicYear: '',
  });

  const [activeTab, setActiveTab] = useState<TabView>(TabView.DASHBOARD);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  // --- EFFECT: PERSIST USERS SYSTEM ---
  useEffect(() => {
    localStorage.setItem('system_users', JSON.stringify(registeredUsers));
  }, [registeredUsers]);

  // --- EFFECT: LOAD USER DATA ON LOGIN ---
  useEffect(() => {
    if (currentUser && currentUser.role !== 'admin') {
      // Load isolated data for this user
      const savedClasses = localStorage.getItem(`classes_${currentUser.username}`);
      const savedStudents = localStorage.getItem(`students_${currentUser.username}`);
      const savedSettings = localStorage.getItem(`settings_${currentUser.username}`);

      setClasses(savedClasses ? JSON.parse(savedClasses) : []);
      setStudents(savedStudents ? JSON.parse(savedStudents) : []);
      setSettings(savedSettings ? JSON.parse(savedSettings) : { schoolName: currentUser.schoolName || '', principalName: '', academicYear: '' });
      setActiveTab(TabView.DASHBOARD);
    } else if (currentUser && currentUser.role === 'admin') {
      setActiveTab(TabView.ADMIN);
    }
    
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
  }, [currentUser]);

  // --- EFFECT: SAVE USER DATA (ISOLATED) ---
  useEffect(() => {
    if (currentUser && currentUser.role !== 'admin') {
      localStorage.setItem(`classes_${currentUser.username}`, JSON.stringify(classes));
    }
  }, [classes, currentUser]);

  useEffect(() => {
    if (currentUser && currentUser.role !== 'admin') {
      localStorage.setItem(`students_${currentUser.username}`, JSON.stringify(students));
    }
  }, [students, currentUser]);

  useEffect(() => {
    if (currentUser && currentUser.role !== 'admin') {
      localStorage.setItem(`settings_${currentUser.username}`, JSON.stringify(settings));
    }
  }, [settings, currentUser]);


  // --- HANDLERS ---
  const handleLogin = (user: User) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setClasses([]);
    setStudents([]);
    localStorage.removeItem('currentUser');
  };

  const handleEditStudent = (student: Student) => {
    setEditingStudent(student);
    setActiveTab(TabView.ENTRY);
  };

  // --- RENDER LOGIN IF NOT AUTHENTICATED ---
  if (!currentUser) {
    return <Login onLogin={handleLogin} users={registeredUsers} />;
  }

  // --- NAVIGATION ITEMS ---
  let navItems = [
    { id: TabView.DASHBOARD, label: 'لوحة المعلومات', icon: <LayoutDashboard size={20} /> },
    { id: TabView.CLASSES, label: 'إدارة الصفوف', icon: <BookOpen size={20} /> },
    { id: TabView.ENTRY, label: 'إدخال الدرجات', icon: <Users size={20} /> },
    { id: TabView.RESULTS, label: 'النتائج والترتيب', icon: <GraduationCap size={20} /> },
    { id: TabView.SETTINGS, label: 'الإعدادات', icon: <SettingsIcon size={20} /> },
  ];

  if (currentUser.role === 'admin') {
    navItems = [
      { id: TabView.ADMIN, label: 'لوحة المطور', icon: <Shield size={20} /> }
    ];
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row text-gray-800 font-sans bg-gray-100">
      
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-slate-900 text-slate-100 flex flex-col shadow-xl shrink-0 print:hidden sticky top-0 md:h-screen z-50">
        <div className="p-6 flex items-center gap-3 border-b border-slate-700">
          <div className={`${currentUser.role === 'admin' ? 'bg-red-600' : 'bg-indigo-600'} p-2 rounded-lg transition-colors`}>
            {currentUser.role === 'admin' ? <Shield size={24} className="text-white" /> : <School size={24} className="text-white" />}
          </div>
          <div className="overflow-hidden">
            <h1 className="text-lg font-bold leading-tight text-white truncate">نظام رصد</h1>
            <p className="text-xs text-slate-300 truncate">مرحباً، {currentUser.username}</p>
          </div>
        </div>
        
        <nav className="flex-1 p-4 flex md:flex-col overflow-x-auto md:overflow-visible gap-2 md:gap-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 whitespace-nowrap ${
                activeTab === item.id 
                  ? 'bg-indigo-600 text-white shadow-lg md:translate-x-[-4px]' 
                  : 'text-slate-200 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {item.icon}
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-300 hover:bg-red-900/30 hover:text-red-200 transition"
          >
            <LogOut size={20} />
            <span className="font-medium">تسجيل الخروج</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-gray-100 print:h-auto print:overflow-visible w-full">
        {/* Header */}
        <header className="bg-white shadow-sm px-6 py-4 flex justify-between items-center z-10 border-b border-gray-200 print:hidden flex-wrap gap-2">
          <h2 className="text-xl font-bold text-gray-800">
            {navItems.find(n => n.id === activeTab)?.label}
          </h2>
          <div className="flex items-center gap-4">
            {currentUser.role !== 'admin' && (
              <>
                <div className="hidden sm:block text-xs font-bold text-indigo-800 px-3 py-1 bg-indigo-50 rounded-full border border-indigo-100">
                  ينتهي الاشتراك: {currentUser.limits.expiryDate}
                </div>
                {settings.schoolName && <span className="text-sm font-bold text-gray-700">{settings.schoolName}</span>}
              </>
            )}
          </div>
        </header>

        {/* Content Body */}
        <div className="flex-1 overflow-auto p-4 md:p-6 print:p-0 print:overflow-visible scroll-smooth">
          {currentUser.role === 'admin' ? (
             <AdminPanel users={registeredUsers} setUsers={setRegisteredUsers} />
          ) : (
            <>
              {activeTab === TabView.DASHBOARD && (
                <Dashboard classes={classes} students={students} />
              )}
              {activeTab === TabView.CLASSES && (
                <ClassManager 
                  classes={classes} 
                  setClasses={setClasses} 
                  maxClasses={currentUser.limits.maxClasses} 
                />
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
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;