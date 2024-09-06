CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  profile_pic VARCHAR(255),
  status VARCHAR(50) DEFAULT 'offline'
);

CREATE TABLE messages (
  id SERIAL PRIMARY KEY,
  sender_id INT REFERENCES users(id),
  receiver_id INT REFERENCES users(id),
  message_content TEXT NOT NULL,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla opcional para gestionar amigos
CREATE TABLE friends (
  user_id INT REFERENCES users(id),
  friend_id INT REFERENCES users(id),
  PRIMARY KEY (user_id, friend_id)
);
