import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Save, Copy } from 'lucide-react';
import { useShoppingContext } from '../contexts/ShoppingContext';
import { ShoppingList } from '../types';

interface CreateListProps {
  onSave: () => void;
  onCancel: () => void;
  duplicateFromList?: ShoppingList;
}

export default function CreateList({ onSave, onCancel, duplicateFromList }: CreateListProps) {
  const { dispatch } = useShoppingContext();
  const [listName, setListName] = useState(duplicateFromList ? `${duplicateFromList.name} (Cópia)` : '');

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const handleSave = () => {
    if (!listName.trim()) return;

    const newTotalEstimated = duplicateFromList
      ? duplicateFromList.items.reduce((sum, item) => sum + (item.estimatedPrice * item.quantity), 0)
      : 0;

    const newList: ShoppingList = {
      id: generateId(),
      name: listName.trim(),
      items: duplicateFromList ? duplicateFromList.items.map(item => ({
        ...item,
        id: generateId(),
        purchased: false,
        actualPrice: undefined
      })) : [],
      createdAt: new Date(),
      updatedAt: new Date(),
      totalEstimated: newTotalEstimated,
      totalActual: 0,
      completed: false
    };

    dispatch({ type: 'ADD_LIST', payload: newList });
    onSave();
  };

  const quickTemplates = [
    'Compra do Mês',
    'Churrasco',
    'Produtos de Limpeza',
    'Festa de Aniversário',
    'Compras de Emergência'
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
        <h2 className="text-xl font-semibold text-blue-800 mb-4">
          {duplicateFromList ? 'Duplicar Lista' : 'Nova Lista de Compras'}
        </h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome da Lista *
            </label>
            <input
              type="text"
              value={listName}
              onChange={(e) => setListName(e.target.value)}
              placeholder="Ex: Compra do mês de Janeiro"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              autoFocus
            />
          </div>

          {duplicateFromList && (
            <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
              <div className="flex items-center gap-2 text-yellow-700">
                <Copy className="w-4 h-4" />
                <span className="text-sm font-medium">
                  Duplicando "{duplicateFromList.name}" com {duplicateFromList.items.length} itens
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {!duplicateFromList && (
        <div>
          <h3 className="text-lg font-medium text-gray-800 mb-3">Templates Rápidos</h3>
          <div className="grid grid-cols-1 gap-2">
            {quickTemplates.map((template) => (
              <motion.button
                key={template}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setListName(template)}
                className="bg-white p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all text-left"
              >
                {template}
              </motion.button>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={onCancel}
          className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 p-3 rounded-lg font-medium transition-colors"
        >
          Cancelar
        </button>
        <button
          onClick={handleSave}
          disabled={!listName.trim()}
          className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white p-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
        >
          <Save className="w-4 h-4" />
          Criar Lista
        </button>
      </div>
    </motion.div>
  );
}
