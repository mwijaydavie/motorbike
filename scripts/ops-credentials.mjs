import { randomBytes } from 'node:crypto';
import { hashPassword } from '../server/ops-http.mjs';

const password = randomBytes(24).toString('base64url');
console.log('Save this admin password in your password manager. Do not commit it or share it in chat.');
console.log(password);
console.log('\nSet this server-only variable in your hosting dashboard:');
console.log(`OPS_PASSWORD_HASH=${await hashPassword(password)}`);
