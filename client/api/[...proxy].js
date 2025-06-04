// Vercel serverless function to proxy API calls to Railway backend
export default async function handler(req, res) {
  const { proxy } = req.query;
  const path = Array.isArray(proxy) ? proxy.join('/') : proxy || '';
  
  const railwayUrl = 'https://web-production-e7159.up.railway.app';
  const targetUrl = `${railwayUrl}/${path}`;
  
  try {
    // Forward the request to Railway
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: {
        'Content-Type': req.headers['content-type'] || 'application/json',
        'Authorization': req.headers.authorization || '',
        'X-Requested-With': req.headers['x-requested-with'] || '',
      },
      body: req.method !== 'GET' && req.method !== 'HEAD' ? JSON.stringify(req.body) : undefined,
    });
    
    const data = await response.text();
    
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    
    // Set the response status and return the data
    res.status(response.status);
    
    // Try to parse as JSON, fallback to text
    try {
      const jsonData = JSON.parse(data);
      res.json(jsonData);
    } catch {
      res.send(data);
    }
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ error: 'Proxy failed', message: error.message });
  }
} 