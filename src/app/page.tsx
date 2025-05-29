"use client";

import React from 'react';
import Link from 'next/link';

const LandingPage: React.FC = () => {
  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl text-right font-amiri">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-8 font-tajawal">مرحباً بك في بصائر</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Book Reader Card */}
        <Link href="/book" passHref>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md cursor-pointer hover:shadow-lg transition-shadow">
            <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 font-tajawal">تصفح الكتاب</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-2">انتقل إلى واجهة قراءة وتصفح الكتاب</p>
          </div>
        </Link>
        {/* More cards can be added here in the future */}
      </div>
    </div>
  );
};

export default LandingPage;
