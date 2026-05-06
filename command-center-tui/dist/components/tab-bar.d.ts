import type { Widgets } from 'blessed';
export declare function createTabBar(screen: Widgets.Screen, activeTab: number, onTab: (i: number) => void): Widgets.BoxElement;
