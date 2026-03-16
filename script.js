// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  deleteDoc,
  doc,
  getDocs
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
const titleInput = document.getElementById('titleInput');
const textInput = document.getElementById('textInput');
const status = document.getElementById('status');
const clearBtn = document.getElementById('clearBtn');

// Публикация поста
if (postBtn) {
  postBtn.addEventListener('click', async () => {
    const title = titleInput ? titleInput.value.trim() : '';
    const text = textInput.value.trim();
    
    if (!text) {
      status.textContent = '⚠️ Введи текст!';
      return;
    }
    
    try {
      status.textContent = '⏳ Публикация...';
      
      await addDoc(collection(db, 'posts'), {
        title: title,
        text: text,
        timestamp: serverTimestamp()
      });
      
      // Очистка полей
      if (titleInput) titleInput.value = '';
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

// Очистка всех постов
if (clearBtn) {
  clearBtn.addEventListener('click', async () => {
    const confirmClear = confirm('⚠️ Ты уверен, что хочешь удалить ВСЕ посты? Это действие нельзя отменить!');
    
    if (!confirmClear) return;
    
    try {
      status.textContent = '⏳ Удаление...';
      
      const snapshot = await getDocs(collection(db, 'posts'));
      const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);
      
      status.textContent = '✅ Все посты удалены!';
      
      setTimeout(() => {
        status.textContent = '';
      }, 3000);
      
    } catch (error) {
      console.error('Error:', error);
      status.textContent = '❌ Ошибка при удалении: ' + error.message;
    }
  });
}

// ============================================
// ЧАСЫ (index.html) - чтение постов
// ============================================
const postsContainer = document.getElementById('posts');
const fullScreenModal = document.getElementById('fullScreenModal');
const fullScreenTitle = document.getElementById('fullScreenTitle');
const fullScreenText = document.getElementById('fullScreenText');
const fullScreenTime = document.getElementById('fullScreenTime');
const closeBtn = document.getElementById('closeBtn');

// Закрытие модального окна
function closeModal() {
  if (fullScreenModal) {
    fullScreenModal.style.display = 'none';
  }
}

if (closeBtn) {
  closeBtn.addEventListener('click', closeModal);
}

// Закрытие по клику вне контента
if (fullScreenModal) {
  fullScreenModal.addEventListener('click', (e) => {
    if (e.target === fullScreenModal) {
      closeModal();
    }
  });
}

// Закрытие по кнопке назад (для часов)
if (fullScreenModal) {
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' || e.key === 'Backspace') {
      closeModal();
    }
  });
}

// Отображение постов
if (postsContainer) {
  const q = query(collection(db, 'posts'), orderBy('timestamp', 'desc'));
  
  onSnapshot(q, (snapshot) => {
    postsContainer.innerHTML = '';
    
    if (snapshot.empty) {
      postsContainer.innerHTML = '<div style="color: #666; text-align: center; padding: 20px;">Пока нет постов</div>';
      return;
    }
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      const postDiv = document.createElement('div');
      postDiv.className = 'post';
      postDiv.style.cursor = 'pointer';
      
      // Форматируем время
      let timeStr = '';
      if (data.timestamp) {
        const date = data.timestamp.toDate();
        timeStr = date.toLocaleTimeString('ru-RU', { 
          hour: '2-digit', 
          minute: '2-digit' 
        });
      }
      
      // Показываем заголовок или превью текста
      const displayTitle = data.title || 'Без заголовка';
      
      postDiv.innerHTML = `
        <div class="time">${timeStr}</div>
        <div class="post-title">${displayTitle}</div>
      `;
      
      // Открытие полного текста при клике
      postDiv.addEventListener('click', () => {
        if (fullScreenModal) {
          fullScreenTime.textContent = timeStr;
          fullScreenTitle.textContent = displayTitle;
          fullScreenText.textContent = data.text || '';
          fullScreenModal.style.display = 'flex';
        }
      });
      
      postsContainer.appendChild(postDiv);
    });
  });
}
