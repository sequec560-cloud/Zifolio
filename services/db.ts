import { User } from '../types';

const USERS_KEY = 'zifolio_users_db';
const SESSION_KEY = 'zifolio_session_user';

export const db = {
  // Get all users from storage
  getUsers: (): User[] => {
    const usersStr = localStorage.getItem(USERS_KEY);
    return usersStr ? JSON.parse(usersStr) : [];
  },

  // Save a new user
  createUser: (user: Omit<User, 'id' | 'createdAt'>): User => {
    const users = db.getUsers();
    
    // Check if email exists
    if (users.some(u => u.email === user.email)) {
      throw new Error('Este email já está registado.');
    }

    const newUser: User = {
      ...user,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      plan: 'Free' // Default plan
    };

    users.push(newUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    return newUser;
  },

  // Authenticate user
  login: (email: string, password: string): User => {
    const users = db.getUsers();
    const user = users.find(u => u.email === email && u.password === password);
    
    if (!user) {
      throw new Error('Email ou senha inválidos.');
    }
    
    return user;
  },

  // Update existing user
  updateUser: (updatedUser: User): void => {
    const users = db.getUsers();
    const index = users.findIndex(u => u.id === updatedUser.id);
    
    if (index !== -1) {
      users[index] = updatedUser;
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
    }
  },

  // Get mock/default user for first run if no users exist
  getMockUser: (): User => {
    return {
      id: 'mock-user-1',
      name: 'Methew White',
      email: 'investidor@bodiva.ao',
      password: 'password',
      phone: '+244 923 456 789',
      plan: 'Premium',
      createdAt: new Date().toISOString()
    };
  }
};