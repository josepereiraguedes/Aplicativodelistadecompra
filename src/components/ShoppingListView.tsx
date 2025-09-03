import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit3, Trash2, Check, Star, DollarSign, Package, MoreVertical, CheckCircle, TrendingUp } from 'lucide-react';
import { useShoppingContext } from '../contexts/ShoppingContext';
import { ShoppingItem } from '../types';
import AddItemModal from './AddItemModal';

interface ShoppingListViewProps {
  listId: string;
  onBack: () => void;
}

export default function ShoppingListView({ listId, onBack }: ShoppingListViewProps) {
  const { state, dispatch } = useShoppingContext();
  const [showAddItem, setShowAddItem] = useState(false);
  const [editingItem, setEditingItem] = useState<ShoppingItem | null>(null);
  const [showListActions, setShowListActions] = useState(false);
  const [showDeleteListConfirm, setShowDeleteListConfirm] = useState(false);
  const [showCompleteConfirm, setShowCompleteConfirm] = useState(false);
  const [editingListName, setEditingListName] = useState(false);
  
  const list = useMemo(() => state.lists.find(l => l.id === listId), [state.lists, listId]);
  const [newListName, setNewListName] = useState(list?.name || '');

  useEffect(() => {
    if (list) {
      setNewListName(list.name);
    } else {
      onBack();
    }
  }, [list, onBack]);

  if (!list) return null;

  const priorityOrder = { high: 0, medium: 1, low: 2 };
  const sortedItems = [...list.items].sort((a, b) => {
    if (a.purchased !== b.purchased) return a.purchased ? 1 : -1;
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  const handleTogglePurchased = (item: ShoppingItem) => {
    const updatedItem = {
      ...item,
      purchased: !item.purchased,
      actualPrice: !item.purchased ? (item.actualPrice ?? item.estimatedPrice * item.quantity) : undefined,
    };
    dispatch({ type: 'UPDATE_ITEM', payload: { listId, item: updatedItem } });
  };

  const handleActualPriceChange = (item: ShoppingItem, newPrice: string) => {
    const price = parseFloat(newPrice);
    if (!isNaN(price)) {
      dispatch({ type: 'UPDATE_ITEM', payload: { listId, item: { ...item, actualPrice: price } } });
    }
  };

  const handleDeleteItem = (itemId: string) => dispatch({ type: 'DELETE_ITEM', payload: { listId, itemId } });
  const handleDeleteList = () => {
    dispatch({ type: 'DELETE_LIST', payload: listId });
    onBack();
  };
  const handleCompleteList = () => {
    dispatch({ type: 'UPDATE_LIST', payload: { ...list, completed: true, updatedAt: new Date() } });
    onBack();
  };

  const handleUpdateListName = () => {
    if (newListName.trim() && newListName.trim() !== list.name) {
      dispatch({ type: 'UPDATE_LIST', payload: { ...list, name: newListName.trim(), updatedAt: new Date() } });
    }
    setEditingListName(false);
  };

  const handleSaveItem = (item: ShoppingItem) => {
    const action = editingItem ? 'UPDATE_ITEM' : 'ADD_ITEM';
    dispatch({ type: action, payload: { listId, item } });
    setShowAddItem(false);
    setEditingItem(null);
  };
  
  const completedItems = list.items.filter(item => item.purchased).length;
  const progress = list.items.length > 0 ? (completedItems / list.items.length) * 100 : 0;
  const allItemsPurchased = list.items.length > 0 && completedItems === list.items.length;

  return (
    <div className="pb-24 relative">
      <motion.div
        layout
        className="sticky top-0 bg-neutral-50/80 backdrop-blur-sm z-10 pt-4 -mx-4 px-4"
      >
        <div className="bg-white p-4 rounded-xl shadow-md border border-neutral-200 mb-4">
          <ListHeader
            list={list}
            progress={progress}
            allItemsPurchased={allItemsPurchased}
            editingListName={editingListName}
            newListName={newListName}
            setNewListName={setNewListName}
            handleUpdateListName={handleUpdateListName}
            setShowListActions={setShowListActions}
            showListActions={showListActions}
            setEditingListName={setEditingListName}
            setShowCompleteConfirm={setShowCompleteConfirm}
            setShowDeleteListConfirm={setShowDeleteListConfirm}
          />
        </div>
      </motion.div>

      <div className="space-y-3">
        <AnimatePresence>
          {sortedItems.map((item, index) => (
            <ItemCard
              key={item.id}
              item={item}
              index={index}
              onTogglePurchased={handleTogglePurchased}
              onPriceChange={handleActualPriceChange}
              onEdit={() => { setEditingItem(item); setShowAddItem(true); }}
              onDelete={handleDeleteItem}
            />
          ))}
        </AnimatePresence>
      </div>

      {list.items.length === 0 && <EmptyState onAdd={() => setShowAddItem(true)} />}

      <FAB onAdd={() => { setEditingItem(null); setShowAddItem(true); }} />

      <AnimatePresence>
        {showAddItem && (
          <AddItemModal item={editingItem} onSave={handleSaveItem} onClose={() => setShowAddItem(false)} />
        )}
        {showDeleteListConfirm && (
          <ConfirmationModal
            title="Excluir Lista"
            message={`Tem certeza que deseja excluir a lista "${list.name}"? Esta ação é irreversível.`}
            confirmText="Excluir"
            onConfirm={handleDeleteList}
            onCancel={() => setShowDeleteListConfirm(false)}
            isDanger={true}
          />
        )}
        {showCompleteConfirm && (
          <ConfirmationModal
            title="Finalizar Compra"
            message={`Parabéns! Deseja marcar a lista "${list.name}" como concluída?`}
            confirmText="Finalizar"
            onConfirm={handleCompleteList}
            onCancel={() => setShowCompleteConfirm(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// Sub-components for clarity
const ListHeader = ({ list, progress, allItemsPurchased, editingListName, newListName, setNewListName, handleUpdateListName, showListActions, setShowListActions, setEditingListName, setShowCompleteConfirm, setShowDeleteListConfirm }: any) => (
  <>
    <div className="flex justify-between items-start">
      <div className="flex-1 pr-2">
        {editingListName ? (
          <input
            type="text"
            value={newListName}
            onChange={(e) => setNewListName(e.target.value)}
            onBlur={handleUpdateListName}
            onKeyPress={(e) => e.key === 'Enter' && handleUpdateListName()}
            className="text-xl font-bold text-neutral-800 bg-transparent border-b-2 border-primary focus:outline-none w-full"
            autoFocus
          />
        ) : (
          <h2 className="text-xl font-bold text-neutral-800 truncate">{list.name}</h2>
        )}
        <p className="text-sm text-neutral-600">{list.items.filter((i:any) => i.purchased).length} de {list.items.length} itens</p>
      </div>
      <div className="relative">
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => setShowListActions(!showListActions)} className="p-2 text-neutral-500 hover:text-primary transition-colors">
          <MoreVertical className="w-5 h-5" />
        </motion.button>
        <AnimatePresence>
          {showListActions && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="absolute top-10 right-0 bg-white border border-neutral-200 rounded-lg shadow-xl z-20 min-w-[180px]"
            >
              <button onClick={() => { setEditingListName(true); setShowListActions(false); }} className="w-full px-4 py-3 text-left text-neutral-700 hover:bg-neutral-50 flex items-center gap-3 transition-colors">
                <Edit3 className="w-4 h-4" /> Editar Nome
              </button>
              {allItemsPurchased && (
                <button onClick={() => { setShowCompleteConfirm(true); setShowListActions(false); }} className="w-full px-4 py-3 text-left text-success hover:bg-green-50 flex items-center gap-3 transition-colors">
                  <CheckCircle className="w-4 h-4" /> Finalizar
                </button>
              )}
              <button onClick={() => { setShowDeleteListConfirm(true); setShowListActions(false); }} className="w-full px-4 py-3 text-left text-danger hover:bg-red-50 flex items-center gap-3 transition-colors border-t border-neutral-100">
                <Trash2 className="w-4 h-4" /> Excluir Lista
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
    <div className="grid grid-cols-2 gap-3 my-3">
      <div className="bg-neutral-100 p-3 rounded-lg">
        <p className="text-xs text-neutral-600">Total Estimado</p>
        <p className="text-lg font-semibold text-neutral-800">R$ {list.totalEstimated.toFixed(2)}</p>
      </div>
      <div className="bg-green-50 p-3 rounded-lg border border-green-200">
        <p className="text-xs text-green-800 flex items-center gap-1"><TrendingUp className="w-3 h-3" />Total Gasto</p>
        <p className="text-lg font-bold text-success">R$ {list.totalActual.toFixed(2)}</p>
      </div>
    </div>
    <div className="w-full bg-neutral-200 rounded-full h-2.5">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        className={`h-2.5 rounded-full ${progress === 100 ? 'bg-success' : 'bg-gradient-to-r from-primary to-secondary'}`}
      />
    </div>
  </>
);

const ItemCard = ({ item, index, onTogglePurchased, onPriceChange, onEdit, onDelete }: any) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const getPriorityProps = (priority: string) => {
    if (priority === 'high') return { Icon: Star, className: "text-danger fill-danger/20", label: "Alta" };
    if (priority === 'medium') return { Icon: Star, className: "text-warning", label: "Média" };
    return { Icon: Star, className: "text-neutral-400", label: "Baixa" };
  };
  const priority = getPriorityProps(item.priority);

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, x: -50, scale: 0.95 }}
        transition={{ delay: index * 0.03 }}
        className={`bg-white p-3 rounded-xl border-l-4 transition-all duration-300 ${item.purchased ? 'border-success bg-neutral-50' : 'border-primary'}`}
      >
        <div className="flex items-start gap-3">
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => onTogglePurchased(item)} className={`mt-1 w-7 h-7 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${item.purchased ? 'bg-success border-success text-white' : 'border-neutral-300'}`}>
            {item.purchased && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}><Check className="w-4 h-4" /></motion.div>}
          </motion.button>
          <div className="flex-1 min-w-0">
            <h3 className={`font-semibold transition-all ${item.purchased ? 'line-through text-neutral-500' : 'text-neutral-800'}`}>{item.name}</h3>
            <div className="flex items-center gap-4 text-sm text-neutral-600 flex-wrap mt-1">
              <div className="flex items-center gap-1" title="Quantidade"><Package className="w-3.5 h-3.5" /> {item.quantity} {item.unit}</div>
              <div className={`flex items-center gap-1 ${priority.className}`} title={`Prioridade ${priority.label}`}><priority.Icon className="w-3.5 h-3.5" /></div>
            </div>
            {!item.purchased && (
              <p className="text-neutral-700 font-medium mt-2">Total Est.: R$ {(item.estimatedPrice * item.quantity).toFixed(2)}</p>
            )}
            <AnimatePresence>
              {item.purchased && (
                <motion.div initial={{ opacity: 0, height: 0, marginTop: 0 }} animate={{ opacity: 1, height: 'auto', marginTop: '8px' }}>
                  <label className="text-xs font-medium text-success">Preço Real Pago</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 font-medium">R$</span>
                    <input type="number" step="0.01" defaultValue={(item.actualPrice ?? 0).toFixed(2)} onBlur={(e) => onPriceChange(item, e.target.value)} className="w-full pl-10 pr-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-success" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <div className="flex flex-col gap-1">
            <motion.button whileTap={{ scale: 0.9 }} onClick={onEdit} className="p-2 text-neutral-500 hover:text-primary hover:bg-blue-50 rounded-lg transition-colors"><Edit3 className="w-4 h-4" /></motion.button>
            <motion.button whileTap={{ scale: 0.9 }} onClick={() => setShowDeleteConfirm(true)} className="p-2 text-neutral-500 hover:text-danger hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></motion.button>
          </div>
        </div>
      </motion.div>
      <AnimatePresence>
        {showDeleteConfirm && (
          <ConfirmationModal title="Excluir Item" message="Tem certeza que deseja excluir este item?" confirmText="Excluir" onConfirm={() => { onDelete(item.id); setShowDeleteConfirm(false); }} onCancel={() => setShowDeleteConfirm(false)} isDanger={true} />
        )}
      </AnimatePresence>
    </>
  );
};

const FAB = ({ onAdd }: any) => (
  <motion.button
    initial={{ scale: 0, y: 50 }}
    animate={{ scale: 1, y: 0 }}
    whileHover={{ scale: 1.1, rotate: 90 }}
    whileTap={{ scale: 0.9 }}
    onClick={onAdd}
    className="fixed bottom-6 right-6 bg-gradient-to-r from-primary to-secondary text-white w-16 h-16 rounded-full flex items-center justify-center shadow-xl z-30"
    aria-label="Adicionar novo item"
  >
    <Plus className="w-8 h-8" />
  </motion.button>
);

const EmptyState = ({ onAdd }: any) => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
    <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}>
      <Package className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
    </motion.div>
    <h3 className="text-lg font-medium text-neutral-600 mb-2">Sua lista está vazia</h3>
    <p className="text-neutral-500 mb-4">Adicione itens para começar a planejar!</p>
    <button onClick={onAdd} className="bg-primary hover:bg-primary-dark text-white px-6 py-2 rounded-lg font-medium transition-colors">Adicionar Primeiro Item</button>
  </motion.div>
);

const ConfirmationModal = ({ title, message, confirmText, onConfirm, onCancel, isDanger = false }: any) => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white p-6 rounded-xl max-w-sm w-full shadow-2xl">
      <h3 className={`text-lg font-semibold ${isDanger ? 'text-danger' : 'text-neutral-800'} mb-2`}>{title}</h3>
      <p className="text-neutral-600 mb-6">{message}</p>
      <div className="flex gap-3">
        <button onClick={onCancel} className="flex-1 bg-neutral-200 hover:bg-neutral-300 text-neutral-800 p-3 rounded-lg font-medium transition-colors">Cancelar</button>
        <button onClick={onConfirm} className={`flex-1 text-white p-3 rounded-lg font-medium transition-colors ${isDanger ? 'bg-danger hover:bg-red-700' : 'bg-primary hover:bg-primary-dark'}`}>{confirmText}</button>
      </div>
    </motion.div>
  </motion.div>
);
