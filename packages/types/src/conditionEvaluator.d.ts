import type { EdgeCondition } from './index';

export declare function evaluateCondition(
  condition: EdgeCondition,
  userAnswer: string | string[],
): boolean;
