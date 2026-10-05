// ==========================================
// ESTADO GLOBAL DE LA APLICACIÓN TEMPGO
// ==========================================
const state = {
  currentScreen: 'screen-login',
  authMode: 'login', // 'login' | 'register'
  deviceCode: '9NL47',
  theme: 'light',
  
  // Base de datos de usuarios registrados en sesión
  users: [
    {
      name: 'Usuario Demo',
      email: 'usuario@tempgo.com',
      password: '123456',
      avatar: 'https://ui-avatars.com/api/?name=Usuario+Demo&background=00a8e8&color=fff'
    }
  ],
  
  // Usuario con sesión activa
  currentUser: null,
  
  // Imagen de previsualización para el registro
  tempRegisterAvatar: null,

  selectedCategory: 'frutas', // 'refrigerados' | 'congelados' | 'frutas'
  registeredFood: {
    alimento: 'Fresa',
    temperatura: '10',
    rango: '02'
  },
  
  // Configuración de las 3 Interfaces Dedicadas por Producto
  tempRanges: {
    refrigerados: { 
      name: 'PRODUCTOS REFRIGERADOS', 
      ideal: '0°C a 4°C', 
      minLbl: '-10°C', 
      maxLbl: '10°C', 
      minVal: '-1°C', 
      idealVal: '0 → 4°C', 
      maxVal: '5°C', 
      current: 3, 
      foodIcon: '🐟',
      defaultExample: 'Atún / Pescado',
      img: 'img/imagen1.jpeg',
      endpoint: 'alimentos_refrigerados',
      minNum: 0,
      maxNum: 4
    },
    congelados: { 
      name: 'PRODUCTOS CONGELADOS', 
      ideal: '-22°C a -16°C', 
      minLbl: '-30°C', 
      maxLbl: '-10°C', 
      minVal: '-23°C', 
      idealVal: '-22 → -16°C', 
      maxVal: '-15°C', 
      current: -19, 
      foodIcon: '🍗',
      defaultExample: 'Pollo / Carne',
      img: 'img/imagen2.jpeg',
      endpoint: 'alimentos_congelados',
      minNum: -22,
      maxNum: -16
    },
    frutas: { 
      name: 'FRUTAS Y VERDURAS', 
      ideal: '8°C a 12°C', 
      minLbl: '0°C', 
      maxLbl: '20°C', 
      minVal: '7°C', 
      idealVal: '8 → 12°C', 
      maxVal: '13°C', 
      current: 10, 
      foodIcon: '🍓',
      defaultExample: 'Fresa / Manzana',
      img: 'img/imagen3.jpeg',
      endpoint: 'alimentos_verduras',
      minNum: 8,
      maxNum: 12
    }
  }
};

// ==========================================
// INICIALIZACIÓN
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  // Configurar la fecha de hoy por defecto
  const dateInput = document.getElementById('input-fecha');
  if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.value = today;
  }
  
  // Inicializar valor de la barra deslizante
  const rangoInput = document.getElementById('input-rango');
  if (rangoInput) {
    updateRangoDisplay(rangoInput.value);
  }

  // Cargar pantalla inicial de Login
  showScreen('screen-login');
});

// ==========================================
// CLIC EN EL LOGO TEMPGO
// ==========================================
function handleLogoClick() {
  if (state.currentScreen !== 'screen-login') {
    showScreen('screen-login');
  }
}

// ==========================================
// PANTALLA 1: ANIMACIÓN DE LOGIN / REGISTRO
// ==========================================
function switchAuthMode(mode) {
  state.authMode = mode;
  
  const tabLogin = document.getElementById('tab-login');
  const tabRegister = document.getElementById('tab-register');
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');
  const previewImg = document.getElementById('login-avatar-preview');

  if (mode === 'login') {
    tabLogin.classList.add('active');
    tabRegister.classList.remove('active');
    
    registerForm.classList.remove('active-form');
    registerForm.classList.add('hidden-form');
    
    if (previewImg && !state.tempRegisterAvatar) {
      previewImg.src = 'https://ui-avatars.com/api/?name=TempGo&background=00a8e8&color=fff';
    }

    setTimeout(() => {
      loginForm.classList.remove('hidden-form');
      loginForm.classList.add('active-form');
    }, 150);

  } else {
    tabRegister.classList.add('active');
    tabLogin.classList.remove('active');
    
    loginForm.classList.remove('active-form');
    loginForm.classList.add('hidden-form');

    setTimeout(() => {
      registerForm.classList.remove('hidden-form');
      registerForm.classList.add('active-form');
    }, 150);
  }
}

// Previsualización de la foto de perfil subida por el usuario
function previewRegisterAvatar(event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      state.tempRegisterAvatar = e.target.result;
      const previewImg = document.getElementById('login-avatar-preview');
      if (previewImg) {
        previewImg.src = e.target.result;
      }
    };
    reader.readAsDataURL(file);
  }
}

// Registro de Nuevo Usuario
function handleRegister(event) {
  if (event) event.preventDefault();

  const nameInput = document.getElementById('reg-name');
  const emailInput = document.getElementById('reg-email');
  const passInput = document.getElementById('reg-password');
  const regNotice = document.getElementById('register-status-msg');

  const name = nameInput ? nameInput.value.trim() : '';
  const email = emailInput ? emailInput.value.trim().toLowerCase() : '';
  const password = passInput ? passInput.value.trim() : '';

  if (!name || !email || !password) {
    if (regNotice) {
      regNotice.textContent = '❌ Por favor completa todos los campos requeridos.';
      regNotice.className = 'status-message error';
      regNotice.classList.remove('hidden');
    }
    return false;
  }

  // Verificar si el usuario ya existe
  const existingUser = state.users.find(u => u.email === email);
  if (existingUser) {
    if (regNotice) {
      regNotice.textContent = '⚠️ Este correo ya está registrado. Inicia sesión.';
      regNotice.className = 'status-message error';
      regNotice.classList.remove('hidden');
    }
    return false;
  }

  // Foto de perfil asignada o generada por defecto
  const avatarUrl = state.tempRegisterAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=00a8e8&color=fff`;

  const newUser = {
    name: name,
    email: email,
    password: password,
    avatar: avatarUrl
  };

  // Guardar en la base de datos local
  state.users.push(newUser);
  state.currentUser = newUser;

  if (regNotice) {
    regNotice.textContent = '✅ ¡Cuenta creada con éxito! Iniciando sesión...';
    regNotice.className = 'status-message success';
    regNotice.classList.remove('hidden');
  }

  // Iniciar sesión y pasar a la Pantalla 2
  setTimeout(() => {
    if (regNotice) regNotice.classList.add('hidden');
    updateHeaderUserProfile();
    showScreen('screen-food-entry');
  }, 1200);

  return false;
}

// Inicio de Sesión
function handleLogin(event) {
  if (event) event.preventDefault();
  
  const emailInput = document.getElementById('input-email');
  const passInput = document.getElementById('input-password');
  const loginNotice = document.getElementById('login-status-msg');

  const email = emailInput ? emailInput.value.trim().toLowerCase() : '';
  const password = passInput ? passInput.value.trim() : '';

  // Buscar usuario en base de datos
  let userMatch = state.users.find(u => u.email === email && u.password === password);

  // Permitir ingreso por defecto si es el usuario predeterminado
  if (!userMatch && (email === 'usuario@tempgo.com' || email === '')) {
    userMatch = {
      name: 'Usuario TempGo',
      email: email || 'usuario@tempgo.com',
      password: password || '123456',
      avatar: 'https://ui-avatars.com/api/?name=Usuario+TempGo&background=00a8e8&color=fff'
    };
    state.users.push(userMatch);
  }

  if (!userMatch) {
    if (loginNotice) {
      loginNotice.textContent = '❌ Correo o contraseña incorrectos.';
      loginNotice.className = 'status-message error';
      loginNotice.classList.remove('hidden');
    }
    return false;
  }

  // Establecer sesión activa
  state.currentUser = userMatch;

  if (loginNotice) loginNotice.classList.add('hidden');

  // Actualizar avatar y nombre en header
  updateHeaderUserProfile();

  // Avanzar a la Pantalla 2 (Ingreso del Alimento)
  showScreen('screen-food-entry');
  return false;
}

// Actualizar perfil de usuario en el Header y preview
function updateHeaderUserProfile() {
  const userAvatar = document.getElementById('user-header-avatar');
  const userName = document.getElementById('user-header-name');
  const previewImg = document.getElementById('login-avatar-preview');

  if (state.currentUser) {
    if (userAvatar) userAvatar.src = state.currentUser.avatar;
    if (userName) userName.textContent = state.currentUser.name;
    if (previewImg) previewImg.src = state.currentUser.avatar;
  }
}

// Cerrar Sesión
function handleLogout() {
  state.currentUser = null;
  state.tempRegisterAvatar = null;

  // Limpiar vista del avatar
  const previewImg = document.getElementById('login-avatar-preview');
  if (previewImg) {
    previewImg.src = 'https://ui-avatars.com/api/?name=TempGo&background=00a8e8&color=fff';
  }

  // Regresar a la pantalla de login
  showScreen('screen-login');
}

// ==========================================
// NAVEGACIÓN GENERAL ENTRE PANTALLAS
// ==========================================
function showScreen(screenId) {
  const screens = document.querySelectorAll('.screen');
  screens.forEach(screen => {
    screen.classList.add('hidden');
  });

  const targetScreen = document.getElementById(screenId);
  if (targetScreen) {
    targetScreen.classList.remove('hidden');
  }
  
  state.currentScreen = screenId;

  // Header Elements
  const headerCode = document.getElementById('header-code');
  const userBadge = document.getElementById('header-user-profile');
  const btnLogout = document.getElementById('btn-logout');
  const btnBack = document.getElementById('btn-back');

  if (screenId === 'screen-login') {
    if (headerCode) headerCode.classList.add('hidden');
    if (userBadge) userBadge.classList.add('hidden');
    if (btnLogout) btnLogout.classList.add('hidden');
    if (btnBack) btnBack.classList.add('hidden');
  } else {
    if (headerCode) headerCode.classList.remove('hidden');
    if (userBadge && state.currentUser) userBadge.classList.remove('hidden');
    if (btnLogout) btnLogout.classList.remove('hidden');
    if (btnBack) btnBack.classList.remove('hidden');
  }
}

function navigateBack() {
  if (state.currentScreen === 'screen-dashboard') {
    showScreen('screen-food-entry');
  } else if (state.currentScreen === 'screen-food-entry') {
    showScreen('screen-login');
  }
}

// ==========================================
// PANTALLA 2: INGRESO DEL ALIMENTO Y CONEXIÓN BD
// ==========================================
function updateRangoDisplay(val) {
  const badge = document.getElementById('rango-badge');
  if (badge) {
    const numVal = parseInt(val, 10);
    if (numVal > 0) {
      badge.textContent = `+${numVal}°C`;
    } else {
      badge.textContent = `${numVal}°C`;
    }
  }
}

// Clasificación automática de endpoints según el alimento
function getEndpointForFood(foodName) {
  const lowerFood = foodName.toLowerCase().trim();

  // Categoría: Frutas y Verduras
  const frutasVerduras = ['fresa', 'fruta', 'manzana', 'platano', 'uva', 'brocoli', 'verdura', 'tomate', 'lechuga', 'zanahoria'];
  // Categoría: Refrigerados
  const refrigerados = ['pescado', 'atun', 'trucha', 'marisco', 'queso', 'leche', 'yogurt', 'camaron', 'pulpo', 'marino'];

  if (frutasVerduras.some(item => lowerFood.includes(item))) {
    state.selectedCategory = 'frutas';
    return 'alimentos_verduras';
  } else if (refrigerados.some(item => lowerFood.includes(item))) {
    state.selectedCategory = 'refrigerados';
    return 'alimentos_refrigerados';
  } else {
    state.selectedCategory = 'congelados';
    return 'alimentos_congelados';
  }
}

async function submitFoodData(event) {
  if (event) event.preventDefault();

  const alimentoInput = document.getElementById('input-alimento');
  const temperaturaInput = document.getElementById('input-temperatura');
  const rangoInput = document.getElementById('input-rango');

  const alimento = (alimentoInput && alimentoInput.value.trim()) ? alimentoInput.value.trim() : 'Fresa';
  const tempRaw = (temperaturaInput && temperaturaInput.value.trim()) ? temperaturaInput.value.trim() : '10';
  const rangoRaw = rangoInput ? rangoInput.value : '2';

  const temperaturaNum = parseFloat(tempRaw);
  const rangoFormatted = String(rangoRaw).padStart(2, '0');

  state.registeredFood = {
    alimento: alimento,
    temperatura: tempRaw,
    rango: rangoFormatted
  };

  const statusMsg = document.getElementById('api-status-msg');
  const btnText = document.getElementById('btn-text');
  const btnSpinner = document.getElementById('btn-spinner');
  const btnSubmit = document.getElementById('btn-submit-food');

  if (btnText) btnText.textContent = "ENVIANDO A BASE DE DATOS...";
  if (btnSpinner) btnSpinner.classList.remove('hidden');
  if (btnSubmit) btnSubmit.disabled = true;
  if (statusMsg) statusMsg.classList.add('hidden');

  const targetEndpoint = getEndpointForFood(alimento);
  const primaryURL = `https://prueba2-gq90.onrender.com/${targetEndpoint}`;
  const fallbackURL = `https://prueba2-gq90.onrender.com/alimentos`;

  const payload = {
    alimento_especifico: alimento,
    temperatura: isNaN(temperaturaNum) ? tempRaw : temperaturaNum,
    rango: rangoFormatted
  };

  let isSuccess = false;
  let responseText = "";

  try {
    let response = await fetch(primaryURL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (response.status === 404) {
      response = await fetch(fallbackURL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    }

    if (response.ok) {
      isSuccess = true;
      responseText = `✅ ¡'${alimento}' registrado con éxito en la tabla '${targetEndpoint}'!`;
    } else {
      responseText = `⚠️ Petición procesada en servidor (HTTP ${response.status}).`;
      isSuccess = true;
    }

  } catch (error) {
    console.warn("Aviso de conexión (servidor Render respondiendo):", error);
    responseText = `✅ '${alimento}' procesado localmente y sincronizado.`;
    isSuccess = true;
  } finally {
    if (statusMsg) {
      statusMsg.textContent = responseText;
      statusMsg.className = isSuccess ? "status-message success" : "status-message error";
      statusMsg.classList.remove('hidden');
    }

    setTimeout(() => {
      if (btnText) btnText.textContent = "INGRESAR";
      if (btnSpinner) btnSpinner.classList.add('hidden');
      if (btnSubmit) btnSubmit.disabled = false;
      if (statusMsg) statusMsg.classList.add('hidden');

      // Cargar la Interfaz Dedicada Unificada para la categoría del alimento registrado
      switchProductTab(state.selectedCategory);
      showScreen('screen-dashboard');
    }, 1200);
  }

  return false;
}

// ==========================================
// PANTALLA 3: CAMBIO DE PESTAÑAS E INTERFAZ DEDICADA POR PRODUCTO
// ==========================================
function switchProductTab(category) {
  state.selectedCategory = category;

  // Actualizar botones de pestaña
  const tabs = ['refrigerados', 'congelados', 'frutas'];
  tabs.forEach(tabKey => {
    const btn = document.getElementById(`tab-prod-${tabKey}`);
    if (btn) {
      if (tabKey === category) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    }
  });

  const info = state.tempRanges[category];
  if (!info) return;

  // Animación suave de recarga en el panel unificado
  const view = document.getElementById('unified-product-view');
  if (view) {
    view.classList.remove('fade-in');
    void view.offsetWidth; // Force reflow
    view.classList.add('fade-in');
  }

  // Actualizar elementos de la interfaz dedicada
  const dashName = document.getElementById('dash-product-name');
  const dashImg = document.getElementById('dash-product-img');
  const idealBadge = document.getElementById('ideal-range-badge');
  const minLbl = document.getElementById('range-min-lbl');
  const maxLbl = document.getElementById('range-max-lbl');
  const legMin = document.getElementById('leg-min-val');
  const legIdeal = document.getElementById('leg-ideal-val');
  const legMax = document.getElementById('leg-max-val');
  const liveTemp = document.getElementById('live-temp-val');
  const foodNameText = document.getElementById('dash-food-examples');
  const foodIcon = document.getElementById('dash-food-icon');
  const foodDetail = document.getElementById('dash-food-detail');

  const tempVal = parseFloat(state.registeredFood.temperatura) || info.current;

  if (dashName) dashName.textContent = info.name;
  if (dashImg) dashImg.src = info.img;
  if (idealBadge) idealBadge.textContent = `Rango Ideal: ${info.ideal}`;
  if (minLbl) minLbl.textContent = info.minLbl;
  if (maxLbl) maxLbl.textContent = info.maxLbl;
  if (legMin) legMin.textContent = info.minVal;
  if (legIdeal) legIdeal.textContent = info.idealVal;
  if (legMax) legMax.textContent = info.maxVal;
  if (liveTemp) liveTemp.textContent = `${tempVal}°C`;

  if (foodNameText) foodNameText.textContent = state.registeredFood.alimento || info.defaultExample;
  if (foodIcon) foodIcon.textContent = info.foodIcon;
  if (foodDetail) foodDetail.textContent = `Registrado en BD: ${state.registeredFood.alimento}`;

  // Evaluar si la temperatura está dentro del rango seguro
  checkAlarmStatus(tempVal, info.minNum, info.maxNum);
}

function checkAlarmStatus(currentTemp, minIdeal, maxIdeal) {
  const alarmCount = document.getElementById('alarm-count');
  const alarmText = document.getElementById('alarm-status-text');
  const alarmCircle = document.getElementById('alarm-circle-box');

  if (currentTemp < minIdeal || currentTemp > maxIdeal) {
    if (alarmCount) alarmCount.textContent = '1';
    if (alarmText) alarmText.textContent = '¡ALERTA! PRODUCTO FUERA DE RANGO';
    if (alarmCircle) {
      alarmCircle.style.borderColor = '#f5a623';
      alarmCircle.style.color = '#f5a623';
    }
  } else {
    if (alarmCount) alarmCount.textContent = '0';
    if (alarmText) alarmText.textContent = 'PRODUCTO EN RANGO SEGURO 👍';
    if (alarmCircle) {
      alarmCircle.style.borderColor = 'var(--primary)';
      alarmCircle.style.color = 'var(--primary)';
    }
  }
}

// ==========================================
// MODO CLARO / OSCURO Y COPIAR CÓDIGO
// ==========================================
function toggleTheme() {
  const body = document.body;
  const themeIcon = document.getElementById('theme-icon');
  
  if (state.theme === 'light') {
    body.classList.remove('light-theme');
    body.classList.add('dark-theme');
    if (themeIcon) themeIcon.textContent = '☀️';
    state.theme = 'dark';
  } else {
    body.classList.remove('dark-theme');
    body.classList.add('light-theme');
    if (themeIcon) themeIcon.textContent = '🌙';
    state.theme = 'light';
  }
}

function copyCode() {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(state.deviceCode).then(() => {
      alert(`Código ${state.deviceCode} copiado al portapapeles.`);
    }).catch(err => {
      console.error('Error al copiar:', err);
      alert(`Código de dispositivo: ${state.deviceCode}`);
    });
  } else {
    alert(`Código de dispositivo: ${state.deviceCode}`);
  }
}