// These adapters never perform I/O. Reserved .invalid URLs and synthetic markers
// prevent fixtures being confused with discovered real-world evidence.
export class LocalResearchProvider {
 constructor(mode='success'){this.mode=mode;this.calls=0}
 describe(){return {provider:'local-test',model:'research-fixture',adapter_version:'1.0',configuration:{mode:this.mode}}}
 async execute(request,{attempt,run_id}){
  this.calls++;
  if(this.mode==='provider_failure'||(this.mode==='retry'&&attempt===1))throw Error('PROVIDER_FAILURE');
  if(this.mode==='parsing_failure')return {output:{broken:true},metadata:{synthetic:true}};
  const review=this.mode==='uncertain',reject=this.mode==='contradiction';
  return {metadata:{synthetic:true,provider_request_id:'local:'+run_id,usage:{input_tokens:0,output_tokens:0},cost:{actual:0,currency:'USD'}},output:{summary:'SYNTHETIC TEST DATA — '+request.input.topic,research_status:reject?'REJECTED':review?'REVIEW_REQUIRED':'COMPLETE',fact_status:reject?'disputed':'verified',publish_recommendation:reject?'reject':review?'hold':'proceed_with_caution',main_source:'SRC-001',additional_sources:['SRC-002'],claims:[{claim_id:'CLAIM-001',statement:'Synthetic fixture reports a test observation.',claim_type:'observation',importance:'central',verification_status:reject?'disputed':'verified',needs_qualification:true,qualifier:'Only a local test fixture, not a real-world finding.'}],sources:['SRC-001','SRC-002'].map((source_id,i)=>({source_id,url:'https://fixture.invalid/source/'+i,title:'Synthetic source '+i,publisher:'Test fixture',source_type:i?'independent_confirmation':'primary',source_strength:90,retrieved_at:'2026-01-01T00:00:00.000Z',published_at:null,rights_status:'synthetic-not-for-publication'})),evidence:[{claim_id:'CLAIM-001',source_id:'SRC-001',support_type:reject?'contradicts':'supports',evidence_reference:'Synthetic excerpt: test observation only.',confidence:0.9},{claim_id:'CLAIM-001',source_id:'SRC-002',support_type:'supports',evidence_reference:'Synthetic independent fixture excerpt.',confidence:0.8}],uncertainties:['Synthetic findings do not establish real-world facts.'],contradictions:reject?['Synthetic contradictory observation.']:[],open_questions:review?['Synthetic question requiring review.']:[],overclaim_risks:['Do not publish synthetic claims.']}};
 }
}
export class LocalFactGuardProvider {
 constructor(mode='PASS'){this.mode=mode;this.calls=0}
 describe(){return {provider:'local-test',model:'fact-guard-fixture',adapter_version:'1.0',configuration:{mode:this.mode}}}
 async execute(request,{attempt,run_id}){
  this.calls++;
  if(this.mode==='provider_failure'||(this.mode==='retry'&&attempt===1))throw Error('PROVIDER_FAILURE');
  if(this.mode==='parsing_failure')return {output:{broken:true},metadata:{synthetic:true}};
  const decision=this.mode==='retry'?'PASS':this.mode,ids=request.input.research.claims.map(c=>c.claim_id);
  return {metadata:{synthetic:true,provider_request_id:'local:'+run_id,usage:{input_tokens:0,output_tokens:0},cost:{actual:0,currency:'USD'}},output:{decision,required_corrections:decision==='PASS'?[]:['Resolve the synthetic factual blocker.'],script_guardrails:['Never publish synthetic fixture results.','Preserve qualifications.'],approved_claims:decision==='PASS'?ids:[],blocked_claims:decision==='PASS'?[]:ids,warnings:['SYNTHETIC TEST DATA — no independent web verification.'],reasoning_summary:'Deterministic local contract test; no factual real-world judgment.',approved_hook:'Synthetic fixture only'}};
 }
}
