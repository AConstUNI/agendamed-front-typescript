export async function getUserSession(jwt: string) {
  if (!jwt) {
    console.warn('No JWT provided');
    return null;
  }

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_LINK}/users/me`, {
    headers: {
      Authorization: `Bearer ${jwt}`,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    const text = await res.text();
    console.error('Server error:', res.status, text);
    return null;
  }

  const text = await res.text();
  if (!text) {
    // Resposta vazia
    return null;
  }

  try {
    return JSON.parse(text);
  } catch (err) {
    console.error('Failed to parse JSON:', err, 'Response text:', text);
    return null;
  }
}