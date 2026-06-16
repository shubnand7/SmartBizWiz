// Local Storage Keys
const STORAGE_KEY = 'smartTodoList';

// DOM Elements
const todoInput = document.getElementById('todoInput');
const categorySelect = document.getElementById('categorySelect');
const addBtn = document.getElementById('addBtn');
const todoList = document.getElementById('todoList');
const emptyState = document.getElementById('emptyState');
const clearCompletedBtn = document.getElementById('clearCompleted');
const clearAllBtn = document.getElementById('clearAll');
const filterBtns = document.querySelectorAll('.filter-btn');
const totalCount = document.getElementById('totalCount');
const completedCount = document.getElementById('completedCount');
const pendingCount = document.getElementById('pendingCount');

// State
let todos = [];
let currentFilter = 'all';

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    loadTodos();
    renderTodos();
    updateStats();
    setupEventListeners();
});

// Setup Event Listeners
function setupEventListeners() {
    addBtn.addEventListener('click', addTodo);
    todoInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTodo();
    });
    clearCompletedBtn.addEventListener('click', clearCompleted);
    clearAllBtn.addEventListener('click', clearAll);
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.filter;
            renderTodos();
        });
    });
}

// Add Todo
function addTodo() {
    const text = todoInput.value.trim();
    
    if (text === '') {
        alert('Please enter a task!');
        return;
    }

    const todo = {
        id: Date.now(),
        text: text,
        category: categorySelect.value,
        completed: false,
        createdAt: new Date().toLocaleString()
    };

    todos.unshift(todo);
    saveTodos();
    renderTodos();
    updateStats();
    todoInput.value = '';
    todoInput.focus();
}

// Toggle Todo Complete
function toggleTodo(id) {
    todos = todos.map(todo => 
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );
    saveTodos();
    renderTodos();
    updateStats();
}

// Delete Todo
function deleteTodo(id) {
    if (confirm('Are you sure you want to delete this task?')) {
        todos = todos.filter(todo => todo.id !== id);
        saveTodos();
        renderTodos();
        updateStats();
    }
}

// Clear Completed Todos
function clearCompleted() {
    const completedCount = todos.filter(todo => todo.completed).length;
    
    if (completedCount === 0) {
        alert('No completed tasks to clear!');
        return;
    }

    if (confirm(`Are you sure you want to delete ${completedCount} completed task(s)?`)) {
        todos = todos.filter(todo => !todo.completed);
        saveTodos();
        renderTodos();
        updateStats();
    }
}

// Clear All Todos
function clearAll() {
    if (todos.length === 0) {
        alert('No tasks to clear!');
        return;
    }

    if (confirm('Are you sure you want to delete ALL tasks? This cannot be undone!')) {
        todos = [];
        saveTodos();
        renderTodos();
        updateStats();
    }
}

// Render Todos
function renderTodos() {
    todoList.innerHTML = '';

    const filteredTodos = todos.filter(todo => {
        if (currentFilter === 'completed') return todo.completed;
        if (currentFilter === 'active') return !todo.completed;
        return true;
    });

    if (filteredTodos.length === 0) {
        emptyState.classList.add('show');
        return;
    } else {
        emptyState.classList.remove('show');
    }

    filteredTodos.forEach(todo => {
        const li = document.createElement('li');
        li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
        
        li.innerHTML = `
            <input 
                type="checkbox" 
                class="checkbox" 
                ${todo.completed ? 'checked' : ''} 
                onchange="toggleTodo(${todo.id})"
            >
            <div class="todo-content">
                <div class="todo-text">${escapeHtml(todo.text)}</div>
                <span class="todo-category category-${todo.category}">${todo.category}</span>
            </div>
            <div class="todo-actions">
                <button class="btn-delete" onclick="deleteTodo(${todo.id})">Delete</button>
            </div>
        `;
        
        todoList.appendChild(li);
    });
}

// Update Statistics
function updateStats() {
    totalCount.textContent = todos.length;
    completedCount.textContent = todos.filter(todo => todo.completed).length;
    pendingCount.textContent = todos.filter(todo => !todo.completed).length;
}

// Save Todos to Local Storage
function saveTodos() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
    } catch (error) {
        console.error('Error saving todos to local storage:', error);
        alert('Failed to save tasks. Your browser may have disabled local storage.');
    }
}

// Load Todos from Local Storage
function loadTodos() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        todos = stored ? JSON.parse(stored) : [];
    } catch (error) {
        console.error('Error loading todos from local storage:', error);
        todos = [];
    }
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Export todos as JSON (optional feature)
function exportTodos() {
    const dataStr = JSON.stringify(todos, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `todos-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
}

// Import todos from JSON (optional feature)
function importTodos(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const imported = JSON.parse(e.target.result);
            if (Array.isArray(imported)) {
                todos = imported;
                saveTodos();
                renderTodos();
                updateStats();
                alert('Todos imported successfully!');
            } else {
                alert('Invalid file format!');
            }
        } catch (error) {
            alert('Error importing todos: ' + error.message);
        }
    };
    reader.readAsText(file);
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + D to focus input
    if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault();
        todoInput.focus();
    }
});
