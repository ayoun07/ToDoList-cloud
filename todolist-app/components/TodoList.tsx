'use client';

import { useState, useEffect } from 'react';
import { Todo } from '@/types/todo';
import { Trash2, Plus, CheckCircle2, Circle } from 'lucide-react';

export default function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [input, setInput] = useState('');
  const [mounted, setMounted] = useState(false);

  // Charger les tâches depuis le localStorage au montage
  useEffect(() => {
    const storedTodos = localStorage.getItem('todos');
    if (storedTodos) {
      try {
        setTodos(JSON.parse(storedTodos));
      } catch (error) {
        console.error('Erreur lors du chargement des tâches:', error);
      }
    }
    setMounted(true);
  }, []);

  // Sauvegarder les tâches dans le localStorage
  useEffect(() => {
    if (mounted) {
      localStorage.setItem('todos', JSON.stringify(todos));
    }
  }, [todos, mounted]);

  // Ajouter une nouvelle tâche
  const addTodo = () => {
    if (input.trim() === '') return;

    const newTodo: Todo = {
      id: Date.now().toString(),
      text: input,
      completed: false,
      createdAt: new Date(),
    };

    setTodos([newTodo, ...todos]);
    setInput('');
  };

  // Basculer l'état d'une tâche
  const toggleTodo = (id: string) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  // Supprimer une tâche
  const deleteTodo = (id: string) => {
    setTodos(todos.filter((todo) => todo.id !== id));
  };

  // Gérer la touche Entrée
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addTodo();
    }
  };

  const completedCount = todos.filter((todo) => todo.completed).length;
  const totalCount = todos.length;

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* En-tête */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Ma Todo List</h1>
          <p className="text-gray-600">Gérez vos tâches facilement et efficacement</p>
        </div>

        {/* Carte principale */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          {/* Formulaire d'entrée */}
          <div className="flex gap-2 mb-6">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ajouter une nouvelle tâche..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={addTodo}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <Plus size={20} />
              Ajouter
            </button>
          </div>

          {/* Statistiques */}
          {totalCount > 0 && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-gray-700">
                <span className="font-semibold">{completedCount}</span> / <span className="font-semibold">{totalCount}</span> tâches complétées
                {totalCount > 0 && (
                  <span className="ml-2 text-gray-500">
                    ({Math.round((completedCount / totalCount) * 100)}%)
                  </span>
                )}
              </p>
            </div>
          )}

          {/* Liste des tâches */}
          <div className="space-y-2">
            {todos.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-400 text-lg">Aucune tâche pour le moment</p>
                <p className="text-gray-300 text-sm">Ajoutez une tâche pour commencer</p>
              </div>
            ) : (
              todos.map((todo) => (
                <div
                  key={todo.id}
                  className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group"
                >
                  {/* Bouton de complétion */}
                  <button
                    onClick={() => toggleTodo(todo.id)}
                    className="flex-shrink-0 text-gray-400 hover:text-blue-500 transition-colors"
                  >
                    {todo.completed ? (
                      <CheckCircle2 size={24} className="text-blue-500" />
                    ) : (
                      <Circle size={24} />
                    )}
                  </button>

                  {/* Texte de la tâche */}
                  <span
                    className={`flex-1 text-lg ${
                      todo.completed
                        ? 'text-gray-400 line-through'
                        : 'text-gray-800'
                    }`}
                  >
                    {todo.text}
                  </span>

                  {/* Bouton de suppression */}
                  <button
                    onClick={() => deleteTodo(todo.id)}
                    className="flex-shrink-0 text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Pied de page */}
        {todos.length > 0 && (
          <div className="text-center text-gray-600 text-sm">
            <p>
              {todos.filter((todo) => !todo.completed).length} tâche(s) à faire
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
