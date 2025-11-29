import React, { useState } from 'react';
import { User, SubscriptionLimits } from '../types';
import { UserPlus, Save, Trash2, Calendar, Shield, Activity, RefreshCw } from 'lucide-react';

interface AdminPanelProps {
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ users, setUsers }) => {
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newSchoolName, setNewSchoolName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [maxClasses, setMaxClasses] = useState(5);
  
  const addUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (users.find(u => u.username === newUsername)) {
      alert('اسم المستخدم موجود بالفعل');
      return;
    }

    const newUser: User = {
      username: newUsername,
      password: newPassword,
      schoolName: newSchoolName,
      role: 'user',
      isActive: true,
      limits: {
        maxClasses: maxClasses,
        maxStudentsPerClass: 100,
        expiryDate: expiryDate || new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0]
      }
    };

    setUsers([...users, newUser]);
    setNewUsername('');
    setNewPassword('');
    setNewSchoolName('');
    alert('تم إضافة المستخدم بنجاح');
  };

  const deleteUser = (username: string) => {
    if (confirm(`هل أنت متأكد من حذف المستخدم ${username}؟ سيتم حذف جميع بياناته.`)) {
      setUsers(users.filter(u => u.username !== username));
      // In a real app, you would also delete their keyed data from localStorage
      localStorage.removeItem(`classes_${username}`);
      localStorage.removeItem(`students_${username}`);
      localStorage.removeItem(`settings_${username}`);
    }
  };

  const toggleStatus = (username: string) => {
    setUsers(users.map(u => u.username === username ? { ...u, isActive: !u.isActive } : u));
  };

  const extendSubscription = (username: string) => {
    const newDate = prompt('أدخل تاريخ الانتهاء الجديد (YYYY-MM-DD):', 
      new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0]
    );
    if (newDate) {
      setUsers(users.map(u => u.username === username ? { ...u, limits: { ...u.limits, expiryDate: newDate } } : u));
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="bg-indigo-900 text-white p-6 rounded-lg shadow-lg flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Shield size={28} />
            لوحة تحكم المطور
          </h2>
          <p className="text-indigo-200">إدارة المشتركين والصلاحيات</p>
        </div>
        <div className="bg-white/10 px-4 py-2 rounded text-center">
          <p className="text-sm">عدد المشتركين</p>
          <p className="text-2xl font-bold">{users.length}</p>
        </div>
      </div>

      {/* Add User Form */}
      <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
        <h3 className="text-lg font-bold mb-4 text-gray-800 flex items-center gap-2">
          <UserPlus size={20} className="text-indigo-600" />
          إضافة مشترك جديد
        </h3>
        <form onSubmit={addUser} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <input 
            type="text" 
            placeholder="اسم المستخدم (Login ID)" 
            className="p-2 border rounded focus:ring-2 focus:ring-indigo-500 outline-none"
            value={newUsername} onChange={e => setNewUsername(e.target.value)} required
          />
          <input 
            type="text" 
            placeholder="كلمة المرور" 
            className="p-2 border rounded focus:ring-2 focus:ring-indigo-500 outline-none"
            value={newPassword} onChange={e => setNewPassword(e.target.value)} required
          />
          <input 
            type="text" 
            placeholder="اسم المدرسة (اختياري)" 
            className="p-2 border rounded focus:ring-2 focus:ring-indigo-500 outline-none"
            value={newSchoolName} onChange={e => setNewSchoolName(e.target.value)}
          />
          <div className="flex flex-col">
            <label className="text-xs text-gray-500 mb-1">تاريخ انتهاء الاشتراك</label>
            <input 
              type="date" 
              className="p-2 border rounded focus:ring-2 focus:ring-indigo-500 outline-none"
              value={expiryDate} onChange={e => setExpiryDate(e.target.value)} required
            />
          </div>
          <div className="flex flex-col">
            <label className="text-xs text-gray-500 mb-1">عدد الصفوف المسموح</label>
            <input 
              type="number" 
              placeholder="Max Classes" 
              className="p-2 border rounded focus:ring-2 focus:ring-indigo-500 outline-none"
              value={maxClasses} onChange={e => setMaxClasses(parseInt(e.target.value))} required
            />
          </div>
          <button type="submit" className="bg-emerald-600 text-white font-bold py-2 rounded hover:bg-emerald-700 transition flex items-center justify-center gap-2 mt-auto">
            <Save size={18} /> إضافة مستخدم
          </button>
        </form>
      </div>

      {/* Users List */}
      <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
        <table className="w-full text-right">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="p-4">اسم المستخدم</th>
              <th className="p-4">المدرسة</th>
              <th className="p-4">كلمة السر</th>
              <th className="p-4">عدد الصفوف</th>
              <th className="p-4">ينتهي في</th>
              <th className="p-4">الحالة</th>
              <th className="p-4 text-center">الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.username} className="border-t border-gray-100 hover:bg-gray-50">
                <td className="p-4 font-bold">{user.username}</td>
                <td className="p-4 text-gray-600">{user.schoolName || '-'}</td>
                <td className="p-4 font-mono text-sm bg-gray-50 w-min whitespace-nowrap px-2 rounded">{user.password}</td>
                <td className="p-4">{user.limits.maxClasses}</td>
                <td className={`p-4 ${new Date(user.limits.expiryDate) < new Date() ? 'text-red-600 font-bold' : 'text-green-600'}`}>
                  {user.limits.expiryDate}
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {user.isActive ? 'نشط' : 'موقف'}
                  </span>
                </td>
                <td className="p-4 flex justify-center gap-2">
                  <button onClick={() => toggleStatus(user.username)} className="p-2 bg-gray-200 rounded hover:bg-gray-300" title={user.isActive ? 'إيقاف الحساب' : 'تنشيط الحساب'}>
                    <Activity size={16} />
                  </button>
                  <button onClick={() => extendSubscription(user.username)} className="p-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200" title="تجديد الاشتراك">
                    <Calendar size={16} />
                  </button>
                  <button onClick={() => deleteUser(user.username)} className="p-2 bg-red-100 text-red-700 rounded hover:bg-red-200" title="حذف المستخدم">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr><td colSpan={7} className="p-6 text-center text-gray-500">لا يوجد مشتركين</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};