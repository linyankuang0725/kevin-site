export async function onRequestPost(context) {
  try {
    const input = await context.request.json();
    for (const key of ['name', 'birthDate', 'birthTime', 'birthPlace']) {
      if (!input[key]) {
        return new Response(JSON.stringify({ ok: false, error: `${key} is required` }), {
          status: 400,
          headers: { 'content-type': 'application/json; charset=utf-8' },
        });
      }
    }

    const bridgeUrl = 'https://read-days-bone-magic.trycloudflare.com/bazi/report';
    const bridgeToken = 'qJtkn2BNllI-PTOv1KrMXnOcQB3G-1mGNNE3b0grDD0';

    const res = await fetch(bridgeUrl, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'authorization': `Bearer ${bridgeToken}`,
      },
      body: JSON.stringify(input),
    });

    const text = await res.text();
    return new Response(text, {
      status: res.status,
      headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ ok: false, error: String(error?.message || error) }), {
      status: 500,
      headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
    });
  }
}
