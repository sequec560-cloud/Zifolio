import { User, Feedback, Asset, Task } from '../types';
import { MOCK_ASSETS } from '../constants';

const USERS_KEY = 'zifolio_users_db';
const FEEDBACK_KEY = 'zifolio_feedback_db';
const ASSETS_KEY = 'zifolio_assets_db';
const TASKS_KEY = 'zifolio_tasks_db';

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

  loginWithGoogle: (email: string, name: string, photoUrl?: string): User => {
    const users = db.getUsers();
    let user = users.find(u => u.email === email);

    if (user) {
      return user;
    }

    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      email,
      password: '', // External auth doesn't store password locally usually
      phone: '',
      photoUrl,
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

  upgradeToPremium: (userId: string): User => {
    const users = db.getUsers();
    const index = users.findIndex(u => u.id === userId);

    if (index === -1) {
      throw new Error('Usuário não encontrado.');
    }

    const nextYear = new Date();
    nextYear.setFullYear(nextYear.getFullYear() + 1);

    const updatedUser = {
      ...users[index],
      plan: 'Premium' as const,
      planExpiryDate: nextYear.toISOString().split('T')[0] // YYYY-MM-DD
    };

    users[index] = updatedUser;
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    return updatedUser;
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

  // --- TASKS ---

  getUserTasks: (userId: string): Task[] => {
    const allTasksStr = localStorage.getItem(TASKS_KEY);
    const allTasks: Task[] = allTasksStr ? JSON.parse(allTasksStr) : [];
    return allTasks.filter(t => t.userId === userId);
  },

  addTask: (task: Omit<Task, 'id' | 'createdAt'>): Task => {
    const allTasksStr = localStorage.getItem(TASKS_KEY);
    const allTasks: Task[] = allTasksStr ? JSON.parse(allTasksStr) : [];
    
    const newTask: Task = {
      ...task,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString()
    };
    
    allTasks.push(newTask);
    localStorage.setItem(TASKS_KEY, JSON.stringify(allTasks));
    return newTask;
  },

  toggleTask: (taskId: string): Task[] => {
    const allTasksStr = localStorage.getItem(TASKS_KEY);
    if (!allTasksStr) return [];
    
    const allTasks: Task[] = JSON.parse(allTasksStr);
    const index = allTasks.findIndex(t => t.id === taskId);
    
    if (index !== -1) {
      allTasks[index].completed = !allTasks[index].completed;
      localStorage.setItem(TASKS_KEY, JSON.stringify(allTasks));
    }
    return allTasks;
  },

  deleteTask: (taskId: string): void => {
    const allTasksStr = localStorage.getItem(TASKS_KEY);
    if (!allTasksStr) return;
    
    let allTasks: Task[] = JSON.parse(allTasksStr);
    allTasks = allTasks.filter(t => t.id !== taskId);
    localStorage.setItem(TASKS_KEY, JSON.stringify(allTasks));
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