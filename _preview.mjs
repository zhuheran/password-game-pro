import http from 'node:http';
import worker from './worker.js';
const server = http.createServer(async (req,res)=>{
  const fw = await worker.fetch(new Request('http://localhost:8788'+req.url));
  const body = await fw.arrayBuffer();
  res.writeHead(fw.status, Object.fromEntries(fw.headers));
  res.end(Buffer.from(body));
});
server.listen(8788, ()=>console.log('preview: http://localhost:8788'));
