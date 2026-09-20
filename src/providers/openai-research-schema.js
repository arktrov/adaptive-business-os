// API schema mirrors (but does not replace) the existing canonical domain validator.
const string={type:'string'},strings={type:'array',items:string};
const object=properties=>({type:'object',properties,required:Object.keys(properties),additionalProperties:false});
export const researchOutputSchema=object({
 summary:string,research_status:{type:'string',enum:['COMPLETE','REVIEW_REQUIRED','REJECTED']},
 fact_status:{type:'string',enum:['verified','mostly_verified','partially_verified','disputed','unverified','false','outdated']},
 publish_recommendation:{type:'string',enum:['proceed','proceed_with_caution','rewrite_and_recheck','hold','reject']},
 main_source:{type:['string','null']},additional_sources:strings,
 claims:{type:'array',items:object({claim_id:string,statement:string,claim_type:string,importance:string,verification_status:string,needs_qualification:{type:'boolean'},qualifier:string})},
 sources:{type:'array',items:object({source_id:string,url:string,title:string,publisher:string,source_type:string,source_strength:{type:'number',minimum:0,maximum:100},retrieved_at:string,published_at:{type:['string','null']},rights_status:string})},
 evidence:{type:'array',items:object({claim_id:string,source_id:string,support_type:{type:'string',enum:['supports','contradicts','context']},evidence_reference:string,confidence:{type:'number',minimum:0,maximum:1}})},
 uncertainties:strings,contradictions:strings,open_questions:strings,overclaim_risks:strings
});
