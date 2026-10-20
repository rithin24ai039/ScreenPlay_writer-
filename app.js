import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const URL = window.SCREENPLAY_SUPABASE_URL || "";
const KEY = window.SCREENPLAY_SUPABASE_ANON_KEY || "";
const db = URL && KEY ? createClient(URL, KEY) : null;
const $ = id => document.getElementById(id);
const STORE = "screenplay-projects-v1";
const state = { projects: [], active: null, user: null, authMode: "signin", timer: null, undo: [] };
const examples = {
 blank: [],
 short: [{type:"transition",text:"FADE IN:"},{type:"scene",text:"INT. LOCATION — DAY"},{type:"action",text:"Describe what the audience sees and hears."},{type:"character",text:"CHARACTER NAME"},{type:"dialogue",text:"Write the dialogue here."},{type:"transition",text:"FADE OUT."}],
 feature: [{type:"transition",text:"FADE IN:"},{type:"scene",text:"EXT. OPENING LOCATION — DAY"},{type:"action",text:"Introduce the world, the mood, and the person whose life is about to change."},{type:"scene",text:"INT. SECOND LOCATION — DAY"},{type:"action",text:"The story begins to move. What does your protagonist want?"}]
};
const sample = [{type:"transition",text:"FADE IN:"},{type:"scene",text:"INT. SMALL COFFEE SHOP — MORNING"},{type:"action",text:"Morning light spills across an almost-empty café. Rain draws silver lines down the windows."},{type:"action",text:"MAYA, 28, sits with a notebook open in front of her. The page is blank. Her coffee has gone cold."},{type:"character",text:"MAYA"},{type:"dialogue",text:"Come on. It’s just a first line."},{type:"action",text:"She taps her pen against the table. A small smile appears."},{type:"character",text:"MAYA"},{type:"dialogue",text:"Once upon a time..."},{type:"transition",text:"CUT TO:"},{type:"scene",text:"EXT. CITY STREET — CONTINUOUS"},{type:"action",text:"The city wakes up around her. Somewhere, a story is already beginning."}];
const esc = s => String(s ?? "").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const id = () => crypto.randomUUID ? crypto.randomUUID() : Date.now()+"-"+Math.random().toString(36).slice(2);
const stamp = () => new Date().toISOString();
function toast(text,type=""){const n=document.createElement("div");n.className="toast "+type;n.textContent=text;$("toasts").append(n);setTimeout(()=>n.remove(),3500);}
// Screenplays are never stored in browser storage. Supabase is the only persistence layer.
function loadLocal(){return [];}
function saveLocal(){}
function current(){return state.projects.find(p=>p.id===state.active);}
function makeProject(title,template="blank",content){const d=stamp();return {id:id(),title:title.trim()||"Untitled screenplay",content:content||examples[template]||[],logline:"",genre:"",notes:"",createdAt:d,updatedAt:d};}
function normalise(p){return {id:p.id||id(),title:p.title||"Untitled screenplay",content:Array.isArray(p.content)?p.content:[],logline:p.logline||"",genre:p.genre||"",notes:p.notes||"",createdAt:p.createdAt||stamp(),updatedAt:p.updatedAt||stamp()};}
function blocks(){return [...$("script").children].map(n=>({type:n.dataset.type||"action",text:(n.innerText||"").replace(/\u00a0/g," ").trimEnd()})).filter(b=>b.text.trim());}
function htmlBlock(b){return '<div data-type="'+esc(b.type||"action")+'">'+esc(b.text||"")+"</div>";}
function renderBlocks(items){$("script").innerHTML=(items||[]).map(htmlBlock).join("");stats();}
function persist(){if(!state.user||!db){requireLogin();return;}clearTimeout(state.timer);state.timer=setTimeout(saveCloud,500);} 
function setSave(s){$("saveStatus").textContent=s;$("editorSave").textContent=s;}
function stats(){const bs=blocks(),text=bs.map(b=>b.text).join(" "),n=text.trim()?text.trim().split(/\s+/).length:0;$("wordCount").textContent=n+" "+(n===1?"word":"words");const pages=Math.max(1,Math.ceil(n/180));$("pageCount").textContent=pages+" "+(pages===1?"page":"pages");$("paperTitle").textContent=($("title").value||"Untitled screenplay").toUpperCase();}
function renderDashboard(){const grid=$("projects");grid.innerHTML="";$("count").textContent=state.projects.length;$("empty").classList.toggle("show",state.projects.length===0);[...state.projects].sort((a,b)=>new Date(b.updatedAt)-new Date(a.updatedAt)).forEach((p,i)=>{const card=document.createElement("article");card.className="project";card.tabIndex=0;const words=(p.content||[]).reduce((n,b)=>n+(b.text||"").split(/\s+/).filter(Boolean).length,0);card.innerHTML='<div class="cover c'+(i%3)+'"><small>SCREENPLAY / '+String(i+1).padStart(2,"0")+'</small></div><div class="project-info"><div class="project-name">'+esc(p.title)+'</div><div class="project-desc">'+esc(p.logline||p.genre||"A story in progress")+'</div><div class="project-foot">'+words+' words · '+new Date(p.updatedAt).toLocaleDateString()+' &nbsp; ···</div></div>';card.onclick=()=>openProject(p.id);card.onkeydown=e=>{if(e.key==="Enter")openProject(p.id);};grid.append(card);});}
function view(name){$("dashboard").classList.toggle("hidden",name!=="dashboard");$("editorView").classList.toggle("hidden",name!=="editor");$("guideView").classList.toggle("hidden",name!=="guide");$("crumb").textContent=name==="editor"?(current()?.title||"Screenplay"):name==="guide"?"Writing guide":"My screenplays";$("sidebar").classList.remove("open");}
function openProject(pid){if(!state.user){requireLogin();return;}const p=state.projects.find(p=>p.id===pid);if(!p)return;state.active=pid;state.undo=[];renderBlocks(p.content);$("title").value=p.title;$("logline").value=p.logline;$("genre").value=p.genre;$("notes").value=p.notes;renderScenes();renderCharacters();view("editor");setSave("Cloud save enabled");}
function createProject(title,template){if(!state.user){$("newDialog").close();requireLogin();return;}const p=makeProject(title,template);state.projects.unshift(p);renderDashboard();openProject(p.id);$("newDialog").close();persist();toast("Your new screenplay is ready.","success");}
function renderScenes(){const box=$("scenes");box.innerHTML="";const ss=blocks().filter(b=>b.type==="scene");if(!ss.length){box.innerHTML='<p class="scene-item">No scenes yet<br><small>Add a scene heading to begin</small></p>';return;}ss.forEach((s,i)=>{const b=document.createElement("button");b.className="scene-item";b.innerHTML="<b>"+esc(s.text)+"</b><small>SCENE "+String(i+1).padStart(2,"0")+"</small>";b.onclick=()=>{const target=[...$("script").children].find(n=>n.dataset.type==="scene"&&n.textContent===s.text);target?.scrollIntoView({behavior:"smooth",block:"center"});};box.append(b);});}
function renderCharacters(){const names=[...new Set(blocks().filter(b=>b.type==="character").map(b=>b.text.trim()).filter(Boolean))];$("characters").innerHTML=names.length?names.map(n=>'<div class="char">'+esc(n)+'</div>').join(""):"Character cues appear here as you write.";}
function scheduleSave(){const p=current();if(!p)return;if(!state.user||!db){setSave("Sign in required");requireLogin();return;}p.content=blocks();p.title=$("title").value.trim()||"Untitled screenplay";p.logline=$("logline").value;p.genre=$("genre").value;p.notes=$("notes").value;p.updatedAt=stamp();stats();renderScenes();renderCharacters();setSave("Saving to cloud…");clearTimeout(state.timer);state.timer=setTimeout(saveCloud,450);}
async function saveCloud(){const p=current();if(!p||!state.user||!db)return;try{const {error}=await db.from("screenplays").upsert({user_id:state.user.id,local_id:p.id,title:p.title,content:p.content,logline:p.logline,genre:p.genre,notes:p.notes,updated_at:stamp()},{onConflict:"user_id,local_id"});if(error)throw error;setSave("Synced to cloud");}catch(e){console.error(e);setSave("Saved locally");toast("Cloud sync failed; your local draft is safe.","error");}}
async function loadCloud(){if(!db||!state.user)return;try{const {data,error}=await db.from("screenplays").select("*").order("updated_at",{ascending:false});if(error)throw error;state.projects=(data||[]).map(row=>normalise({id:row.local_id,title:row.title,content:row.content,logline:row.logline,genre:row.genre,notes:row.notes,createdAt:row.created_at,updatedAt:row.updated_at}));if(state.active&&!state.projects.some(p=>p.id===state.active))state.active=null;renderDashboard();if(state.active)openProject(state.active);}catch(e){console.error(e);toast("Could not load your cloud screenplays. Check your connection and try again.","error");}}
function addBlock(type,text=""){state.undo.push($("script").innerHTML);$("script").insertAdjacentHTML("beforeend",htmlBlock({type,text}));const node=$("script").lastElementChild;node?.focus();const r=document.createRange();r.selectNodeContents(node);r.collapse(false);const s=window.getSelection();s.removeAllRanges();s.addRange(r);scheduleSave();}
function selectedBlock(){let n=window.getSelection()?.anchorNode;n=n?.nodeType===3?n.parentElement:n;while(n&&n.parentElement!==$("script"))n=n.parentElement;return n&&n!==$("script")?n:null;}
function formatElement(type){let n=selectedBlock();if(!n){addBlock(type);return;}state.undo.push($("script").innerHTML);n.dataset.type=type;$("element").value=type;scheduleSave();}
function download(content,name,type){const blob=new Blob([content],{type});const url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download=name.replace(/[\\/:*?"<>|]/g,"-");document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);}
function exportFountain(){const p=current();if(!p)return;let out=p.title.toUpperCase()+"\n"+"=".repeat(Math.min(50,p.title.length))+"\n\n";if(p.logline)out+="# "+p.logline+"\n\n";for(const b of p.content){if(b.type==="scene")out+="\n"+b.text.toUpperCase()+"\n\n";else if(b.type==="character")out+="\n"+b.text.toUpperCase()+"\n";else if(b.type==="dialogue")out+=b.text+"\n";else if(b.type==="parenthetical")out+="("+b.text.replace(/^\(|\)$/g,"")+")\n";else if(b.type==="transition")out+="\n> "+b.text.toUpperCase()+"\n\n";else out+=b.text+"\n";}download(out,p.title+".fountain","text/plain;charset=utf-8");toast("Fountain file exported.","success");}
function exportPdf(){const p=current();if(!p)return;const w=window.open("","_blank");if(!w){toast("Allow pop-ups to print or save as PDF.","error");return;}const body=p.content.map(b=>'<div class="'+esc(b.type)+'">'+esc(b.text)+"</div>").join("");w.document.write('<!doctype html><html><head><title>'+esc(p.title)+'</title><style>@page{size:letter;margin:1in}body{font:12pt/1.5 "Courier New",monospace;color:#111}.titlepage{height:8in;display:flex;flex-direction:column;justify-content:center;text-align:center;page-break-after:always}.titlepage h1{font-size:18pt;font-weight:normal}.scene{font-weight:bold;text-transform:uppercase;margin:1em 0 .8em;break-after:avoid}.action{margin:.6em 0}.character{font-weight:bold;text-transform:uppercase;margin:1em 0 0 37%;break-after:avoid}.dialogue{margin:0 14% .6em 17%}.parenthetical{margin:0 22% 0 27%}.transition{text-align:right;text-transform:uppercase;font-weight:bold;margin:1em 0}</style></head><body><div class="titlepage"><h1>'+esc(p.title)+'</h1><p>Written by</p><p>'+esc(state.user?.email||"Screenplay Writer")+'</p></div>'+body+'<script>window.onload=()=>setTimeout(()=>window.print(),250)<\/script></body></html>');w.document.close();toast("Choose “Save as PDF” in the print dialog.","success");}
function sampleScript(){if(!state.user){requireLogin();return;}const p=makeProject("The First Line","blank",sample);p.logline="A blocked writer discovers that every beginning is a choice.";p.genre="Drama";state.projects.unshift(p);renderDashboard();openProject(p.id);persist();toast("Sample added. Make it your own!","success");}
function requireLogin(){if(state.user&&db)return false;$("authHeading").textContent="Sign in to save your screenplays.";if(!$("authDialog").open)$("authDialog").showModal();return true;}
function account(){if(state.user&&db){if(confirm("Sign out? Your screenplays remain in your Supabase account, but this session will close."))db.auth.signOut().then(({error})=>{if(error){toast("Could not sign out. Please try again.","error");return;}state.user=null;state.projects=[];state.active=null;renderDashboard();view("dashboard");accountUI();requireLogin();toast("Signed out.");});}else if(!db)toast("Authentication is unavailable because Supabase is not configured.","error");else requireLogin();}
function accountUI(){$("accountName").textContent=state.user?.email||"Sign in required";$("accountStatus").textContent=state.user?"Private cloud storage enabled":"Sign in to create and save screenplays";$("avatar").textContent=(state.user?.email?.[0]||"↗").toUpperCase();$("saveStatus").textContent=state.user?"Cloud account connected":"Sign in required";}
async function authSubmit(e){
  e.preventDefault();
  const submit = $("authSubmit");
  const errorBox = $("authError");
  errorBox.textContent = "";
  if (!db) {
    errorBox.textContent = "Sign-in is unavailable because Supabase is not configured. Please try again later.";
    return;
  }
  const email = $("email").value.trim();
  const password = $("password").value;
  submit.disabled = true;
  submit.textContent = state.authMode === "signup" ? "Creating account…" : "Signing in…";
  try {
    const result = state.authMode === "signup"
      ? await db.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin } })
      : await db.auth.signInWithPassword({ email, password });
    if (result.error) {
      console.error("Supabase authentication error:", result.error);
      const message = result.error.message || "Authentication failed.";
      if (/invalid login credentials/i.test(message)) {
        errorBox.textContent = "Email or password is incorrect. If you just signed up, confirm your email first.";
      } else if (/email not confirmed/i.test(message)) {
        errorBox.textContent = "Please open the confirmation link sent to your email, then sign in.";
      } else if (/already registered|user already exists/i.test(message)) {
        errorBox.textContent = "An account with this email already exists. Switch to Sign in.";
      } else if (/password should be at least|weak password/i.test(message)) {
        errorBox.textContent = "Choose a stronger password that meets the password requirements.";
      } else {
        errorBox.textContent = message;
      }
      return;
    }
    if (state.authMode === "signup" && !result.data.session) {
      errorBox.textContent = "Account created. Check your email for the confirmation link, then return here and sign in. Check spam if it doesn't arrive.";
      return;
    }
    if (!result.data.user) {
      errorBox.textContent = "Authentication did not return a user. Please try again.";
      return;
    }
    state.user = result.data.user;
    $("authDialog").close();
    accountUI();
    await loadCloud();
    toast("You're signed in.", "success");
  } catch (err) {
    console.error("Unexpected authentication error:", err);
    errorBox.textContent = err?.message
      ? "Could not reach the authentication service: " + err.message
      : "Could not reach the authentication service. Check your connection and try again.";
  } finally {
    submit.disabled = false;
    submit.textContent = state.authMode === "signup" ? "Create free account" : "Sign in";
  }
}
function bind(){const showNew=()=>{$("newTitle").value="";$("newDialog").showModal();$("newTitle").focus();};$("newBtn").onclick=$("emptyNew").onclick=showNew;$("newForm").onsubmit=e=>{e.preventDefault();createProject($("newTitle").value,$("template").value);};$("sampleBtn").onclick=sampleScript;$("backBtn").onclick=()=>{view("dashboard");renderDashboard();};$("homeBtn").onclick=()=>{view("dashboard");renderDashboard();};$("guideBtn").onclick=()=>view("guide");$("guideBack").onclick=()=>view("dashboard");$("guideNew").onclick=showNew;$("menuBtn").onclick=()=>$("sidebar").classList.toggle("open");$("themeBtn").onclick=()=>{document.body.classList.toggle("light");localStorage.setItem("screenplay-theme",document.body.classList.contains("light")?"light":"dark");};$("accountBtn").onclick=account;$("authForm").onsubmit=authSubmit;$("authToggle").onclick=()=>{state.authMode=state.authMode==="signin"?"signup":"signin";$("authHeading").textContent=state.authMode==="signup"?"Create your free writer account.":"Save your stories anywhere.";$("authSubmit").textContent=state.authMode==="signup"?"Create free account":"Sign in";$("authToggle").textContent=state.authMode==="signup"?"Already have an account? Sign in":"New here? Create a free account";$("authError").textContent="";};document.querySelectorAll("[data-close]").forEach(b=>b.onclick=()=>$(b.dataset.close).close());$("title").oninput=()=>{const p=current();if(!p)return;p.title=$("title").value||"Untitled screenplay";$("crumb").textContent=p.title;stats();scheduleSave();renderDashboard();};["logline","genre","notes"].forEach(k=>$(k).oninput=scheduleSave);$("script").oninput=scheduleSave;$("script").onkeydown=e=>{if(e.key==="Tab"){e.preventDefault();const a=["action","scene","character","dialogue","parenthetical","transition"],next=a[(a.indexOf($("element").value)+1)%a.length];$("element").value=next;formatElement(next);}if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==="s"){e.preventDefault();scheduleSave();toast("Draft saved.","success");}if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==="b"){e.preventDefault();document.execCommand("bold");}if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==="i"){e.preventDefault();document.execCommand("italic");}};$("element").onchange=()=>formatElement($("element").value);$("addScene").onclick=()=>addBlock("scene","INT. NEW LOCATION — DAY");$("fountainBtn").onclick=exportFountain;$("pdfBtn").onclick=exportPdf;$("helpBtn").onclick=()=>toast("Choose an element from the toolbar. Press Tab to cycle through screenplay elements.");$("focusBtn").onclick=()=>{document.body.classList.toggle("focus");$("focusBtn").classList.toggle("active");};$("boldBtn").onclick=()=>document.execCommand("bold");$("italicBtn").onclick=()=>document.execCommand("italic");$("undoBtn").onclick=()=>{if(!state.undo.length)return;$("script").innerHTML=state.undo.pop();scheduleSave();};document.querySelectorAll(".tab").forEach(b=>b.onclick=()=>{document.querySelectorAll(".tab").forEach(t=>t.classList.toggle("active",t===b));$("detailsPanel").classList.toggle("hidden",b.dataset.tab!=="detailsPanel");$("charactersPanel").classList.toggle("hidden",b.dataset.tab!=="charactersPanel");});}
async function init(){localStorage.removeItem(STORE);localStorage.removeItem("screenplay-active-v1");state.projects=[];state.active=null;bind();renderDashboard();if(localStorage.getItem("screenplay-theme")==="light")document.body.classList.add("light");if(db){const {data:{session}}=await db.auth.getSession();state.user=session?.user||null;accountUI();if(state.user)await loadCloud();db.auth.onAuthStateChange((_event,session)=>{state.user=session?.user||null;accountUI();if(state.user)loadCloud();else{state.projects=[];state.active=null;renderDashboard();view("dashboard");}});}else accountUI();if(!state.user)requireLogin();}
init();