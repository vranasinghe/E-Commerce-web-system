fetch('http://localhost:4000/api/ai/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ messages: [{ role: 'user', content: 'hello' }] })
}).then(r => r.json().then(j => console.log(r.status, j))).catch(console.error);
