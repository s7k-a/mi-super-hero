// Проверка авторизации при загрузке страницы
document.addEventListener('DOMContentLoaded', async () => {
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
        try {
            const user = JSON.parse(currentUser);
            await showUserProfile(user);
            document.getElementById('logoutBtn').style.display = 'block';
        } catch (e) {
            console.error('Ошибка при загрузке профиля:', e);
            localStorage.removeItem('currentUser');
 