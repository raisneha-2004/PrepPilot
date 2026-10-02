import fs from 'node:fs/promises';
import path from 'node:path';
import { v4 as uuidv4 } from 'uuid';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

/**
 * Robust JSON File Repository with atomic writes and concurrency lock
 */
export class FileRepository {
  constructor(collectionName, storageDir = env.STORAGE_DIR) {
    this.collectionName = collectionName;
    this.storageDir = path.resolve(process.cwd(), storageDir);
    this.filePath = path.join(this.storageDir, `${collectionName}.json`);
    this._writeQueue = Promise.resolve();
    this._dataCache = null;
    this._initialized = false;
  }

  async _init() {
    if (this._initialized) return;
    try {
      await fs.mkdir(this.storageDir, { recursive: true });
      try {
        const raw = await fs.readFile(this.filePath, 'utf-8');
        this._dataCache = JSON.parse(raw);
        if (!Array.isArray(this._dataCache)) {
          this._dataCache = [];
        }
      } catch (err) {
        if (err.code === 'ENOENT') {
          this._dataCache = [];
          await this._atomicSave(this._dataCache);
        } else {
          logger.error({ err, collection: this.collectionName }, 'Error reading JSON file store');
          this._dataCache = [];
        }
      }
      this._initialized = true;
    } catch (err) {
      logger.error({ err, collection: this.collectionName }, 'Failed to initialize repository directory');
      throw err;
    }
  }

  async _atomicSave(data) {
    const tempFile = `${this.filePath}.${uuidv4()}.tmp`;
    const jsonString = JSON.stringify(data, null, 2);
    try {
      await fs.writeFile(tempFile, jsonString, 'utf-8');
      
      // On Windows, rename can occasionally throw EPERM if the target file is momentarily open.
      // We implement a retry mechanism.
      let attempts = 0;
      while (attempts < 5) {
        try {
          await fs.rename(tempFile, this.filePath);
          break;
        } catch (renameErr) {
          attempts++;
          if (attempts >= 5) {
            // Fallback: direct write if rename fails
            await fs.writeFile(this.filePath, jsonString, 'utf-8');
            try { await fs.unlink(tempFile); } catch (_) {}
            break;
          }
          await new Promise((r) => setTimeout(r, 20 * attempts));
        }
      }
    } catch (err) {
      try {
        await fs.unlink(tempFile);
      } catch (_) {}
      logger.error({ err, collection: this.collectionName }, 'Failed atomic write to repository');
      throw err;
    }
  }

  _enqueueWrite(fn) {
    this._writeQueue = this._writeQueue.then(fn).catch((err) => {
      logger.error({ err, collection: this.collectionName }, 'Repository write queue error');
      throw err;
    });
    return this._writeQueue;
  }

  async list() {
    await this._init();
    return [...this._dataCache];
  }

  async find(predicate) {
    await this._init();
    return this._dataCache.filter(predicate);
  }

  async findOne(predicate) {
    await this._init();
    const item = this._dataCache.find(predicate);
    return item ? { ...item } : null;
  }

  async findById(id) {
    await this._init();
    const item = this._dataCache.find((d) => d.id === id || d.userId === id);
    return item ? { ...item } : null;
  }

  async create(item) {
    await this._init();
    return this._enqueueWrite(async () => {
      const doc = {
        id: item.id || uuidv4(),
        ...item,
        createdAt: item.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      this._dataCache.push(doc);
      await this._atomicSave(this._dataCache);
      return { ...doc };
    });
  }

  async update(id, updates) {
    await this._init();
    return this._enqueueWrite(async () => {
      const index = this._dataCache.findIndex((d) => d.id === id || d.userId === id);
      if (index === -1) {
        return null;
      }
      const updated = {
        ...this._dataCache[index],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      this._dataCache[index] = updated;
      await this._atomicSave(this._dataCache);
      return { ...updated };
    });
  }

  async upsert(idOrPredicate, doc) {
    await this._init();
    return this._enqueueWrite(async () => {
      const index = typeof idOrPredicate === 'function'
        ? this._dataCache.findIndex(idOrPredicate)
        : this._dataCache.findIndex((d) => d.id === idOrPredicate || d.userId === idOrPredicate);

      if (index >= 0) {
        const updated = {
          ...this._dataCache[index],
          ...doc,
          updatedAt: new Date().toISOString()
        };
        this._dataCache[index] = updated;
        await this._atomicSave(this._dataCache);
        return { ...updated };
      } else {
        const newDoc = {
          id: typeof idOrPredicate === 'string' ? idOrPredicate : (doc.id || uuidv4()),
          ...doc,
          createdAt: doc.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        this._dataCache.push(newDoc);
        await this._atomicSave(this._dataCache);
        return { ...newDoc };
      }
    });
  }

  async delete(id) {
    await this._init();
    return this._enqueueWrite(async () => {
      const index = this._dataCache.findIndex((d) => d.id === id || d.userId === id);
      if (index === -1) return false;
      this._dataCache.splice(index, 1);
      await this._atomicSave(this._dataCache);
      return true;
    });
  }

  async clear() {
    await this._init();
    return this._enqueueWrite(async () => {
      this._dataCache = [];
      await this._atomicSave(this._dataCache);
    });
  }
}
