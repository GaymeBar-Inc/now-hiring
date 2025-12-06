import * as migration_20251206_223322 from './20251206_223322';

export const migrations = [
  {
    up: migration_20251206_223322.up,
    down: migration_20251206_223322.down,
    name: '20251206_223322'
  },
];
