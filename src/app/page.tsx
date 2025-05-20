"use client";

import { useState, useEffect } from 'react';
import BookContent from '@/components/BookContent';
import { ThemeToggle } from '@/components/ThemeToggle';
import Search from '@/components/Search';
import { Paragraph } from '@/types/book';
import PageNavigation from '@/components/PageNavigation';

const ITEMS_PER_PAGE = 20; // عدد الفقرات في كل صفحة

export default function Home() {
  const [displayedParagraphs, setDisplayedParagraphs] = useState<Paragraph[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(0);
  const [nextPageTitle, setNextPageTitle] = useState('');

  const fetchData = async (page: number, search: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/book?page=${page}&limit=${ITEMS_PER_PAGE}&search=${encodeURIComponent(search)}`);
      const data = await response.json();
      
      setDisplayedParagraphs(data.data);
      setTotalPages(Math.ceil(data.total / ITEMS_PER_PAGE));
      
      // جلب عنوان الصفحة التالية إذا كانت موجودة
      if (page < Math.ceil(data.total / ITEMS_PER_PAGE)) {
        const nextPageResponse = await fetch(`/api/book?page=${page + 1}&limit=1&search=${encodeURIComponent(search)}`);
        const nextPageData = await nextPageResponse.json();
        if (nextPageData.data.length > 0) {
          // استخدام أول فقرة من الصفحة التالية كعنوان
          setNextPageTitle(nextPageData.data[0].text.substring(0, 50) + '...');
        }
      } else {
        setNextPageTitle('');
      }
      
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(currentPage, searchTerm);
  }, [currentPage, searchTerm]);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      window.scrollTo(0, 0); // التمرير إلى أعلى الصفحة
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      window.scrollTo(0, 0); // التمرير إلى أعلى الصفحة
    }
  };

  return (
    <div dir="rtl" className="min-h-screen bg-white dark:bg-gray-900">
      <header className="py-6 px-4 bg-white dark:bg-gray-800 shadow-md sticky top-0 z-10">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">بصائر</h1>
          <ThemeToggle />
        </div>
      </header>
      
      <main className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <Search onSearch={handleSearch} />
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
            {loading ? (
              <div className="text-center py-10">جاري التحميل...</div>
            ) : (
              <>
                <BookContent paragraphs={displayedParagraphs} />
                
                <PageNavigation 
                  currentPage={currentPage}
                  totalPages={totalPages}
                  nextPageTitle={nextPageTitle}
                  onNextPage={goToNextPage}
                  onPreviousPage={goToPreviousPage}
                />
              </>
            )}
          </div>
        </div>
      </main>
      
      <footer className="py-6 px-4 bg-white dark:bg-gray-800 shadow-inner mt-8">
        <div className="container mx-auto text-center text-gray-600 dark:text-gray-400">
          <p>© {new Date().getFullYear()} - بصائر</p>
        </div>
      </footer>
    </div>
  );
}