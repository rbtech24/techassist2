import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Chat from './components/Chat';
import Admin from './components/Admin';
import Login from './components/Login';
import Setup from './components/Setup';
import RequireAuth from './components/RequireAuth';
import PWAPrompt from './components/PWAPrompt';

function App() {
  return (
    <BrowserRouter>
      <PWAPrompt />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Chat />} />
          <Route path="admin">
            <Route index element={<RequireAuth><Admin /></RequireAuth>} />
            <Route path="login" element={<Login />} />
          </Route>
          <Route path="setup" element={<Setup />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
