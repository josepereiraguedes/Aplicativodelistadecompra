import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Save } from 'lucide-react';
import { useShoppingContext } from '../contexts/ShoppingContext';

interface UserSetupProps {
  onComplete: () => void;
}

export default function UserSetup({ onComplete }: UserSetupProps) {
  const { dispatch } = useShoppingContext();
  const [userName, setUserName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim()) return;

    const user = {
      name: userName.trim(),
      createdAt: new Date()
    };

    dispatch({ type: 'SET_USER', payload: user });
    onComplete();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-8"
        >
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-10 h-10 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Bem-vindo à Lista Inteligente!
          </h1>
          <p className="text-gray-600">
            Vamos começar personalizando sua experiência
          </p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Como podemos te chamar?
            </label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Digite seu nome"
              className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center"
              autoFocus
              required
            />
          </div>

          <motion.button
            type="submit"
            disabled={!userName.trim()}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white p-4 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-3"
          >
            <Save className="w-5 h-5" />
            Começar
          </motion.button>
        </motion.form>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-8 text-center"
        >
          <p className="text-xs text-gray-500">
            Seus dados são salvos apenas no seu dispositivo
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
