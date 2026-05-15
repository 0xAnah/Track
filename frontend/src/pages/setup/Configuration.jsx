// inside pages/setup/Configuration.jsx
import { useNavigate } from 'react-router-dom';

export default function Configuration() {
  const navigate = useNavigate();

  const handleFinish = () => {
    // 1. Save settings to DB/State
    // 2. Redirect to Dashboard
    navigate('/dashboard');
  };

  return (
    // ... UI with Toggles ...
    <button onClick={handleFinish} className="w-full bg-[#0052CC] ...">
      Finish Setup
    </button>
  );
}