// Configurações e constantes
const TEACHER_DOMAINS = ['escola.edu.br', 'professor.br', 'educacao.gov.br', 'seduc.br'];
const TEACHER_KEYWORDS = ['professor', 'prof', 'docente', 'teacher', 'educador'];

// Função principal para verificar autenticação do professor
function checkTeacherAuth() {
    try {
        // Obter email do usuário armazenado
        const userEmail = getUserEmail();
        
        // Verificar se o usuário está logado
        if (!userEmail) {
            redirectToLogin('Você precisa fazer login para acessar esta área.');
            return false;
        }
        
        // Verificar se é um professor
        if (!isTeacherEmail(userEmail)) {
            redirectToLogin('Acesso negado. Esta área é restrita para professores.');
            return false;
        }
        
        // Configurar interface do professor
        setupTeacherInterface(userEmail);
        return true;
        
    } catch (error) {
        console.error('Erro na verificação de autenticação:', error);
        redirectToLogin('Erro na verificação de autenticação.');
        return false;
    }
}

// Obter email do usuário dos diferentes storages
function getUserEmail() {
    return localStorage.getItem('userEmail') || 
           sessionStorage.getItem('userEmail') ||
           localStorage.getItem('teacherEmail') ||
           sessionStorage.getItem('teacherEmail');
}

// Verificar se o email é de um professor
function isTeacherEmail(email) {
    if (!email || typeof email !== 'string') {
        return false;
    }
    
    const emailLower = email.toLowerCase();
    
    // Verificar domínios específicos para professores
    const hasDomain = TEACHER_DOMAINS.some(domain => emailLower.endsWith(domain));
    if (hasDomain) return true;
    
    // Verificar palavras-chave no email
    const hasKeyword = TEACHER_KEYWORDS.some(keyword => emailLower.includes(keyword));
    if (hasKeyword) return true;
    
    // Verificar padrões específicos
    // Exemplo: prof.nome@escola.com.br
    if (emailLower.includes('prof.') || emailLower.includes('.prof')) return true;
    
    // Lista de emails específicos de professores (pode ser expandida)
    const specificTeacherEmails = [
        'coordenacao@',
        'direcao@',
        'pedagogia@'
    ];
    
    const hasSpecificPattern = specificTeacherEmails.some(pattern => emailLower.includes(pattern));
    if (hasSpecificPattern) return true;
    
    return false;
}

// Extrair nome do professor do email
function extractTeacherName(email) {
    try {
        // Remover domínio do email
        const localPart = email.split('@')[0];
        
        // Remover números e caracteres especiais
        let name = localPart.replace(/[0-9._-]/g, ' ');
        
        // Remover palavras comuns como 'prof', 'professor', etc.
        name = name.replace(/\b(prof|professor|docente|teacher)\b/gi, '');
        
        // Limpar espaços extras
        name = name.trim().replace(/\s+/g, ' ');
        
        // Capitalizar primeira letra de cada palavra
        name = name.split(' ')
                   .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                   .join(' ');
        
        // Se o nome estiver vazio ou muito curto, usar parte do email
        if (!name || name.length < 2) {
            name = localPart.charAt(0).toUpperCase() + localPart.slice(1);
        }
        
        return name || 'Professor';
        
    } catch (error) {
        console.error('Erro ao extrair nome do professor:', error);
        return 'Professor';
    }
}

// Configurar interface para o professor
function setupTeacherInterface(userEmail) {
    try {
        // Exibir nome do professor
        const teacherName = extractTeacherName(userEmail);
        const teacherNameElement = document.getElementById('teacherName');
        
        if (teacherNameElement) {
            teacherNameElement.textContent = teacherName;
        }
        
        // Salvar informações do professor
        saveTeacherInfo(userEmail, teacherName);
        
        // Configurar eventos adicionais se necessário
        setupAdditionalEvents();
        
    } catch (error) {
        console.error('Erro ao configurar interface do professor:', error);
    }
}

// Salvar informações do professor
function saveTeacherInfo(email, name) {
    try {
        const teacherInfo = {
            email: email,
            name: name,
            loginTime: new Date().toISOString(),
            userType: 'professor'
        };
        
        // Salvar no localStorage para persistência
        localStorage.setItem('teacherInfo', JSON.stringify(teacherInfo));
        localStorage.setItem('userType', 'professor');
        
    } catch (error) {
        console.error('Erro ao salvar informações do professor:', error);
    }
}

// Redirecionar para login com mensagem
function redirectToLogin(message) {
    if (message) {
        alert(message);
    }
    window.location.href = 'login.html';
}

// Função de logout
function logout() {
    try {
        const confirmLogout = confirm('Tem certeza que deseja sair?');
        
        if (confirmLogout) {
            // Limpar todos os dados armazenados
            clearStorageData();
            
            // Redirecionar para página de login
            window.location.href = 'login.html';
        }
        
    } catch (error) {
        console.error('Erro durante logout:', error);
        // Forçar limpeza e redirecionamento em caso de erro
        clearStorageData();
        window.location.href = 'login.html';
    }
}

// Limpar dados de armazenamento
function clearStorageData() {
    // Lista de chaves para limpar
    const keysToRemove = [
        'userEmail',
        'teacherEmail',
        'userType',
        'teacherInfo',
        'loginTime',
        'authToken'
    ];
    
    // Limpar localStorage
    keysToRemove.forEach(key => {
        localStorage.removeItem(key);
        sessionStorage.removeItem(key);
    });
}

// Configurar eventos adicionais
function setupAdditionalEvents() {
    // Verificar periodicamente se o usuário ainda está autenticado
    setInterval(checkAuthStatus, 300000); // Verificar a cada 5 minutos
    
    // Adicionar listener para quando a página perde o foco
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Adicionar listeners para teclas de atalho
    document.addEventListener('keydown', handleKeyboardShortcuts);
}

// Verificar status de autenticação periodicamente
function checkAuthStatus() {
    const userEmail = getUserEmail();
    if (!userEmail || !isTeacherEmail(userEmail)) {
        logout();
    }
}

// Manipular mudanças de visibilidade da página
function handleVisibilityChange() {
    if (document.visibilityState === 'visible') {
        // Verificar autenticação quando a página volta a ficar visível
        checkAuthStatus();
    }
}

// Manipular atalhos de teclado
function handleKeyboardShortcuts(event) {
    // Ctrl + L para logout rápido
    if (event.ctrlKey && event.key === 'l') {
        event.preventDefault();
        logout();
    }
    
    // Ctrl + H para voltar ao painel principal
    if (event.ctrlKey && event.key === 'h') {
        event.preventDefault();
        window.location.href = 'painel-professor.html';
    }
}

// Função para obter informações do professor
function getTeacherInfo() {
    try {
        const teacherInfoStr = localStorage.getItem('teacherInfo');
        return teacherInfoStr ? JSON.parse(teacherInfoStr) : null;
    } catch (error) {
        console.error('Erro ao obter informações do professor:', error);
        return null;
    }
}

// Função para validar sessão
function validateSession() {
    const teacherInfo = getTeacherInfo();
    
    if (!teacherInfo) {
        return false;
    }
    
    // Verificar se a sessão não expirou (exemplo: 8 horas)
    const loginTime = new Date(teacherInfo.loginTime);
    const currentTime = new Date();
    const timeDiff = currentTime - loginTime;
    const maxSessionTime = 8 * 60 * 60 * 1000; // 8 horas em millisegundos
    
    if (timeDiff > maxSessionTime) {
        clearStorageData();
        return false;
    }
    
    return true;
}

// Função para mostrar notificações
function showNotification(message, type = 'info') {
    // Criar elemento de notificação
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Estilizar notificação
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 10px;
        color: white;
        font-weight: 500;
        z-index: 1000;
        opacity: 0;
        transform: translateX(100%);
        transition: all 0.3s ease;
    `;
    
    // Definir cor baseada no tipo
    switch (type) {
        case 'success':
            notification.style.background = 'linear-gradient(45deg, #4CAF50, #45a049)';
            break;
        case 'error':
            notification.style.background = 'linear-gradient(45deg, #f44336, #da190b)';
            break;
        case 'warning':
            notification.style.background = 'linear-gradient(45deg, #ff9800, #f57c00)';
            break;
        default:
            notification.style.background = 'linear-gradient(45deg, #667eea, #764ba2)';
    }
    
    // Adicionar ao documento
    document.body.appendChild(notification);
    
    // Animar entrada
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remover após 5 segundos
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 5000);
}

// Event listeners principais
document.addEventListener('DOMContentLoaded', function() {
    // Verificar autenticação ao carregar a página
    if (!checkTeacherAuth()) {
        return;
    }
    
    // Validar sessão
    if (!validateSession()) {
        redirectToLogin('Sua sessão expirou. Faça login novamente.');
        return;
    }
    
    // Mostrar notificação de boas-vindas
    const teacherInfo = getTeacherInfo();
    if (teacherInfo) {
        showNotification(`Bem-vindo(a), ${teacherInfo.name}!`, 'success');
    }
});

// Manipular erros globais
window.addEventListener('error', function(event) {
    console.error('Erro global capturado:', event.error);
    showNotification('Ocorreu um erro inesperado. Tente recarregar a página.', 'error');
});

// Verificar se há atualizações da página (Service Worker ou similar)
window.addEventListener('beforeunload', function(event) {
    // Salvar estado antes de sair (se necessário)
    const teacherInfo = getTeacherInfo();
    if (teacherInfo) {
        teacherInfo.lastActivity = new Date().toISOString();
        localStorage.setItem('teacherInfo', JSON.stringify(teacherInfo));
    }
});

// Exportar funções principais para uso em outras páginas (se necessário)
window.TeacherAuth = {
    checkTeacherAuth,
    isTeacherEmail,
    getTeacherInfo,
    validateSession,
    logout,
    showNotification
};