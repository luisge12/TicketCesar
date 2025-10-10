//This file contains the database connection logic for the blog application.
//Created by Luis González

import { supabase } from "./config.js";

export class BlogConnections {

    async getAllArticles() {
        try {
            const { data, error } = await supabase
                .from('articles')
                .select('*')
                .order('date', { ascending: false });
            if (error) throw error;
            return data;
        } catch(error) {
            console.error('Error fetching articles:', error);
            throw error;
        }
    }

    async getArticleById(id) {
        try {
            const { data, error } = await supabase
                .from('articles')
                .select('*')
                .eq('id', id)
                .single();
            if (error) throw error;
            return data;
        } catch(error) {
            console.error('Error fetching article by ID:', error);
            throw error;
        }  
    }

    async insertArticle(articleData) {
        try {
            const { data, error } = await supabase
                .from('articles')
                .insert([articleData])
                .select();
            if (error) throw error;
            return data[0];
        } catch(error) {
            console.error('Error inserting article:', error);
            throw error;
        
        }
    }
}

/*// This method is for proving that the connection to the database is working fine
const prueba = new BlogConnections();
prueba.insertArticle({
    title: 'Test Article',
    excerpt: 'This is a test excerpt.',
    images: 'https://example.com/image.jpg',
    category: 'Test',
    date: '2024-06-01',
    author: 'Luis González',
    content: 'This is a test article content.',
}).then(article => {
    console.log('Inserted article:', article);
});
*/