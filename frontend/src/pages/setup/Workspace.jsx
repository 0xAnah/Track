import React from 'react';
import { Upload, UserPlus } from 'lucide-react';
import ProgressBar from '../../components/onboarding/ProgressBar';

export default function Workforce() {
  return (
    <div className="max-w-xl mx-auto py-12 px-6">
      <ProgressBar step={2} total={4} />
      
      <div className="text-center mb-10">
        <h2 className="text-2xl font-black text-gray-900 mb-2">Build your workforce</h2>
        <p className="text-sm text-gray-500">Add your employees to the workspace to start tracking.</p>
      </div>

      <div className="space-y-4">
        {/* CSV Option */}
        <button className="w-full flex items-center gap-4 p-6 border-2 border-dashed border-gray-200 rounded-2xl hover:border-trackBlue hover:bg-blue-50 transition-all group">
          <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center group-hover:bg-white">
            <Upload className="text-gray-400 group-hover:text-trackBlue" />
          </div>
          <div className="text-left">
            <p className="text-sm font-bold text-gray-900">Import from CSV</p>
            <p className="text-[10px] text-gray-500">Bulk upload your team members using our template.</p>
          </div>
        </button>

        
        <button className="w-full flex items-center gap-4 p-6 border-2 border-gray-100 rounded-2xl hover:border-trackBlue transition-all group">
          <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
            <UserPlus className="text-gray-400 group-hover:text-trackBlue" />
          </div>
          <div className="text-left">
            <p className="text-sm font-bold text-gray-900">Add Manually</p>
            <p className="text-[10px] text-gray-500">Input employee details one by one.</p>
          </div>
        </button>
      </div>

      <button className="w-full mt-8 bg-[#0052CC] text-white py-4 rounded-xl font-bold shadow-lg">
        Continue to Configuration
      </button>
    </div>
  );
}