export interface MinuteForm {
  division: string;
  title: string;
  notes: string;
  speaker: string;
  numberOfParticipants: number;
  members: string[];
  images: string[]; // ADD THIS
}

export function validateMinute(form: MinuteForm) {
  if (!form.division.trim()) return "Division is required.";
  if (!form.title.trim()) return "Title is required.";
  if (!form.notes.trim()) return "Notes cannot be empty.";
  if (!form.speaker.trim()) return "Speaker is required.";

  if (form.numberOfParticipants <= 0)
    return "Number of participants must be greater than 0.";

  if (form.members.length === 0) return "Please add at least one member.";

  if (form.images.length === 0) return "Please upload at least one image.";

  return null;
}
