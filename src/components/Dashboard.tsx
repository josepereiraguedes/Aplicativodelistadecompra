import React from 'react';
import { motion } from 'framer-motion';
import { Plus, ShoppingCart, TrendingUp, Archive, BarChart3, Star, CheckCircle } from 'lucide-react';
import { useShoppingContext } from '../contexts/ShoppingContext';
import { format } from '../utils/dateUtils';

interface DashboardProps {
  onCreateList: () => void;
  onViewList: (listId: string) => void;
  onViewHistory: () => void;
  onViewStats: () => void;
}

export default function Dashboard({ onCreateList, onViewList, onViewHistory, onViewStats }: DashboardProps) {
  const { state } = useShoppingContext();
  const { lists, stats, user } = state;

  const activeLists = lists.filter(l => !l.completed);
  const recentLists = activeLists
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 3);

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const monthlySpending = lists
    .filter(list => {
      const listDate = new Date(list.createdAt);
      return list.completed && listDate.getMonth() === currentMonth && listDate.getFullYear() === currentYear;
    })
    .reduce((sum, list) => sum + list.totalActual, 0);

  const getListProgress = (list: any) => {
    if (list.items.length === 0) return 0;
    const completed = list.items.filter((item: any) => item.purchased).length;
    return (completed / list.items.length) * 100;
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-primary via-secondary to-accent text-white p-6 rounded-2xl shadow-xl relative overflow-hidden"
      >
        <div className="relative z-10">
          <motion.h2 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="text-3xl font-bold mb-2"
          >
            {getGreeting()}, {user?.name || 'Usuário'}!
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="opacity-90 text-lg"
          >
            {activeLists.length > 0 
              ? `Você tem ${activeLists.length} lista${activeLists.length !== 1 ? 's' : ''} em andamento.`
              : 'Vamos começar uma nova compra?'
            }
          </motion.p>
        </div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-12 -mb-12" />
      </motion.div>

      <div className="grid grid-cols-2 gap-4">
        <StatCard icon={TrendingUp} color="green" label="Gasto no Mês" value={`R$ ${monthlySpending.toFixed(2)}`} delay={0.1} />
        <StatCard icon={ShoppingCart} color="blue" label="Listas Ativas" value={activeLists.length} delay={0.2} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <motion.button
          onClick={onCreateList}
          whileHover={{ scale: 1.03, y: -2 }}
          whileTap={{ scale: 0.97 }}
          className="w-full bg-gradient-to-r from-primary to-secondary text-white p-5 rounded-2xl font-semibold flex items-center justify-center gap-3 transition-all duration-300 shadow-lg hover:shadow-xl"
        >
          <Plus className="w-6 h-6" />
          Criar Nova Lista
        </motion.button>
      </motion.div>

      {recentLists.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-3"
        >
          <h3 className="text-xl font-semibold text-neutral-800 flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" />
            Listas Recentes
          </h3>
          {recentLists.map((list, index) => (
            <ListCard key={list.id} list={list} progress={getListProgress(list)} onClick={() => onViewList(list.id)} delay={0.4 + index * 0.1} />
          ))}
        </motion.div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <NavButton icon={Archive} label="Histórico" onClick={onViewHistory} delay={0.5} />
        <NavButton icon={BarChart3} label="Estatísticas" onClick={onViewStats} delay={0.6} />
      </div>

      {activeLists.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="text-center py-8"
        >
          <motion.div
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <ShoppingCart className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
          </motion.div>
          <h3 className="text-lg font-medium text-neutral-600 mb-2">
            Nenhuma lista ativa
          </h3>
          <p className="text-neutral-500 mb-4">
            Crie sua primeira lista para começar
          </p>
        </motion.div>
      )}
    </div>
  );
}

const StatCard = ({ icon: Icon, color, label, value, delay }: any) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay }}
    className="bg-white p-4 rounded-xl border border-neutral-200 shadow-sm"
  >
    <div className="flex items-center justify-between">
      <div>
        <p className={`text-${color}-600 text-sm font-medium`}>{label}</p>
        <p className={`text-2xl font-bold text-${color}-800`}>{value}</p>
      </div>
      <div className={`bg-${color}-100 p-2 rounded-lg`}>
        <Icon className={`w-6 h-6 text-${color}-600`} />
      </div>
    </div>
  </motion.div>
);

const ListCard = ({ list, progress, onClick, delay }: any) => {
  const isComplete = progress === 100;
  return (
    <motion.button
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
      whileHover={{ scale: 1.02, x: 4 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="w-full bg-white p-4 rounded-xl border border-neutral-200 hover:border-primary/50 hover:shadow-lg transition-all duration-200 text-left group"
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <h4 className="font-semibold text-neutral-800 group-hover:text-primary transition-colors">{list.name}</h4>
          <p className="text-sm text-neutral-600">{list.items.length} itens • Est. R$ {list.totalEstimated.toFixed(2)}</p>
        </div>
        <div className={`text-sm font-bold ${isComplete ? 'text-success' : 'text-primary'}`}>{progress.toFixed(0)}%</div>
      </div>
      <div className="w-full bg-neutral-200 rounded-full h-2.5">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.8, delay }}
          className={`h-2.5 rounded-full ${isComplete ? 'bg-success' : 'bg-gradient-to-r from-primary to-secondary'}`}
        />
      </div>
    </motion.button>
  );
};

const NavButton = ({ icon: Icon, label, onClick, delay }: any) => (
  <motion.button
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    whileHover={{ scale: 1.03 }}
    whileTap={{ scale: 0.97 }}
    onClick={onClick}
    className="bg-white text-neutral-700 p-4 rounded-xl flex items-center justify-center gap-3 transition-all border border-neutral-200 shadow-sm hover:shadow-md hover:text-primary"
  >
    <Icon className="w-5 h-5" />
    <span className="font-semibold">{label}</span>
  </motion.button>
);
