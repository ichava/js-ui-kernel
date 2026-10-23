import tseslint from 'typescript-eslint';
import { ignores, typescript } from './config/eslint.base.js';

export default tseslint.config(ignores, typescript);
