// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  onSnapshot,
  query,
  orderBy,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDzWkndMjgF-cdi8Pb2gZiGOcv-IJj1rQI",
  authDomain: "watch-notes-afaff.firebaseapp.com",
  projectId: "watch-notes-afaff",
  storageBucket: "watch-notes-afaff.firebasestorage.app",
  messagingSenderId: "957776348633",
  appId: "1:957776348633:web:d3d09846f51ef9d38045c8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ============================================
// АДМИНКА (admin.html) - отправка постов
// ============================================
const postBtn = document.getElementById('postBtn');
const textInput = document.getElementById('textInput');
const status = document.getElementById('status');

if (postBtn && textInput) {
  postBtn.addEventListener('click', async () => {
    const text = textInput.value.trim();
    
    if (!text) {
      status.textContent = '⚠️ Введи текст!';
      return;
    }
    
    try {
      status.textContent = '⏳ Публикация...';
      
      await addDoc(collection(db, 'posts'), {
        text: text,
        timestamp: serverTimestamp()
      });
      
      textInput.value = '';
      status.textContent = '✅ Опубликовано!';
      
      setTimeout(() => {
        status.textContent = '';
      }, 2000);
      
    } catch (error) {
      console.error('Error:', error);
      status.textContent = '❌ Ошибка: ' + error.message;
    }
  });
}

// ============================================
// ЧАСЫ (index.html) - чтение постов
// ============================================
const postsContainer = document.getElementById('posts');

if (postsContainer) {
  const q = query(collection(db, 'posts'), orderBy('timestamp', 'desc'));
  
  onSnapshot(q, (snapshot) => {
    postsContainer.innerHTML = '';
    
    if (snapshot.empty) {
      postsContainer.innerHTML = '<div style="color: #666;">Пока нет постов</div>';
      return;
    }
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      const postDiv = document.createElement('div');
      postDiv.className = 'post';
      
      // Форматируем время
      let timeStr = '';
      if (data.timestamp) {
        const date = data.timestamp.toDate();
        timeStr = date.toLocaleTimeString('ru-RU', { 
          hour: '2-digit', 
          minute: '2-digit' 
        });
      }
      
      postDiv.innerHTML = `
        <div class="time">${timeStr}</div>
        <div>${data.text}</div>
      `;
      
      postsContainer.appendChild(postDiv);
    });
  });
}