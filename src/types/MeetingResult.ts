export interface MeetingResult {
  id: number;
  target: string;
  achievement: number;
  targetCompletionDate: string;
  description: string;
  createdAt?: string;

  minute: {
    id: number;
    title: string;
  };
}

export interface MeetingResultRequest {
  minuteId: number;
  target: string;
  achievement: number;
  targetCompletionDate: string;
  description: string;
}
