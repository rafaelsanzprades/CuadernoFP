export class ApiError extends Error {
  info: unknown;
  status: number;
  constructor(message: string, info: unknown, status: number) {
    super(message);
    this.info = info;
    this.status = status;
  }
}

export const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    const info = await res.json().catch(() => ({}));
    throw new ApiError('An error occurred while fetching the data.', info, res.status);
  }
  const json = await res.json();
  if (json.status !== 'success') {
    throw new Error(json.message || 'API responded with an error');
  }
  return json.data;
};


