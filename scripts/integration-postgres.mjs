// Compatibility entry point. Uses only the isolated test runner, never truncates development data.
import {spawnSync} from 'node:child_process';
const r=spawnSync(process.execPath,['--test','--test-concurrency=1','test/postgres.test.js'],{stdio:'inherit',env:process.env});
process.exit(r.status??1);
