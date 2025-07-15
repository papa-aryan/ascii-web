const ContentDatabase = require('./database/database.js');
const db = new ContentDatabase();

const command = process.argv[2];
const type = process.argv[3];
const id = process.argv[4];

function printHelp() {
    console.log(`
Content Management Script
-------------------------
Usage:
  node manage-content.js list <type>      - Lists all published posts of a type ('blog' or 'journal').
  node manage-content.js delete <type> <id> - Deletes a specific post by its ID.

Examples:
  node manage-content.js list journal
  node manage-content.js delete journal 12
    `);
}

function listContent(contentType) {
    if (contentType === 'journal') {
        db.getAllPublishedJournals((err, items) => {
            if (err) return console.error('Error:', err.message);
            console.log(`--- Published Journals ---`);
            items.forEach(item => console.log(`ID: ${item.id}, Title: ${item.title}`));
            db.close();
        });
    } else {
        console.log("Listing for this type is not implemented yet.");
        db.close();
    }
}

function deleteContent(contentType, contentId) {
    if (!contentId) {
        console.error('Error: Please provide an ID to delete.');
        db.close();
        return;
    }

    if (contentType === 'journal') {
        db.deleteJournal(contentId, function(err) {
            if (err) return console.error('Error:', err.message);
            if (this.changes === 0) {
                console.log(`No journal found with ID ${contentId}.`);
            } else {
                console.log(`Journal with ID ${contentId} has been deleted.`);
            }
            db.close();
        });
    } else {
        console.log("Deletion for this type is not implemented yet.");
        db.close();
    }
}


if (command === 'list') {
    listContent(type);
} else if (command === 'delete') {
    deleteContent(type, id);
} else {
    printHelp();
    db.close();
}