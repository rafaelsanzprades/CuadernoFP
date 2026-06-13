export const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    const error = new Error('An error occurred while fetching the data.');
    (error as any).info = await res.json().catch(() => ({}));
    (error as any).status = res.status;
    throw error;
  }
  const json = await res.json();
  if (json.status !== 'success') {
    throw new Error(json.message || 'API responded with an error');
  }
  return json.data;
};


