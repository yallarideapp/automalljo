/**
 * Minimal GitHub REST client for the admin panel. Everything runs in the browser with the
 * staff member's own fine-grained access key (Contents: read and write on this repository only).
 */
export const REPO={owner:"yallarideapp",repo:"automalljo",branch:"main",appDir:"app"} as const;
const API="https://api.github.com/repos/"+REPO.owner+"/"+REPO.repo;

export class GitHubError extends Error{constructor(message:string,readonly status:number){super(message);}}

async function call<T>(token:string,path:string,init:RequestInit={}):Promise<T>{
 const response=await fetch(path.startsWith("http")?path:API+path,{...init,headers:{Accept:"application/vnd.github+json","X-GitHub-Api-Version":"2022-11-28",Authorization:"Bearer "+token,...(init.body?{"Content-Type":"application/json"}:{}),...init.headers}});
 if(!response.ok){
  let detail="";try{detail=((await response.json()) as {message?:string}).message??"";}catch{/* no body */}
  throw new GitHubError(detail||response.statusText||"GitHub request failed",response.status);
 }
 return response.status===204?(undefined as T):(await response.json() as T);
}

/** Confirms the key works and can write to the repository. */
export async function checkAccess(token:string){
 const repo=await call<{permissions?:{push?:boolean};full_name:string}>(token,"");
 // GitHub only reports permissions for a signed-in request, so a missing block means the key was not accepted.
 if(!repo.permissions)throw new GitHubError("Bad credentials",401);
 if(!repo.permissions.push)throw new GitHubError("This key can read the website but cannot save changes. Give it Contents: Read and write.",403);
 return repo.full_name;
}

const decode=(base64:string)=>new TextDecoder().decode(Uint8Array.from(atob(base64.replace(/\s/g,"")),char=>char.charCodeAt(0)));
const encode=(bytes:Uint8Array)=>{let binary="";const chunk=0x8000;for(let i=0;i<bytes.length;i+=chunk)binary+=String.fromCharCode(...bytes.subarray(i,i+chunk));return btoa(binary);};

/** Reads a JSON file from the latest version of the site. */
export async function readJson<T>(token:string,path:string):Promise<{data:T;sha:string}>{
 const file=await call<{content:string;sha:string}>(token,"/contents/"+REPO.appDir+"/"+path+"?ref="+REPO.branch+"&t="+Date.now());
 return {data:JSON.parse(decode(file.content)) as T,sha:file.sha};
}
export async function fileSha(token:string,path:string){
 try{return (await call<{sha:string}>(token,"/contents/"+REPO.appDir+"/"+path+"?ref="+REPO.branch+"&t="+Date.now())).sha;}catch(error){if(error instanceof GitHubError&&error.status===404)return null;throw error;}
}

export type CommitFile={path:string;text?:string;bytes?:Uint8Array};
/** Saves every change as one commit on the main branch. The site rebuilds itself after each commit. */
export async function commitFiles(token:string,message:string,files:CommitFile[],deletions:string[]=[]){
 const ref=await call<{object:{sha:string}}>(token,"/git/ref/heads/"+REPO.branch);
 const head=await call<{tree:{sha:string}}>(token,"/git/commits/"+ref.object.sha);
 const tree=[];
 for(const file of files){
  const bytes=file.bytes??new TextEncoder().encode(file.text??"");
  const blob=await call<{sha:string}>(token,"/git/blobs",{method:"POST",body:JSON.stringify({content:encode(bytes),encoding:"base64"})});
  tree.push({path:REPO.appDir+"/"+file.path,mode:"100644",type:"blob",sha:blob.sha});
 }
 for(const path of deletions)tree.push({path:REPO.appDir+"/"+path,mode:"100644",type:"blob",sha:null});
 const newTree=await call<{sha:string}>(token,"/git/trees",{method:"POST",body:JSON.stringify({base_tree:head.tree.sha,tree})});
 const commit=await call<{sha:string;html_url:string}>(token,"/git/commits",{method:"POST",body:JSON.stringify({message,tree:newTree.sha,parents:[ref.object.sha]})});
 await call(token,"/git/refs/heads/"+REPO.branch,{method:"PATCH",body:JSON.stringify({sha:commit.sha,force:false})});
 return commit;
}

export type DeployState={status:"queued"|"in_progress"|"completed"|"unknown";conclusion?:string|null;url?:string};
/** Progress of the site rebuild for a commit. Needs Actions: Read-only on the key; otherwise "unknown". */
export async function deployState(token:string,sha:string):Promise<DeployState>{
 try{
  const runs=await call<{workflow_runs:{status:string;conclusion:string|null;html_url:string}[]}>(token,"/actions/runs?head_sha="+sha+"&per_page=1");
  const run=runs.workflow_runs[0];
  if(!run)return {status:"queued"};
  return {status:(run.status==="completed"?"completed":run.status==="queued"||run.status==="waiting"||run.status==="pending"?"queued":"in_progress"),conclusion:run.conclusion,url:run.html_url};
 }catch{return {status:"unknown"};}
}
