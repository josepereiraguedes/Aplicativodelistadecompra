import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Archive, Copy, Trash2, Calendar, DollarSign, Package } from 'lucide-react';
import { useShoppingContext } from '../contexts/ShoppingContext';
import { format } from '../utils/dateUtils';
import { ShoppingList } from '../types';

interface HistoryProps {
  onDuplicateList: (listId: string) => void;
  onViewList: (listId: string) => void;
}

export default function History({ onDuplicateList, onViewList }: HistoryProps) {
  const { state, dispatch } = useShoppingContext();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const completedLists = state.lists
    .filter(list => list.completed || list.items.every(item => item.purchased))
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  const handleDeleteList = (listId: string) => {
    dispatch({ type: 'DELETE_LIST', payload: listId });
    setShowDeleteConfirm(null);
  };

  if (completedLists.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-12"
      >
        <Archive className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-600 mb-2">
          Nenhuma lista concluída
        </h3>
        <p className="text-gray-500">
          Complete suas listas para vê-las aqui
        </p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 rounded-xl"
      >
        <h2 className="text-xl font-bold mb-2">Histórico de Compras</h2>
        <p className="opacity-90">
          {completedLists.length} lista{completedLists.length !== 1 ? 's' : ''} concluída{completedLists.length !== 1 ? 's' : ''}
        </p>
      </motion.div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-green-50 p-4 rounded-xl border border-green-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 text-sm font-medium">Total Gasto</p>
              <p className="text-2xl font-bold text-green-800">
                R$ {completedLists.reduce((sum, list) => sum + list.totalActual, 0).toFixed(2)}
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-green-600" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-blue-50 p-4 rounded-xl border border-blue-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm font-medium">Itens Comprados</p>
              <p className="text-2xl font-bold text-blue-800">
                {completedLists.reduce((sum, list) => sum + list.items.length, 0)}
              </p>
            </div>
            <Package className="w-8 h-8 text-blue-600" />
          </div>
        </motion.div>
      </div>

      {/* Lists */}
      <div className="space-y-3">
        {completedLists.map((list, index) => (
          <motion.div
            key={list.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white p-4 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200"
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800">{list.name}</h3>
                <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                  <div className="flex items-center gap-1">
                    <Package className="w-3 h-3" />
                    {list.items.length} itens
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {format(list.updatedAt)}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-semibold text-green-600">
                  R$ {list.totalActual.toFixed(2)}
                </p>
                <p className="text-xs text-gray-500">Gasto</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => onViewList(list.id)}
                className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-700 p-2 rounded-lg font-medium transition-colors text-sm"
              >
                Ver Detalhes
              </button>
              <button
                onClick={() => onDuplicateList(list.id)}
                className="px-3 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg transition-colors"
                title="Duplicar Lista"
              >
                <Copy className="w-4 h-4" />
              </button>
              <button
                onClick={() => setShowDeleteConfirm(list.id)}
                className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg transition-colors"
                title="Excluir Lista"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Preview */}
            <div className="mt-3 pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-500 mb-2">Itens comprados:</p>
              <div className="flex flex-wrap gap-1">
                {list.items.slice(0, 3).map(item => (
                  <span key={item.id} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                    {item.name}
                  </span>
                ))}
                {list.items.length > 3 && (
                  <span className="bg-gray-100 text-gray-500 text-xs px-2 py-1 rounded">
                    +{list.items.length - 3} mais
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white p-6 rounded-xl max-w-sm w-full"
          >
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Excluir Lista
            </h3>
            <p className="text-gray-600 mb-4">
              Tem certeza que deseja excluir esta lista do histórico? Esta ação não pode ser desfeita.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 p-3 rounded-lg font-medium transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDeleteList(showDeleteConfirm)}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white p-3 rounded-lg font-medium transition-colors"
              >
                Excluir
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
