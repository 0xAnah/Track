import React from 'react';
import { useNavigate } from 'react-router-dom';
import Confetti from 'react-confetti'; // Optional: npm install react-confetti

export default function SetupSuccess() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white p-6">
      {/* Optional Confetti effect */}
      <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6">
        <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
          </svg>
        </div>
      </div>

      <h1 className="text-3xl font-black text-gray-900 mb-2">Your Workspace Is Ready!!</h1>
      <p className="text-sm text-gray-500 text-center max-w-xs mb-10">
        Congratulations! Your setup is complete. You can now start managing your workforce and tracking sessions.
      </p>

      <button 
        onClick={() => navigate('/dashboard')}
        className="w-full max-w-sm bg-[#0052CC] text-white py-4 rounded-xl font-bold shadow-xl shadow-blue-100 active:scale-95 transition"
      >
        Go to Dashboard
      </button>
    </div>
  );
}