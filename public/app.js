const $=s=>document.querySelector(s);
async function api(path,options){const r=await fetch(path,options);const x=await r.json();if(!r.ok)throw Error(x.error);return x}
function table(target,rows,fields){
 const root=$(target);root.replaceChildren();
 if(!rows.length){root.textContent='Keine Einträge vorhanden.';return}
 const table=document.createElement('table'),head=document.createElement('tr');
 for(const [label] of fields){const th=document.createElement('th');th.textContent=label;head.append(th)}table.append(head);
 for(const row of rows){const tr=document.createElement('tr');for(const [,key] of fields){const td=document.createElement('td');td.textContent=row[key]??'—';tr.append(td)}table.append(tr)}
 root.append(table);
}
async function detail(id){
 const d=await api('/api/jobs/'+id);$('#detail').hidden=false;
 $('#meta').textContent=Object.entries(d.job).map(([k,v])=>k+': '+(v??'—')).join('\n');
 table('#history',d.stateHistory.map(t=>({...t,actor:t.actor_id||t.actor_type,timestamp:t.occurred_at||t.timestamp})),[['From','from_state'],['To','to_state'],['Actor','actor'],['Reason','reason'],['Run','run_id'],['Timestamp','timestamp']]);
 table('#evidence',d.evidence,[['Type','evidence_type'],['Source','source'],['Reference','reference'],['Created At','created_at']]);
 table('#artifacts',d.artifacts,[['Logical Name','logical_name'],['Artifact ID','artifact_id'],['Version','version'],['Content Hash','content_hash'],['Storage Reference','storage_reference'],['Created At','created_at']]);
 renderScripts(d);renderAssets(d.assetProduction);
 renderRuns('#research',d.research??[]);renderRuns('#fact-guard',d.factGuard??[]);
 $('#quality').textContent=Object.entries(d.quality).map(([k,v])=>k+': '+(v??'Nicht ausgeführt')).join(' · ');
 $('#publish').textContent=Object.entries(d.publish).map(([k,v])=>k+': '+(v??'Nicht vorhanden')).join(' · ');
}
async function load(){
 const b=await api('/api/businesses');$('#businesses').textContent=b.map(x=>x.name).join(', ');
 const jobs=await api('/api/jobs');$('#jobs').replaceChildren();
 for(const j of jobs){const li=document.createElement('li'),button=document.createElement('button');button.textContent=(j.working_title||j.id)+' · '+j.format+' · '+j.current_state;button.onclick=()=>detail(j.id).catch(showError);li.append(button);$('#jobs').append(li)}
}
function showError(e){$('#error').textContent=e.message}
$('#form').onsubmit=async e=>{e.preventDefault();try{const d=Object.fromEntries(new FormData(e.target));d.idempotency_key=crypto.randomUUID();const j=await api('/api/jobs',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(d)});await load();await detail(j.id)}catch(e){showError(e)}};
load().catch(showError);

function renderRuns(target,runs){
 const root=$(target);root.replaceChildren();
 if(!runs.length){root.textContent='Nicht ausgeführt';return}
 for(const run of runs){
  const section=document.createElement('section'),title=document.createElement('h4'),pre=document.createElement('pre');
  title.textContent=run.status+' · '+(run.metadata?.synthetic===true?'SYNTHETISCHE TESTDATEN – kein echter Research-/Fact-Guard-Nachweis':run.metadata?.synthetic===false?'Provider-Ergebnis':'Keine erfolgreiche Provider-Evidenz');
  pre.textContent=JSON.stringify({run_id:run.run_id,attempt:run.attempt,provider:run.provider,model:run.model,prompt_version:run.prompt_version,policy_version:run.policy_version,started_at:run.started_at,completed_at:run.completed_at,status:run.status,error_category:run.error_category,canonical_input_hash:run.canonical_input_hash,output_hash:run.output_hash,result:run.output},null,2);
  section.append(title,pre);root.append(section);
 }
}

function renderScripts(d){
 const scripts=$('#scripts'),packages=$('#production-packages');scripts.replaceChildren();packages.replaceChildren();
 if(!d.scripts?.length)scripts.textContent=d.scriptExecutions?.length?'Script review required: '+JSON.stringify(d.scriptExecutions.at(-1).validation):'Nicht ausgeführt';
 for(const s of d.scripts??[]){const section=document.createElement('section'),title=document.createElement('h4'),text=document.createElement('pre'),detail=document.createElement('details'),summary=document.createElement('summary'),data=document.createElement('pre');title.textContent=s.format+' · Version '+s.script_version+' · '+s.status;text.textContent=s.voiceover_text;summary.textContent='Claim traceability, validation and provider';data.textContent=JSON.stringify({script_id:s.script_id,hook:s.hook,estimated_duration:s.estimated_duration,claim_usage:s.claim_usage,validation:s.validation,provider:s.provider,model:s.model,prompt_version:s.prompt_version,publication_hold:s.publication_hold},null,2);detail.append(summary,data);section.append(title,text,detail);scripts.append(section)}
 if(!d.productionPackages?.length)packages.textContent='Nicht erstellt';
 for(const p of d.productionPackages??[]){const section=document.createElement('section'),title=document.createElement('h4'),data=document.createElement('pre');title.textContent=p.format+' · Package '+p.package_version+' · '+p.status;data.textContent=JSON.stringify({production_package_id:p.production_package_id,timeline:p.timeline_segments,audio_plan:p.audio_plan,rights_requirements:p.rights_requirements,safe_areas:p.safe_areas,publication_hold:p.publication_hold,release_allowed:p.release_allowed},null,2);section.append(title,data);packages.append(section)}
}

function renderAssets(a){const root=$('#assets');root.replaceChildren();if(!a?.plans?.length){root.textContent='Noch keine Asset-Produktion';return}const plan=a.plans.at(-1),manifest=a.manifests.at(-1),voice=a.artifacts.filter(x=>x.type==='VOICE');for(const [title,data] of [['VOICE',voice.map(v=>({provider:v.provenance.provider,profile:v.provenance.profile,duration:v.qa.duration,qa:v.qa.status,status:v.status}))],['VISUAL ASSETS',plan.requirements.map(r=>{const asset=a.artifacts.find(a=>a.beat_ids?.includes(r.visual_beat_id));return {beat:r.visual_beat_id,route:r.resolution_type,asset:asset?.asset_id??null,provider:asset?.provenance.provider??null,classification:r.classification,rights:asset?.rights.status??'UNKNOWN',disclosure:r.disclosure,status:asset?.status??'UNRESOLVED'}})],['MANIFEST',manifest??{status:'NOT_CREATED'}],['BLOCKERS',a.outcomes.filter(x=>x.status!=='SUCCEEDED')]]){const h=document.createElement('h4'),pre=document.createElement('pre');h.textContent=title;pre.textContent=JSON.stringify(data,null,2);root.append(h,pre)}}
