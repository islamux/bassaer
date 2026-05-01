type ToolResult = {
    content: Array<{
        type: string;
        text: string;
    }>;
    isError?: boolean;
};
export declare function handleTool(name: string, args: Record<string, any>): Promise<ToolResult>;
export declare function getToolDefinitions(): ({
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            task_id: {
                type: string;
                description: string;
            };
            milestone_id?: undefined;
            status?: undefined;
            domain?: undefined;
            agent_id?: undefined;
            limit?: undefined;
            summary?: undefined;
            feedback?: undefined;
            reason?: undefined;
            resolution?: undefined;
            priority?: undefined;
            assignee?: undefined;
            execution_mode?: undefined;
            notes?: undefined;
            action?: undefined;
            description?: undefined;
            tags?: undefined;
            prompt?: undefined;
            builder_prompt?: undefined;
            acceptance_criteria?: undefined;
            constraints?: undefined;
            context_files?: undefined;
            reference_docs?: undefined;
            note?: undefined;
            actual_start?: undefined;
            actual_end?: undefined;
            drift_days?: undefined;
            id?: undefined;
            title?: undefined;
            phase?: undefined;
            planned_start?: undefined;
            planned_end?: undefined;
            label?: undefined;
            depends_on?: undefined;
            name?: undefined;
            type?: undefined;
            permissions?: undefined;
            color?: undefined;
            parent_id?: undefined;
        };
        required: string[];
    };
} | {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            task_id?: undefined;
            milestone_id?: undefined;
            status?: undefined;
            domain?: undefined;
            agent_id?: undefined;
            limit?: undefined;
            summary?: undefined;
            feedback?: undefined;
            reason?: undefined;
            resolution?: undefined;
            priority?: undefined;
            assignee?: undefined;
            execution_mode?: undefined;
            notes?: undefined;
            action?: undefined;
            description?: undefined;
            tags?: undefined;
            prompt?: undefined;
            builder_prompt?: undefined;
            acceptance_criteria?: undefined;
            constraints?: undefined;
            context_files?: undefined;
            reference_docs?: undefined;
            note?: undefined;
            actual_start?: undefined;
            actual_end?: undefined;
            drift_days?: undefined;
            id?: undefined;
            title?: undefined;
            phase?: undefined;
            planned_start?: undefined;
            planned_end?: undefined;
            label?: undefined;
            depends_on?: undefined;
            name?: undefined;
            type?: undefined;
            permissions?: undefined;
            color?: undefined;
            parent_id?: undefined;
        };
        required: never[];
    };
} | {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            milestone_id: {
                type: string;
                description: string;
            };
            task_id?: undefined;
            status?: undefined;
            domain?: undefined;
            agent_id?: undefined;
            limit?: undefined;
            summary?: undefined;
            feedback?: undefined;
            reason?: undefined;
            resolution?: undefined;
            priority?: undefined;
            assignee?: undefined;
            execution_mode?: undefined;
            notes?: undefined;
            action?: undefined;
            description?: undefined;
            tags?: undefined;
            prompt?: undefined;
            builder_prompt?: undefined;
            acceptance_criteria?: undefined;
            constraints?: undefined;
            context_files?: undefined;
            reference_docs?: undefined;
            note?: undefined;
            actual_start?: undefined;
            actual_end?: undefined;
            drift_days?: undefined;
            id?: undefined;
            title?: undefined;
            phase?: undefined;
            planned_start?: undefined;
            planned_end?: undefined;
            label?: undefined;
            depends_on?: undefined;
            name?: undefined;
            type?: undefined;
            permissions?: undefined;
            color?: undefined;
            parent_id?: undefined;
        };
        required: string[];
    };
} | {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            milestone_id: {
                type: string;
                description: string;
            };
            status: {
                type: string;
                description: string;
            };
            domain: {
                type: string;
                description: string;
            };
            task_id?: undefined;
            agent_id?: undefined;
            limit?: undefined;
            summary?: undefined;
            feedback?: undefined;
            reason?: undefined;
            resolution?: undefined;
            priority?: undefined;
            assignee?: undefined;
            execution_mode?: undefined;
            notes?: undefined;
            action?: undefined;
            description?: undefined;
            tags?: undefined;
            prompt?: undefined;
            builder_prompt?: undefined;
            acceptance_criteria?: undefined;
            constraints?: undefined;
            context_files?: undefined;
            reference_docs?: undefined;
            note?: undefined;
            actual_start?: undefined;
            actual_end?: undefined;
            drift_days?: undefined;
            id?: undefined;
            title?: undefined;
            phase?: undefined;
            planned_start?: undefined;
            planned_end?: undefined;
            label?: undefined;
            depends_on?: undefined;
            name?: undefined;
            type?: undefined;
            permissions?: undefined;
            color?: undefined;
            parent_id?: undefined;
        };
        required: never[];
    };
} | {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            agent_id: {
                type: string;
                description: string;
            };
            limit: {
                type: string;
                description: string;
            };
            task_id?: undefined;
            milestone_id?: undefined;
            status?: undefined;
            domain?: undefined;
            summary?: undefined;
            feedback?: undefined;
            reason?: undefined;
            resolution?: undefined;
            priority?: undefined;
            assignee?: undefined;
            execution_mode?: undefined;
            notes?: undefined;
            action?: undefined;
            description?: undefined;
            tags?: undefined;
            prompt?: undefined;
            builder_prompt?: undefined;
            acceptance_criteria?: undefined;
            constraints?: undefined;
            context_files?: undefined;
            reference_docs?: undefined;
            note?: undefined;
            actual_start?: undefined;
            actual_end?: undefined;
            drift_days?: undefined;
            id?: undefined;
            title?: undefined;
            phase?: undefined;
            planned_start?: undefined;
            planned_end?: undefined;
            label?: undefined;
            depends_on?: undefined;
            name?: undefined;
            type?: undefined;
            permissions?: undefined;
            color?: undefined;
            parent_id?: undefined;
        };
        required: never[];
    };
} | {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            task_id: {
                type: string;
                description: string;
            };
            agent_id: {
                type: string;
                description: string;
            };
            milestone_id?: undefined;
            status?: undefined;
            domain?: undefined;
            limit?: undefined;
            summary?: undefined;
            feedback?: undefined;
            reason?: undefined;
            resolution?: undefined;
            priority?: undefined;
            assignee?: undefined;
            execution_mode?: undefined;
            notes?: undefined;
            action?: undefined;
            description?: undefined;
            tags?: undefined;
            prompt?: undefined;
            builder_prompt?: undefined;
            acceptance_criteria?: undefined;
            constraints?: undefined;
            context_files?: undefined;
            reference_docs?: undefined;
            note?: undefined;
            actual_start?: undefined;
            actual_end?: undefined;
            drift_days?: undefined;
            id?: undefined;
            title?: undefined;
            phase?: undefined;
            planned_start?: undefined;
            planned_end?: undefined;
            label?: undefined;
            depends_on?: undefined;
            name?: undefined;
            type?: undefined;
            permissions?: undefined;
            color?: undefined;
            parent_id?: undefined;
        };
        required: string[];
    };
} | {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            task_id: {
                type: string;
                description: string;
            };
            summary: {
                type: string;
                description: string;
            };
            agent_id: {
                type: string;
                description: string;
            };
            milestone_id?: undefined;
            status?: undefined;
            domain?: undefined;
            limit?: undefined;
            feedback?: undefined;
            reason?: undefined;
            resolution?: undefined;
            priority?: undefined;
            assignee?: undefined;
            execution_mode?: undefined;
            notes?: undefined;
            action?: undefined;
            description?: undefined;
            tags?: undefined;
            prompt?: undefined;
            builder_prompt?: undefined;
            acceptance_criteria?: undefined;
            constraints?: undefined;
            context_files?: undefined;
            reference_docs?: undefined;
            note?: undefined;
            actual_start?: undefined;
            actual_end?: undefined;
            drift_days?: undefined;
            id?: undefined;
            title?: undefined;
            phase?: undefined;
            planned_start?: undefined;
            planned_end?: undefined;
            label?: undefined;
            depends_on?: undefined;
            name?: undefined;
            type?: undefined;
            permissions?: undefined;
            color?: undefined;
            parent_id?: undefined;
        };
        required: string[];
    };
} | {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            task_id: {
                type: string;
                description: string;
            };
            feedback: {
                type: string;
                description: string;
            };
            milestone_id?: undefined;
            status?: undefined;
            domain?: undefined;
            agent_id?: undefined;
            limit?: undefined;
            summary?: undefined;
            reason?: undefined;
            resolution?: undefined;
            priority?: undefined;
            assignee?: undefined;
            execution_mode?: undefined;
            notes?: undefined;
            action?: undefined;
            description?: undefined;
            tags?: undefined;
            prompt?: undefined;
            builder_prompt?: undefined;
            acceptance_criteria?: undefined;
            constraints?: undefined;
            context_files?: undefined;
            reference_docs?: undefined;
            note?: undefined;
            actual_start?: undefined;
            actual_end?: undefined;
            drift_days?: undefined;
            id?: undefined;
            title?: undefined;
            phase?: undefined;
            planned_start?: undefined;
            planned_end?: undefined;
            label?: undefined;
            depends_on?: undefined;
            name?: undefined;
            type?: undefined;
            permissions?: undefined;
            color?: undefined;
            parent_id?: undefined;
        };
        required: string[];
    };
} | {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            task_id: {
                type: string;
                description: string;
            };
            reason: {
                type: string;
                description: string;
            };
            milestone_id?: undefined;
            status?: undefined;
            domain?: undefined;
            agent_id?: undefined;
            limit?: undefined;
            summary?: undefined;
            feedback?: undefined;
            resolution?: undefined;
            priority?: undefined;
            assignee?: undefined;
            execution_mode?: undefined;
            notes?: undefined;
            action?: undefined;
            description?: undefined;
            tags?: undefined;
            prompt?: undefined;
            builder_prompt?: undefined;
            acceptance_criteria?: undefined;
            constraints?: undefined;
            context_files?: undefined;
            reference_docs?: undefined;
            note?: undefined;
            actual_start?: undefined;
            actual_end?: undefined;
            drift_days?: undefined;
            id?: undefined;
            title?: undefined;
            phase?: undefined;
            planned_start?: undefined;
            planned_end?: undefined;
            label?: undefined;
            depends_on?: undefined;
            name?: undefined;
            type?: undefined;
            permissions?: undefined;
            color?: undefined;
            parent_id?: undefined;
        };
        required: string[];
    };
} | {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            task_id: {
                type: string;
                description: string;
            };
            resolution: {
                type: string;
                description: string;
            };
            milestone_id?: undefined;
            status?: undefined;
            domain?: undefined;
            agent_id?: undefined;
            limit?: undefined;
            summary?: undefined;
            feedback?: undefined;
            reason?: undefined;
            priority?: undefined;
            assignee?: undefined;
            execution_mode?: undefined;
            notes?: undefined;
            action?: undefined;
            description?: undefined;
            tags?: undefined;
            prompt?: undefined;
            builder_prompt?: undefined;
            acceptance_criteria?: undefined;
            constraints?: undefined;
            context_files?: undefined;
            reference_docs?: undefined;
            note?: undefined;
            actual_start?: undefined;
            actual_end?: undefined;
            drift_days?: undefined;
            id?: undefined;
            title?: undefined;
            phase?: undefined;
            planned_start?: undefined;
            planned_end?: undefined;
            label?: undefined;
            depends_on?: undefined;
            name?: undefined;
            type?: undefined;
            permissions?: undefined;
            color?: undefined;
            parent_id?: undefined;
        };
        required: string[];
    };
} | {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            task_id: {
                type: string;
                description: string;
            };
            priority: {
                type: string;
                description: string;
            };
            assignee: {
                type: string;
                description: string;
            };
            execution_mode: {
                type: string;
                description: string;
            };
            notes: {
                type: string;
                description: string;
            };
            milestone_id?: undefined;
            status?: undefined;
            domain?: undefined;
            agent_id?: undefined;
            limit?: undefined;
            summary?: undefined;
            feedback?: undefined;
            reason?: undefined;
            resolution?: undefined;
            action?: undefined;
            description?: undefined;
            tags?: undefined;
            prompt?: undefined;
            builder_prompt?: undefined;
            acceptance_criteria?: undefined;
            constraints?: undefined;
            context_files?: undefined;
            reference_docs?: undefined;
            note?: undefined;
            actual_start?: undefined;
            actual_end?: undefined;
            drift_days?: undefined;
            id?: undefined;
            title?: undefined;
            phase?: undefined;
            planned_start?: undefined;
            planned_end?: undefined;
            label?: undefined;
            depends_on?: undefined;
            name?: undefined;
            type?: undefined;
            permissions?: undefined;
            color?: undefined;
            parent_id?: undefined;
        };
        required: string[];
    };
} | {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            task_id: {
                type: string;
                description: string;
            };
            action: {
                type: string;
                description: string;
            };
            description: {
                type: string;
                description: string;
            };
            tags: {
                type: string;
                items: {
                    type: string;
                };
                description: string;
            };
            agent_id: {
                type: string;
                description: string;
            };
            milestone_id?: undefined;
            status?: undefined;
            domain?: undefined;
            limit?: undefined;
            summary?: undefined;
            feedback?: undefined;
            reason?: undefined;
            resolution?: undefined;
            priority?: undefined;
            assignee?: undefined;
            execution_mode?: undefined;
            notes?: undefined;
            prompt?: undefined;
            builder_prompt?: undefined;
            acceptance_criteria?: undefined;
            constraints?: undefined;
            context_files?: undefined;
            reference_docs?: undefined;
            note?: undefined;
            actual_start?: undefined;
            actual_end?: undefined;
            drift_days?: undefined;
            id?: undefined;
            title?: undefined;
            phase?: undefined;
            planned_start?: undefined;
            planned_end?: undefined;
            label?: undefined;
            depends_on?: undefined;
            name?: undefined;
            type?: undefined;
            permissions?: undefined;
            color?: undefined;
            parent_id?: undefined;
        };
        required: string[];
    };
} | {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            task_id: {
                type: string;
                description: string;
            };
            prompt: {
                type: string;
                description: string;
            };
            builder_prompt: {
                type: string;
                description: string;
            };
            acceptance_criteria: {
                type: string;
                items: {
                    type: string;
                };
                description: string;
            };
            constraints: {
                type: string;
                items: {
                    type: string;
                };
                description: string;
            };
            context_files: {
                type: string;
                items: {
                    type: string;
                };
                description: string;
            };
            reference_docs: {
                type: string;
                items: {
                    type: string;
                };
                description: string;
            };
            milestone_id?: undefined;
            status?: undefined;
            domain?: undefined;
            agent_id?: undefined;
            limit?: undefined;
            summary?: undefined;
            feedback?: undefined;
            reason?: undefined;
            resolution?: undefined;
            priority?: undefined;
            assignee?: undefined;
            execution_mode?: undefined;
            notes?: undefined;
            action?: undefined;
            description?: undefined;
            tags?: undefined;
            note?: undefined;
            actual_start?: undefined;
            actual_end?: undefined;
            drift_days?: undefined;
            id?: undefined;
            title?: undefined;
            phase?: undefined;
            planned_start?: undefined;
            planned_end?: undefined;
            label?: undefined;
            depends_on?: undefined;
            name?: undefined;
            type?: undefined;
            permissions?: undefined;
            color?: undefined;
            parent_id?: undefined;
        };
        required: string[];
    };
} | {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            milestone_id: {
                type: string;
                description: string;
            };
            note: {
                type: string;
                description: string;
            };
            task_id?: undefined;
            status?: undefined;
            domain?: undefined;
            agent_id?: undefined;
            limit?: undefined;
            summary?: undefined;
            feedback?: undefined;
            reason?: undefined;
            resolution?: undefined;
            priority?: undefined;
            assignee?: undefined;
            execution_mode?: undefined;
            notes?: undefined;
            action?: undefined;
            description?: undefined;
            tags?: undefined;
            prompt?: undefined;
            builder_prompt?: undefined;
            acceptance_criteria?: undefined;
            constraints?: undefined;
            context_files?: undefined;
            reference_docs?: undefined;
            actual_start?: undefined;
            actual_end?: undefined;
            drift_days?: undefined;
            id?: undefined;
            title?: undefined;
            phase?: undefined;
            planned_start?: undefined;
            planned_end?: undefined;
            label?: undefined;
            depends_on?: undefined;
            name?: undefined;
            type?: undefined;
            permissions?: undefined;
            color?: undefined;
            parent_id?: undefined;
        };
        required: string[];
    };
} | {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            milestone_id: {
                type: string;
                description: string;
            };
            actual_start: {
                type: string;
                description: string;
            };
            actual_end: {
                type: string;
                description: string;
            };
            task_id?: undefined;
            status?: undefined;
            domain?: undefined;
            agent_id?: undefined;
            limit?: undefined;
            summary?: undefined;
            feedback?: undefined;
            reason?: undefined;
            resolution?: undefined;
            priority?: undefined;
            assignee?: undefined;
            execution_mode?: undefined;
            notes?: undefined;
            action?: undefined;
            description?: undefined;
            tags?: undefined;
            prompt?: undefined;
            builder_prompt?: undefined;
            acceptance_criteria?: undefined;
            constraints?: undefined;
            context_files?: undefined;
            reference_docs?: undefined;
            note?: undefined;
            drift_days?: undefined;
            id?: undefined;
            title?: undefined;
            phase?: undefined;
            planned_start?: undefined;
            planned_end?: undefined;
            label?: undefined;
            depends_on?: undefined;
            name?: undefined;
            type?: undefined;
            permissions?: undefined;
            color?: undefined;
            parent_id?: undefined;
        };
        required: string[];
    };
} | {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            milestone_id: {
                type: string;
                description: string;
            };
            drift_days: {
                type: string;
                description: string;
            };
            task_id?: undefined;
            status?: undefined;
            domain?: undefined;
            agent_id?: undefined;
            limit?: undefined;
            summary?: undefined;
            feedback?: undefined;
            reason?: undefined;
            resolution?: undefined;
            priority?: undefined;
            assignee?: undefined;
            execution_mode?: undefined;
            notes?: undefined;
            action?: undefined;
            description?: undefined;
            tags?: undefined;
            prompt?: undefined;
            builder_prompt?: undefined;
            acceptance_criteria?: undefined;
            constraints?: undefined;
            context_files?: undefined;
            reference_docs?: undefined;
            note?: undefined;
            actual_start?: undefined;
            actual_end?: undefined;
            id?: undefined;
            title?: undefined;
            phase?: undefined;
            planned_start?: undefined;
            planned_end?: undefined;
            label?: undefined;
            depends_on?: undefined;
            name?: undefined;
            type?: undefined;
            permissions?: undefined;
            color?: undefined;
            parent_id?: undefined;
        };
        required: string[];
    };
} | {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            id: {
                type: string;
                description: string;
            };
            title: {
                type: string;
                description: string;
            };
            domain: {
                type: string;
                description: string;
            };
            phase: {
                type: string;
                description: string;
            };
            planned_start: {
                type: string;
                description: string;
            };
            planned_end: {
                type: string;
                description: string;
            };
            task_id?: undefined;
            milestone_id?: undefined;
            status?: undefined;
            agent_id?: undefined;
            limit?: undefined;
            summary?: undefined;
            feedback?: undefined;
            reason?: undefined;
            resolution?: undefined;
            priority?: undefined;
            assignee?: undefined;
            execution_mode?: undefined;
            notes?: undefined;
            action?: undefined;
            description?: undefined;
            tags?: undefined;
            prompt?: undefined;
            builder_prompt?: undefined;
            acceptance_criteria?: undefined;
            constraints?: undefined;
            context_files?: undefined;
            reference_docs?: undefined;
            note?: undefined;
            actual_start?: undefined;
            actual_end?: undefined;
            drift_days?: undefined;
            label?: undefined;
            depends_on?: undefined;
            name?: undefined;
            type?: undefined;
            permissions?: undefined;
            color?: undefined;
            parent_id?: undefined;
        };
        required: string[];
    };
} | {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            milestone_id: {
                type: string;
                description: string;
            };
            label: {
                type: string;
                description: string;
            };
            priority: {
                type: string;
                description: string;
            };
            acceptance_criteria: {
                type: string;
                items: {
                    type: string;
                };
                description: string;
            };
            constraints: {
                type: string;
                items: {
                    type: string;
                };
                description: string;
            };
            depends_on: {
                type: string;
                items: {
                    type: string;
                };
                description: string;
            };
            execution_mode: {
                type: string;
                description: string;
            };
            task_id?: undefined;
            status?: undefined;
            domain?: undefined;
            agent_id?: undefined;
            limit?: undefined;
            summary?: undefined;
            feedback?: undefined;
            reason?: undefined;
            resolution?: undefined;
            assignee?: undefined;
            notes?: undefined;
            action?: undefined;
            description?: undefined;
            tags?: undefined;
            prompt?: undefined;
            builder_prompt?: undefined;
            context_files?: undefined;
            reference_docs?: undefined;
            note?: undefined;
            actual_start?: undefined;
            actual_end?: undefined;
            drift_days?: undefined;
            id?: undefined;
            title?: undefined;
            phase?: undefined;
            planned_start?: undefined;
            planned_end?: undefined;
            name?: undefined;
            type?: undefined;
            permissions?: undefined;
            color?: undefined;
            parent_id?: undefined;
        };
        required: string[];
    };
} | {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            agent_id: {
                type: string;
                description: string;
            };
            name: {
                type: string;
                description: string;
            };
            type: {
                type: string;
                description: string;
            };
            permissions: {
                type: string;
                items: {
                    type: string;
                };
                description: string;
            };
            color: {
                type: string;
                description: string;
            };
            parent_id: {
                type: string;
                description: string;
            };
            task_id?: undefined;
            milestone_id?: undefined;
            status?: undefined;
            domain?: undefined;
            limit?: undefined;
            summary?: undefined;
            feedback?: undefined;
            reason?: undefined;
            resolution?: undefined;
            priority?: undefined;
            assignee?: undefined;
            execution_mode?: undefined;
            notes?: undefined;
            action?: undefined;
            description?: undefined;
            tags?: undefined;
            prompt?: undefined;
            builder_prompt?: undefined;
            acceptance_criteria?: undefined;
            constraints?: undefined;
            context_files?: undefined;
            reference_docs?: undefined;
            note?: undefined;
            actual_start?: undefined;
            actual_end?: undefined;
            drift_days?: undefined;
            id?: undefined;
            title?: undefined;
            phase?: undefined;
            planned_start?: undefined;
            planned_end?: undefined;
            label?: undefined;
            depends_on?: undefined;
        };
        required: string[];
    };
})[];
export {};
