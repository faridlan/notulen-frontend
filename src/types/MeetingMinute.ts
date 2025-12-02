export interface Member {
  name: string;
}

export interface MinuteImage {
  id: number;
  url: string;
}

export interface MeetingMinute {
  id: number;
  division: string;
  title: string;
  notes: string;
  speaker: string;
  numberOfParticipants: number;
  members: Member[];
  images?: MinuteImage[];
  createdAt?: string;
  updatedAt?: string;
}
