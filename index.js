const http = require('http');
const PORT = 3004;
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('RSS Reader: Prod Online\n');
});
server.listen(PORT, () => {
  console.log(`Servidor a correr na porta ${PORT}`);
});
