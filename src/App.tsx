import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home } from 'lucide-react';
import { ShoppingProvider, useShoppingContext } from './contexts/ShoppingContext';
import Layout from './components/Layout';
import UserSetup from './components/UserSetup';
import Dashboard from './components/Dashboard';
import CreateList from './components/CreateList';
import ShoppingListView from './components/ShoppingListView';
import History from './components/History';
import Statistics from './components/Statistics';

type Screen = 'dashboard' | 'create-list' | 'list-view' | 'history' | 'statistics';

const screenVariants = {
  initial: (direction: number) => ({
    x: direction > 0 ? '100%' : '-100%',
    opacity: 0,
  }),
  animate: {
    x: '0%',
    opacity: 1,
    transition: { type: 'tween', ease: 'circOut', duration: 0.4 }
  },
  exit: (direction: number) => ({
    x: direction < 0 ? '100%' : '-100%',
    opacity: 0,
    transition: { type: 'tween', ease: 'circIn', duration: 0.4 }
  })
};

function AppContent() {
  const { state } = useShoppingContext();
  const [currentScreen, setCurrentScreen] = useState<Screen>('dashboard');
  const [currentListId, setCurrentListId] = useState<string | null>(null);
  const [duplicateFromListId, setDuplicateFromListId] = useState<string | null>(null);
  const [showUserSetup, setShowUserSetup] = useState(false);
  const [direction, setDirection] = useState(1);

  useEffect(() => {
    setShowUserSetup(!state.user);
  }, [state.user]);

  if (showUserSetup) {
    return <UserSetup onComplete={() => setShowUserSetup(false)} />;
  }

  const navigateTo = (screen: Screen, dir: number) => {
    setDirection(dir);
    setCurrentScreen(screen);
  };

  const handleCreateList = () => {
    setDuplicateFromListId(null);
    navigateTo('create-list', 1);
  };

  const handleDuplicateList = (listId: string) => {
    setDuplicateFromListId(listId);
    navigateTo('create-list', 1);
  };

  const handleViewList = (listId: string) => {
    setCurrentListId(listId);
    navigateTo('list-view', 1);
  };

  const handleBack = () => {
    navigateTo('dashboard', -1);
    setCurrentListId(null);
    setDuplicateFromListId(null);
  };

  const getScreenTitle = () => {
    switch (currentScreen) {
      case 'dashboard':
        return 'Lista Inteligente';
      case 'create-list':
        return duplicateFromListId ? 'Duplicar Lista' : 'Nova Lista';
      case 'list-view':
        const list = state.lists.find(l => l.id === currentListId);
        return list?.name || 'Carregando...';
      case 'history':
        return 'Histórico de Compras';
      case 'statistics':
        return 'Estatísticas';
      default:
        return 'Lista Inteligente';
    }
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'dashboard':
        return <Dashboard onCreateList={handleCreateList} onViewList={handleViewList} onViewHistory={() => navigateTo('history', 1)} onViewStats={() => navigateTo('statistics', 1)} />;
      case 'create-list':
        return <CreateList onSave={handleBack} onCancel={handleBack} duplicateFromList={duplicateFromListId ? state.lists.find(l => l.id === duplicateFromListId) : undefined} />;
      case 'list-view':
        return currentListId ? <ShoppingListView listId={currentListId} onBack={handleBack} /> : null;
      case 'history':
        return <History onDuplicateList={handleDuplicateList} onViewList={handleViewList} />;
      case 'statistics':
        return <Statistics />;
      default:
        return null;
    }
  };

  return (
    <Layout
      title={getScreenTitle()}
      showBackButton={currentScreen !== 'dashboard'}
      onBack={handleBack}
    >
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={currentScreen}
          custom={direction}
          variants={screenVariants}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          {renderScreen()}
        </motion.div>
      </AnimatePresence>

      {currentScreen !== 'dashboard' && (
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          exit={{ y: 100 }}
          transition={{ type: 'spring', stiffness: 200, damping: 25 }}
          className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40"
        >
          <button
            onClick={handleBack}
            className="bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2"
          >
            <Home className="w-5 h-5" />
            <span className="font-medium">Home</span>
          </button>
        </motion.div>
      )}
    </Layout>
  );
}

export default function App() {
  return (
    <ShoppingProvider>
      <AppContent />
    </ShoppingProvider>
  );
}
