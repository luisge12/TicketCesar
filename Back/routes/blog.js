import express from 'express';

export default function createBlogRouter({ blogconnect }) {
  const router = express.Router();

  router.get('/get-articles', async (req, res) => {
    try {
      const articles = await blogconnect.getAllArticles();
      res.json(articles);
    } catch (error) {
      console.error('Error fetching articles:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  router.get('/articles/:id', async (req, res) => {
    const { id } = req.params;
    try {
      const article = await blogconnect.getArticleById(id);
      if (!article) return res.status(404).json({ error: 'Article not found' });
      res.json(article);
    } catch (error) {
      console.error('Error fetching article by id:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  router.post('/create-article', async (req, res) => {
    const articleData = req.body;
    try {
      const newArticle = await blogconnect.insertArticle(articleData);
      res.status(201).json(newArticle);
    } catch (error) {
      console.error('Error creating article:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  router.put('/articles/:id', async (req, res) => {
    const { id } = req.params;
    const articleData = req.body;
    try {
      const updated = await blogconnect.updateArticle(id, articleData);
      if (!updated) return res.status(404).json({ error: 'Article not found or no fields to update' });
      res.json(updated);
    } catch (error) {
      console.error('Error updating article:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  router.delete('/articles/:id', async (req, res) => {
    const { id } = req.params;
    try {
      const deleted = await blogconnect.deleteArticle(id);
      if (!deleted) return res.status(404).json({ error: 'Article not found' });
      res.json({ message: 'Article deleted', article: deleted });
    } catch (error) {
      console.error('Error deleting article:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  return router;
}
