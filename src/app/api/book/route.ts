import { NextRequest, NextResponse } from 'next/server';
import bookData from '../../bassaer.json';
import { Paragraph } from '@/types/book';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const search = searchParams.get('search') || '';
  
  const data = bookData as Paragraph[];
  
  let results = data;
  
  // تطبيق البحث إذا كان موجودًا
  if (search) {
    const terms = search.toLowerCase().split(' ').filter(term => term.length > 0);
    results = data.filter(paragraph => {
      const text = paragraph.text.toLowerCase();
      return terms.some(term => text.includes(term));
    });
  }
  
  // حساب الصفحات
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const paginatedResults = results.slice(startIndex, endIndex);
  
  // تحديد عناوين الصفحات (يمكن استخدام أول فقرة في كل صفحة كعنوان)
  const pageTitle = paginatedResults.length > 0 ? paginatedResults[0].text.substring(0, 50) : '';
  
  return NextResponse.json({
    total: results.length,
    page,
    limit,
    pageTitle,
    totalPages: Math.ceil(results.length / limit),
    data: paginatedResults
  });
}