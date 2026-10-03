const fs=require('fs'),assert=require('assert');
const form=fs.readFileSync('assets/form-management.js','utf8');
const css=fs.readFileSync('assets/portal.css','utf8');
for(const tag of form.match(/<button\b[^>]*>/g)||[])assert(/\bclass=/.test(tag),`Every form-management button must use an explicit theme class: ${tag}`);
for(const needle of [
  '#r43Monitoring .ge-btn',
  '#r43Monitoring .ge-assess-tabs button',
  '#r43Monitoring .ge-btn.primary',
  '#r43Monitoring .ge-btn.danger',
  '#r43Monitoring .ge-form-palette button.ge-form-tool-btn',
  '#r43Monitoring .ge-form-preview',
  '#r43Monitoring .ge-form-preview .ge-form-question'
])assert(css.includes(needle),`Missing Assessment/Checklist theme rule: ${needle}`);
assert(form.includes('class="ge-btn compact" data-view='),'Submission history View action must use canonical button theme');
assert(form.includes('class="ge-btn compact" data-start='),'Monitoring Work completion action must use canonical button theme');
assert(form.includes('class="ge-btn compact danger" data-remove-field='),'Checklist remove action must use canonical danger theme');
console.log('R84_ASSESSMENT_BUTTON_THEME_CONTRACT_PASS');
