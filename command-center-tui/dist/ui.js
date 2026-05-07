import blessed from 'blessed';
import { currentTheme, getThemeName } from '../theme.js';
export function createBaseView(screen, options = {}) {
    const theme = currentTheme();
    const box = blessed.box({
        parent: screen,
        top: 1,
        left: 0,
        right: 0,
        bottom: 1,
        keys: true,
        vi: true,
        scrollable: true,
        alwaysScroll: true,
        tags: true,
        style: { bg: theme.bg, fg: theme.fg },
        ...options,
    });
    return {
        box,
        render: () => box.setContent('{center}{red-fg}No data{/}{/}'),
    };
}
export function createModal(screen, title, content) {
    const theme = currentTheme();
    const isDark = getThemeName() === 'dark';
    const w = Math.min(80, screen.width - 4);
    const h = Math.min(30, screen.height - 4);
    const top = Math.floor((screen.height - h) / 2);
    const left = Math.floor((screen.width - w) / 2);
    const modal = blessed.box({
        parent: screen,
        top,
        left,
        width: w,
        height: h,
        tags: true,
        scrollable: true,
        alwaysScroll: true,
        keys: true,
        vi: true,
        border: { type: 'line' },
        style: {
            bg: theme.barBg,
            fg: theme.fg,
            border: { fg: theme.accent },
        },
    });
    const lines = [`{center}{bold}{${isDark ? 'accent' : 'headerFg'}-fg}${title}{/}{/}`, ''];
    lines.push(...content.split('\n'));
    lines.push('', '{center}{muted}Press Esc to close{/}');
    modal.setContent(lines.join('\n'));
    modal.focus();
    screen.render();
    return modal;
}
export function createInputModal(screen, title, placeholder, callback) {
    const theme = currentTheme();
    const w = 60;
    const h = 5;
    const top = Math.floor((screen.height - h) / 2);
    const left = Math.floor((screen.width - w) / 2);
    const overlay = blessed.box({
        parent: screen,
        top,
        left,
        width: w,
        height: h,
        tags: true,
        border: { type: 'line' },
        style: {
            bg: theme.barBg,
            fg: theme.fg,
            border: { fg: theme.accent },
        },
    });
    overlay.setContent(`{bold}${title}{/}\n${placeholder}`);
    overlay.focus();
    screen.render();
    let input = '';
    screen.grabInput('text');
    const handler = (_ch, key) => {
        if (key.name === 'enter') {
            screen.ungrabInput();
            screen.removeListener('keypress', handler);
            screen.remove(overlay);
            callback(input);
        }
        else if (key.name === 'escape') {
            screen.ungrabInput();
            screen.removeListener('keypress', handler);
            screen.remove(overlay);
            callback('');
        }
        else if (key.name === 'backspace') {
            input = input.slice(0, -1);
            overlay.setContent(`{bold}${title}{/}\n${input || placeholder}`);
            screen.render();
        }
        else if (!key.ctrl && !key.meta && key.ch && key.ch.length === 1) {
            input += key.ch;
            overlay.setContent(`{bold}${title}{/}\n${input || placeholder}`);
            screen.render();
        }
    };
    screen.on('keypress', handler);
    return overlay;
}
export function renderProgressBar(pct, width) {
    const theme = currentTheme();
    const filled = Math.round((pct / 100) * width);
    const empty = width - filled;
    return `{${theme.success}-fg}${'█'.repeat(filled)}{/}{${theme.border}-fg}${'░'.repeat(empty)}{/}`;
}
//# sourceMappingURL=ui.js.map