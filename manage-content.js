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
  node manage-content.js list <type>      - Lists all published posts of a type ('blog' or 'mini').
  node manage-content.js delete <type> <id> - Deletes a specific post by its ID.

Examples:
  node manage-content.js list mini
  node manage-content.js delete mini 12
    `);
}

function listContent(contentType) {
    if (contentType === 'mini') {
        db.getAllPublishedMinis((err, items) => {
            if (err) return console.error('Error:', err.message);
            console.log(`--- Published Minis ---`);
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

    if (contentType === 'mini') {
        db.deleteMini(contentId, function(err) {
            if (err) return console.error('Error:', err.message);
            if (this.changes === 0) {
                console.log(`No mini found with ID ${contentId}.`);
            } else {
                console.log(`Mini with ID ${contentId} has been deleted.`);
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