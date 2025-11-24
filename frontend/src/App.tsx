// src/App.tsx

import MessagesPage from './pages/MessagesPage';
import { I18nProvider } from './i18n';

function App() {
console.log('[Hermes][RENDERER] App render');
  return (
    <I18nProvider>
      <MessagesPage />
    </I18nProvider>
  );
}

export default App;
