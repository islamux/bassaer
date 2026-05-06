import type { Widgets } from 'blessed';
import type { TrackerState } from '../types.js';
export declare function createTaskBoard(screen: Widgets.Screen, state: TrackerState | null, milestoneIdx: number): Widgets.BoxElement;
