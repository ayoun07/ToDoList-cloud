"use client";

import { useState, useEffect } from "react";
import { Todo } from "@/types/todo";
import { Trash2, Plus, CheckCircle2, Circle } from "lucide-react";

export default function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTodos() {
      try {
        const response = await fetch("/api/todos");
        if (!response.ok) {
          throw new Error("Impossible de charger les tâches");
        }
        const data: Todo[] = await response.json();
        setTodos(data);
      } catch (error) {
        console.error("Erreur lors du chargement des tâches :", error);
      } finally {
        setLoading(false);
      }
    }

    loadTodos();
  }, []);

  const addTodo = async () => {
    if (input.trim() === "") return;

    try {
      const response = await fetch("/api/todos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: input.trim() }),
      });

      if (!response.ok) {
        throw new Error("Impossible d’ajouter la tâche");
      }

      const createdTodo: Todo = await response.json();
      setTodos([createdTodo, ...todos]);
      setInput("");
    } catch (error) {
      console.error("Erreur lors de l’ajout de la tâche :", error);
    }
  };

  const toggleTodo = async (id: string) => {
    const todo = todos.find((todo) => todo.id === id);
    if (!todo) return;

    try {
      const response = await fetch("/api/todos", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, completed: !todo.completed }),
      });

      if (!response.ok) {
        throw new Error("Impossible de mettre à jour la tâche");
      }

      const updatedTodo: Todo = await response.json();
      setTodos(todos.map((item) => (item.id === id ? updatedTodo : item)));
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la tâche :", error);
    }
  };

  const deleteTodo = async (id: string) => {
    try {
      const response = await fetch("/api/todos", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) {
        throw new Error("Impossible de supprimer la tâche");
      }

      setTodos(todos.filter((todo) => todo.id !== id));
    } catch (error) {
      console.error("Erreur lors de la suppression de la tâche :", error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      addTodo();
    }
  };

  const completedCount = todos.filter((todo) => todo.completed).length;
  const totalCount = todos.length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center text-gray-600">
          Chargement des tâches…
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Ma Todo List
          </h1>
          <p className="text-gray-600">
            Gérez vos tâches facilement et efficacement
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
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

          {totalCount > 0 && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-gray-700">
                <span className="font-semibold">{completedCount}</span> /{" "}
                <span className="font-semibold">{totalCount}</span> tâches
                complétées
                {totalCount > 0 && (
                  <span className="ml-2 text-gray-500">
                    ({Math.round((completedCount / totalCount) * 100)}%)
                  </span>
                )}
              </p>
            </div>
          )}

          <div className="space-y-2">
            {todos.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-400 text-lg">
                  Aucune tâche pour le moment
                </p>
                <p className="text-gray-300 text-sm">
                  Ajoutez une tâche pour commencer
                </p>
              </div>
            ) : (
              todos.map((todo) => (
                <div
                  key={todo.id}
                  className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group"
                >
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

                  <span
                    className={`flex-1 text-lg ${
                      todo.completed
                        ? "text-gray-400 line-through"
                        : "text-gray-800"
                    }`}
                  >
                    {todo.text}
                  </span>

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
