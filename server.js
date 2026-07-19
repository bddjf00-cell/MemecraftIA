const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const BASE_DIR = path.join(__dirname, 'desktop');

const MODELS = {
  'llama-3.1-8b':{model:'meta/llama-3.1-8b-instruct',apiKey:'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',temperature:0.3,top_p:0.85,max_tokens:8192},
  'deepseek-flash':{model:'deepseek-ai/deepseek-v4-flash',apiKey:'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',temperature:0.3,top_p:0.85,max_tokens:4096},
  'deepseek-pro':{model:'deepseek-ai/deepseek-v4-pro',apiKey:'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',temperature:0.7,top_p:0.92,max_tokens:32768,supportsThinking:true},
  'llama-3.3-70b':{model:'meta/llama-3.3-70b-instruct',apiKey:'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',temperature:0.7,top_p:0.92,max_tokens:65536,supportsThinking:true},
  'qwen-3.5-397b':{model:'qwen/qwen3.5-397b-a17b',apiKey:'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',temperature:0.5,top_p:0.92,max_tokens:65536,supportsThinking:true},
  'nemotron-super':{model:'nvidia/llama-3.3-nemotron-super-49b-v1',apiKey:'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',temperature:0.6,top_p:0.9,max_tokens:65536,supportsThinking:true},
  'gemma-3':{model:'google/gemma-3n-e2b-it',apiKey:'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',temperature:0.2,top_p:0.7,max_tokens:8192},
  'llama-vision':{model:'meta/llama-3.2-11b-vision-instruct',apiKey:'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',temperature:1,top_p:1,max_tokens:8192},
  'mixtral-8x7b':{model:'mistralai/mixtral-8x7b-instruct-v0.1',apiKey:'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',temperature:0.5,top_p:1,max_tokens:32768},
  'minimax-m2.7':{model:'minimaxai/minimax-m2.7',apiKey:'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',temperature:1,top_p:0.95,max_tokens:65536},
  'poolside-laguna':{model:'poolside/laguna-xs-2.1',apiKey:'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',temperature:1,top_p:0.95,max_tokens:65536},
  'glm-5.2':{model:'z-ai/glm-5.2',apiKey:'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',temperature:1,top_p:1,max_tokens:65536,supportsThinking:true},
  'kimi-k2.6':{model:'moonshotai/kimi-k2.6',apiKey:'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',temperature:1,top_p:1,max_tokens:65536}
};

const MIME_TYPES = {'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.ico':'image/x-icon'};

const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin','*');
  res.setHeader('Access-Control-Allow-Methods','GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers','Content-Type');
  if(req.method==='OPTIONS'){res.writeHead(204);res.end();return}

  if(req.method==='GET'&&req.url==='/api/models'){
    res.writeHead(200,{'Content-Type':'application/json'});
    res.end(JSON.stringify(Object.keys(MODELS)));
    return
  }

  if(req.method==='POST'&&req.url==='/api/chat'){
    let body='';
    req.on('data',c=>body+=c);
    req.on('end',async()=>{
      try{
        const {messages,model:modelId}=JSON.parse(body);
        const cfg=MODELS[modelId]||MODELS['llama-3.1-8b'];
        const payload={model:cfg.model,messages,temperature:cfg.temperature,top_p:cfg.top_p,max_tokens:cfg.max_tokens,stream:!cfg.supportsThinking};
        const r=await fetch("https://integrate.api.nvidia.com/v1/chat/completions",{
          method:'POST',
          headers:{'Content-Type':'application/json','Authorization':`Bearer ${cfg.apiKey}`},
          body:JSON.stringify(payload)
        });
        if(cfg.supportsThinking){
          const data=await r.json();
          res.writeHead(200,{'Content-Type':'application/json'});
          res.end(JSON.stringify(data));
        }else{
          res.writeHead(200,{'Content-Type':'text/event-stream','Cache-Control':'no-cache'});
          const reader=r.body.getReader();const dec=new TextDecoder();
          while(true){const{done,value}=await reader.read();if(done){res.end();break}res.write(dec.decode(value))}
        }
      }catch(e){
        res.writeHead(500,{'Content-Type':'application/json'});
        res.end(JSON.stringify({error:e.message}));
      }
    });
    return
  }

  let urlPath=req.url.split('?')[0];
  if(urlPath==='/')urlPath='/index.html';
  if(urlPath==='/descargas')urlPath='/descargas.html';
  let fp=path.join(BASE_DIR,urlPath);
  if(!fp.startsWith(BASE_DIR)){res.writeHead(403);res.end('Forbidden');return}
  try{
    const c=fs.readFileSync(fp);
    const ext=path.extname(fp);
    res.writeHead(200,{'Content-Type':MIME_TYPES[ext]||'application/octet-stream'});
    res.end(c);
  }catch{
    res.writeHead(404,{'Content-Type':'text/html'});
    res.end('<h1>404</h1><p>Archivo no encontrado. Prueba <a href="/">index.html</a> o <a href="/descargas">descargas</a></p>');
  }
});

server.listen(PORT,()=>console.log(`MemeCraft Code server en http://localhost:${PORT}`));
