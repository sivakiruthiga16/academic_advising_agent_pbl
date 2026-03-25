import { useState, useEffect } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import { BookOpen, Award, TrendingUp, AlertCircle, PieChart, ChevronDown, Calendar, Activity } from 'lucide-react';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

const AcademicPerformance = ({ studentData, allRecords = [], suggestions, remarks }) => {
    const [selectedSemester, setSelectedSemester] = useState('');

    useEffect(() => {
        if (allRecords.length > 0 && !selectedSemester) {
            setSelectedSemester(allRecords[0].semester);
        }
    }, [allRecords]);

    // Determine active record based on selection
    const activeRecord = allRecords.find(r => r.semester === selectedSemester) || allRecords[0] || studentData?.academicRecord;
    const subjects = activeRecord?.subjects || studentData?.subjects || [];
    const semesterCgpa = activeRecord?.cgpa || 0;
    const overallCgpa = studentData?.cgpa || 0;
    const department = studentData?.department || 'Not Assigned';

    if (!activeRecord && subjects.length === 0) {
        return (
            <div className="bg-white p-12 rounded-2xl shadow-sm border border-gray-100 text-center animate-in fade-in duration-500">
                <div className="bg-indigo-50 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner">
                    <BookOpen className="h-10 w-10 text-indigo-500" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800">No Academic Data</h3>
                <p className="text-gray-500 mt-2 max-w-sm mx-auto">Your academic profile is being prepared. Check back soon for your performance analytics.</p>
            </div>
        );
    }

    // Chart Data Preparation
    const barData = {
        labels: subjects.map(s => s.name || s.subjectName),
        datasets: [
            {
                label: 'Marks obtained',
                data: subjects.map(s => s.marks),
                backgroundColor: 'rgba(79, 70, 229, 0.7)',
                borderColor: 'rgba(79, 70, 229, 1)',
                borderWidth: 0,
                borderRadius: 8,
                barThickness: 32,
            },
        ],
    };

    const barOptions = {
        responsive: true,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: '#1e293b',
                padding: 12,
                cornerRadius: 8,
                titleFont: { size: 14, weight: 'bold' },
                bodyFont: { size: 13 }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                max: 100,
                grid: { color: '#f1f5f9' },
                ticks: { font: { weight: 'bold' } }
            },
            x: {
                grid: { display: false },
                ticks: { font: { weight: 'medium' } }
            }
        },
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header with Semester Selector */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Academic Overview</h2>
                    <p className="text-gray-500 text-sm font-medium">Viewing performance data for {selectedSemester || 'Current Semester'}</p>
                </div>
                {allRecords.length > 1 && (
                    <div className="relative w-full md:w-64">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Calendar className="h-4 w-4 text-indigo-500" />
                        </div>
                        <select
                            value={selectedSemester}
                            onChange={(e) => setSelectedSemester(e.target.value)}
                            className="block w-full pl-10 pr-10 py-2.5 text-sm font-bold border-2 border-gray-100 rounded-xl appearance-none focus:outline-none focus:border-indigo-500 transition-all text-gray-700 bg-white cursor-pointer"
                        >
                            {allRecords.map((r, i) => (
                                <option key={i} value={r.semester}>{r.semester}</option>
                            ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                            <ChevronDown className="h-4 w-4 text-gray-400" />
                        </div>
                    </div>
                )}
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-indigo-600 rounded-2xl p-6 text-white shadow-xl shadow-indigo-100 relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
                    <div className="flex items-center justify-between mb-4 relative z-10">
                        <p className="text-indigo-100 font-bold uppercase tracking-wider text-xs">Overall CGPA</p>
                        <Award className="h-6 w-6 text-yellow-300" />
                    </div>
                    <div className="text-5xl font-black mb-1 relative z-10">{parseFloat(overallCgpa).toFixed(2)}</div>
                    <p className="text-indigo-100 text-sm font-medium opacity-80">{department} Department</p>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-gray-400 font-bold uppercase tracking-wider text-xs">Semester GPA</p>
                        <div className="p-2 bg-blue-50 rounded-lg"><TrendingUp className="h-5 w-5 text-blue-500" /></div>
                    </div>
                    <div className="text-4xl font-black text-gray-900">{parseFloat(semesterCgpa).toFixed(2)}</div>
                    <p className="text-gray-500 text-sm font-medium mt-1 italic">{selectedSemester || 'Target Performance'}</p>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-gray-400 font-bold uppercase tracking-wider text-xs">Course Load</p>
                        <div className="p-2 bg-emerald-50 rounded-lg"><BookOpen className="h-5 w-5 text-emerald-500" /></div>
                    </div>
                    <div className="text-4xl font-black text-gray-900">{subjects.length}</div>
                    <p className="text-gray-500 text-sm font-medium mt-1">Subjects in {selectedSemester || 'current term'}</p>
                </div>
            </div>

            {/* Performance Analysis & Advisor Guidance */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Chart Section */}
                <div className="lg:col-span-2 bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h3 className="font-bold text-xl text-gray-800">Subject Performance</h3>
                            <p className="text-gray-400 text-sm font-medium mt-1">Detailed marks breakdown for {selectedSemester}</p>
                        </div>
                        <div className="bg-gray-50 p-2 rounded-xl border border-gray-100">
                            <PieChart className="h-5 w-5 text-gray-400" />
                        </div>
                    </div>
                    <div className="h-72">
                        <Bar options={barOptions} data={barData} />
                    </div>
                </div>

                {/* Advisor Guidance */}
                <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
                    <h3 className="font-bold text-xl mb-4 flex items-center gap-2 text-gray-800">
                        <Award className="h-6 w-6 text-indigo-600" />
                        Advisor Guidance
                    </h3>
                    <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                        {remarks && remarks.length > 0 ? (
                            remarks.map((r, i) => (
                                <div key={i} className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl relative group">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">
                                            {r.advisorId?.name || 'Advisor'}
                                        </span>
                                        <span className="text-[10px] font-bold text-gray-400">
                                            {new Date(r.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-700 leading-relaxed">{r.remark || r.content}</p>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-400 text-sm text-center py-8">
                                No guidance remarks from advisor yet.
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Subject List Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                    <h3 className="font-bold text-lg text-gray-800">Transcript Preview</h3>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                        {selectedSemester || 'Current Semester'}
                    </span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50">
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Subject Name</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Marks</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Grade</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Progress</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {subjects.map((sub, idx) => (
                                <tr key={idx} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <p className="font-bold text-gray-800 group-hover:text-indigo-600 transition-colors uppercase text-sm tracking-tight">
                                            {sub.name || sub.subjectName}
                                        </p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="font-black text-gray-900">{sub.marks}</span>
                                        <span className="text-gray-400 text-xs ml-1">/ 100</span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`px-3 py-1 rounded-full text-xs font-black shadow-sm ${sub.grade?.startsWith('A') ? 'bg-emerald-100 text-emerald-700' :
                                            sub.grade?.startsWith('B') ? 'bg-blue-100 text-blue-700' :
                                                'bg-amber-100 text-amber-700'
                                            }`}>
                                            {sub.grade || 'N/A'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="w-24 bg-gray-100 rounded-full h-2 ml-auto overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all duration-1000 ${sub.marks >= 80 ? 'bg-emerald-500' :
                                                    sub.marks >= 60 ? 'bg-indigo-500' : 'bg-amber-500'
                                                    }`}
                                                style={{ width: `${sub.marks}%` }}
                                            />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AcademicPerformance;
