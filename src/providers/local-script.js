import {formats,realization} from '../domain/script-production.js';
import {captureScriptResponse,parseScriptResponse} from './script-response.js';
export class LocalScriptProvider {
 constructor(make){this.make=make;this.calls=0}
 describe(){return {provider:'local-deterministic',model:'script-fixture/1',synthetic:true}}
 async execute(input,context){this.calls++;
  const output=this.make?this.make(input):{scripts:formats(input).map((format,n)=>({format,segments:[{segment_id:'hook-'+n,role:'HOOK',claim_id:null,usage_type:'NONE',text:input.production_policy.neutral_phrases[0],visual_type:'MOTION_GRAPHICS',visual_classification:'ILLUSTRATIVE'},{segment_id:'body-'+n,role:'BODY',claim_id:input.approved_claims[0].claim_id,usage_type:input.scope.mandatory_qualifiers[input.approved_claims[0].claim_id]?'QUALIFIED':'DIRECT',text:realization(input,input.approved_claims[0].claim_id),visual_type:'CONTROLLED_DIAGRAM',visual_classification:'SCIENTIFIC_VISUALIZATION'},{segment_id:'end-'+n,role:'ENDING',claim_id:null,usage_type:'NONE',text:input.production_policy.neutral_phrases[1],visual_type:'MOTION_GRAPHICS',visual_classification:'ILLUSTRATIVE'}]}))};
  const data={id:'synthetic-response',model:'script-fixture/1',status:'completed',output:[{type:'message',role:'assistant',content:[{type:'output_text',text:JSON.stringify(output)}]}]};
  const a=captureScriptResponse(data,{request_id:'synthetic',run_id:context.run_id,request_hash:context.input_hash,config:this.describe()});await context.persistResponse(a);
  return {output:parseScriptResponse(a),metadata:{synthetic:true,provider_request_id:'synthetic',external_calls:0,usage:null,cost:null}};
 }
}
