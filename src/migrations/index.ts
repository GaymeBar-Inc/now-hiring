import * as migration_20251206_223322 from './20251206_223322';
import * as migration_20251207_190558 from './20251207_190558';
import * as migration_20260421_145138 from './20260421_145138';
import * as migration_20260430_132006 from './20260430_132006';

export const migrations = [
  {
    up: migration_20251206_223322.up,
    down: migration_20251206_223322.down,
    name: '20251206_223322',
  },
  {
    up: migration_20251207_190558.up,
    down: migration_20251207_190558.down,
    name: '20251207_190558',
  },
  {
    up: migration_20260421_145138.up,
    down: migration_20260421_145138.down,
    name: '20260421_145138',
  },
  {
    up: migration_20260430_132006.up,
    down: migration_20260430_132006.down,
    name: '20260430_132006'
  },
];
