
import React, { useState, useEffect, useMemo } from 'react';
import * as todoService from '../services/todoService';
import { TodoItem, Priority } from '../types';
import { ClipboardDocumentListIcon, PlusIcon, PencilIcon, TrashIcon, CheckIcon, XMarkIcon, ChartBarIcon } from './icons/Icons';

interface TodoListProps {
  agentName: string;
}

const getPriorityColor = (priority: Priority): string => {
    switch (priority) {
        case 'High': return 'bg-red-500';
        case 'Medium': return 'bg-yellow-500';
        case 'Low': return 'bg-blue-500';
        default: return 'bg-gray-500';
    }
};

const priorities: Priority[] = ['Low', 'Medium', 'High'];
const priorityOrder: Record<Priority, number> = { 'High': 1, 'Medium': 2, 'Low': 3 };

const TodoList: React.FC<TodoListProps> = ({ agentName }) => {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [newTodoText, setNewTodoText] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const [sortByPriority, setSortByPriority] = useState(false);

  useEffect(() => {
    const loadedTodos = todoService.getTodosForAgent(agentName).map(t => ({
      ...t,
      priority: t.priority || 'Medium', // Add default for old data
    }));
    setTodos(loadedTodos);
  }, [agentName]);

  const displayedTodos = useMemo(() => {
    return [...todos].sort((a, b) => {
        // Incomplete tasks always come before completed tasks
        if (a.completed !== b.completed) {
            return a.completed ? 1 : -1;
        }
        if (sortByPriority) {
            return priorityOrder[a.priority] - priorityOrder[b.priority];
        }
        // Default sort is handled by how items are added (newest first)
        return 0;
    });
  }, [todos, sortByPriority]);


  const updateAndSave = (newTodos: TodoItem[]) => {
    setTodos(newTodos);
    todoService.saveTodosForAgent(agentName, newTodos);
  };

  const handleAddTodo = () => {
    if (newTodoText.trim() === '') return;
    const newTodo: TodoItem = {
      id: Date.now().toString(),
      text: newTodoText.trim(),
      completed: false,
      priority: 'Medium',
    };
    updateAndSave([newTodo, ...todos]);
    setNewTodoText('');
  };
  
  const handleToggleTodo = (id: string) => {
    const newTodos = todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );
    updateAndSave(newTodos);
  };

  const handleDeleteTodo = (id: string) => {
    updateAndSave(todos.filter(todo => todo.id !== id));
  };
  
  const startEditing = (todo: TodoItem) => {
    setEditingId(todo.id);
    setEditingText(todo.text);
  };
  
  const handleSaveEdit = () => {
    if (editingId === null || editingText.trim() === '') return;
    const newTodos = todos.map(todo =>
      todo.id === editingId ? { ...todo, text: editingText.trim() } : todo
    );
    updateAndSave(newTodos);
    setEditingId(null);
    setEditingText('');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingText('');
  };

  const handlePriorityCycle = (id: string) => {
    const newTodos = todos.map(todo => {
        if (todo.id === id) {
            const currentIndex = priorities.indexOf(todo.priority);
            const nextIndex = (currentIndex + 1) % priorities.length;
            return { ...todo, priority: priorities[nextIndex] };
        }
        return todo;
    });
    updateAndSave(newTodos);
  };

  return (
    <div className="p-2 bg-overlay/50 rounded-lg">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-semibold text-highlight flex items-center gap-2">
          <ClipboardDocumentListIcon className="w-5 h-5" />
          Agent Task List
        </h3>
        <button 
            onClick={() => setSortByPriority(!sortByPriority)}
            className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded-md transition-colors ${sortByPriority ? 'bg-primary text-white' : 'bg-overlay text-text-secondary hover:bg-surface'}`}
            title="Sort tasks by priority"
        >
            <ChartBarIcon className="w-4 h-4" />
            Sort by Priority
        </button>
      </div>

      <div className="flex gap-2 mb-3">
        <input
          type="text"
          value={newTodoText}
          onChange={(e) => setNewTodoText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAddTodo()}
          placeholder="Add a new task..."
          className="flex-grow bg-overlay border border-secondary rounded-lg py-1 px-2 text-sm"
        />
        <button onClick={handleAddTodo} className="p-2 rounded-full text-white bg-secondary hover:bg-opacity-80">
          <PlusIcon className="w-4 h-4" />
        </button>
      </div>
      <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
        {displayedTodos.length === 0 ? (
            <p className="text-sm text-text-secondary italic text-center py-4">No tasks yet.</p>
        ) : displayedTodos.map(todo => (
          <div key={todo.id} className="group flex items-center gap-2 bg-overlay p-2 rounded-lg animate-fadeIn">
            {editingId === todo.id ? (
                <>
                    <input
                        type="text"
                        value={editingText}
                        onChange={e => setEditingText(e.target.value)}
                        onKeyDown={e => {
                            if (e.key === 'Enter') handleSaveEdit();
                            if (e.key === 'Escape') handleCancelEdit();
                        }}
                        className="flex-grow bg-surface border border-primary rounded px-2 py-1 text-sm"
                        autoFocus
                    />
                    <button onClick={handleSaveEdit} className="p-1 text-green-400 hover:text-green-300" title="Save"><CheckIcon className="w-4 h-4" /></button>
                    <button onClick={handleCancelEdit} className="p-1 text-text-secondary hover:text-white" title="Cancel"><XMarkIcon className="w-4 h-4" /></button>
                </>
            ) : (
                <>
                    <input
                        type="checkbox"
                        checked={todo.completed}
                        onChange={() => handleToggleTodo(todo.id)}
                        className="h-4 w-4 bg-surface border-secondary rounded text-primary focus:ring-primary flex-shrink-0"
                    />
                    <button 
                        onClick={() => handlePriorityCycle(todo.id)}
                        className="flex-shrink-0 w-3 h-3 rounded-full transition-transform hover:scale-125"
                        style={{ backgroundColor: getPriorityColor(todo.priority).replace('bg-', '#').replace('-500', '') }}
                        title={`Priority: ${todo.priority}. Click to change.`}
                    />
                    <span className={`flex-grow text-sm ${todo.completed ? 'line-through text-text-secondary' : 'text-text-primary'}`}>
                        {todo.text}
                    </span>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => startEditing(todo)} className="p-1 text-highlight hover:text-white" title="Edit"><PencilIcon className="w-4 h-4" /></button>
                        <button onClick={() => handleDeleteTodo(todo.id)} className="p-1 text-red-400 hover:text-red-300" title="Delete"><TrashIcon className="w-4 h-4" /></button>
                    </div>
                </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TodoList;