import React from 'react';

export const AdminLoadingScreen: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F7F1E5] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[#E2A69B] border-t-transparent rounded-full animate-spin" />
    </div>
  );
};
