/* مسار الملف: js/utils/helpers.js */

export function debounce(func, wait) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

export function getLevelClass(level) {
    if (level === 'مبتدئ') return 'beginner';
    if (level === 'متوسط') return 'intermediate';
    if (level === 'متقدم') return 'advanced';
    return 'default';
}