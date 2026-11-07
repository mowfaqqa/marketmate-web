export type Business = { id: string; name: string; category: string; description: string; location: string; contact: string | null; language: string; tone: string; brandColor: string; version: number; updatedAt: string };
export type Account = { email: string; verified: boolean; business: Business };
export class ApiError extends Error { constructor(message: string, public status: number) { super(message); } }
export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`/api${path}`, { ...options, cache: 'no-store', credentials: 'same-origin', headers: { 'Content-Type': 'application/json', ...options.headers } });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new ApiError(Array.isArray(data.message) ? data.message.join('. ') : data.message || 'Something went wrong. Please try again.', response.status);
  return data;
}
