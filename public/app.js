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
