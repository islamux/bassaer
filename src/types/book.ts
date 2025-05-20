export interface Run {
    text: string;
    font: string | null;
    size: number | null;
    bold: boolean | null;
    italic: boolean | null;
    underline: boolean | null;
  }
  
  export interface Spacing {
    before: number | null;
    after: number | null;
  }
  
  export interface Paragraph {
    type: string;
    text: string;
    spacing: Spacing;
    runs: Run[];
  }