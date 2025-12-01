import { User, Feedback, Asset, Task, Transaction } from '../types';
import { MOCK_ASSETS, MOCK_TRANSACTIONS } from '../constants';

const USERS_KEY = 'zifolio_users_db';
const FEEDBACK_KEY = 'zifolio_feedback_db';
const ASSETS_KEY = 'zifolio_assets_db';
const TASKS_KEY = 'zifolio_tasks_db';
const TRANSACTIONS_KEY = 'zifolio_transactions_db';

// Helper to safely parse JSON
const safeJsonParse = <T>(key: string, fallback: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (error) {
    console.error(`Error parsing ${key} from localStorage:`, error);
    return fallback;
  }
};

export const db = {
  // --- USERS ---

  getUsers: (): User[] => {
    return safeJsonParse<User[]>(USERS_KEY, []);
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

  // --- TRANSACTIONS ---

  getUserTransactions: (userId: string): Transaction[] => {
    const allTransactions = safeJsonParse<Transaction[]>(TRANSACTIONS_KEY, []);
    let userTransactions = allTransactions.filter(t => t.userId === userId);

    // Seed mock transactions if user is mock user and list is empty
    if (userId === 'mock-user-1' && userTransactions.length === 0) {
       const seeded = MOCK_TRANSACTIONS.map(t => ({...t, userId: 'mock-user-1'}));
       db.addTransaction(seeded[0]); // Add individually to trigger save
       db.addTransaction(seeded[1]);
       db.addTransaction(seeded[2]);
       return seeded;
    }
    
    return userTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },

  addTransaction: (transaction: Omit<Transaction, 'id'>): Transaction => {
    const allTransactions = safeJsonParse<Transaction[]>(TRANSACTIONS_KEY, []);
    
    const newTx: Transaction = {
        ...transaction,
        id: Math.random().toString(36).substr(2, 9),
    };

    allTransactions.push(newTx);
    localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(allTransactions));
    return newTx;
  },

  // --- ASSETS ---

  getAllAssets: (): Asset[] => {
    return safeJsonParse<Asset[]>(ASSETS_KEY, []);
  },

  getUserAssets: (userId: string): Asset[] => {
    const allAssets = db.getAllAssets();
    const userAssets = allAssets.filter(a => a.userId === userId);
    
    // Seed data for the Mock User if empty
    if (userId === 'mock-user-1' && userAssets.length === 0) {
      const seededAssets = MOCK_ASSETS.map(a => ({ ...a, userId: 'mock-user-1' }));
      localStorage.setItem(ASSETS_KEY, JSON.stringify([...allAssets, ...seededAssets]));
      return seededAssets;
    }

    return userAssets;
  },

  saveAsset: (asset: Asset): void => {
    const allAssets = db.getAllAssets();
    allAssets.push(asset);
    localStorage.setItem(ASSETS_KEY, JSON.stringify(allAssets));

    // GENERATE TRANSACTION: BUY
    db.addTransaction({
        userId: asset.userId,
        type: 'buy',
        assetName: asset.name,
        amount: asset.investedAmount,
        date: asset.purchaseDate || new Date().toISOString().split('T')[0]
    });
  },

  updateAsset: (updatedAsset: Asset): void => {
    const allAssets = db.getAllAssets();
    const index = allAssets.findIndex(a => a.id === updatedAsset.id);
    
    if (index !== -1) {
      const oldAsset = allAssets[index];
      allAssets[index] = updatedAsset;
      localStorage.setItem(ASSETS_KEY, JSON.stringify(allAssets));

      // GENERATE TRANSACTION: BUY OR SELL based on difference
      const diff = updatedAsset.investedAmount - oldAsset.investedAmount;
      if (diff > 0) {
          db.addTransaction({
              userId: updatedAsset.userId,
              type: 'buy',
              assetName: updatedAsset.name,
              amount: diff,
              date: new Date().toISOString().split('T')[0]
          });
      } else if (diff < 0) {
          db.addTransaction({
              userId: updatedAsset.userId,
              type: 'sell',
              assetName: updatedAsset.name,
              amount: Math.abs(diff),
              date: new Date().toISOString().split('T')[0]
          });
      }
    }
  },

  deleteAsset: (assetId: string): void => {
    let allAssets = db.getAllAssets();
    const asset = allAssets.find(a => a.id === assetId);
    
    allAssets = allAssets.filter(a => a.id !== assetId);
    localStorage.setItem(ASSETS_KEY, JSON.stringify(allAssets));

    // GENERATE TRANSACTION: SELL (Liquidation)
    if (asset) {
        const valueAtExit = asset.quantity * asset.currentPriceUnit;
        db.addTransaction({
            userId: asset.userId,
            type: 'sell',
            assetName: asset.name,
            amount: valueAtExit,
            date: new Date().toISOString().split('T')[0]
        });
    }
  },

  // --- TASKS ---

  getUserTasks: (userId: string): Task[] => {
    const allTasks = safeJsonParse<Task[]>(TASKS_KEY, []);
    return allTasks.filter(t => t.userId === userId);
  },

  addTask: (task: Omit<Task, 'id' | 'createdAt'>): Task => {
    const allTasks = safeJsonParse<Task[]>(TASKS_KEY, []);
    
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
    const allTasks = safeJsonParse<Task[]>(TASKS_KEY, []);
    const index = allTasks.findIndex(t => t.id === taskId);
    
    if (index !== -1) {
      allTasks[index].completed = !allTasks[index].completed;
      localStorage.setItem(TASKS_KEY, JSON.stringify(allTasks));
    }
    return allTasks;
  },

  deleteTask: (taskId: string): void => {
    let allTasks = safeJsonParse<Task[]>(TASKS_KEY, []);
    allTasks = allTasks.filter(t => t.id !== taskId);
    localStorage.setItem(TASKS_KEY, JSON.stringify(allTasks));
  },

  // --- FEEDBACK ---

  saveFeedback: (feedback: Omit<Feedback, 'id' | 'createdAt'>): void => {
    const existingFeedback = safeJsonParse<Feedback[]>(FEEDBACK_KEY, []);
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