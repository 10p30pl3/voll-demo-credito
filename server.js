import http from 'node:http';
import { readFile } from 'node:fs/promises';
const TRIGGER_URL='https://produtos.vollsc.com/api/triggers/activate/22a4895d-bba7-4b8b-8ad0-13a154ebeb2e';
const html=await readFile(new URL('./index.html',import.meta.url));
const favicon=await readFile(new URL('./favicon.svg',import.meta.url));
const logo=await readFile(new URL('./voll-credito-logo.svg',import.meta.url));
const json=(res,status,body)=>{res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});res.end(JSON.stringify(body));};
async function handler(req,res){
 const path=new URL(req.url,'http://localhost').pathname;
 if(req.method==='GET'&&path==='/'){res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'});return res.end(html);}
 if(req.method==='GET'&&(path==='/favicon.svg'||path==='/voll-credito-logo.svg')){res.writeHead(200,{'Content-Type':'image/svg+xml; charset=utf-8','Cache-Control':'public, max-age=3600'});return res.end(path==='/favicon.svg'?favicon:logo);}
 if(req.method==='GET'&&path==='/favicon.ico'){res.writeHead(302,{Location:'/favicon.svg'});return res.end();}
 if(req.method==='GET'&&path==='/health')return json(res,200,{ok:true});
 if(path!=='/api/trigger')return json(res,404,{error:'Não encontrado.'});
 if(req.method!=='POST'){res.setHeader('Allow','POST');return json(res,405,{error:'Método inválido.'});}
 if(req.headers.origin){try{if(new URL(req.headers.origin).host!==req.headers.host)return json(res,403,{error:'Origem inválida.'});}catch{return json(res,403,{error:'Origem inválida.'});}}
 let body;try{let data='';let bytes=0;for await(const chunk of req){bytes+=chunk.length;if(bytes>16384)return json(res,413,{error:'Body muito grande.'});data+=chunk;}body=JSON.parse(data);}catch{return json(res,400,{error:'Body inválido.'});}
 if(!body||!['WHATSAPP','VOICE'].includes(body.action)||typeof body.whatsapp!=='string'||!/^\d{8,15}$/.test(body.whatsapp)||!Number.isInteger(body.try)||body.try<1||body.try>3||body.to!=='1007')return json(res,400,{error:'Dados de acionamento inválidos.'});
 const key=process.env.VOLL_API_KEY;if(!key)return json(res,503,{error:'Integração não configurada.'});
 const url=new URL(TRIGGER_URL);url.searchParams.set('voll-api-key',key);
 try{const result=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:body.action,whatsapp:body.whatsapp,try:body.try,to:body.to}),signal:AbortSignal.timeout(25000),redirect:'error'});await result.body?.cancel();if(!result.ok)return json(res,502,{error:'O workflow não confirmou o envio (HTTP '+result.status+').',upstream_status:result.status});return json(res,200,{ok:true,upstream_status:result.status});}
 catch{return json(res,504,{error:'Envio não confirmado. Verifique o workflow antes de tentar novamente.'});}
}
const server=http.createServer((req,res)=>{handler(req,res).catch(()=>{if(!res.headersSent)json(res,500,{error:'Erro interno.'});else res.end();});});
server.listen(Number(process.env.PORT)||3000,'0.0.0.0',()=>console.log('Voll Crédito em execução.'));
