const COURSES = [
{id:'18.01',title:'Calculus I',units:12,req:'GIR',pre:[],offer:['Fall','Spring']},
{id:'18.02',title:'Calculus II',units:12,req:'GIR',pre:['18.01'],offer:['Fall','Spring']},
{id:'18.03',title:'Differential Equations',units:12,req:'GIR',pre:['18.02'],offer:['Fall','Spring']},
{id:'8.01',title:'Physics I',units:12,req:'GIR',pre:[],offer:['Fall','Spring']},
{id:'8.02',title:'Physics II',units:12,req:'GIR',pre:['8.01'],offer:['Fall','Spring']},
{id:'7.01x',title:'Intro Biology',units:12,req:'GIR',pre:[],offer:['Fall','Spring']},
{id:'5.12',title:'Organic Chemistry',units:12,req:'BE Core',pre:[],offer:['Fall','Spring']},
{id:'5.07',title:'General Biochemistry',units:12,req:'BE Core',pre:['5.12'],offer:['Fall']},
{id:'7.03',title:'Genetics',units:12,req:'BE Core',pre:['7.01x'],offer:['Fall','Spring']},
{id:'7.05',title:'General Biochemistry',units:12,req:'BE Core',pre:['5.12'],offer:['Fall','Spring']},
{id:'7.06',title:'Cell Biology',units:12,req:'BE Core',pre:['7.03'],offer:['Fall','Spring']},
{id:'20.110',title:'Thermodynamics of Biological Systems',units:12,req:'BE Core',pre:['18.03'],offer:['Fall']},
{id:'20.109',title:'Laboratory Fundamentals in Biological Engineering',units:12,req:'BE Core',pre:['5.12'],offer:['Fall','Spring']},
{id:'20.129',title:'Biomolecular Engineering Laboratory',units:12,req:'BE Core',pre:['5.12'],offer:['Fall','Spring']},
{id:'20.309',title:'Instrumentation and Measurement for Biological Systems',units:12,req:'BE Core',pre:['18.03'],offer:['Spring']},
{id:'20.320',title:'Analysis of Biological Systems',units:12,req:'BE Core',pre:['20.110'],offer:['Fall']},
{id:'20.330',title:'Fields, Forces & Flows in Biological Systems',units:12,req:'BE Core',pre:['20.320'],offer:['Spring']},
{id:'20.380',title:'Biological Engineering Design',units:12,req:'BE Core',pre:['7.06','20.330'],offer:['Fall','Spring']},
{id:'6.100A',title:'Introduction to Computer Science Programming in Python',units:6,req:'Computational',pre:[],offer:['Fall','Spring']},
{id:'6.100B',title:'Introduction to Computational Thinking and Data Science',units:6,req:'Computational',pre:['6.100A'],offer:['Fall','Spring']},
{id:'HASS',title:'HASS Elective',units:12,req:'HASS',pre:[],offer:['Fall','Spring']},
{id:'UE',title:'Unrestricted Elective',units:12,req:'Unrestricted',pre:[],offer:['Fall','Spring']},
{id:'RE',title:'Restricted Elective',units:12,req:'Restricted Elective',pre:[],offer:['Fall','Spring']}
];

const SEMESTERS=['Fall 2026','Spring 2027','Fall 2027','Spring 2028','Fall 2028','Spring 2029','Fall 2029','Spring 2030'];
const initialPlan={}; SEMESTERS.forEach(s=>initialPlan[s]=[]);
let state=JSON.parse(localStorage.getItem('mitBEPlanner')||'null')||{plan:initialPlan,completed:[],transferred:[]};

function save(){localStorage.setItem('mitBEPlanner',JSON.stringify(state));}
function course(id){return COURSES.find(c=>c.id===id)}
function completedSet(){return new Set([...state.completed,...state.transferred])}
function prereqsMet(c){return c.pre.every(p=>completedSet().has(p))}
function isTaken(id){return Object.values(state.plan).flat().includes(id)||state.completed.includes(id)||state.transferred.includes(id)}
function semesterType(s){return s.startsWith('Fall')?'Fall':'Spring'}

function render(){renderStats();renderPlan();renderAvailable();renderReq();}
function renderStats(){
 const all=COURSES.filter(c=>!['HASS','UE','RE'].includes(c.id));
 const done=state.completed.length+state.transferred.length;
 const pct=Math.min(100,Math.round(done/Math.max(1,all.length)*100));
 document.getElementById('overallPct').textContent=pct+'%';
 const counts={}; COURSES.forEach(c=>counts[c.req]=(counts[c.req]||0)+(state.completed.includes(c.id)||state.transferred.includes(c.id)?c.units:0));
 document.getElementById('stats').innerHTML=`<div class="stat"><b>${done}</b><span>courses satisfied</span></div><div class="stat"><b>${counts['BE Core']||0}</b><span>BE Core units</span></div><div class="stat"><b>${counts.HASS||0}</b><span>HASS units</span></div><div class="stat"><b>${counts['Restricted Elective']||0}</b><span>restricted elective units</span></div>`;
}
function renderPlan(){
 const years={2026:[SEMESTERS[0],SEMESTERS[1]],2027:[SEMESTERS[2],SEMESTERS[3]],2028:[SEMESTERS[4],SEMESTERS[5]],2029:[SEMESTERS[6],SEMESTERS[7]]};
 document.getElementById('years').innerHTML=Object.entries(years).map(([y,ss])=>`<div class="year"><div class="year-title">${y}</div><div class="semester-grid">${ss.map(renderSemester).join('')}</div></div>`).join('');
 document.querySelectorAll('[data-add]').forEach(b=>b.onclick=()=>openPicker(b.dataset.add));
 document.querySelectorAll('[data-course]').forEach(b=>b.onclick=()=>openCourse(b.dataset.course));
}
function renderSemester(s){const items=state.plan[s]||[];return `<div class="semester"><h3>${s}</h3><div class="semester-courses">${items.map(id=>{let c=course(id);return `<div class="course-chip" data-course="${id}"><div class="chip-left"><span class="check">✓</span><b>${id}</b><span>${c?.title||''}</span></div><span>${c?.units||''}</span></div>`}).join('')}<button class="add-course" data-add="${s}">＋ Add course</button></div></div>`}
function availableFor(s){return COURSES.filter(c=>!isTaken(c.id)&&prereqsMet(c)&&c.offer.includes(semesterType(s)))}
function openPicker(s){
 const list=availableFor(s);document.getElementById('modalContent').innerHTML=`<h2>Add to ${s}</h2><p>${list.length?'Choose a course that is currently unlocked.':'No courses are currently unlocked for this semester.'}</p><div class="semester-courses">${list.map(c=>`<button class="course-chip" data-pick="${c.id}" style="text-align:left"><div><b>${c.id}</b> — ${c.title}</div><span>${c.units}u</span></button>`).join('')}</div>`;
 document.querySelectorAll('[data-pick]').forEach(b=>b.onclick=()=>{state.plan[s].push(b.dataset.pick);save();closeModal();render()});document.getElementById('modal').classList.remove('hidden');
}
function openCourse(id){const c=course(id);document.getElementById('modalContent').innerHTML=`<h2>${c.id}</h2><p><b>${c.title}</b></p><p>${c.units} units · ${c.req}</p><p>${c.pre.length?'Prerequisites: '+c.pre.join(', '):'No prerequisites in this planner.'}</p><p>${prereqsMet(c)?'✓ Prerequisites satisfied':'🔒 Prerequisites not yet satisfied'}</p><button class="primary" id="markDone">Mark completed</button><button class="ghost" id="removeCourse" style="margin-left:8px">Remove from plan</button>`;document.getElementById('modal').classList.remove('hidden');document.getElementById('markDone').onclick=()=>{state.completed=[...new Set([...state.completed,id])];Object.keys(state.plan).forEach(s=>state.plan[s]=state.plan[s].filter(x=>x!==id));save();closeModal();render()};document.getElementById('removeCourse').onclick=()=>{Object.keys(state.plan).forEach(s=>state.plan[s]=state.plan[s].filter(x=>x!==id));save();closeModal();render()}}
function renderAvailable(){const q=(document.getElementById('courseSearch').value||'').toLowerCase();const list=COURSES.filter(c=>!isTaken(c.id)&&prereqsMet(c)&&(!q||`${c.id} ${c.title} ${c.req}`.toLowerCase().includes(q)));document.getElementById('availableGrid').innerHTML=list.map(c=>`<div class="course-card available"><span class="pill">${c.req}</span><h3>${c.id}</h3><div class="meta">${c.title} · ${c.units} units</div><div class="meta">Offered: ${c.offer.join(', ')}</div><button data-course="${c.id}">View / add</button></div>`).join('')||'<p>No currently unlocked courses match your search.</p>';document.querySelectorAll('#availableGrid [data-course]').forEach(b=>b.onclick=()=>openCourse(b.dataset.course))}
function renderReq(){const reqs=[['BE Core',144],['HASS',96],['Restricted Elective',36],['Unrestricted',48],['Concentration',60]];document.getElementById('reqGrid').innerHTML=reqs.map(([name,total])=>{let done=COURSES.filter(c=>c.req===name&&(state.completed.includes(c.id)||state.transferred.includes(c.id))).reduce((a,c)=>a+c.units,0);let p=Math.min(100,Math.round(done/total*100));return `<div class="req-card"><h3>${name}</h3><div class="req-line"><span>${done} / ${total} units</span><b>${p}%</b></div><div class="bar"><i style="width:${p}%"></i></div></div>`}).join('')}
function closeModal(){document.getElementById('modal').classList.add('hidden')}
document.getElementById('closeModal').onclick=closeModal;document.getElementById('modal').onclick=e=>{if(e.target.id==='modal')closeModal()};
document.querySelectorAll('.tab').forEach(t=>t.onclick=()=>{document.querySelectorAll('.tab').forEach(x=>x.classList.remove('active'));document.querySelectorAll('.tab-panel').forEach(x=>x.classList.remove('active'));t.classList.add('active');document.getElementById(t.dataset.tab).classList.add('active')});
document.getElementById('courseSearch').oninput=renderAvailable;
document.getElementById('resetBtn').onclick=()=>{if(confirm('Reset your planner?')){state={plan:initialPlan,completed:[],transferred:[]};save();render()}};
document.getElementById('exportBtn').onclick=()=>{const blob=new Blob([JSON.stringify(state,null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='mit-be-plan.json';a.click();};
render();