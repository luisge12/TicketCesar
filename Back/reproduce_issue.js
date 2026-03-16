import { BlogConnections } from './BlogConnections.js';
import dotenv from 'dotenv';
dotenv.config();

async function reproduce() {
    const blog = new BlogConnections();
    try {
        const articleData = {
            title: 'Reproduction Test',
            excerpt: 'Testing subtitles',
            content: [
                { text: 'Paragraph with subtitle', subtitle: 'Test Subtitle' },
                { text: 'Paragraph without subtitle', subtitle: '' }
            ],
            images: [],
            category: 'Noticias',
            author: 'Tester',
            date: new Date().toISOString()
        };
        
        console.log('Inserting test article...');
        const newArticle = await blog.insertArticle(articleData);
        console.log('Article inserted with ID:', newArticle.id);
        
        console.log('Fetching article back...');
        const fetched = await blog.getArticleById(newArticle.id);
        console.log('Fetched content with subtitles:');
        console.log(JSON.stringify(fetched.content, null, 2));
        
        // Final check in DB column directly
        // (This would require a new query or just trust getArticleById)
        
    } catch (err) {
        console.error(err);
    } finally {
        await blog.close();
    }
}
reproduce();
