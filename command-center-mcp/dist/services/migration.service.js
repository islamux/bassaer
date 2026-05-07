export const CURRENT_SCHEMA_VERSION = 1;
const migrations = [
    {
        version: 1,
        name: 'remove_done_field',
        run: (state) => {
            for (const m of [...state.milestones.active, ...state.milestones.backlog]) {
                for (const t of m.subtasks) {
                    if ('done' in t) {
                        delete t.done;
                    }
                }
            }
        },
    },
];
export function runMigrations(state) {
    const currentVersion = state._schema_version ?? 0;
    if (currentVersion >= CURRENT_SCHEMA_VERSION) {
        return state;
    }
    for (const migration of migrations) {
        if (migration.version > currentVersion) {
            migration.run(state);
        }
    }
    ;
    state._schema_version = CURRENT_SCHEMA_VERSION;
    return state;
}
export function getPendingMigrations(state) {
    const currentVersion = state._schema_version ?? 0;
    return migrations.filter(m => m.version > currentVersion);
}
export function getSchemaVersion(state) {
    return state._schema_version ?? 0;
}
//# sourceMappingURL=migration.service.js.map