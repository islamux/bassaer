import React from 'react';
import { Paragraph } from '@/types/book';

interface BookContentProps {
  paragraphs: Paragraph[];
}

export default function BookContent({ paragraphs }: BookContentProps) {
  return (
    <div className="rtl:text-right ltr:text-left">
      {paragraphs.map((paragraph, index) => {
        // تحديد ما إذا كانت الفقرة عنوانًا (يمكن تحديد ذلك بناءً على نمط النص أو الخصائص)
        const isHeading = paragraph.runs[0]?.bold || 
                         (paragraph.runs[0]?.size && paragraph.runs[0].size > 16) ||
                         paragraph.type === 'heading';
        
        return (
          <div key={index} className="mb-4">
            <p 
              className={`whitespace-pre-line ${isHeading ? 'text-xl md:text-2xl font-bold mt-6 mb-4 text-blue-800 dark:text-blue-300' : ''}`}
              style={{
                fontFamily: paragraph.runs[0]?.font || 'inherit',
                fontSize: paragraph.runs[0]?.size ? `${paragraph.runs[0].size / 16}rem` : 'inherit',
                fontWeight: paragraph.runs[0]?.bold ? 'bold' : 'normal',
                fontStyle: paragraph.runs[0]?.italic ? 'italic' : 'normal',
                textDecoration: paragraph.runs[0]?.underline ? 'underline' : 'none',
                marginTop: paragraph.spacing?.before !== null ? `${paragraph.spacing.before}px` : '1rem',
                marginBottom: paragraph.spacing?.after !== null ? `${paragraph.spacing.after}px` : '1rem',
              }}
            >
              {paragraph.text}
            </p>
          </div>
        );
      })}
    </div>
  );
}