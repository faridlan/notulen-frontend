import { api, BASE_URL } from "../helpers/fetcher";
import type { MeetingMinute } from "../types/MeetingMinute";

export function getMinutes(): Promise<MeetingMinute[]> {
  return api<MeetingMinute[]>(`${BASE_URL}/minutes`);
}

export function getMinute(id: number): Promise<MeetingMinute> {
  return api<MeetingMinute>(`${BASE_URL}/minutes/${id}`);
}

export function createMinute(
  data: Partial<MeetingMinute>
): Promise<MeetingMinute> {
  return api<MeetingMinute>(`${BASE_URL}/minutes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export function updateMinute(
  id: number,
  data: Partial<MeetingMinute>
): Promise<MeetingMinute> {
  return api<MeetingMinute>(`${BASE_URL}/minutes/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export function deleteMinute(id: number): Promise<void> {
  return api<void>(`${BASE_URL}/minutes/${id}`, {
    method: "DELETE",
  });
}

// images
export function addImagesToMinute(id: number, urls: string[]) {
  return api<MeetingMinute>(`${BASE_URL}/minutes/${id}/images`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ urls }),
  });
}

export function deleteImage(minuteId: number, imageId: number) {
  return api<void>(`${BASE_URL}/minutes/${minuteId}/images/${imageId}`, {
    method: "DELETE",
  });
}

export function replaceImage(minuteId: number, imageId: number, url: string) {
  return api<MeetingMinute>(
    `${BASE_URL}/minutes/${minuteId}/images/${imageId}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    }
  );
}
