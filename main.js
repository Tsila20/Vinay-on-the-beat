import { Capacitor } from '@capacitor/core';
import { SplashScreen } from '@capacitor/splash-screen';
import {
  initializeApp
} from 'firebase/app';
import {
  getAuth,
  signInAnonymously,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  where
} from 'firebase/firestore';
import './style.css';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || '';

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const state = {
  user: null,
  publicSettings: {
    storeName: 'Vinay On The Beat',
    heroText: 'Premium beats, instruments, and direct chat with the producer.',
    whatsappNumber: '261387527591',
    facebookUrl: 'https://www.facebook.com/profile.php?id=61576525058832'
  },
  selectedConversationId: null
};

document.querySelector('#app').innerHTML = `
  <div class="topbar">
    <div class="container topbar-inner row-between">
      <div class="brand">
        <div class="brand-badge">V</div>
        <div>
          <h1 id="storeName">Vinay On The Beat</h1>
          <p>AFRO | TRAP | DRILL</p>
        </div>
      </div>
      <div class="nav-actions">
        <a class="btn btn-secondary" id="facebookBtn" target="_blank">Facebook</a>
        <a class="btn" id="whatsappBtn" target="_blank">WhatsApp</a>
      </div>
    </div>
  </div>

  <main>
    <section class="hero">
      <div class="container hero-grid">
        <div class="hero-card">
          <div class="small-badges">
            <span class="small-badge">Firebase Stable Chat</span>
            <span class="small-badge">Android Release Ready</span>
            <span class="small-badge">Installable App</span>
          </div>
          <h2>Vinay On The Beat</h2>
          <p id="heroText"></p>
          <div class="nav-actions" style="margin-top:18px">
            <button class="btn" id="openChatBtn">Open chat</button>
            <button class="btn btn-secondary" id="openAdminBtn">Admin</button>
          </div>
        </div>
        <div class="hero-card logo-orb">
          <img src="/branding/app-icon-1024.png" class="hero-logo" alt="Vinay logo"/>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <h3>Catalogue</h3>
        <div id="products" class="product-grid"></div>
      </div>
    </section>

    <section class="section" id="chatSection">
      <div class="container">
        <h3>Client chat</h3>
        <div class="chat-layout one-col">
          <div class="chat-box">
            <div class="chat-header">
              <input class="field" id="clientName" placeholder="Votre nom"/>
            </div>
            <div class="chat-messages" id="clientMessages"></div>
            <div class="chat-footer">
              <input class="field" id="clientMessageInput" placeholder="Écrire un message..." />
              <button class="btn" id="clientSendBtn">Send</button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="section" id="adminSection" style="display:none">
      <div class="container admin-grid">
        <div class="stack">
          <section class="card">
            <h4>Admin login</h4>
            <input class="field" id="adminEmail" type="email" placeholder="Admin email" />
            <input class="field" id="adminPassword" type="password" placeholder="Admin password" style="margin-top:10px"/>
            <button class="btn" id="adminLoginBtn" style="margin-top:10px">Login</button>
            <button class="btn btn-secondary" id="adminLogoutBtn" style="margin-top:10px">Logout</button>
          </section>

          <section class="card">
            <h4>Add product</h4>
            <input class="field" id="pTitle" placeholder="Title" />
            <input class="field" id="pPrice" placeholder="Price" style="margin-top:10px"/>
            <input class="field" id="pCategory" placeholder="Category" style="margin-top:10px"/>
            <input class="field" id="pImage" placeholder="Image URL" style="margin-top:10px"/>
            <input class="field" id="pDownload" placeholder="Download URL" style="margin-top:10px"/>
            <textarea class="field" id="pDescription" placeholder="Description" style="margin-top:10px"></textarea>
            <button class="btn" id="addProductBtn" style="margin-top:10px">Save product</button>
          </section>
        </div>

        <div class="stack">
          <section class="card">
            <h4>Conversations</h4>
            <div class="chat-layout">
              <aside class="chat-sidebar">
                <div id="conversationList" class="conversation-list"></div>
              </aside>
              <div class="chat-box">
                <div class="chat-header">
                  <strong id="adminConvTitle">Select a conversation</strong>
                </div>
                <div class="chat-messages" id="adminMessages"></div>
                <div class="chat-footer">
                  <input class="field" id="adminMessageInput" placeholder="Reply..." />
                  <button class="btn" id="adminSendBtn">Send</button>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </section>
  </main>
`);

function el(id) { return document.getElementById(id); }
function formatTime(ts) {
  try { return ts?.toDate ? ts.toDate().toLocaleString() : new Date(ts).toLocaleString(); }
  catch { return ''; }
}
function safe(text) {
  return String(text || '').replace(/[<>&]/g, s => ({'<':'&lt;','>':'&gt;','&':'&amp;'}[s]));
}

async function loadSettings() {
  const snap = await getDoc(doc(db, 'settings', 'public'));
  if (snap.exists()) state.publicSettings = { ...state.publicSettings, ...snap.data() };
  el('storeName').textContent = state.publicSettings.storeName;
  el('heroText').textContent = state.publicSettings.heroText;
  el('facebookBtn').href = state.publicSettings.facebookUrl;
  el('whatsappBtn').href = `https://wa.me/${state.publicSettings.whatsappNumber}`;
}

async function ensureAnon() {
  if (!auth.currentUser) await signInAnonymously(auth);
}

async function ensureClientConversation() {
  await ensureAnon();
  const key = 'vinay_conv_id';
  let id = localStorage.getItem(key);
  if (!id) {
    const ref = doc(collection(db, 'conversations'));
    id = ref.id;
    await setDoc(ref, {
      clientName: '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      lastMessage: '',
      ownerUid: auth.currentUser.uid
    });
    localStorage.setItem(key, id);
  }
  state.selectedConversationId = id;
  subscribeClientMessages(id);
}

function renderProducts(list) {
  const root = el('products');
  root.innerHTML = '';
  list.forEach(p => {
    const card = document.createElement('article');
    card.className = 'product-card';
    card.innerHTML = `
      <img src="${p.image || '/branding/app-icon-1024.png'}" alt="${safe(p.title)}">
      <div class="product-content">
        <div class="muted">${safe(p.category || '')}</div>
        <h4 style="margin:0">${safe(p.title || '')}</h4>
        <div class="price">${safe(p.price || '')}</div>
        <div class="muted">${safe(p.description || '')}</div>
        <div class="nav-actions">
          <a class="btn" href="${p.downloadUrl || '#'}" target="_blank">Open</a>
        </div>
      </div>
    `;
    root.appendChild(card);
  });
}

function subscribeProducts() {
  const qy = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
  onSnapshot(qy, (snap) => {
    renderProducts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  });
}

function subscribeClientMessages(conversationId) {
  const qy = query(collection(db, 'conversations', conversationId, 'messages'), orderBy('createdAt', 'asc'));
  onSnapshot(qy, (snap) => {
    const box = el('clientMessages');
    box.innerHTML = '';
    snap.forEach(d => {
      const m = d.data();
      const div = document.createElement('div');
      div.className = `message ${m.sender === 'admin' ? 'admin' : 'client'}`;
      div.innerHTML = `<div>${safe(m.text)}</div><small>${formatTime(m.createdAt)}</small>`;
      box.appendChild(div);
    });
    box.scrollTop = box.scrollHeight;
  });
}

async function sendClientMessage() {
  const input = el('clientMessageInput');
  const name = el('clientName').value.trim() || 'Client';
  const text = input.value.trim();
  if (!text || !state.selectedConversationId) return;
  await updateDoc(doc(db, 'conversations', state.selectedConversationId), {
    clientName: name,
    updatedAt: serverTimestamp(),
    lastMessage: text
  });
  await addDoc(collection(db, 'conversations', state.selectedConversationId, 'messages'), {
    conversationId: state.selectedConversationId,
    sender: 'client',
    text,
    createdAt: serverTimestamp()
  });
  input.value = '';
}

async function adminLogin() {
  const email = el('adminEmail').value.trim();
  const password = el('adminPassword').value;
  await signInWithEmailAndPassword(auth, email, password);
}

async function adminLogout() {
  await signOut(auth);
  await ensureAnon();
}

async function addProduct() {
  if (!auth.currentUser || auth.currentUser.isAnonymous) {
    alert('Admin login required');
    return;
  }
  await addDoc(collection(db, 'products'), {
    title: el('pTitle').value.trim(),
    price: el('pPrice').value.trim(),
    category: el('pCategory').value.trim(),
    image: el('pImage').value.trim() || '/branding/app-icon-1024.png',
    downloadUrl: el('pDownload').value.trim() || '#',
    description: el('pDescription').value.trim(),
    createdAt: serverTimestamp()
  });
  ['pTitle','pPrice','pCategory','pImage','pDownload','pDescription'].forEach(id => el(id).value = '');
}

function subscribeConversations() {
  const qy = query(collection(db, 'conversations'), orderBy('updatedAt', 'desc'));
  onSnapshot(qy, (snap) => {
    const root = el('conversationList');
    root.innerHTML = '';
    snap.forEach(d => {
      const c = { id: d.id, ...d.data() };
      const item = document.createElement('div');
      item.className = 'conversation-item' + (state.selectedConversationId === c.id ? ' active' : '');
      item.innerHTML = `<strong>${safe(c.clientName || 'Client')}</strong><div class="muted">${safe(c.lastMessage || '')}</div>`;
      item.onclick = () => {
        state.selectedConversationId = c.id;
        el('adminConvTitle').textContent = c.clientName || 'Client';
        subscribeAdminMessages(c.id);
      };
      root.appendChild(item);
    });
  });
}

function subscribeAdminMessages(conversationId) {
  const qy = query(collection(db, 'conversations', conversationId, 'messages'), orderBy('createdAt', 'asc'));
  onSnapshot(qy, (snap) => {
    const box = el('adminMessages');
    box.innerHTML = '';
    snap.forEach(d => {
      const m = d.data();
      const div = document.createElement('div');
      div.className = `message ${m.sender === 'admin' ? 'admin' : 'client'}`;
      div.innerHTML = `<div>${safe(m.text)}</div><small>${formatTime(m.createdAt)}</small>`;
      box.appendChild(div);
    });
    box.scrollTop = box.scrollHeight;
  });
}

async function sendAdminMessage() {
  const input = el('adminMessageInput');
  const text = input.value.trim();
  if (!text || !state.selectedConversationId) return;
  await updateDoc(doc(db, 'conversations', state.selectedConversationId), {
    updatedAt: serverTimestamp(),
    lastMessage: text
  });
  await addDoc(collection(db, 'conversations', state.selectedConversationId, 'messages'), {
    conversationId: state.selectedConversationId,
    sender: 'admin',
    text,
    createdAt: serverTimestamp()
  });
  input.value = '';
}

function initUi() {
  el('openChatBtn').onclick = () => document.getElementById('chatSection').scrollIntoView({ behavior: 'smooth' });
  el('openAdminBtn').onclick = () => {
    const sec = el('adminSection');
    sec.style.display = sec.style.display === 'none' ? 'block' : 'none';
    sec.scrollIntoView({ behavior: 'smooth' });
  };
  el('clientSendBtn').onclick = sendClientMessage;
  el('clientMessageInput').addEventListener('keydown', e => e.key === 'Enter' && sendClientMessage());
  el('adminLoginBtn').onclick = async () => {
    try { await adminLogin(); alert('Admin connected'); }
    catch (e) { alert(e.message); }
  };
  el('adminLogoutBtn').onclick = async () => {
    await adminLogout();
    alert('Logged out');
  };
  el('addProductBtn').onclick = async () => {
    try { await addProduct(); alert('Product saved'); }
    catch (e) { alert(e.message); }
  };
  el('adminSendBtn').onclick = sendAdminMessage;
  el('adminMessageInput').addEventListener('keydown', e => e.key === 'Enter' && sendAdminMessage());
}

onAuthStateChanged(auth, async (user) => {
  state.user = user;
  if (!user) await ensureAnon();
  const isAdmin = !!(user && !user.isAnonymous && user.email && user.email === ADMIN_EMAIL);
  if (isAdmin) {
    subscribeConversations();
  }
});

await loadSettings();
await ensureClientConversation();
subscribeProducts();
initUi();

if (Capacitor.getPlatform() !== 'web') {
  try { await SplashScreen.hide(); } catch {}
}
