// Electron'un güvenli iletişim köprüsünü içe aktarır.
const { contextBridge, ipcRenderer } = require('electron');

// React tarafına yalnızca izin verdiğimiz fonksiyonları açar.
contextBridge.exposeInMainWorld('allNight', {

  // Windows'un mevcut temasını öğrenir.
  getTheme: () => ipcRenderer.invoke('theme:get'),

  // Windows temasını dark veya light olarak değiştirir.
  setTheme: (theme) => ipcRenderer.invoke('theme:set', theme)

});