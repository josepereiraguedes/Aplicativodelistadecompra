import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Target, Award } from 'lucide-react';
import { useShoppingContext } from '../contexts/ShoppingContext';

export default function Statistics() {
  const { state } = useShoppingContext();
  const { stats, lists } = state;

  // Calculate monthly data
  const monthlyData = lists.reduce((acc: any, list) => {
    const month = new Date(list.createdAt).toLocaleString('pt-BR', { month: 'long', year: 'numeric' });
    if (!acc[month]) {
      acc[month] = { spent: 0, lists: 0, items: 0 };
    }
    acc[month].spent += list.totalActual || list.totalEstimated;
    acc[month].lists += 1;
    acc[month].items += list.items.length;
    return acc;
  }, {});

  const monthlyEntries = Object.entries(monthlyData)
    .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
    .slice(-6);

  // Calculate categories
  const categoryData = lists.reduce((acc: any, list) => {
    list.items.forEach(item => {
      const category = item.category || 'Outros';
      if (!acc[category]) {
        acc[category] = { count: 0, spent: 0 };
      }
      acc[category].count += 1;
      acc[category].spent += item.actualPrice || item.estimatedPrice;
    });
    return acc;
  }, {});

  const topCategories = Object.entries(categoryData)
    .sort(([, a]: any, [, b]: any) => b.spent - a.spent)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-orange-600 to-red-600 text-white p-6 rounded-xl"
      >
        <h2 className="text-xl font-bold mb-2">Estatísticas</h2>
        <p className="opacity-90">
          Análise dos seus hábitos de compras
        </p>
      </motion.div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-blue-50 p-4 rounded-xl border border-blue-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm font-medium">Total de Listas</p>
              <p className="text-2xl font-bold text-blue-800">
                {stats.totalLists}
              </p>
            </div>
            <BarChart3 className="w-8 h-8 text-blue-600" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-green-50 p-4 rounded-xl border border-green-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 text-sm font-medium">Total Gasto</p>
              <p className="text-2xl font-bold text-green-800">
                R$ {stats.totalSpent.toFixed(2)}
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-600" />
          </div>
        </motion.div>
      </div>

      {/* Most Bought Items */}
      {stats.mostBoughtItems.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white p-6 rounded-xl border border-gray-200"
        >
          <div className="flex items-center gap-2 mb-4">
            <Award className="w-5 h-5 text-yellow-600" />
            <h3 className="text-lg font-semibold text-gray-800">
              Produtos Mais Comprados
            </h3>
          </div>
          <div className="space-y-3">
            {stats.mostBoughtItems.map((item, index) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    index === 0 ? 'bg-yellow-100 text-yellow-800' :
                    index === 1 ? 'bg-gray-100 text-gray-800' :
                    index === 2 ? 'bg-orange-100 text-orange-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {index + 1}
                  </div>
                  <span className="font-medium text-gray-800">{item.name}</span>
                </div>
                <div className="text-right">
                  <span className="text-lg font-semibold text-gray-700">
                    {item.count}x
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Monthly Trends */}
      {monthlyEntries.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white p-6 rounded-xl border border-gray-200"
        >
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-800">
              Tendência Mensal
            </h3>
          </div>
          <div className="space-y-4">
            {monthlyEntries.map(([month, data]: any, index) => {
              const maxSpent = Math.max(...monthlyEntries.map(([, d]: any) => d.spent));
              const percentage = maxSpent > 0 ? (data.spent / maxSpent) * 100 : 0;
              
              return (
                <div key={month} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700 capitalize">
                      {month}
                    </span>
                    <div className="text-right">
                      <span className="text-sm font-semibold text-gray-800">
                        R$ {data.spent.toFixed(2)}
                      </span>
                      <p className="text-xs text-gray-500">
                        {data.lists} lista{data.lists !== 1 ? 's' : ''} • {data.items} itens
                      </p>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Categories */}
      {topCategories.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white p-6 rounded-xl border border-gray-200"
        >
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-5 h-5 text-purple-600" />
            <h3 className="text-lg font-semibold text-gray-800">
              Top Categorias
            </h3>
          </div>
          <div className="space-y-3">
            {topCategories.map(([category, data]: any, index) => (
              <div key={category} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-purple-500" />
                  <span className="font-medium text-gray-800">{category}</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-semibold text-gray-700">
                    R$ {data.spent.toFixed(2)}
                  </span>
                  <p className="text-xs text-gray-500">
                    {data.count} itens
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Empty State */}
      {stats.totalLists === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">
            Dados insuficientes
          </h3>
          <p className="text-gray-500">
            Crie algumas listas para ver suas estatísticas
          </p>
        </motion.div>
      )}
    </div>
  );
}
