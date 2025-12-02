import { api, BASE_URL } from "../helpers/fetcher";
import type {
  MeetingResult,
  MeetingResultRequest,
} from "../types/MeetingResult";

export function getResults(): Promise<MeetingResult[]> {
  return api<MeetingResult[]>(`${BASE_URL}/results`);
}

export function getResult(id: number): Promise<MeetingResult> {
  return api<MeetingResult>(`${BASE_URL}/results/${id}`);
}

export function createResult(
  data: MeetingResultRequest
): Promise<MeetingResult> {
  return api<MeetingResult>(`${BASE_URL}/results`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export function updateResult(
  id: number,
  data: Omit<MeetingResultRequest, "minuteId">
): Promise<MeetingResult> {
  return api<MeetingResult>(`${BASE_URL}/results/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export function deleteResult(id: number): Promise<void> {
  return api<void>(`${BASE_URL}/results/${id}`, {
    method: "DELETE",
  });
}
