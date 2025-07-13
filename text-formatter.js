/**
 * TextFormatter class for handling text formatting with word wrapping
 * Provides OOP approach to text processing for blog posts and minis
 */
class TextFormatter {
    constructor(options = {}) {
        this.maxLineLength = options.maxLineLength || 80;
        this.preserveMarkdown = options.preserveMarkdown !== false;
        this.breakLongWords = options.breakLongWords !== false;
    }

    /**
     * Formats text with word wrapping and markdown parsing
     * @param {string} text - The text to format
     * @returns {string} - Formatted HTML
     */
    format(text) {
        if (!text) return '';

        // Split into paragraphs (double newlines)
        const paragraphs = text.split(/\n\s*\n/);
        
        return paragraphs
            .map(paragraph => this.formatParagraph(paragraph))
            .join('\n\n');
    }

    /**
     * Formats a single paragraph with word wrapping
     * @param {string} paragraph - The paragraph text
     * @returns {string} - Formatted HTML paragraph
     */
    formatParagraph(paragraph) {
        if (!paragraph.trim()) return '';

        // Apply markdown formatting first
        let formattedText = this.preserveMarkdown ? this.parseMarkdown(paragraph) : paragraph;
        
        // Apply word wrapping
        const wrappedText = this.wrapText(formattedText);
        
        return `<p>${wrappedText}</p>`;
    }

    /**
     * Wraps text to specified line length while preserving HTML tags
     * @param {string} text - The text to wrap
     * @returns {string} - Wrapped text with <br> tags
     */
    wrapText(text) {
        // Split by existing line breaks and process each line
        const lines = text.split(/\r?\n/);
        
        return lines
            .map(line => this.wrapLine(line))
            .join('<br>');
    }

    /**
     * Wraps a single line of text
     * @param {string} line - The line to wrap
     * @returns {string} - Wrapped line
     */
    wrapLine(line) {
        if (!line.trim()) return '';

        const words = line.split(/\s+/);
        const wrappedLines = [];
        let currentLine = '';
        let currentLength = 0;

        for (const word of words) {
            const wordLength = this.getTextLength(word);
            
            // If adding this word would exceed the limit
            if (currentLength + wordLength + 1 > this.maxLineLength && currentLine) {
                wrappedLines.push(currentLine.trim());
                currentLine = word;
                currentLength = wordLength;
            } else {
                if (currentLine) {
                    currentLine += ' ' + word;
                    currentLength += wordLength + 1;
                } else {
                    currentLine = word;
                    currentLength = wordLength;
                }
            }

            // Handle extremely long words
            if (this.breakLongWords && wordLength > this.maxLineLength) {
                const brokenWord = this.breakLongWord(word);
                if (currentLine === word) {
                    currentLine = brokenWord;
                }
            }
        }

        if (currentLine) {
            wrappedLines.push(currentLine.trim());
        }

        return wrappedLines.join('<br>');
    }

    /**
     * Gets the display length of text, ignoring HTML tags
     * @param {string} text - The text to measure
     * @returns {number} - Display length
     */
    getTextLength(text) {
        // Remove HTML tags for length calculation
        return text.replace(/<[^>]*>/g, '').length;
    }

    /**
     * Breaks a long word into smaller parts
     * @param {string} word - The word to break
     * @returns {string} - Broken word with <br> tags
     */
    breakLongWord(word) {
        if (this.getTextLength(word) <= this.maxLineLength) {
            return word;
        }

        const parts = [];
        let remaining = word;
        
        while (this.getTextLength(remaining) > this.maxLineLength) {
            // Find a good break point (avoid breaking HTML tags)
            let breakPoint = this.maxLineLength;
            
            // If we're inside an HTML tag, adjust break point
            let tagStart = remaining.lastIndexOf('<', breakPoint);
            let tagEnd = remaining.indexOf('>', tagStart);
            
            if (tagStart !== -1 && tagEnd > breakPoint) {
                breakPoint = tagStart;
            }
            
            if (breakPoint <= 0) breakPoint = this.maxLineLength;
            
            parts.push(remaining.substring(0, breakPoint));
            remaining = remaining.substring(breakPoint);
        }
        
        if (remaining) {
            parts.push(remaining);
        }
        
        return parts.join('<br>');
    }

    /**
     * Parses basic markdown syntax
     * @param {string} text - The text to parse
     * @returns {string} - Parsed text with HTML tags
     */
    parseMarkdown(text) {
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')  // **bold**
            .replace(/\*(.*?)\*/g, '<em>$1</em>')              // *italic*
            .replace(/`(.*?)`/g, '<code>$1</code>');           // `code`
    }

    /**
     * Creates a TextFormatter instance configured for blog posts
     * @returns {TextFormatter} - Configured formatter
     */
    static forBlogPosts() {
        return new TextFormatter({
            maxLineLength: 85,
            preserveMarkdown: true,
            breakLongWords: true
        });
    }

    /**
     * Creates a TextFormatter instance configured for minis
     * @returns {TextFormatter} - Configured formatter
     */
    static forMinis() {
        return new TextFormatter({
            maxLineLength: 75,
            preserveMarkdown: true,
            breakLongWords: true
        });
    }
}

// Export for Node.js environment
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TextFormatter;
}