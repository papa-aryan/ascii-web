const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class BlogDatabase {
    constructor() {
        this.dbPath = path.join(__dirname, 'blog.db');
        this.db = new sqlite3.Database(this.dbPath);
        this.initTables();
    }
    
    initTables() {
        this.db.serialize(() => {
            this.db.run(`
                CREATE TABLE IF NOT EXISTS posts (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    title TEXT NOT NULL,
                    content TEXT NOT NULL,
                    status TEXT DEFAULT 'draft',
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            `);
        });
    }
    
    // Save draft (simple version)
    saveDraft(title, content, callback) {
        const query = `INSERT INTO posts (title, content, status) VALUES (?, ?, 'draft')`;
        this.db.run(query, [title, content], function(err) {
            callback(err, this ? this.lastID : null);
        });
    }
    
    // Get all drafts
    getAllDrafts(callback) {
        const query = `SELECT * FROM posts WHERE status = 'draft' ORDER BY updated_at DESC`;
        this.db.all(query, callback);
    }
    
    // Update draft
    updateDraft(id, title, content, callback) {
        const query = `UPDATE posts SET title = ?, content = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND status = 'draft'`;
        this.db.run(query, [title, content, id], callback);
    }
    
    // Delete draft
    deleteDraft(id, callback) {
        const query = `DELETE FROM posts WHERE id = ? AND status = 'draft'`;
        this.db.run(query, [id], callback);
    }
    
    close() {
        this.db.close();
    }
}

module.exports = BlogDatabase;