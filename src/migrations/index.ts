import * as migration_20251206_223322 from './20251206_223322';
import * as migration_20251207_190558 from './20251207_190558';
import * as migration_20251207_214334_site_settings from './20251207_214334_site_settings';

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
    up: migration_20251207_214334_site_settings.up,
    down: migration_20251207_214334_site_settings.down,
    name: '20251207_214334_site_settings'
  },
];
