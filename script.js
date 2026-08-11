// Fluid Attendant Standalone Login Screen Core Script

function handleLogin() {
  const email = document.getElementById('email-input').value;
  showToast(`🎉 로그인 성공! 환영합니다 (${email})`);
}

function handleSocialLogin(provider) {
  showToast(`🎉 ${provider} 계정으로 로그인 성공!`);
}

function showToast(message) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `
    <span class="material-symbols-outlined" style="font-size: 20px;">info</span>
    <span>${message}</span>
  `;

  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}
