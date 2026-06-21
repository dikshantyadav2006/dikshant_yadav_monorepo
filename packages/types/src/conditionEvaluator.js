export function evaluateCondition(condition, userAnswer) {
  const answers = Array.isArray(userAnswer) ? userAnswer : [userAnswer];
  const value = condition.value ?? '';

  switch (condition.type) {
    case 'equals':
      return answers.includes(value);
    case 'contains':
      return answers.some((answer) => answer.includes(value));
    case 'truthy':
      return answers.length > 0 && answers[0] !== '';
    case 'falsy':
      return answers.length === 0 || answers[0] === '';
    default:
      return false;
  }
}
