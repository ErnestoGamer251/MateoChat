const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());

// Conexión a PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Función para generar tokens JWT
const generateToken = (user) => {
  return jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '1h' });
};

// Middleware para verificar token JWT
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) return res.status(401).json({ error: 'No autorizado' });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Token inválido' });
    req.user = user;
    next();
  });
};

// --- RUTAS API ---

// POST /signup - Registrar un nuevo usuario
app.post('/signup', async (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const result = await pool.query(
      'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id, username',
      [username, hashedPassword]
    );
    const token = generateToken(result.rows[0]);
    res.status(201).json({ message: 'Usuario registrado', token });
  } catch (error) {
    res.status(500).json({ error: 'Error al registrar usuario' });
  }
});

// POST /login - Autenticar al usuario
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const userResult = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    if (userResult.rows.length === 0) return res.status(400).json({ error: 'Usuario no encontrado' });

    const user = userResult.rows[0];
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).json({ error: 'Contraseña incorrecta' });

    const token = generateToken(user);
    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: 'Error en el inicio de sesión' });
  }
});

// GET /messages - Obtener mensajes entre dos usuarios
app.get('/messages', authenticateToken, async (req, res) => {
  const { receiver_id } = req.query;
  const sender_id = req.user.id;

  try {
    const result = await pool.query(
      'SELECT * FROM messages WHERE (sender_id = $1 AND receiver_id = $2) OR (sender_id = $2 AND receiver_id = $1) ORDER BY timestamp ASC',
      [sender_id, receiver_id]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los mensajes' });
  }
});

// POST /messages - Enviar un nuevo mensaje
app.post('/messages', authenticateToken, async (req, res) => {
  const { receiver_id, message_content } = req.body;
  const sender_id = req.user.id;

  try {
    await pool.query(
      'INSERT INTO messages (sender_id, receiver_id, message_content) VALUES ($1, $2, $3)',
      [sender_id, receiver_id, message_content]
    );
    res.status(201).json({ message: 'Mensaje enviado' });
  } catch (error) {
    res.status(500).json({ error: 'Error al enviar el mensaje' });
  }
});

// PUT /profile - Editar el perfil del usuario
app.put('/profile', authenticateToken, async (req, res) => {
  const { username, profile_pic } = req.body;
  const user_id = req.user.id;

  try {
    await pool.query(
      'UPDATE users SET username = $1, profile_pic = $2 WHERE id = $3',
      [username, profile_pic, user_id]
    );
    res.json({ message: 'Perfil actualizado' });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar el perfil' });
  }
});

// Iniciar el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});
