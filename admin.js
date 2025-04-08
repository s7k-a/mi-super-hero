// Функция для получения списка пользователей
async function fetchUsers() {
    try {
        const response = await fetch('/api/users');
        if (!response.ok) {
            throw new Error('Ошибка при получении данных');
        }
        const users = await response.json();
        displayUsers(users);
    } catch (error) {
        showMessage(error.message, 'error');
    }
}

// Функция для загрузки пользователей
async function uploadUsers(file) {
    try {
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await fetch('/api/upload-users', {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Ошибка при загрузке файла');
        }
        
        const result = await response.json();
        showMessage(result.message, 'success');
        document.getElementById('updateBtn').style.display = 'block';
    } catch (error) {
        showMessage(error.message, 'error');
    }
}

// Функция для отображения сообщений
function showMessage(message, type) {
    const statusEl = document.getElementById('status');
    if (!statusEl) return;
    
    statusEl.textContent = message;
    statusEl.className = `status ${type}`;
    
    setTimeout(() => {
        statusEl.textContent = '';
        statusEl.className = 'status';
    }, 3000);
}

// Функция для отображения пользователей в таблице
function displayUsers(users) {
    const tbody = document.querySelector('#userTable tbody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    users.forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${user.login}</td>
            <td>${user.name}</td>
            <td>${user.position}</td>
            <td>${user.store}</td>
        `;
        tbody.appendChild(row);
    });
}

// Обработчики событий
document.addEventListener('DOMContentLoaded', () => {
    // Загружаем список пользователей при загрузке страницы
    fetchUsers();
    
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const updateBtn = document.getElementById('updateBtn');
    
    // Обработка drag & drop
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
    });
    
    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('dragover');
    });
    
    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFileUpload(files[0]);
        }
    });
    
    // Обработчик изменения файла через input
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFileUpload(e.target.files[0]);
        }
    });
    
    // Обработчик кнопки обновления
    updateBtn.addEventListener('click', () => {
        fetchUsers();
        updateBtn.style.display = 'none';
    });

    document.getElementById('logoutBtn').addEventListener('click', () => {
        window.location.href = '/';
    });
});

// Функция для обработки загрузки файла
function handleFileUpload(file) {
    if (!file.name.endsWith('.xlsx')) {
        showMessage('Пожалуйста, загрузите файл Excel (.xlsx)', 'error');
        return;
    }
    
    uploadUsers(file);
} 