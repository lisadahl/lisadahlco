import type { APIRoute } from 'astro';

export const prerender = false;

export const GET: APIRoute = async () => {
  try {
    const response = await fetch('https://dahllm.substack.com/feed', {
      headers: {
        'User-Agent': 'Mozilla/5.0'
      }
    });

    if (!response.ok) {
      throw new Error(`Substack feed request failed: ${response.status}`);
    }

    const xmlData = await response.text();

    return new Response(xmlData, {
      status: 200,
      headers: {
        'Content-Type': 'text/xml; charset=utf-8'
      }
    });
  } catch (error) {
    console.error('Error proxying Substack feed:', error);

    return new Response(JSON.stringify({ error: 'Failed to fetch Substack feed' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
};
