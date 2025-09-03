import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, X, Star, Zap } from 'lucide-react';
import { ShoppingItem } from '../types';

interface AddItemModalProps {
  item?: ShoppingItem | null;
  onSave: (item: ShoppingItem) => void;
  onClose: () => void;
}

const units = ['un', 'kg', 'g', 'l', 'ml', 'pacote', 'caixa', 'dúzia', 'fatia'];
const priorities = [
  { value: 'low', label: 'Baixa', color: 'text-green-600', bgColor: 'bg-green-50', borderColor: 'border-green-200' },
  { value: 'medium', label: 'Média', color: 'text-yellow-600', bgColor: 'bg-yellow-50', borderColor: 'border-yellow-200' },
  { value: 'high', label: 'Alta', color: 'text-red-600', bgColor: 'bg-red-50', borderColor: 'border-red-200' }
];

// Itens comuns para sugestão rápida
const commonItems = [
  'Arroz', 'Feijão', 'Leite', 'Pão', 'Ovos', 'Açúcar', 'Sal', 'Óleo', 'Macarrão', 'Carne',
  'Frango', 'Tomate', 'Cebola', 'Alho', 'Batata', 'Banana', 'Maçã', 'Detergente', 'Sabão', 'Papel higiênico'
];

export default function AddItemModal({ item, onSave, onClose }: AddItemModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    quantity: 1,
    unit: 'un',
    estimatedPrice: 0,
    priority: 'medium' as const
  });
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name,
        quantity: item.quantity,
        unit: item.unit,
        estimatedPrice: item.estimatedPrice,
        priority: item.priority
      });
    }
  }, [item]);

  useEffect(() => {
    if (formData.name.length > 0) {
      const filtered = commonItems.filter(commonItem => 
        commonItem.toLowerCase().includes(formData.name.toLowerCase()) &&
        commonItem.toLowerCase() !== formData.name.toLowerCase()
      ).slice(0, 5);
      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [formData.name]);

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) return;

    const newItem: ShoppingItem = {
      id: item?.id || generateId(),
      name: formData.name.trim(),
      quantity: Number(formData.quantity),
      unit: formData.unit,
      estimatedPrice: Number(formData.estimatedPrice),
      priority: formData.priority,
      purchased: item?.purchased || false,
      actualPrice: item?.actualPrice
    };

    onSave(newItem);
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSuggestionClick = (suggestion: string) => {
    setFormData(prev => ({ ...prev, name: suggestion }));
    setShowSuggestions(false);
  };

  const quickFillData: Record<string, { quantity: number; unit: string; price: number; priority: 'low' | 'medium' | 'high' }> = {
    'Arroz': { quantity: 1, unit: 'kg', price: 5.99, priority: 'high' },
    'Feijão': { quantity: 1, unit: 'kg', price: 8.99, priority: 'high' },
    'Leite': { quantity: 1, unit: 'l', price: 4.50, priority: 'medium' },
    'Pão': { quantity: 1, unit: 'un', price: 6.00, priority: 'medium' },
    'Ovos': { quantity: 1, unit: 'dúzia', price: 12.99, priority: 'medium' },
  };

  const handleQuickFill = (itemName: string) => {
    const data = quickFillData[itemName];
    if (data) {
      setFormData(prev => ({
        ...prev,
        name: itemName,
        quantity: data.quantity,
        unit: data.unit,
        estimatedPrice: data.price,
        priority: data.priority
      }));
    } else {
      setFormData(prev => ({ ...prev, name: itemName }));
    }
    setShowSuggestions(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="bg-white p-6 rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">
            {item ? 'Editar Item' : 'Adicionar Item'}
          </h2>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all"
          >
            <X className="w-5 h-5" />
          </motion.button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Nome do Produto */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome do Produto *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Ex: Arroz, Feijão, Leite..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              required
              autoFocus
            />
            
            {/* Suggestions */}
            {showSuggestions && suggestions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-10 mt-1 max-h-40 overflow-y-auto"
              >
                {suggestions.map((suggestion, index) => (
                  <motion.button
                    key={suggestion}
                    type="button"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleQuickFill(suggestion)}
                    className="w-full px-3 py-2 text-left hover:bg-blue-50 transition-colors flex items-center gap-2"
                  >
                    <Zap className="w-3 h-3 text-blue-500" />
                    {suggestion}
                    {quickFillData[suggestion] && (
                      <span className="text-xs text-blue-600 ml-auto">Preenchimento rápido</span>
                    )}
                  </motion.button>
                ))}
              </motion.div>
            )}
          </div>

          {/* Quantidade e Unidade */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantidade *
              </label>
              <input
                type="number"
                value={formData.quantity}
                onChange={(e) => handleChange('quantity', e.target.value)}
                min="0.01"
                step="0.01"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Unidade
              </label>
              <select
                value={formData.unit}
                onChange={(e) => handleChange('unit', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                {units.map(unit => (
                  <option key={unit} value={unit}>
                    {unit}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Preço Estimado */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preço Unitário Estimado
            </label>
            <div className="relative">
              <span className="absolute left-3 top-3 text-gray-500 font-medium">R$</span>
              <input
                type="number"
                value={formData.estimatedPrice}
                onChange={(e) => handleChange('estimatedPrice', e.target.value)}
                min="0"
                step="0.01"
                className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="0,00"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Este é o preço por cada unidade (un, kg, l, etc.).</p>
          </div>

          {/* Prioridade */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Prioridade
            </label>
            <div className="grid grid-cols-3 gap-2">
              {priorities.map((priority, index) => (
                <motion.button
                  key={priority.value}
                  type="button"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleChange('priority', priority.value)}
                  className={`p-3 rounded-lg border-2 transition-all flex flex-col items-center gap-2 ${
                    formData.priority === priority.value
                      ? `${priority.borderColor} ${priority.bgColor} ${priority.color}`
                      : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <Star className={`w-4 h-4 ${
                    formData.priority === priority.value ? 'fill-current' : ''
                  }`} />
                  <span className="text-sm font-medium">{priority.label}</span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Botões */}
          <div className="flex gap-3 pt-4">
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onClose}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 p-3 rounded-lg font-medium transition-all"
            >
              Cancelar
            </motion.button>
            <motion.button
              type="submit"
              disabled={!formData.name.trim()}
              whileHover={{ scale: formData.name.trim() ? 1.02 : 1 }}
              whileTap={{ scale: formData.name.trim() ? 0.98 : 1 }}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed text-white p-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 shadow-lg"
            >
              <Save className="w-4 h-4" />
              {item ? 'Atualizar' : 'Adicionar'}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
