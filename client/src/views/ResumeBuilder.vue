<template>
  <div class="rb-root">
    <div class="rb-toolbar">
      <h1><i class="bi bi-file-earmark-person"></i> 简历工具</h1>
      <div class="rb-template-switch">
        <button v-for="t in templates" :key="t.key" :class="['rb-tpl-btn', { active: currentTpl === t.key }]" @click="currentTpl = t.key">{{ t.label }}</button>
      </div>
      <div class="rb-toolbar-actions">
        <button class="rb-btn rb-btn-outline" @click="loadSample">示例</button>
        <button class="rb-btn rb-btn-outline" @click="toggleAutoSave"><i :class="autoSave ? 'bi bi-cloud-check' : 'bi bi-cloud'"></i></button>
        <button class="rb-btn rb-btn-print" @click="printResume"><i class="bi bi-printer"></i> 导出 PDF</button>
      </div>
    </div>

    <div class="rb-main">
      <!-- Form (unchanged) -->
      <div class="rb-form">
        <section class="rb-section" :class="{ collapsed: sections.basic }">
          <h2 @click="sections.basic = !sections.basic"><i class="bi bi-chevron-right" :class="{ rotated: !sections.basic }"></i><i class="bi bi-person-badge"></i> 基本信息</h2>
          <div v-show="!sections.basic">
            <div class="rb-avatar-row">
              <div class="rb-avatar-preview" @click="triggerUpload"><img v-if="form.avatar" :src="form.avatar" /><i v-else class="bi bi-camera"></i></div>
              <input type="file" ref="fileInput" accept="image/*" @change="onAvatarChange" hidden />
              <span class="rb-avatar-hint">点击上传头像</span>
            </div>
            <div class="rb-row"><div class="rb-field"><label>姓名 *</label><input v-model="form.name" placeholder="张三" /></div><div class="rb-field"><label>求职意向</label><input v-model="form.title" placeholder="前端工程师" /></div></div>
            <div class="rb-row rb-row-3"><div class="rb-field"><label>电话</label><input v-model="form.phone" /></div><div class="rb-field"><label>邮箱</label><input v-model="form.email" /></div><div class="rb-field"><label>所在地</label><input v-model="form.location" /></div></div>
            <div class="rb-row rb-row-3"><div class="rb-field"><label>GitHub</label><input v-model="form.github" /></div><div class="rb-field"><label>网站</label><input v-model="form.website" /></div><div class="rb-field"><label>LinkedIn</label><input v-model="form.linkedin" /></div></div>
            <div class="rb-field"><label>个人简介</label><textarea v-model="form.bio" rows="2" placeholder="简要介绍..."></textarea></div>
          </div>
        </section>

        <section class="rb-section" :class="{ collapsed: sections.edu }">
          <h2 @click="sections.edu = !sections.edu"><i class="bi bi-chevron-right" :class="{ rotated: !sections.edu }"></i><i class="bi bi-mortarboard"></i> 教育背景</h2>
          <div v-show="!sections.edu">
            <div v-for="(e,i) in form.education" :key="i" class="rb-card">
              <div class="rb-card-actions"><button class="rb-move" @click="moveItem(form.education,i,-1)" :disabled="i===0"><i class="bi bi-chevron-up"></i></button><button class="rb-move" @click="moveItem(form.education,i,1)" :disabled="i===form.education.length-1"><i class="bi bi-chevron-down"></i></button><button class="rb-remove" @click="form.education.splice(i,1)">×</button></div>
              <div class="rb-row"><div class="rb-field"><label>学校</label><input v-model="e.school" /></div><div class="rb-field"><label>专业</label><input v-model="e.major" /></div></div>
              <div class="rb-row"><div class="rb-field"><label>学历</label><input v-model="e.degree" /></div><div class="rb-field"><label>时间</label><input v-model="e.time" /></div></div>
            </div>
            <button class="rb-btn rb-btn-sm" @click="addEducation"><i class="bi bi-plus-lg"></i> 添加</button>
          </div>
        </section>

        <section class="rb-section" :class="{ collapsed: sections.work }">
          <h2 @click="sections.work = !sections.work"><i class="bi bi-chevron-right" :class="{ rotated: !sections.work }"></i><i class="bi bi-briefcase"></i> 工作经历</h2>
          <div v-show="!sections.work">
            <div v-for="(w,i) in form.work" :key="i" class="rb-card">
              <div class="rb-card-actions"><button class="rb-move" @click="moveItem(form.work,i,-1)" :disabled="i===0"><i class="bi bi-chevron-up"></i></button><button class="rb-move" @click="moveItem(form.work,i,1)" :disabled="i===form.work.length-1"><i class="bi bi-chevron-down"></i></button><button class="rb-remove" @click="form.work.splice(i,1)">×</button></div>
              <div class="rb-row"><div class="rb-field"><label>公司</label><input v-model="w.company" /></div><div class="rb-field"><label>职位</label><input v-model="w.position" /></div></div>
              <div class="rb-row"><div class="rb-field"><label>开始</label><input v-model="w.start" /></div><div class="rb-field"><label>结束</label><input v-model="w.end" /></div></div>
              <div class="rb-field"><label>工作内容</label><textarea v-model="w.desc" rows="2"></textarea></div>
            </div>
            <button class="rb-btn rb-btn-sm" @click="addWork"><i class="bi bi-plus-lg"></i> 添加</button>
          </div>
        </section>

        <section class="rb-section" :class="{ collapsed: sections.projects }">
          <h2 @click="sections.projects = !sections.projects"><i class="bi bi-chevron-right" :class="{ rotated: !sections.projects }"></i><i class="bi bi-code-slash"></i> 项目经验</h2>
          <div v-show="!sections.projects">
            <div v-for="(p,i) in form.projects" :key="i" class="rb-card">
              <div class="rb-card-actions"><button class="rb-move" @click="moveItem(form.projects,i,-1)" :disabled="i===0"><i class="bi bi-chevron-up"></i></button><button class="rb-move" @click="moveItem(form.projects,i,1)" :disabled="i===form.projects.length-1"><i class="bi bi-chevron-down"></i></button><button class="rb-remove" @click="form.projects.splice(i,1)">×</button></div>
              <div class="rb-row"><div class="rb-field"><label>项目</label><input v-model="p.name" /></div><div class="rb-field"><label>时间</label><input v-model="p.time" /></div></div>
              <div class="rb-field"><label>技术栈</label><input v-model="p.stack" /></div>
              <div class="rb-field"><label>描述</label><textarea v-model="p.desc" rows="2"></textarea></div>
            </div>
            <button class="rb-btn rb-btn-sm" @click="addProject"><i class="bi bi-plus-lg"></i> 添加</button>
          </div>
        </section>

        <section class="rb-section" :class="{ collapsed: sections.skills }">
          <h2 @click="sections.skills = !sections.skills"><i class="bi bi-chevron-right" :class="{ rotated: !sections.skills }"></i><i class="bi bi-tools"></i> 专业技能</h2>
          <div v-show="!sections.skills">
            <div class="rb-field"><label>技能（逗号分隔）</label><textarea v-model="form.skills" rows="2"></textarea></div>
            <div class="rb-field" style="margin-top:10px"><label>语言能力</label><input v-model="form.languages" /></div>
            <div class="rb-field" style="margin-top:10px"><label>证书/荣誉</label><input v-model="form.certificates" /></div>
          </div>
        </section>
      </div>

      <!-- Preview -->
      <div class="rb-preview">
        <div class="rb-preview-sticky">
          <div class="rb-preview-label">实时预览 · {{ templates.find(t=>t.key===currentTpl)?.label }}</div>

          <!-- ====== Template: Classic ====== -->
          <div v-if="currentTpl === 'classic'" class="resume-paper tpl-classic" id="resume-paper">
            <div class="rp-header-c">
              <img v-if="form.avatar" :src="form.avatar" class="rp-avatar" />
              <h1>{{ form.name || '张三' }}</h1>
              <p class="rp-title">{{ form.title || '求职意向' }}</p>
              <div class="rp-contact" v-if="form.phone||form.email||form.location||form.github||form.website">
                <span v-if="form.phone"><i class="bi bi-telephone"></i>{{ form.phone }}</span>
                <span v-if="form.email"><i class="bi bi-envelope"></i>{{ form.email }}</span>
                <span v-if="form.location"><i class="bi bi-geo-alt"></i>{{ form.location }}</span>
                <span v-if="form.github"><i class="bi bi-github"></i>{{ form.github }}</span>
                <span v-if="form.website"><i class="bi bi-globe"></i>{{ form.website }}</span>
              </div>
            </div>
            <SectionBlock title="个人简介" v-if="form.bio"><p>{{ form.bio }}</p></SectionBlock>
            <SectionBlock title="教育背景" v-if="hasEducation">
              <div v-for="(e,i) in form.education" :key="i" class="rp-item" v-show="e.school">
                <div class="rp-item-head"><strong>{{ e.school }}</strong><span>{{ e.major }} · {{ e.degree }}</span><em>{{ e.time }}</em></div>
              </div>
            </SectionBlock>
            <SectionBlock title="工作经历" v-if="hasWork">
              <div v-for="(w,i) in form.work" :key="i" class="rp-item" v-show="w.company">
                <div class="rp-item-head"><strong>{{ w.company }}</strong><span>{{ w.position }}</span><em>{{ w.start }} — {{ w.end }}</em></div>
                <p v-if="w.desc">{{ w.desc }}</p>
              </div>
            </SectionBlock>
            <SectionBlock title="项目经验" v-if="hasProjects">
              <div v-for="(p,i) in form.projects" :key="i" class="rp-item" v-show="p.name">
                <div class="rp-item-head"><strong>{{ p.name }}</strong><span v-if="p.time">{{ p.time }}</span></div>
                <p v-if="p.stack" class="rp-stack"><em>{{ p.stack }}</em></p>
                <p v-if="p.desc">{{ p.desc }}</p>
              </div>
            </SectionBlock>
            <SectionBlock title="专业技能 & 其它" v-if="hasExtra">
              <div v-if="skillTags.length" class="rp-tags"><span v-for="s in skillTags" :key="s" class="rp-tag">{{ s }}</span></div>
              <p v-if="form.languages" style="margin-top:8px"><strong>语言：</strong>{{ form.languages }}</p>
              <p v-if="form.certificates"><strong>证书：</strong>{{ form.certificates }}</p>
            </SectionBlock>
          </div>

          <!-- ====== Template: Modern ====== -->
          <div v-else-if="currentTpl === 'modern'" class="resume-paper tpl-modern" id="resume-paper">
            <div class="rp-sidebar">
              <img v-if="form.avatar" :src="form.avatar" class="rp-avatar-lg" />
              <h1>{{ form.name || '张三' }}</h1>
              <p class="rp-title">{{ form.title || '求职意向' }}</p>
              <div class="rp-contact-col" v-if="form.phone||form.email||form.location||form.github||form.website">
                <div v-if="form.phone"><i class="bi bi-telephone"></i>{{ form.phone }}</div>
                <div v-if="form.email"><i class="bi bi-envelope"></i>{{ form.email }}</div>
                <div v-if="form.location"><i class="bi bi-geo-alt"></i>{{ form.location }}</div>
                <div v-if="form.github"><i class="bi bi-github"></i>{{ form.github }}</div>
                <div v-if="form.website"><i class="bi bi-globe"></i>{{ form.website }}</div>
              </div>
              <div class="rp-side-section" v-if="skillTags.length">
                <h4>专业技能</h4>
                <div class="rp-side-tags"><span v-for="s in skillTags" :key="s">{{ s }}</span></div>
              </div>
              <div class="rp-side-section" v-if="form.languages">
                <h4>语言</h4><p>{{ form.languages }}</p>
              </div>
              <div class="rp-side-section" v-if="form.certificates">
                <h4>证书</h4><p>{{ form.certificates }}</p>
              </div>
            </div>
            <div class="rp-main-col">
              <SectionBlock title="个人简介" v-if="form.bio"><p>{{ form.bio }}</p></SectionBlock>
              <SectionBlock title="教育背景" v-if="hasEducation">
                <div v-for="(e,i) in form.education" :key="i" class="rp-item" v-show="e.school">
                  <div class="rp-item-head"><strong>{{ e.school }}</strong><span>{{ e.major }} · {{ e.degree }}</span><em>{{ e.time }}</em></div>
                </div>
              </SectionBlock>
              <SectionBlock title="工作经历" v-if="hasWork">
                <div v-for="(w,i) in form.work" :key="i" class="rp-item rp-item-timeline" v-show="w.company">
                  <div class="rp-timeline-dot"></div>
                  <div class="rp-item-head"><strong>{{ w.company }}</strong><span>{{ w.position }}</span><em>{{ w.start }} — {{ w.end }}</em></div>
                  <p v-if="w.desc">{{ w.desc }}</p>
                </div>
              </SectionBlock>
              <SectionBlock title="项目经验" v-if="hasProjects">
                <div v-for="(p,i) in form.projects" :key="i" class="rp-item" v-show="p.name">
                  <div class="rp-item-head"><strong>{{ p.name }}</strong><span v-if="p.time">{{ p.time }}</span></div>
                  <p v-if="p.stack" class="rp-stack"><em>{{ p.stack }}</em></p>
                  <p v-if="p.desc">{{ p.desc }}</p>
                </div>
              </SectionBlock>
            </div>
          </div>

          <!-- ====== Template: Minimal ====== -->
          <div v-else-if="currentTpl === 'minimal'" class="resume-paper tpl-minimal" id="resume-paper">
            <div class="rp-header-m">
              <h1>{{ form.name || '张三' }}</h1>
              <p class="rp-title">{{ form.title || '求职意向' }}</p>
              <div class="rp-contact" v-if="form.phone||form.email||form.location">
                <span v-if="form.phone">{{ form.phone }}</span>
                <span v-if="form.email">{{ form.email }}</span>
                <span v-if="form.location">{{ form.location }}</span>
                <span v-if="form.github">{{ form.github }}</span>
              </div>
            </div>
            <SectionBlock title="简介" v-if="form.bio"><p>{{ form.bio }}</p></SectionBlock>
            <SectionBlock title="教育" v-if="hasEducation">
              <div v-for="(e,i) in form.education" :key="i" class="rp-item" v-show="e.school">
                <div class="rp-item-head"><strong>{{ e.school }}</strong><span>{{ e.major }} · {{ e.degree }}</span><em>{{ e.time }}</em></div>
              </div>
            </SectionBlock>
            <SectionBlock title="经历" v-if="hasWork">
              <div v-for="(w,i) in form.work" :key="i" class="rp-item" v-show="w.company">
                <div class="rp-item-head"><strong>{{ w.position }}</strong><span>@ {{ w.company }}</span><em>{{ w.start }} — {{ w.end }}</em></div>
                <p v-if="w.desc">{{ w.desc }}</p>
              </div>
            </SectionBlock>
            <SectionBlock title="项目" v-if="hasProjects">
              <div v-for="(p,i) in form.projects" :key="i" class="rp-item" v-show="p.name">
                <div class="rp-item-head"><strong>{{ p.name }}</strong><em>{{ p.time }}</em></div>
                <p v-if="p.desc">{{ p.desc }}</p>
                <p v-if="p.stack" class="rp-stack">{{ p.stack }}</p>
              </div>
            </SectionBlock>
            <SectionBlock title="技能" v-if="hasExtra">
              <div v-if="skillTags.length" class="rp-tags"><span v-for="s in skillTags" :key="s" class="rp-tag">{{ s }}</span></div>
              <p v-if="form.languages" style="margin-top:8px">{{ form.languages }}</p>
              <p v-if="form.certificates">{{ form.certificates }}</p>
            </SectionBlock>
          </div>

          <!-- ====== Template: Professional ====== -->
          <div v-else class="resume-paper tpl-professional" id="resume-paper">
            <div class="rp-pro-top">
              <div class="rp-pro-top-left">
                <img v-if="form.avatar" :src="form.avatar" class="rp-avatar" />
                <h1>{{ form.name || '张三' }}</h1>
                <p class="rp-title">{{ form.title || '求职意向' }}</p>
              </div>
              <div class="rp-pro-top-right" v-if="form.phone||form.email||form.location||form.github">
                <div v-if="form.phone"><i class="bi bi-telephone"></i>{{ form.phone }}</div>
                <div v-if="form.email"><i class="bi bi-envelope"></i>{{ form.email }}</div>
                <div v-if="form.location"><i class="bi bi-geo-alt"></i>{{ form.location }}</div>
                <div v-if="form.github"><i class="bi bi-github"></i>{{ form.github }}</div>
                <div v-if="form.website"><i class="bi bi-globe"></i>{{ form.website }}</div>
              </div>
            </div>
            <div class="rp-pro-body">
              <div class="rp-pro-main">
                <SectionBlock title="个人简介" v-if="form.bio"><p>{{ form.bio }}</p></SectionBlock>
                <SectionBlock title="工作经历" v-if="hasWork">
                  <div v-for="(w,i) in form.work" :key="i" class="rp-item" v-show="w.company">
                    <div class="rp-item-head"><strong>{{ w.company }}</strong><span>{{ w.position }}</span><em>{{ w.start }} — {{ w.end }}</em></div>
                    <p v-if="w.desc">{{ w.desc }}</p>
                  </div>
                </SectionBlock>
                <SectionBlock title="项目经验" v-if="hasProjects">
                  <div v-for="(p,i) in form.projects" :key="i" class="rp-item" v-show="p.name">
                    <div class="rp-item-head"><strong>{{ p.name }}</strong><em>{{ p.time }}</em></div>
                    <p v-if="p.stack" class="rp-stack"><em>{{ p.stack }}</em></p>
                    <p v-if="p.desc">{{ p.desc }}</p>
                  </div>
                </SectionBlock>
              </div>
              <div class="rp-pro-side">
                <SectionBlock title="教育背景" v-if="hasEducation">
                  <div v-for="(e,i) in form.education" :key="i" class="rp-item" v-show="e.school">
                    <strong>{{ e.school }}</strong><br /><span>{{ e.major }} · {{ e.degree }}</span><br /><em>{{ e.time }}</em>
                  </div>
                </SectionBlock>
                <SectionBlock title="专业技能" v-if="hasExtra">
                  <div v-if="skillTags.length" class="rp-tags"><span v-for="s in skillTags" :key="s">{{ s }}</span></div>
                  <p v-if="form.languages" style="margin-top:6px;font-size:12px"><strong>语言</strong><br />{{ form.languages }}</p>
                  <p v-if="form.certificates" style="font-size:12px"><strong>证书</strong><br />{{ form.certificates }}</p>
                </SectionBlock>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'

const STORAGE_KEY = 'resume_builder_data'

const form = reactive({
  avatar:'', name:'', title:'', phone:'', email:'', location:'',
  github:'', website:'', linkedin:'',
  bio:'', education:[], work:[], projects:[],
  skills:'', languages:'', certificates:'',
})
const sections = reactive({ basic:false, edu:false, work:false, projects:false, skills:false })
const skillTags = computed(() => form.skills.split(/[,，]/).map(s=>s.trim()).filter(Boolean))
const hasEducation = computed(() => form.education.some(e=>e.school))
const hasWork = computed(() => form.work.some(w=>w.company))
const hasProjects = computed(() => form.projects.some(p=>p.name))
const hasExtra = computed(() => form.skills||form.languages||form.certificates)

const templates = [
  { key:'classic', label:'经典' },
  { key:'modern', label:'现代' },
  { key:'minimal', label:'极简' },
  { key:'professional', label:'专业' },
]
const currentTpl = ref('classic')
const autoSave = ref(false)
const fileInput = ref(null)

if(form.work.length===0) addWork()
if(form.projects.length===0) addProject()
if(form.education.length===0) addEducation()

function addWork(){ form.work.push({company:'',position:'',start:'',end:'',desc:''}) }
function addProject(){ form.projects.push({name:'',time:'',stack:'',desc:''}) }
function addEducation(){ form.education.push({school:'',major:'',degree:'',time:''}) }
function moveItem(arr,idx,dir){ const to=idx+dir; if(to<0||to>=arr.length)return; [arr[idx],arr[to]]=[arr[to],arr[idx]] }

function saveToLocal(){ localStorage.setItem(STORAGE_KEY, JSON.stringify({...form, currentTpl:currentTpl.value, sections:{...sections}})) }
function loadFromLocal(){
  const raw=localStorage.getItem(STORAGE_KEY); if(!raw)return
  try{ const data=JSON.parse(raw); Object.keys(form).forEach(k=>{if(k in data)form[k]=data[k]}); if(data.currentTpl)currentTpl.value=data.currentTpl; if(data.sections)Object.assign(sections,data.sections); autoSave.value=true }catch{}
}
onMounted(()=>loadFromLocal())
watch(form,()=>{if(autoSave.value)saveToLocal()},{deep:true})
watch(currentTpl,()=>{if(autoSave.value)saveToLocal()})
watch(sections,()=>{if(autoSave.value)saveToLocal()},{deep:true})
function toggleAutoSave(){ autoSave.value=!autoSave.value; if(autoSave.value)saveToLocal() }

function triggerUpload(){fileInput.value?.click()}
function onAvatarChange(e){const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=ev=>{form.avatar=ev.target.result;if(autoSave.value)saveToLocal()};r.readAsDataURL(f)}

function loadSample(){
  Object.assign(form,{
    name:'张三',title:'高级前端工程师',phone:'138-0000-0000',email:'zhangsan@email.com',location:'北京',
    github:'github.com/zhangsan',website:'zhangsan.dev',linkedin:'linkedin.com/in/zhangsan',
    bio:'5 年前端开发经验，擅长 Vue 生态和工程化建设，主导过多个中大型项目的前端架构设计，对用户体验和性能优化有深入理解。',
    education:[{school:'清华大学',major:'软件工程',degree:'硕士',time:'2021 - 2023'},{school:'北京大学',major:'计算机科学',degree:'本科',time:'2017 - 2021'}],
    work:[
      {company:'ABC 科技有限公司',position:'高级前端开发',start:'2023.06',end:'至今',desc:'负责公司核心产品的前端架构设计与开发，推动组件库建设，优化前端性能，首屏加载时间降低 40%。主导团队从 Vue 2 到 Vue 3 的技术升级。'},
      {company:'XYZ 互联网公司',position:'前端开发工程师',start:'2021.03',end:'2023.05',desc:'参与电商平台前端开发，使用 Vue 3 + TypeScript 重构订单模块，维护内部 UI 组件库。独立负责双十一活动页开发，PV 过千万。'},
    ],
    projects:[
      {name:'企业后台管理系统',time:'2023.06 - 至今',stack:'Vue 3, TypeScript, Pinia, Element Plus, Vite',desc:'从零搭建大型企业后台管理系统，实现动态权限路由、数据可视化大屏、国际化等核心功能。支撑 500+ 内部用户。'},
      {name:'组件库 CocoUI',time:'2022.03 - 2023.05',stack:'Vue 3, Vite, Storybook, Vitest',desc:'主导开发内部 UI 组件库，包含 40+ 组件，单元测试覆盖率 85%，被 8 个业务线接入。'},
      {name:'个人博客系统',time:'2023.01 - 2023.05',stack:'Vue 3, Node.js, Express, MySQL',desc:'全栈开发个人博客，包含文章管理、评论系统、标签分类、管理后台等功能。'},
    ],
    skills:'Vue, React, TypeScript, Node.js, Tailwind CSS, Pinia, Vite, Webpack, Git, Docker, CI/CD',
    languages:'中文（母语）、英语（CET-6，流利读写）',
    certificates:'PMP 项目管理认证、阿里云 ACE 认证',
  })
}
function clearAll(){
  ['name','title','phone','email','location','github','website','linkedin','bio','skills','languages','certificates','avatar'].forEach(f=>form[f]='')
  form.education=[{school:'',major:'',degree:'',time:''}]; form.work=[{company:'',position:'',start:'',end:'',desc:''}]; form.projects=[{name:'',time:'',stack:'',desc:''}]
}
function printResume(){window.print()}
</script>

<style scoped>
/* ====== Layout ====== */
.rb-root{max-width:1440px;margin:0 auto;padding:0 24px 60px}
.rb-toolbar{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;padding:20px 0 16px;border-bottom:1px solid var(--color-border-light);margin-bottom:24px}
.rb-toolbar h1{font-size:1.2rem;font-weight:800;margin:0;display:flex;align-items:center;gap:8px}
.rb-toolbar-actions{display:flex;gap:8px;flex-wrap:wrap}
.rb-template-switch{display:flex;gap:3px;background:var(--color-surface);border:1px solid var(--color-border);border-radius:10px;padding:3px}
.rb-tpl-btn{padding:5px 13px;border:none;border-radius:8px;font-size:0.76rem;font-weight:600;cursor:pointer;background:transparent;color:var(--color-text-muted);transition:all .2s;font-family:var(--font-sans)}
.rb-tpl-btn.active{background:var(--color-primary);color:#fff}
.rb-btn{display:inline-flex;align-items:center;gap:5px;padding:7px 14px;border-radius:8px;font-size:.8rem;font-weight:600;border:none;cursor:pointer;transition:all .2s;font-family:var(--font-sans)}
.rb-btn-sm{padding:5px 12px;font-size:.76rem;border-radius:6px}
.rb-btn-outline{background:var(--color-surface);border:1.5px solid var(--color-border);color:var(--color-text-secondary)}
.rb-btn-outline:hover{border-color:var(--color-accent);color:var(--color-primary)}
.rb-btn-print{background:var(--color-primary);color:#fff}
.rb-btn-print:hover{background:var(--color-accent)}
.rb-main{display:grid;grid-template-columns:1fr 1fr;gap:32px;align-items:start}
@media(max-width:960px){.rb-main{grid-template-columns:1fr}}

/* ====== Form ====== */
.rb-section{margin-bottom:20px}
.rb-section h2{font-size:.88rem;font-weight:700;margin:0 0 10px;display:flex;align-items:center;gap:6px;color:var(--color-text);cursor:pointer;user-select:none}
.rb-section h2 i.bi-chevron-right{font-size:.65rem;transition:transform .2s;color:var(--color-text-muted)}
.rb-section h2 i.bi-chevron-right.rotated{transform:rotate(90deg)}
.rb-section.collapsed h2{margin-bottom:0;opacity:.5}
.rb-row{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px}
.rb-row-3{grid-template-columns:1fr 1fr 1fr}
.rb-field{display:flex;flex-direction:column;gap:3px}
.rb-field label{font-size:.72rem;font-weight:600;color:var(--color-text-muted)}
.rb-field input,.rb-field textarea{padding:8px 11px;border:1.5px solid var(--color-border);border-radius:7px;font-size:.82rem;font-family:var(--font-sans);background:var(--color-surface);color:var(--color-text);outline:none;transition:border-color .2s;resize:vertical}
.rb-field input:focus,.rb-field textarea:focus{border-color:var(--color-accent)}
.rb-card{position:relative;background:var(--color-surface);border:1px solid var(--color-border-light);border-radius:9px;padding:12px 14px;margin-bottom:8px}
.rb-card-actions{position:absolute;top:6px;right:6px;display:flex;gap:2px}
.rb-move{border:none;background:none;color:var(--color-text-muted);cursor:pointer;padding:2px 5px;font-size:.75rem;transition:color .15s}
.rb-move:hover:not(:disabled){color:var(--color-accent)}
.rb-move:disabled{opacity:.3;cursor:default}
.rb-remove{border:none;background:none;color:var(--color-text-muted);font-size:1.1rem;cursor:pointer;padding:0 3px;transition:color .15s}
.rb-remove:hover{color:var(--color-danger)}
.rb-avatar-row{display:flex;align-items:center;gap:12px;margin-bottom:12px}
.rb-avatar-preview{width:52px;height:52px;border-radius:50%;border:2px dashed var(--color-border);display:flex;align-items:center;justify-content:center;cursor:pointer;overflow:hidden;transition:border-color .2s;flex-shrink:0;background:var(--color-surface);color:var(--color-text-muted);font-size:1.1rem}
.rb-avatar-preview:hover{border-color:var(--color-accent)}
.rb-avatar-preview img{width:100%;height:100%;object-fit:cover}
.rb-avatar-hint{font-size:.74rem;color:var(--color-text-muted)}
.rb-preview{}
.rb-preview-sticky{position:sticky;top:80px}
.rb-preview-label{font-size:.68rem;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:var(--color-text-muted);margin-bottom:10px}

/* ====== Shared Resume Paper ====== */
.resume-paper{background:#fff;box-shadow:0 2px 24px rgba(0,0,0,.08),0 0 0 1px rgba(0,0,0,.04);border-radius:3px;min-height:800px;font-size:13.5px;line-height:1.65;color:#333;font-family:'PingFang SC','Microsoft YaHei','Inter',system-ui,sans-serif}
.rp-avatar{width:64px;height:64px;border-radius:50%;object-fit:cover;display:block;margin:0 auto 10px}
.rp-avatar-lg{width:80px;height:80px;border-radius:50%;object-fit:cover;margin-bottom:14px}
.rp-title{font-size:14px;color:#777;margin:0 0 10px}
.rp-contact{display:flex;justify-content:center;gap:18px;font-size:12px;color:#666;flex-wrap:wrap}
.rp-contact span,.rp-contact-col div{display:inline-flex;align-items:center;gap:4px;font-size:12px;color:#666}
.rp-contact-col{display:flex;flex-direction:column;gap:6px;margin-bottom:18px}
.rp-block h3{font-size:13px;font-weight:700;margin:0 0 10px;padding-bottom:6px;border-bottom:1.5px solid #e8e8e8;text-transform:uppercase;letter-spacing:.04em;color:#2D2D2D}
.rp-item{margin-bottom:10px}
.rp-item-head{display:flex;align-items:baseline;gap:10px;flex-wrap:wrap;margin-bottom:3px}
.rp-item-head strong{font-size:13.5px;color:#2D2D2D}
.rp-item-head span{font-size:12.5px;color:#666}
.rp-item-head em{font-size:11.5px;color:#999;margin-left:auto}
.rp-stack{font-size:11.5px;color:#999;margin:2px 0}
.rp-tags{display:flex;flex-wrap:wrap;gap:6px}
.rp-tag{display:inline-block;padding:2px 10px;background:#f3f3f3;border-radius:3px;font-size:11.5px;color:#555}

/* ====== Template: Classic ====== */
.tpl-classic{padding:48px 48px}
.tpl-classic .rp-header-c{text-align:center;margin-bottom:28px;padding-bottom:22px;border-bottom:2px solid #3a3a3a}
.tpl-classic .rp-header-c h1{font-size:26px;font-weight:800;margin:0 0 4px;letter-spacing:.04em}
.tpl-classic .rp-header-c .rp-title{font-size:15px;color:#777}

/* ====== Template: Modern ====== */
.tpl-modern{padding:0;display:grid;grid-template-columns:220px 1fr;min-height:960px}
.rp-sidebar{background:#233142;color:#e0e0e0;padding:36px 24px;display:flex;flex-direction:column;align-items:center;text-align:center}
.rp-sidebar h1{font-size:22px;font-weight:700;color:#fff;margin:0 0 4px}
.rp-sidebar .rp-title{color:rgba(255,255,255,.55);font-size:13px;margin-bottom:18px}
.rp-sidebar .rp-contact-col div{color:rgba(255,255,255,.5);justify-content:center}
.rp-side-section{margin-top:20px;width:100%;text-align:left}
.rp-side-section h4{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:rgba(255,255,255,.35);margin:0 0 8px;padding-bottom:4px;border-bottom:1px solid rgba(255,255,255,.1)}
.rp-side-section p{font-size:11.5px;color:rgba(255,255,255,.45);margin:0;line-height:1.5}
.rp-side-tags{display:flex;flex-wrap:wrap;gap:5px}
.rp-side-tags span{padding:2px 8px;background:rgba(255,255,255,.08);border-radius:3px;font-size:10.5px;color:rgba(255,255,255,.6)}
.rp-main-col{padding:32px 30px}
.rp-main-col .rp-block h3{font-size:12px;border-bottom-color:#e0e0e0;margin-bottom:12px}
.rp-item-timeline{padding-left:18px;position:relative}
.rp-timeline-dot{position:absolute;left:0;top:6px;width:6px;height:6px;border-radius:50%;background:#233142}

/* ====== Template: Minimal ====== */
.tpl-minimal{padding:56px 60px;font-family:'Inter','PingFang SC',sans-serif}
.tpl-minimal .rp-header-m{margin-bottom:36px}
.tpl-minimal .rp-header-m h1{font-size:30px;font-weight:300;letter-spacing:.06em;margin:0 0 4px}
.tpl-minimal .rp-header-m .rp-title{font-size:15px;color:#aaa;margin-bottom:14px}
.tpl-minimal .rp-header-m .rp-contact{justify-content:flex-start;color:#aaa;gap:28px}
.tpl-minimal .rp-block{margin-bottom:26px}
.tpl-minimal .rp-block h3{font-size:10px;font-weight:600;letter-spacing:.12em;color:#aaa;border-bottom:none;padding-bottom:0;margin-bottom:8px}
.tpl-minimal .rp-item-head strong{font-weight:500;font-size:14px}
.tpl-minimal .rp-item-head span{color:#999}
.tpl-minimal .rp-tag{background:none;border:1px solid #e0e0e0;border-radius:20px;padding:2px 12px;font-size:11px}

/* ====== Template: Professional ====== */
.tpl-professional{padding:0}
.rp-pro-top{background:#1a5276;color:#fff;padding:28px 36px;display:flex;align-items:center;gap:28px;flex-wrap:wrap}
.rp-pro-top-left{display:flex;align-items:center;gap:16px;flex:1;min-width:200px}
.rp-pro-top-left .rp-avatar{width:56px;height:56px;margin:0}
.rp-pro-top h1{font-size:22px;font-weight:700;margin:0;color:#fff}
.rp-pro-top .rp-title{font-size:14px;color:rgba(255,255,255,.65);margin:0}
.rp-pro-top-right{display:flex;flex-wrap:wrap;gap:16px;font-size:12px;color:rgba(255,255,255,.5)}
.rp-pro-top-right div{display:flex;align-items:center;gap:5px}
.rp-pro-body{display:grid;grid-template-columns:1fr 200px;padding:30px 36px;gap:28px}
.rp-pro-main .rp-block h3{font-size:12px;color:#1a5276;border-bottom-color:#d5dfe8}
.rp-pro-side .rp-block h3{font-size:11px;color:#1a5276;border-bottom-color:#d5dfe8}
.rp-pro-side{font-size:12px}
.rp-pro-side .rp-item{margin-bottom:10px;font-size:12px;line-height:1.5}
.rp-pro-side .rp-tag{font-size:10.5px}
@media(max-width:700px){.rp-pro-body{grid-template-columns:1fr}}

@media(max-width:600px){.rb-row,.rb-row-3{grid-template-columns:1fr}}
</style>
