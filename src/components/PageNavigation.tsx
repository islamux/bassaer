import React from 'react';

interface PageNavigationProps {
  currentPage: number;
  totalPages: number;
  nextPageTitle: string;
  onNextPage: () => void;
  onPreviousPage: () => void;
}

export default function PageNavigation({
  currentPage,
  totalPages,
  nextPageTitle,
  onNextPage,
  onPreviousPage
}: PageNavigationProps) {
  return (
    <div className="mt-8 flex flex-col space-y-4">
      <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-400">
        <span>صفحة {currentPage} من {totalPages}</span>
      </div>
      
      <div className="flex flex-col md:flex-row justify-between gap-4">
        {currentPage > 1 && (
          <button
            onClick={onPreviousPage}
            className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white px-6 py-3 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-right"
          >
            <span className="block text-sm text-gray-500 dark:text-gray-400 mb-1">الصفحة السابقة</span>
            <span className="font-semibold">العودة للصفحة السابقة</span>
          </button>
        )}
        
        {currentPage < totalPages && nextPageTitle && (
          <button
            onClick={onNextPage}
            className="bg-blue-500 text-white px-6 py-3 rounded-md hover:bg-blue-600 transition-colors text-right"
          >
            <span className="block text-sm text-blue-200 mb-1">الصفحة التالية</span>
            <span className="font-semibold">{nextPageTitle}</span>
          </button>
        )}
      </div>
    </div>
  );
}