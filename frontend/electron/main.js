const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');

let mainWindow;
let backendProcess;

// in dev: app.isPackaged = false, in produzione = true
const isDev = !app.isPackaged;

/**
 * Trova il percorso del JAR del backend.
 * - In dev: cerca in ../backend/target
 * - In produzione: cerca in resources/backend (copiato da extraResources)
 */
function getBackendJarPath() {
  try {
    let jarDir;

    if (isDev) {
      // __dirname in dev = C:\LinkedinAddon\frontend\electron
      jarDir = path.join(__dirname, '..', '..', 'backend', 'target');
    } else {
      // In produzione i file extraResources stanno in process.resourcesPath
      jarDir = path.join(process.resourcesPath, 'backend');
    }

    console.log('[Hermes][BACKEND] Cerco JAR in:', jarDir);

    if (!fs.existsSync(jarDir)) {
      console.warn('[Hermes][BACKEND] Directory JAR inesistente:', jarDir);
      return null;
    }

    const files = fs.readdirSync(jarDir);
    const jarName = files.find((f) => f.endsWith('.jar'));

    if (!jarName) {
      console.warn('[Hermes][BACKEND] Nessun .jar trovato in', jarDir);
      return null;
    }

    const jarPath = path.join(jarDir, jarName);
    console.log('[Hermes][BACKEND] JAR trovato:', jarPath);
    return jarPath;
  } catch (err) {
    console.error('[Hermes][BACKEND] Errore nel trovare il JAR:', err);
    return null;
  }
}

/**
 * Avvia il backend Spring Boot come processo separato (java -jar ...)
 */
function startBackend() {
  const jarPath = getBackendJarPath();
  if (!jarPath) {
    console.warn(
      '[Hermes][BACKEND] Backend NON avviato. Assicurati di aver fatto "mvn clean package" in /backend.'
    );
    return;
  }

  console.log('[Hermes][BACKEND] Avvio backend con "java -jar", path:', jarPath);

  backendProcess = spawn('java', ['-jar', jarPath], {
    cwd: path.dirname(jarPath),
    stdio: 'inherit',
  });

  backendProcess.on('exit', (code, signal) => {
    console.log('[Hermes][BACKEND] Terminato. code =', code, 'signal =', signal);
  });

  backendProcess.on('error', (err) => {
    console.error('[Hermes][BACKEND] Errore nel processo backend:', err);
  });
}

/**
 * Crea la finestra principale di Electron e carica il frontend
 */
function createWindow() {
  console.log('[Hermes][MAIN] isDev =', isDev);
  console.log('[Hermes][MAIN] __dirname =', __dirname);
  console.log('[Hermes][MAIN] resourcesPath =', process.resourcesPath);

  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      devTools: true,
    },
  });

  if (isDev) {
    const devUrl = 'http://localhost:5173';
    console.log('[Hermes][MAIN] Carico URL dev:', devUrl);
    mainWindow.loadURL(devUrl);
  } else {
    const indexPath = path.join(__dirname, '..', 'dist', 'index.html');
    console.log('[Hermes][MAIN] Carico index da:', indexPath);

    mainWindow
      .loadFile(indexPath)
      .then(() => {
        console.log('[Hermes][MAIN] index.html caricato con successo');
      })
      .catch((err) => {
        console.error('[Hermes][MAIN] Errore nel loadFile:', err);
      });
  }

  // DevTools aperti (puoi commentare questa riga quando non ti servono più)
  mainWindow.webContents.openDevTools();

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

/**
 * Inizializzazione app
 */
app.whenReady().then(() => {
  console.log('[Hermes][MAIN] app ready, avvio backend e creo finestra');
  startBackend();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

/**
 * Alla chiusura, killiamo il backend se è ancora vivo
 */
function stopBackend() {
  if (backendProcess && !backendProcess.killed) {
    console.log('[Hermes][BACKEND] Termino backend...');
    backendProcess.kill();
  }
}

app.on('before-quit', () => {
  console.log('[Hermes][MAIN] before-quit');
  stopBackend();
});

app.on('window-all-closed', () => {
  console.log('[Hermes][MAIN] tutte le finestre chiuse');
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
