// utils/validateResult.ts
export interface ResultForm {
  minuteId: number | null;
  target: string;
  achievement: number; // 0–100
  targetCompletionDate: string; // YYYY-MM-DD from <input type="date" />
  description: string;
}

export function validateResult(form: ResultForm): string | null {
  if (!form.minuteId || form.minuteId <= 0) {
    return "Please select a meeting minute.";
  }

  if (!form.target.trim()) {
    return "Target is required.";
  }

  if (form.target.trim().length < 3) {
    return "Target should be at least 3 characters.";
  }

  if (Number.isNaN(form.achievement)) {
    return "Achievement must be a number.";
  }

  if (form.achievement < 0 || form.achievement > 100) {
    return "Achievement must be between 0 and 100%.";
  }

  if (!form.targetCompletionDate) {
    return "Target completion date is required.";
  }

  const date = new Date(form.targetCompletionDate);
  if (isNaN(date.getTime())) {
    return "Target completion date is not a valid date.";
  }

  if (!form.description.trim()) {
    return "Description is required.";
  }

  return null;
}
