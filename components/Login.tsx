import React, { useState } from 'react';
import { User } from '../types';
import { Lock, User as UserIcon, LogIn, AlertTriangle } from 'lucide-react';

interface LoginProps {
  onLogin: (user: User) => void;
  users: User[]; // In real app, this checks backend
}

export const Login: React.FC<LoginProps> = ({ onLogin, users }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Developer Backdoor
    if (username === 'dev' && password === 'm1239') {
      const devUser: User = {
        username: 'dev',
        role: 'admin',
        isActive: true,
        limits: { maxClasses: 9999, maxStudentsPerClass: 9999, expiryDate: '2099-12-31' }
      };
      onLogin(devUser);
      return;
    }

    // Normal User Check
    const foundUser = users.find(u => u.username === username && u.password === password);
    
    if (foundUser) {
      if (!foundUser.isActive) {
        setError('تم إيقاف هذا الحساب. يرجى مراجعة المطور.');
        return;
      }
      
      const today = new Date();
      const expiry = new Date(foundUser.limits.expiryDate);
      
      if (expiry < today) {
        setError('انتهت صلاحية اشتراكك. يرجى تجديد الاشتراك.');
        return;
      }

      onLogin(foundUser);
    } else {
      setError('اسم المستخدم أو كلمة المرور غير صحيحة');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 to-slate-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden w-full max-w-md">
        <div className="bg-indigo-600 p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white bg-opacity-20 rounded-full mb-4">
            <Lock className="text-white" size={32} />
          </div>
          <h1 className="text-2xl font-bold text-white">نظام رصد الدرجات</h1>
          <p className="text-indigo-100 mt-2">تسجيل الدخول للنظام</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded flex items-center gap-2 text-sm font-medium">
              <AlertTriangle size={18} />
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">اسم المستخدم</label>
            <div className="relative">
              <UserIcon className="absolute right-3 top-3 text-gray-400" size={18} />
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                placeholder="أدخل اسم المستخدم"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">كلمة المرور</label>
            <div className="relative">
              <Lock className="absolute right-3 top-3 text-gray-400" size={18} />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="w-full bg-indigo-700 text-white py-3 rounded-lg font-bold shadow hover:bg-indigo-800 transition flex items-center justify-center gap-2"
          >
            <LogIn size={20} />
            دخول
          </button>
          
          <div className="text-center text-xs text-gray-400 mt-4">
            للحصول على حساب أو تجديد الاشتراك، يرجى التواصل مع إدارة النظام.
          </div>
        </form>
      </div>
    </div>
  );
};