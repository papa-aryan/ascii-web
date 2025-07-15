const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class ContentDatabase {
    constructor() {
        this.dbPath = path.join(__dirname, 'blog.db');
        this.db = new sqlite3.Database(this.dbPath);
        this.initTables();
    }
    
    initTables() {
        this.db.serialize(() => {
            // Create the table with the new schema if it doesn't exist
            this.db.run(`
                CREATE TABLE IF NOT EXISTS posts (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    title TEXT NOT NULL,
                    content TEXT NOT NULL,
                    type TEXT DEFAULT 'blog',
                    status TEXT DEFAULT 'draft',
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            `);

            // Check if the 'type' column exists
            this.db.all("PRAGMA table_info(posts)", (err, columns) => {
                if (err) {
                    console.error("Failed to get table info:", err);
                    return;
                }
                
                const typeColumnExists = columns.some(col => col.name === 'type');

                // If the 'type' column doesn't exist, add it
                if (!typeColumnExists) {
                    this.db.run("ALTER TABLE posts ADD COLUMN type TEXT DEFAULT 'blog'", (alterErr) => {
                        if (alterErr) {
                            console.error("Failed to alter table:", alterErr);
                        }
                    });
                }
            });
        });
    }
    
    // Save draft with type parameter
    saveDraft(title, content, type = 'blog', callback) {
        // If callback is undefined and type is a function, it means the type parameter was omitted
        if (typeof type === 'function' && callback === undefined) {
            callback = type;
            type = 'blog';
        }
        
        const query = `INSERT INTO posts (title, content, type, status) VALUES (?, ?, ?, 'draft')`;
        this.db.run(query, [title, content, type], function(err) {
            callback(err, this ? this.lastID : null);
        });
    }

    // Get drafts: if type is provided, filter by type; otherwise, get all drafts.
    getDrafts(type, callback) {
        let query;
        let params;

        if (type) {
            query = `SELECT * FROM posts WHERE status = 'draft' AND type = ? ORDER BY updated_at DESC`;
            params = [type];
        } else {
            query = `SELECT * FROM posts WHERE status = 'draft' ORDER BY updated_at DESC`;
            params = [];
        }
        this.db.all(query, params, callback);
    }
    
    // Update draft with type parameter
    updateDraft(id, title, content, type = 'blog', callback) {
        // Handle case where type is omitted and callback is passed as 4th parameter
        if (typeof type === 'function' && callback === undefined) {
            callback = type;
            type = 'blog';
        }
        
        const query = `UPDATE posts SET title = ?, content = ?, type = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND status = 'draft'`;
        this.db.run(query, [title, content, type, id], callback);
    }
    
    // Delete draft (also wasn't included/shown but i didn't want to remove it just in case)
    deleteDraft(id, callback) {
        const query = `DELETE FROM posts WHERE id = ? AND status = 'draft'`;
        this.db.run(query, [id], callback);
    }

    // Methods for published journals
    publishJournal(title, content, callback) {
        const query = `INSERT INTO posts (title, content, type, status) VALUES (?, ?, 'journal', 'published')`;
        this.db.run(query, [title, content], function(err) {
            callback(err, this ? this.lastID : null);
        });
    }

    // Get all published journals
    getAllPublishedJournals(callback) {
        const query = `SELECT * FROM posts WHERE status = 'published' AND type = 'journal' ORDER BY created_at DESC`;
        this.db.all(query, callback);
    }

    // Get a specific journal by ID
    getJournal(id, callback) {
        const query = `SELECT * FROM posts WHERE id = ? AND type = 'journal'`;
        this.db.get(query, [id], callback);
    }

    // Delete a published journal
    deleteJournal(id, callback) {
        const query = `DELETE FROM posts WHERE id = ? AND type = 'journal' AND status = 'published'`;
        this.db.run(query, [id], callback);
    }

    close() {
        this.db.close();
    }
}

module.exports = ContentDatabase;