// Electron'un uygulama penceresini ve IPC sistemini içe aktarır.
const { app, BrowserWindow, ipcMain } = require('electron');

// Dosya yollarını güvenli biçimde oluşturmak için kullanılır.
const path = require('node:path');

// Windows komutlarını shell açmadan çalıştırmamızı sağlar.
const { execFile } = require('node:child_process');

// Callback tabanlı execFile fonksiyonunu async/await ile kullanırız.
const { promisify } = require('node:util');
const runCommand = promisify(execFile);

// Windows'un mevcut kullanıcıya ait tema ayarlarının kayıt yolu.
const themeKey =
  'HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Themes\\Personalize';

// Windows kayıt defterindeki bir tema değerini okur.
async function readThemeValue(name) {
  const { stdout } = await runCommand('reg.exe', [
    'query', themeKey, '/v', name
  ]);

  // REG_DWORD değerindeki 0x0 veya 0x1 bilgisini bulur.
  const match = stdout.match(/REG_DWORD\s+0x([0-9a-f]+)/i);

  if (!match) throw new Error(`Could not read ${name}`);

  return parseInt(match[1], 16);
}

// Windows'un mevcut temasını öğrenir.
async function getWindowsTheme() {
  const apps = await readThemeValue('AppsUseLightTheme');
  const system = await readThemeValue('SystemUsesLightTheme');

  // İki değer de 0 ise koyu tema aktiftir.
  return apps === 0 && system === 0 ? 'dark' : 'light';
}

// Windows'un iki tema değerini birlikte değiştirir.
async function setWindowsTheme(theme) {
  // Yalnızca dark veya light kabul edilir.
  if (theme !== 'dark' && theme !== 'light') {
    throw new Error('Invalid theme');
  }

  const value = theme === 'dark' ? '0' : '1';

  // Uygulamaların temasını değiştirir.
  await runCommand('reg.exe', [
    'add', themeKey, '/v', 'AppsUseLightTheme',
    '/t', 'REG_DWORD', '/d', value, '/f'
  ]);

  // Windows sistem arayüzünün temasını değiştirir.
  await runCommand('reg.exe', [
    'add', themeKey, '/v', 'SystemUsesLightTheme',
    '/t', 'REG_DWORD', '/d', value, '/f'
  ]);

  return getWindowsTheme();
}

// React arayüzünün mevcut Windows temasını istemesine izin verir.
ipcMain.handle('theme:get', () => getWindowsTheme());

// React arayüzünün tema değiştirme isteğini karşılar.
ipcMain.handle('theme:set', (_event, theme) => setWindowsTheme(theme));

// AllNight masaüstü penceresini oluşturur.
function createWindow() {
  const window = new BrowserWindow({
    width: 1000,
    height: 700,
    minWidth: 750,
    minHeight: 550,
    backgroundColor: '#17191F',

    // React ile Electron arasındaki güvenlik ayarları.
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });

  // Geliştirme sırasında Vite sunucusunu açar.
  window.loadURL('http://localhost:5173');
}

// Electron hazır olduğunda pencereyi oluşturur.
app.whenReady().then(createWindow);

// Son pencere kapatıldığında uygulamadan çıkar.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});