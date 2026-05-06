export declare const themes: {
    dark: {
        bg: string;
        fg: string;
        accent: string;
        success: string;
        warning: string;
        error: string;
        review: string;
        muted: string;
        border: string;
        barBg: string;
        selectedBg: string;
        selectedFg: string;
        headerBg: string;
        headerFg: string;
    };
    light: {
        bg: string;
        fg: string;
        accent: string;
        success: string;
        warning: string;
        error: string;
        review: string;
        muted: string;
        border: string;
        barBg: string;
        selectedBg: string;
        selectedFg: string;
        headerBg: string;
        headerFg: string;
    };
};
export type ThemeName = 'dark' | 'light';
export declare function statusColor(status: string): string;
export declare function statusIcon(status: string): string;
export declare function priorityBadge(priority: string): string;
