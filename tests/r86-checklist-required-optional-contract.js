const fs=require('fs'),assert=require('assert');
const js=fs.readFileSync('assets/form-management.js','utf8');
assert(js.includes('data-field-check="required"'),'Checklist builder must expose a required/optional control');
assert(js.includes('Required to complete checklist'),'Required control must clearly describe submission behavior');
assert(js.includes("This question may be left blank during checklist completion."),'Optional questions must be explicitly identified');
assert(js.includes("if(f.required&&(value===''||value==null||Array.isArray(value)&&!value.length))"),'Submission must enforce required questions');
assert(js.includes('if(!visible(f,values)){delete values[f.id];continue}'),'Hidden conditional questions must not be treated as required');
console.log('R86_CHECKLIST_REQUIRED_OPTIONAL_CONTRACT_PASS');
