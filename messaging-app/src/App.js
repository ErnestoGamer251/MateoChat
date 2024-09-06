import React, { useState, useContext } from 'react';
import axios from 'axios';
import AuthContext from './AuthContext';

const App = () => {
  const { login, token } = useContext(AuthContext);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [messages, setMessages] = useState([]);
  const [receiverId, setReceiverId] = useState('');
  const [newMessage, setNewMessage] = useState('');

  const handleLogin = () => {
    login(username, password);
  };

  const fetchMessages = async () => {
    try {
      const res = await axios.get('http://localhost:3000/messages', {
        params: { receiver_id: receiverId },
        headers: { Authorization: token },
      });
      setMessages(res.data);
    } catch (error) {
      console.error('Error al obtener mensajes', error);
    }
  };

  const sendMessage = async () => {
    try {
      await axios.post(
        'http://localhost:3000/messages',
        { receiver_id: receiverId, message_content: newMessage },
        { headers: { Authorization: token } }
      );
      fetchMessages();
    } catch (error) {
      console.error('Error al enviar mensaje', error);
    }
  };

  return (
    <div>
      <h1>App de Mensajería</h1>

      {/* Formulario de inicio de sesión */}
      <div>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button onClick={handleLogin}>Login</button>
      </div>

      {/* Enviar mensajes */}
      <div>
        <input
          type="text"
          placeholder="ID del receptor"
          value={receiverId}
          onChange={(e) => setReceiverId(e.target.value)}
        />
        <input
          type="text"
          placeholder="Nuevo mensaje"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <button onClick={sendMessage}>Enviar</button>
      </div>

      {/* Mostrar mensajes */}
      <div>
        <h2>Mensajes</h2>
        <button onClick={fetchMessages}>Obtener mensajes</button>
        <ul>
          {messages.map((msg) => (
            <li key={msg.id}>
              {msg.sender_id}: {msg.message_content}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default App;
