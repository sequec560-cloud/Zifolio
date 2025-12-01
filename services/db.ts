import { User, Feedback, Asset } from '../types';
import { MOCK_ASSETS } from '../constants';

const USERS_KEY = 'zifolio_users_db';
const FEEDBACK_KEY = 'zifolio_feedback_db';
const ASSETS_KEY = 'zifolio_assets_db';

export const db = {
  // --- USERS ---

  getUsers: (): User[] => {
    const usersStr = localStorage.getItem(USERS_KEY);
    return usersStr ? JSON.parse(usersStr) : [];
  },

  createUser: (user: Omit<User, 'id' | 'createdAt'>): User => {
    const users = db.getUsers();
    
    if (users.some(u => u.email === user.email)) {
      throw new Error('Este email já está registado.');
    }

    const newUser: User = {
      ...user,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      plan: 'Free',
      notificationSettings: {
        enabled: true,
        dropThreshold: 10,
        gainThreshold: 15
      }
    };

    users.push(newUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    return newUser;
  },

  login: (email: string, password: string): User => {
    const users = db.getUsers();
    // Also check against the hardcoded mock user for fallback access if LS is empty
    let user = users.find(u => u.email === email && u.password === password);
    
    if (!user) {
      // Mock User Fallback
      const mock = db.getMockUser();
      if (email === mock.email && password === mock.password) {
        user = mock;
        // Ensure mock user is in DB so asset saving works later
        if (!users.some(u => u.id === mock.id)) {
          users.push(mock);
          localStorage.setItem(USERS_KEY, JSON.stringify(users));
        }
      }
    }

    if (!user) {
      throw new Error('Email ou senha inválidos.');
    }
    
    return user;
  },

  checkEmailExists: (email: string): boolean => {
    const users = db.getUsers();
    return users.some(u => u.email === email);
  },

  resetPassword: (email: string, newPassword: string): void => {
    const users = db.getUsers();
    const index = users.findIndex(u => u.email === email);
    
    if (index === -1) {
      throw new Error('Usuário não encontrado.');
    }

    users[index].password = newPassword;
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  },

  updateUser: (updatedUser: User): void => {
    const users = db.getUsers();
    const index = users.findIndex(u => u.id === updatedUser.id);
    
    if (index !== -1) {
      users[index] = updatedUser;
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
    }
  },

  // --- ASSETS ---

  getAllAssets: (): Asset[] => {
    const str = localStorage.getItem(ASSETS_KEY);
    return str ? JSON.parse(str) : [];
  },

  getUserAssets: (userId: string): Asset[] => {
    const allAssets = db.getAllAssets();
    const userAssets = allAssets.filter(a => a.userId === userId);
    
    // Seed data for the Mock User if empty
    if (userId === 'mock-user-1' && userAssets.length === 0) {
      const seededAssets = MOCK_ASSETS.map(a => ({ ...a, userId: 'mock-user-1' }));
      // Save seeded assets
      localStorage.setItem(ASSETS_KEY, JSON.stringify([...allAssets, ...seededAssets]));
      return seededAssets;
    }

    return userAssets;
  },

  saveAsset: (asset: Asset): void => {
    const allAssets = db.getAllAssets();
    allAssets.push(asset);
    localStorage.setItem(ASSETS_KEY, JSON.stringify(allAssets));
  },

  updateAsset: (updatedAsset: Asset): void => {
    const allAssets = db.getAllAssets();
    const index = allAssets.findIndex(a => a.id === updatedAsset.id);
    if (index !== -1) {
      allAssets[index] = updatedAsset;
      localStorage.setItem(ASSETS_KEY, JSON.stringify(allAssets));
    }
  },

  deleteAsset: (assetId: string): void => {
    let allAssets = db.getAllAssets();
    allAssets = allAssets.filter(a => a.id !== assetId);
    localStorage.setItem(ASSETS_KEY, JSON.stringify(allAssets));
  },

  // --- FEEDBACK ---

  saveFeedback: (feedback: Omit<Feedback, 'id' | 'createdAt'>): void => {
    const existingFeedback = JSON.parse(localStorage.getItem(FEEDBACK_KEY) || '[]');
    const newFeedback: Feedback = {
      ...feedback,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString()
    };
    existingFeedback.push(newFeedback);
    localStorage.setItem(FEEDBACK_KEY, JSON.stringify(existingFeedback));
  },

  getMockUser: (): User => {
    return {
      id: 'mock-user-1',
      name: 'Methew White',
      email: 'investidor@bodiva.ao',
      password: 'password',
      phone: '+244 923 456 789',
      plan: 'Premium',
      createdAt: new Date().toISOString(),
      notificationSettings: {
        enabled: true,
        dropThreshold: 10,
        gainThreshold: 15
      }
    };
  }
};