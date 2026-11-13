import { useState } from 'react';
import { supabase } from '../lib/supabase.js';

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleAuth = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      if (isLogin) {
        // Logowanie istniejącego użytkownika
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        setMessage('Zalogowano pomyślnie!');
      } else {
        // Rejestracja nowego użytkownika
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        setMessage('Konto zostało utworzone! Możesz się zalogować.');
      }
    } catch (error) {
      setMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Reszta kodu (interfejs) w kolejnym kroku...

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <h2 className="mb-6 text-2xl font-bold text-center">
          {isLogin ? 'Zaloguj się' : 'Zarejestruj się'}
        </h2>
        
        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 w-full rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Hasło</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 w-full rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-md bg-blue-600 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? 'Przetwarzanie...' : (isLogin ? 'Zaloguj' : 'Utwórz konto')}
          </button>
        </form>

        {message && (
          <div className="mt-4 text-center text-sm font-medium text-red-600">
            {message}
          </div>
        )}

        <p className="mt-4 text-center text-sm text-gray-600">
          {isLogin ? 'Nie masz konta? ' : 'Masz już konto? '}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="font-medium text-blue-600 hover:underline"
          >
            {isLogin ? 'Zarejestruj się' : 'Zaloguj się'}
          </button>
        </p>
      </div>
    </div>
  );
}