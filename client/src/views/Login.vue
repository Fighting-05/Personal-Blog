<template>
  <div class="min-h-screen grid lg-grid-cols-2">
    <!-- Left: Characters -->
    <div class="left-panel">
      <div class="left-brand">
        <div class="brand-icon"><i class="bi bi-stars"></i></div>
        <span>个人博客</span>
      </div>

      <div class="stage-wrap">
        <!-- Speech bubbles -->
        <div v-if="speech.text" class="speech-bubble" :style="speech.style" :class="'speech-' + speech.from">
          <span class="speech-name">{{ speech.fromName }}</span>
          {{ speech.text }}
          <div class="speech-tail"></div>
        </div>

        <div class="stage" style="width:550px;height:400px">

          <!-- Purple -->
          <div ref="purpleRef" class="char char-purple" :class="{ 'char-idle': idle }" :style="{ ...purpleBaseStyle, ...purpleAnimStyle }">
            <div class="char-eyes" :style="purpleEyesStyle">
              <EyeBall :size="18" :pupil-size="7" :max-dist="5" eye-color="#fff" pupil-color="#2D2D2D"
                :is-blinking="purpleBlinking" :force-look-x="purpleLX" :force-look-y="purpleLY" />
              <EyeBall :size="18" :pupil-size="7" :max-dist="5" eye-color="#fff" pupil-color="#2D2D2D"
                :is-blinking="purpleBlinking" :force-look-x="purpleLX" :force-look-y="purpleLY" />
            </div>
            <div class="char-name">紫仔</div>
          </div>

          <!-- Black -->
          <div ref="blackRef" class="char char-black" :class="{ 'char-idle': idle }" :style="blackAnimStyle">
            <div class="char-eyes" :style="blackEyesStyle">
              <EyeBall :size="16" :pupil-size="6" :max-dist="4" eye-color="#fff" pupil-color="#2D2D2D"
                :is-blinking="blackBlinking" :force-look-x="blackLX" :force-look-y="blackLY" />
              <EyeBall :size="16" :pupil-size="6" :max-dist="4" eye-color="#fff" pupil-color="#2D2D2D"
                :is-blinking="blackBlinking" :force-look-x="blackLX" :force-look-y="blackLY" />
            </div>
            <div class="char-name">小黑</div>
          </div>

          <!-- Orange -->
          <div ref="orangeRef" class="char char-orange" :class="{ 'char-idle': idle }" :style="orangeAnimStyle">
            <div class="char-eyes" :style="orangeEyesStyle">
              <Pupil :size="12" :max-dist="5" color="#2D2D2D" :force-look-x="orangeLX" :force-look-y="orangeLY" />
              <Pupil :size="12" :max-dist="5" color="#2D2D2D" :force-look-x="orangeLX" :force-look-y="orangeLY" />
            </div>
            <div class="char-name char-name-orange">橙子</div>
          </div>

          <!-- Yellow -->
          <div ref="yellowRef" class="char char-yellow" :class="{ 'char-idle': idle }" :style="yellowAnimStyle">
            <div class="char-eyes" :style="yellowEyesStyle">
              <Pupil :size="12" :max-dist="5" color="#2D2D2D" :force-look-x="yellowLX" :force-look-y="yellowLY" />
              <Pupil :size="12" :max-dist="5" color="#2D2D2D" :force-look-x="yellowLX" :force-look-y="yellowLY" />
            </div>
            <div class="char-name char-name-yellow">阿黄</div>
          </div>

        </div>
      </div>

      <div class="bg-grid"></div>
      <div class="bg-blur bg-blur-1"></div>
      <div class="bg-blur bg-blur-2"></div>
    </div>

    <!-- Right: Form -->
    <div class="right-panel">
      <div class="form-wrap">
        <div class="form-header">
          <h1>欢迎回来</h1>
          <p>登录你的账户继续探索</p>
        </div>

        <form @submit.prevent="handleLogin" class="login-form">
          <div class="field">
            <label>用户名</label>
            <input v-model="username" type="text" placeholder="请输入用户名"
              autocomplete="off"
              @focus="onFocusUsername"
              @blur="isTyping = false"
              required />
          </div>

          <div class="field">
            <label>密码</label>
            <div class="pw-wrap">
              <input v-model="password" :type="showPassword ? 'text' : 'password'"
                placeholder="••••••••"
                @focus="onFocusPassword"
                required />
              <button type="button" class="pw-toggle" @click="togglePassword">
                <i :class="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
              </button>
            </div>
          </div>

          <div v-if="errorMsg" class="error-msg">{{ errorMsg }}</div>

          <button type="submit" class="submit-btn" :disabled="loading"
            @mouseenter="onHoverLogin" @mouseleave="isHovering = false">
            {{ loading ? '登录中...' : '登录' }}
          </button>
        </form>

        <div class="divider"><span>或者</span></div>
        <router-link to="/register" class="register-link">还没有账号？立即注册</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import EyeBall from '@/components/EyeBall.vue'
import Pupil from '@/components/Pupil.vue'

const router = useRouter()
const authStore = useAuthStore()

const username = ref('')
const password = ref('')
const showPassword = ref(false)
const loading = ref(false)
const errorMsg = ref('')
const isTyping = ref(false)
const isLooking = ref(false)
const isHovering = ref(false)
const idle = ref(true)

const mouseX = ref(0)
const mouseY = ref(0)

const purpleBlinking = ref(false)
const blackBlinking = ref(false)
const purplePeeking = ref(false)

const purpleRef = ref(null)
const blackRef = ref(null)
const orangeRef = ref(null)
const yellowRef = ref(null)

// Speech bubble
const speech = ref({ text: '', style: {}, from: '', fromName: '' })
let speechTimer = null

const charNames = { purple: '紫仔', black: '小黑', orange: '橙子', yellow: '阿黄' }

// --- Random dialogues ---
const dialogues = {
  idle: [
    { text: '今天会是谁来登录呢？', from: 'purple' },
    { text: '好久不见，想你了~', from: 'yellow' },
    { text: 'zZZ... 有人在吗？', from: 'orange' },
    { text: '这个博客超棒的！', from: 'black' },
    { text: '密码可要藏好哦 🤫', from: 'purple' },
  ],
  typingUsername: [
    { text: '噢！有人在输入名字', from: 'orange' },
    { text: '让我看看是谁...', from: 'purple' },
  ],
  typingPassword: [
    { text: '别看别看！转头！', from: 'purple' },
    { text: '我遮住眼睛了 🙈', from: 'yellow' },
    { text: '密码是什么呀？好奇', from: 'orange' },
  ],
  showPassword: [
    { text: '哇！我看到了！！', from: 'purple' },
    { text: '非礼勿视非礼勿视', from: 'black' },
  ],
  hoverLogin: [
    { text: '要登录了吗？期待！', from: 'yellow' },
    { text: '终于可以进去啦~', from: 'orange' },
  ],
  loginFail: [
    { text: '啊哦，密码错了 😅', from: 'orange' },
    { text: '没关系，再试一次！', from: 'yellow' },
  ],
}

function showSpeech(from, list) {
  if (!list || !list.length) return
  const msg = list[Math.floor(Math.random() * list.length)]
  let style = {}
  if (from === 'purple') style = { left: '110px', bottom: '420px' }
  else if (from === 'black') style = { left: '270px', bottom: '330px' }
  else if (from === 'orange') style = { left: '30px', bottom: '220px' }
  else if (from === 'yellow') style = { left: '330px', bottom: '250px' }

  speech.value = { text: msg.text, style, from: msg.from, fromName: charNames[msg.from] }
  clearTimeout(speechTimer)
  speechTimer = setTimeout(() => { speech.value = { text: '', style: {}, from: '', fromName: '' } }, 3000)
}

// Idle random chat
onMounted(() => {
  const idleChat = () => {
    const d = dialogues.idle[Math.floor(Math.random() * dialogues.idle.length)]
    showSpeech(d.from, [d])
    speechTimer = setTimeout(idleChat, Math.random() * 6000 + 8000)
  }
  idleChat()

  const move = (e) => { mouseX.value = e.clientX; mouseY.value = e.clientY }
  window.addEventListener('mousemove', move)
  onBeforeUnmount(() => { window.removeEventListener('mousemove', move); clearTimeout(speechTimer) })
})

// Blinking
let blinkTimers = []
function scheduleBlink(setter) {
  const go = () => {
    const t = setTimeout(() => { setter(true); setTimeout(() => { setter(false); go() }, 150) }, Math.random() * 4000 + 3000)
    blinkTimers.push(t)
  }
  go()
}
scheduleBlink(v => purpleBlinking.value = v)
scheduleBlink(v => blackBlinking.value = v)
onBeforeUnmount(() => blinkTimers.forEach(clearTimeout))

// Idle subtle bounce
onMounted(() => {
  const bounce = () => { idle.value = !idle.value; setTimeout(bounce, Math.random() * 2000 + 3000) }
  bounce()
})

// Looking at each other when typing
watch(isTyping, (v) => { if (v) { isLooking.value = true; setTimeout(() => { isLooking.value = false }, 800) } })

// Peeking
watch([password, showPassword], ([p, s]) => {
  if (p.length > 0 && s) {
    const peek = () => {
      const t = setTimeout(() => { purplePeeking.value = true; setTimeout(() => { purplePeeking.value = false; peek() }, 800) }, Math.random() * 3000 + 2000)
      blinkTimers.push(t)
    }
    peek()
  } else { purplePeeking.value = false }
})

// --- Interactions ---
const togglePassword = () => {
  showPassword.value = !showPassword.value
  if (showPassword.value) {
    showSpeech('purple', dialogues.showPassword)
    showSpeech('black', dialogues.showPassword)
  }
}

const onFocusUsername = () => {
  isTyping.value = true
  showSpeech('orange', dialogues.typingUsername)
}
const onFocusPassword = () => {
  showSpeech('purple', dialogues.typingPassword)
  showSpeech('yellow', dialogues.typingPassword)
}
const onHoverLogin = () => {
  isHovering.value = true
  showSpeech('yellow', dialogues.hoverLogin)
}

// Login
async function handleLogin() {
  errorMsg.value = ''
  loading.value = true
  try {
    const res = await authStore.login(username.value, password.value)
    if (res.success) router.push('/')
    else {
      errorMsg.value = res.error || '用户名或密码错误'
      showSpeech('orange', dialogues.loginFail)
    }
  } catch {
    errorMsg.value = '登录失败'
  } finally { loading.value = false }
}

// --- Eye tracking helpers ---
function calcChar(r) {
  if (!r) return { faceX: 0, faceY: 0, skew: 0 }
  const rect = r.getBoundingClientRect()
  const cx = rect.left + rect.width / 2
  const cy = rect.top + rect.height / 3
  const dx = mouseX.value - cx
  const dy = mouseY.value - cy
  return {
    faceX: Math.max(-15, Math.min(15, dx / 20)),
    faceY: Math.max(-10, Math.min(10, dy / 30)),
    skew: Math.max(-6, Math.min(6, -dx / 120)),
  }
}

const purplePos = computed(() => calcChar(purpleRef.value))
const blackPos = computed(() => calcChar(blackRef.value))
const orangePos = computed(() => calcChar(orangeRef.value))
const yellowPos = computed(() => calcChar(yellowRef.value))

const pwdOpen = computed(() => password.value.length > 0 && showPassword.value)
const typingOrSecret = computed(() => isTyping.value || (password.value.length > 0 && !showPassword.value))

const purpleLX = computed(() => pwdOpen.value ? (purplePeeking.value ? 4 : -4) : isLooking.value ? 3 : undefined)
const purpleLY = computed(() => pwdOpen.value ? (purplePeeking.value ? 5 : -4) : isLooking.value ? 4 : undefined)
const blackLX = computed(() => pwdOpen.value ? -4 : isLooking.value ? 0 : undefined)
const blackLY = computed(() => pwdOpen.value ? -4 : isLooking.value ? -4 : undefined)
const orangeLX = computed(() => pwdOpen.value ? -5 : undefined)
const orangeLY = computed(() => pwdOpen.value ? -4 : undefined)
const yellowLX = computed(() => pwdOpen.value ? -5 : undefined)
const yellowLY = computed(() => pwdOpen.value ? -4 : undefined)

const purpleBaseStyle = computed(() => ({
  height: typingOrSecret.value ? '440px' : '400px',
}))
const purpleAnimStyle = computed(() => ({
  transform: pwdOpen.value ? 'skewX(0deg)' : typingOrSecret.value ? `skewX(${(purplePos.value.skew || 0) - 12}deg) translateX(40px)` : `skewX(${purplePos.value.skew || 0}deg)`,
}))
const purpleEyesStyle = computed(() => ({
  left: pwdOpen.value ? '20px' : isLooking.value ? '55px' : `${45 + purplePos.value.faceX}px`,
  top: pwdOpen.value ? '35px' : isLooking.value ? '65px' : `${40 + purplePos.value.faceY}px`,
  gap: '32px',
}))

const blackEyesStyle = computed(() => ({
  left: pwdOpen.value ? '10px' : isLooking.value ? '32px' : `${26 + blackPos.value.faceX}px`,
  top: pwdOpen.value ? '28px' : isLooking.value ? '12px' : `${32 + blackPos.value.faceY}px`,
  gap: '24px',
}))

const blackAnimStyle = computed(() => ({
  transform: pwdOpen.value ? 'skewX(0deg)' : isLooking.value ? `skewX(${(blackPos.value.skew || 0) * 1.5 + 10}deg) translateX(20px)` : typingOrSecret.value ? `skewX(${(blackPos.value.skew || 0) * 1.5}deg)` : `skewX(${blackPos.value.skew || 0}deg)`,
}))

const orangeAnimStyle = computed(() => ({
  transform: pwdOpen.value ? 'skewX(0deg)' : `skewX(${orangePos.value.skew || 0}deg)`,
}))
const orangeEyesStyle = computed(() => ({
  left: pwdOpen.value ? '50px' : `${82 + orangePos.value.faceX}px`,
  top: pwdOpen.value ? '85px' : `${90 + orangePos.value.faceY}px`,
  gap: '32px',
}))

const yellowEyesStyle = computed(() => ({
  left: pwdOpen.value ? '20px' : `${52 + yellowPos.value.faceX}px`,
  top: pwdOpen.value ? '35px' : `${40 + yellowPos.value.faceY}px`,
  gap: '24px',
}))

const yellowAnimStyle = computed(() => ({
  transform: pwdOpen.value ? 'skewX(0deg)' : `skewX(${yellowPos.value.skew || 0}deg)`,
}))
const yellowMouthStyle = computed(() => ({}))
</script>

<style scoped>
/* ====== Layout ====== */
.min-h-screen { min-height: 100vh }
.grid { display: grid }
.lg-grid-cols-2 { grid-template-columns: 1fr 1fr }
@media (max-width: 860px) { .lg-grid-cols-2 { grid-template-columns: 1fr } .left-panel { display: none } }

/* ====== Left Panel ====== */
.left-panel {
  position: relative;
  background: linear-gradient(165deg, #5B3FE8 0%, #4A2FD0 40%, #3D26B8 100%);
  display: flex; flex-direction: column; justify-content: space-between;
  padding: 40px; overflow: hidden;
}
.left-brand { position: relative; z-index: 20; display: flex; align-items: center; gap: 10px; font-size: 1.1rem; font-weight: 700; color: rgba(255,255,255,0.9) }
.brand-icon { width: 32px; height: 32px; border-radius: 8px; background: rgba(255,255,255,0.1); backdrop-filter: blur(6px); display: flex; align-items: center; justify-content: center; font-size: 0.9rem }

/* Speech bubble */
.speech-bubble {
  position: absolute; z-index: 30;
  background: rgba(255,255,255,0.95);
  color: #2D2D2D;
  padding: 8px 14px;
  border-radius: 14px;
  font-size: 0.82rem;
  font-weight: 600;
  white-space: nowrap;
  animation: popIn 0.3s ease-out;
  pointer-events: none;
  display: flex; flex-direction: column; gap: 2px;
}
.speech-name {
  font-size: 0.65rem; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.06em;
}
.speech-purple .speech-name { color: #6C3FF5 }
.speech-black .speech-name { color: #2D2D2D }
.speech-orange .speech-name { color: #E87850 }
.speech-yellow .speech-name { color: #B8A020 }
.speech-tail {
  position: absolute;
  bottom: -8px;
  left: 24px;
  width: 0; height: 0;
  border-left: 8px solid transparent;
  border-right: 8px solid transparent;
  border-top: 10px solid rgba(255,255,255,0.95);
}
@keyframes popIn { from { opacity: 0; transform: translateY(8px) scale(0.9) } to { opacity: 1; transform: translateY(0) scale(1) } }

/* Stage */
.stage-wrap { position: relative; z-index: 20; display: flex; align-items: flex-end; justify-content: center; flex: 1; min-height: 440px }
.stage { position: relative }

/* Characters */
.char { position: absolute; bottom: 0; transition: all 0.7s ease-in-out; transform-origin: bottom center }
.char-eyes { position: absolute; display: flex; transition: all 0.7s ease-in-out }
.char-purple { left: 70px; width: 180px; background: #6C3FF5; border-radius: 10px 10px 0 0; z-index: 1 }
.char-black { left: 240px; width: 120px; height: 310px; background: #2D2D2D; border-radius: 8px 8px 0 0; z-index: 2 }
.char-orange { left: 0; width: 240px; height: 200px; background: #FF9B6B; border-radius: 120px 120px 0 0; z-index: 3 }
.char-yellow { left: 310px; width: 140px; height: 230px; background: #E8D754; border-radius: 70px 70px 0 0; z-index: 4 }
/* Character names */
.char-name {
  position: absolute;
  bottom: -24px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 0.7rem;
  color: rgba(255,255,255,0.5);
  font-weight: 600;
  white-space: nowrap;
  opacity: 0;
  transition: opacity 0.3s;
}
.char:hover .char-name, .char-purple:hover .char-name, .char-black:hover .char-name, .char-orange:hover .char-name, .char-yellow:hover .char-name { opacity: 1 }
.char-name-orange { color: rgba(0,0,0,0.25) }
.char-name-yellow { color: rgba(0,0,0,0.25) }

/* Idle bounce */
.char-idle { animation: idleBounce 0.6s ease-in-out }
@keyframes idleBounce {
  0%, 100% { transform: translateY(0) }
  30% { transform: translateY(-6px) }
  60% { transform: translateY(-2px) }
}

.bg-grid { position: absolute; inset: 0; background-image: radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px); background-size: 20px 20px }
.bg-blur { position: absolute; border-radius: 50%; filter: blur(80px) }
.bg-blur-1 { top: 25%; right: 25%; width: 300px; height: 300px; background: rgba(255,255,255,0.06) }
.bg-blur-2 { bottom: 25%; left: 25%; width: 400px; height: 400px; background: rgba(255,255,255,0.03) }

/* ====== Right Panel ====== */
.right-panel { display: flex; align-items: center; justify-content: center; padding: 40px; background: var(--color-bg) }
.form-wrap { width: 100%; max-width: 420px }
.form-header { text-align: center; margin-bottom: 36px }
.form-header h1 { font-size: 1.8rem; font-weight: 800; margin: 0 0 8px; color: var(--color-text) }
.form-header p { font-size: 0.9rem; color: var(--color-text-muted); margin: 0 }
.login-form { display: flex; flex-direction: column; gap: 20px }
.field { display: flex; flex-direction: column; gap: 6px }
.field label { font-size: 0.84rem; font-weight: 600; color: var(--color-text) }
.field input { height: 48px; padding: 0 14px; border: 1.5px solid var(--color-border); border-radius: 10px; font-size: 0.9rem; font-family: var(--font-sans); background: var(--color-surface); color: var(--color-text); outline: none; transition: border-color 0.25s }
.field input:focus { border-color: var(--color-accent) }
.pw-wrap { position: relative }
.pw-wrap input { width: 100%; padding-right: 44px }
.pw-toggle { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); border: none; background: none; color: var(--color-text-muted); cursor: pointer; padding: 4px; font-size: 1.1rem }
.pw-toggle:hover { color: var(--color-text) }
.error-msg { padding: 10px 14px; background: rgba(220,107,107,0.08); border: 1px solid rgba(220,107,107,0.2); border-radius: 8px; color: #dc6b6b; font-size: 0.84rem }
.submit-btn { height: 48px; border: none; border-radius: 10px; background: linear-gradient(135deg, #5B3FE8, #4A2FD0); color: #fff; font-size: 0.95rem; font-weight: 600; cursor: pointer; transition: opacity 0.2s, transform 0.15s }
.submit-btn:hover { opacity: 0.92; transform: translateY(-1px) }
.submit-btn:disabled { opacity: 0.6; cursor: not-allowed }
.divider { display: flex; align-items: center; gap: 16px; margin: 28px 0 }
.divider::before, .divider::after { content: ''; flex: 1; height: 1px; background: var(--color-border-light) }
.divider span { font-size: 0.78rem; color: var(--color-text-muted) }
.register-link { display: block; text-align: center; font-size: 0.88rem; color: var(--color-text-secondary); text-decoration: none; transition: color 0.2s }
.register-link:hover { color: var(--color-accent) }
</style>
