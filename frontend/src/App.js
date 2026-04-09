import { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';

const API = process.env.REACT_APP_API_URL || 'http://localhost:3000';

function App() {
  const [todos, setTodos] = useState([]);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchTodos = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/api/todos`);
      setTodos(res.data);
    } catch (err) {
      console.error("Error fetching todos:", err);
    } finally {
      setLoading(false);
    }
  };

  const addTodo = async () => {
    if (!title.trim()) return;
    try {
      await axios.post(`${API}/api/todos`, { title });
      setTitle("");
      fetchTodos();
    } catch (err) {
      console.error("Error adding todo:", err);
    }
  };

  const deleteTodo = async (id) => {
    try {
      await axios.delete(`${API}/api/todos/${id}`);
      fetchTodos();
    } catch (err) {
      console.error("Error deleting todo:", err);
    }
  };

  const toggleTodo = async (id, completed) => {
    try {
      await axios.put(`${API}/api/todos/${id}`, { completed: !completed });
      fetchTodos();
    } catch (err) {
      console.error("Error updating todo:", err);
    }
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  return (
    <div className="container">
      <h2>📝 Todo App</h2>
      
      <div className="input-section">
        <input 
          value={title} 
          onChange={(e) => setTitle(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && addTodo()}
          placeholder="Add a new todo..."
        />
        <button onClick={addTodo}>Add</button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : todos.length === 0 ? (
        <p className="empty">No todos yet. Add one to get started!</p>
      ) : (
        <ul className="todo-list">
          {todos.map(t => (
            <li key={t._id} className={t.completed ? 'completed' : ''}>
              <input 
                type="checkbox" 
                checked={t.completed}
                onChange={() => toggleTodo(t._id, t.completed)}
              />
              <span>{t.title}</span>
              <button onClick={() => deleteTodo(t._id)} className="delete">Delete</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default App;
