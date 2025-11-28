import React, { useState, useMemo } from 'react';
import { SchoolClass, Student } from '../types';
import { calculateStudentStats } from '../utils';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line 
} from 'recharts';
import { TrendingUp, TrendingDown, AlertTriangle, Users, BookOpen, CheckCircle } from 'lucide-react';

interface DashboardProps {
  classes: SchoolClass[];
  students: Student[];
}

export const Dashboard: React.FC<DashboardProps> = ({ classes, students }) => {
  const [selectedClassId, setSelectedClassId] = useState<string>(classes[0]?.id || '');

  // Ensure selectedClassId is valid
  React.useEffect(() => {
    if (!selectedClassId && classes.length > 0) {
      setSelectedClassId(classes[0].id);
    }
  }, [classes, selectedClassId]);

  const selectedClass = classes.find(c => c.id === selectedClassId);

  // 1. Calculate General Stats (Across all classes)
  const totalStudents = students.length;
  const totalClasses = classes.length;
  
  // Calculate average percentage across entire school
  const allStudentsWithStats = students.map(s => {
    const cls = classes.find(c => c.id === s.classId);
    return cls ? calculateStudentStats(s, cls) : s;
  });
  
  const schoolAverage = allStudentsWithStats.length > 0
    ? allStudentsWithStats.reduce((acc, s) => acc + (s.percentage || 0), 0) / allStudentsWithStats.length
    : 0;


  // 2. Calculate Specific Stats for Selected Class
  const classStats = useMemo(() => {
    if (!selectedClass) return null;

    const classStudents = allStudentsWithStats.filter(s => s.classId === selectedClassId);
    
    // Subject Analysis
    const subjectAnalysis = selectedClass.subjects.map(subj => {
      const scores = classStudents.map(s => s.scores[subj.id] || 0);
      const totalScore = scores.reduce((a, b) => a + b, 0);
      const avg = scores.length > 0 ? totalScore / scores.length : 0;
      const percentageAvg = (avg / subj.maxScore) * 100;
      
      // Pass/Fail (Assuming < 50% is fail)
      const failCount = scores.filter(score => (score / subj.maxScore) < 0.5).length;
      const passCount = scores.length - failCount;

      return {
        id: subj.id,
        name: subj.name,
        avgScore: avg,
        maxScore: subj.maxScore,
        avgPercentage: percentageAvg,
        passCount,
        failCount
      };
    });

    // Sort subjects by difficulty (lowest average percentage is hardest)
    const sortedByDifficulty = [...subjectAnalysis].sort((a, b) => a.avgPercentage - b.avgPercentage);
    const hardestSubject = sortedByDifficulty[0];
    const easiestSubject = sortedByDifficulty[sortedByDifficulty.length - 1];

    // Grade Distribution for this class
    let gradeDist = { Excellent: 0, VeryGood: 0, Good: 0, Acceptable: 0, Weak: 0 };
    classStudents.forEach(s => {
      const p = s.percentage || 0;
      if (p >= 90) gradeDist.Excellent++;
      else if (p >= 75) gradeDist.VeryGood++;
      else if (p >= 60) gradeDist.Good++;
      else if (p >= 50) gradeDist.Acceptable++;
      else gradeDist.Weak++;
    });

    return {
      studentCount: classStudents.length,
      subjectAnalysis,
      hardestSubject,
      easiestSubject,
      gradeDist,
      students: classStudents
    };
  }, [selectedClass, allStudentsWithStats, selectedClassId]);

  // Chart Data Preparation
  const subjectChartData = classStats?.subjectAnalysis.map(s => ({
    name: s.name,
    'متوسط الدرجة': parseFloat(s.avgScore.toFixed(1)),
    'الدرجة العظمى': s.maxScore
  }));

  const passFailChartData = classStats?.subjectAnalysis.map(s => ({
    name: s.name,
    'ناجح': s.passCount,
    'راسب': s.failCount
  }));

  const pieData = classStats ? [
    { name: 'ممتاز', value: classStats.gradeDist.Excellent, color: '#10b981' },
    { name: 'جيد جداً', value: classStats.gradeDist.VeryGood, color: '#3b82f6' },
    { name: 'جيد', value: classStats.gradeDist.Good, color: '#06b6d4' },
    { name: 'مقبول', value: classStats.gradeDist.Acceptable, color: '#f59e0b' },
    { name: 'ضعيف', value: classStats.gradeDist.Weak, color: '#ef4444' },
  ].filter(d => d.value > 0) : [];

  if (classes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-white rounded-lg shadow text-gray-500">
        <BookOpen size={48} className="mb-4 opacity-20" />
        <p>لا توجد بيانات لعرضها. يرجى إضافة صفوف ومواد أولاً.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* General School Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-indigo-600 flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm font-medium">إجمالي الطلاب</p>
            <p className="text-3xl font-bold text-gray-800">{totalStudents}</p>
          </div>
          <div className="bg-indigo-50 p-3 rounded-full text-indigo-600">
            <Users size={24} />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-500 flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm font-medium">عدد الصفوف</p>
            <p className="text-3xl font-bold text-gray-800">{totalClasses}</p>
          </div>
          <div className="bg-blue-50 p-3 rounded-full text-blue-600">
            <BookOpen size={24} />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-emerald-500 flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm font-medium">متوسط المدرسة العام</p>
            <p className="text-3xl font-bold text-gray-800">{schoolAverage.toFixed(1)}%</p>
          </div>
          <div className="bg-emerald-50 p-3 rounded-full text-emerald-600">
            <TrendingUp size={24} />
          </div>
        </div>
      </div>

      <hr className="border-gray-200" />

      {/* Class Selection & Analysis */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <TrendingUp className="text-indigo-600" />
          تحليل أداء الصف:
        </h2>
        <select 
          value={selectedClassId}
          onChange={(e) => setSelectedClassId(e.target.value)}
          className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full md:w-64 p-2.5"
        >
          {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      {classStats && selectedClass ? (
        <>
          {/* Detailed Cards for Selected Class */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
             <div className="bg-red-50 p-4 rounded-lg border border-red-100">
               <div className="flex items-center gap-2 mb-2 text-red-800 font-bold">
                 <AlertTriangle size={18} />
                 <span>أصعب مادة</span>
               </div>
               <p className="text-lg text-gray-800 font-semibold">{classStats.hardestSubject?.name || '-'}</p>
               <p className="text-xs text-gray-500">متوسط الدرجات: {classStats.hardestSubject?.avgPercentage.toFixed(1)}%</p>
             </div>

             <div className="bg-green-50 p-4 rounded-lg border border-green-100">
               <div className="flex items-center gap-2 mb-2 text-green-800 font-bold">
                 <CheckCircle size={18} />
                 <span>أسهل مادة</span>
               </div>
               <p className="text-lg text-gray-800 font-semibold">{classStats.easiestSubject?.name || '-'}</p>
               <p className="text-xs text-gray-500">متوسط الدرجات: {classStats.easiestSubject?.avgPercentage.toFixed(1)}%</p>
             </div>

             <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
               <div className="flex items-center gap-2 mb-2 text-blue-800 font-bold">
                 <Users size={18} />
                 <span>عدد الطلاب</span>
               </div>
               <p className="text-2xl text-gray-800 font-bold">{classStats.studentCount}</p>
             </div>

             <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
               <div className="flex items-center gap-2 mb-2 text-yellow-800 font-bold">
                 <TrendingDown size={18} />
                 <span>حالات الضعف</span>
               </div>
               <p className="text-2xl text-gray-800 font-bold">{classStats.gradeDist.Weak}</p>
               <p className="text-xs text-gray-500">طالب حصلوا على تقدير ضعيف</p>
             </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Subject Performance Chart */}
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="font-bold text-gray-700 mb-4 text-center">متوسط درجات المواد</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={subjectChartData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={100} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="متوسط الدرجة" fill="#8884d8" radius={[0, 4, 4, 0]} />
                    <Bar dataKey="الدرجة العظمى" fill="#e5e7eb" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Pass/Fail Chart */}
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="font-bold text-gray-700 mb-4 text-center">نسب النجاح والرسوب لكل مادة</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={passFailChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="ناجح" stackId="a" fill="#10b981" />
                    <Bar dataKey="راسب" stackId="a" fill="#ef4444" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            
             {/* Grade Distribution Pie Chart */}
             <div className="bg-white p-4 rounded-lg shadow lg:col-span-2">
              <h3 className="font-bold text-gray-700 mb-4 text-center">توزيع التقديرات العامة للصف</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={4}
                      dataKey="value"
                      label={({name, value}) => `${name}: ${value}`}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center p-8 text-gray-500">
           اختر صفاً لعرض التحليل المفصل.
        </div>
      )}
    </div>
  );
};