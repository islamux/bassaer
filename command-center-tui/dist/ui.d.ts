import type { Widgets } from 'blessed';
import type { TrackerState } from 'command-center-shared';
export interface ViewComponent {
    box: Widgets.BoxElement;
    render: (state: TrackerState | null, milestoneIdx: number) => void;
}
export declare function createBaseView(screen: Widgets.Screen, options?: Partial<Widgets.BoxOptions>): ViewComponent;
export declare function createModal(screen: Widgets.Screen, title: string, content: string): Widgets.BoxElement;
export declare function createInputModal(screen: Widgets.Screen, title: string, placeholder: string, callback: (value: string) => void): Widgets.BoxElement;
export declare function renderProgressBar(pct: number, width: number): string;
