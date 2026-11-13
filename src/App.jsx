import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './lib/supabase';
import Login from './pages/Login';
import WishList from './pages/WishList';

function App() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    // 1. Sprawdź, czy użytkownik był już wcześniej zalogowany
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // 2. Nasłuchuj zmian (np. logowanie, wylogowanie)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    // Sprzątanie nasłuchiwacza po zamknięciu komponentu
    return () => subscription.unsubscribe();
  }, []);

  return (
    <Router>
      <Routes>
        {/* Jeśli użytkownik nie jest zalogowany -> pokaż Login, w przeciwnym razie przekieruj na wishlist */}
        <Route 
          path="/" 
          element={!session ? <Login /> : <Navigate to="/wishlist" />} 
        />
        
        {/* Jeśli użytkownik jest zalogowany -> pokaż WishList, w przeciwnym razie wyrzuć go na stronę główną */}
        <Route 
          path="/wishlist" 
          element={session ? <WishList session={session} /> : <Navigate to="/" />} 
        />
      </Routes>
    </Router>
  );
}

export default App;