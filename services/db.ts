import { User, Feedback, Asset, Task, Transaction } from '../types';
import { MOCK_ASSETS, MOCK_TRANSACTIONS } from '../constants';

const USERS_KEY = 'zifolio_users_db';
const FEEDBACK_KEY = 'zifolio_feedback_db';
const ASSETS_KEY = 'zifolio_assets_db';
const TASKS_KEY = 'zifolio_tasks_db';
const TRANSACTIONS_KEY = 'zifolio_transactions_db';
const SESSION_KEY = 'zifolio_current_session';

const safeJsonParse = <T>(key: string, fallback: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (error) {
    console.error(`Error parsing ${key} from localStorage:`, error);
    return fallback;
  }
};

const safeJsonSet = (key: string, value: any): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error saving ${key} to localStorage:`, error);
  }
};

export const db = {
  // Session
  saveSession: (user: User): void => safeJsonSet(SESSION_KEY, user),
  getSession: (): User | null => safeJsonParse<User | null>(SESSION_KEY, null),
  clearSession: (): void => localStorage.removeItem(SESSION_KEY),

  // Users
  getUsers: (): User[] => safeJsonParse<User[]>(USERS_KEY, []),
  
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
      notificationSettings: { enabled: true, dropThreshold: 10, gainThreshold: 15 }
    };
    users.push(newUser);
    safeJsonSet(USERS_KEY, users);
    return newUser;
  },

  login: (email: string, password: string): User => {
    const users = db.getUsers();
    let user = users.find(u => u.email === email && u.password === password);
    
    // Mock Fallback
    const mock = db.getMockUser();
    if (!user && email === mock.email && password === mock.password) {
      user = mock;
      if (!users.some(u => u.id === mock.id)) {
        users.push(mock);
        safeJsonSet(USERS_KEY, users);
      }
    }

    if (!user) throw new Error('Email ou senha inválidos.');
    return user;
  },

  loginWithGoogle: (email: string, name: string, photoUrl?: string): User => {
    const users = db.getUsers();
    let user = users.find(u => u.email === email);
    if (user) return user;

    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      name, email, password: '', phone: '', photoUrl,
      createdAt: new Date().toISOString(),
      plan: 'Free',
      notificationSettings: { enabled: true, dropThreshold: 10, gainThreshold: 15 }
    };
    users.push(newUser);
    safeJsonSet(USERS_KEY, users);
    return newUser;
  },

  checkEmailExists: (email: string): boolean => {
    return db.getUsers().some(u => u.email === email);
  },

  resetPassword: (email: string, newPassword: string): void => {
    const users = db.getUsers();
    const index = users.findIndex(u => u.email === email);
    if (index === -1) throw new Error('Usuário não encontrado.');
    users[index].password = newPassword;
    safeJsonSet(USERS_KEY, users);
  },

  updateUser: (updatedUser: User): void => {
    const users = db.getUsers();
    const index = users.findIndex(u => u.id === updatedUser.id);
    if (index !== -1) {
      users[index] = updatedUser;
      safeJsonSet(USERS_KEY, users);
      const session = db.getSession();
      if (session && session.id === updatedUser.id) db.saveSession(updatedUser);
    }
  },

  upgradeToPremium: (userId: string): User => {
    const users = db.getUsers();
    const index = users.findIndex(u => u.id === userId);
    if (index === -1) throw new Error('Usuário não encontrado.');
    
    const nextYear = new Date();
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    
    const updated = { ...users[index], plan: 'Premium' as const, planExpiryDate: nextYear.toISOString().split('T')[0] };
    users[index] = updated;
    safeJsonSet(USERS_KEY, users);
    db.saveSession(updated);
    return updated;
  },

  // Assets
  getAllAssets: (): Asset[] => safeJsonParse<Asset[]>(ASSETS_KEY, []),

  getUserAssets: (userId: string): Asset[] => {
    const all = db.getAllAssets();
    const userAssets = all.filter(a => a.userId === userId);
    if (userId === 'mock-user-1' && userAssets.length === 0) {
      const seeded = MOCK_ASSETS.map(a => ({ ...a, userId: 'mock-user-1' }));
      safeJsonSet(ASSETS_KEY, [...all, ...seeded]);
      return seeded;
    }
    return userAssets;
  },

  saveAsset: (asset: Asset): void => {
    const all = db.getAllAssets();
    all.push(asset);
    safeJsonSet(ASSETS_KEY, all);
    db.addTransaction({
      userId: asset.userId, type: 'buy', assetName: asset.name, amount: asset.investedAmount,
      date: asset.purchaseDate || new Date().toISOString().split('T')[0]
    });
  },

  updateAsset: (updated: Asset): void => {
    const all = db.getAllAssets();
    const idx = all.findIndex(a => a.id === updated.id);
    if (idx !== -1) {
      const old = all[idx];
      all[idx] = updated;
      safeJsonSet(ASSETS_KEY, all);
      
      const diff = updated.investedAmount - old.investedAmount;
      if (diff > 0) db.addTransaction({ userId: updated.userId, type: 'buy', assetName: updated.name, amount: diff, date: new Date().toISOString().split('T')[0] });
      else if (diff < 0) db.addTransaction({ userId: updated.userId, type: 'sell', assetName: updated.name, amount: Math.abs(diff), date: new Date().toISOString().split('T')[0] });
    }
  },

  deleteAsset: (id: string): void => {
    const all = db.getAllAssets();
    const asset = all.find(a => a.id === id);
    if (asset) {
      safeJsonSet(ASSETS_KEY, all.filter(a => a.id !== id));
      db.addTransaction({
        userId: asset.userId, type: 'sell', assetName: asset.name, amount: asset.quantity * asset.currentPriceUnit,
        date: new Date().toISOString().split('T')[0]
      });
    }
  },

  // Transactions
  getUserTransactions: (userId: string): Transaction[] => {
    const all = safeJsonParse<Transaction[]>(TRANSACTIONS_KEY, []);
    let userTxs = all.filter(t => t.userId === userId);
    if (userId === 'mock-user-1' && userTxs.length === 0) {
      const seeded = MOCK_TRANSACTIONS.map(t => ({...t, userId: 'mock-user-1'}));
      safeJsonSet(TRANSACTIONS_KEY, [...all, ...seeded]);
      return seeded;
    }
    return userTxs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },

  addTransaction: (tx: Omit<Transaction, 'id'>): Transaction => {
    const all = safeJsonParse<Transaction[]>(TRANSACTIONS_KEY, []);
    const newTx = { ...tx, id: Math.random().toString(36).substr(2, 9) };
    all.push(newTx);
    safeJsonSet(TRANSACTIONS_KEY, all);
    return newTx;
  },

  // Tasks
  getUserTasks: (userId: string): Task[] => safeJsonParse<Task[]>(TASKS_KEY, []).filter(t => t.userId === userId),
  
  addTask: (task: Omit<Task, 'id' | 'createdAt'>): Task => {
    const all = safeJsonParse<Task[]>(TASKS_KEY, []);
    const newTask = { ...task, id: Math.random().toString(36).substr(2, 9), createdAt: new Date().toISOString() };
    all.push(newTask);
    safeJsonSet(TASKS_KEY, all);
    return newTask;
  },

  toggleTask: (id: string): void => {
    const all = safeJsonParse<Task[]>(TASKS_KEY, []);
    const idx = all.findIndex(t => t.id === id);
    if (idx !== -1) {
      all[idx].completed = !all[idx].completed;
      safeJsonSet(TASKS_KEY, all);
    }
  },

  deleteTask: (id: string): void => {
    const all = safeJsonParse<Task[]>(TASKS_KEY, []);
    safeJsonSet(TASKS_KEY, all.filter(t => t.id !== id));
  },

  // Feedback
  saveFeedback: (fb: Omit<Feedback, 'id' | 'createdAt'>): void => {
    const all = safeJsonParse<Feedback[]>(FEEDBACK_KEY, []);
    all.push({ ...fb, id: Math.random().toString(36).substr(2, 9), createdAt: new Date().toISOString() });
    safeJsonSet(FEEDBACK_KEY, all);
  },

  getMockUser: (): User => ({
    id: 'mock-user-1',
    name: 'Methew White',
    email: 'investidor@bodiva.ao',
    password: 'password',
    phone: '+244 923 456 789',
    plan: 'Premium',
    createdAt: new Date().toISOString(),
    notificationSettings: { enabled: true, dropThreshold: 10, gainThreshold: 15 }
  })
};