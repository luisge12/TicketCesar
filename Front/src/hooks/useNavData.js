import { useState, useEffect, useMemo } from 'react';
import { API_URL } from '../config.js';

const BLOG_SECTIONS = ['Articulos', 'Reportajes', 'Critica', 'Entrevistas', 'Noticias'];

export function useNavData() {
    const [categories] = useState(['Danza', 'Musica', 'Teatro', 'Grados', 'Recorridos']);
    const [categoryEvents, setCategoryEvents] = useState({});
    const [articles, setArticles] = useState([]);
    const [loadingArticles, setLoadingArticles] = useState(true);

    useEffect(() => {
        setCategoryEvents({});
        for (const category of categories) {
            fetch(`${API_URL}/events/category/${category}`, {
                credentials: 'include'
            })
                .then(response => response.json())
                .then(data => {
                    setCategoryEvents(prev => ({
                        ...prev,
                        [category]: data
                    }));
                })
                .catch(error => {
                    console.error('Error fetching events:', error);
                });
        }
    }, [categories]);

    useEffect(() => {
        setArticles([]);
        setLoadingArticles(true);
        fetch(`${API_URL}/get-articles`, { credentials: 'include' })
            .then((response) => response.json())
            .then((data) => {
                const arr = Array.isArray(data)
                    ? data
                    : Array.isArray(data?.articles)
                    ? data.articles
                    : [];
                setArticles(arr);
            })
            .catch((error) => {
                console.error('Error fetching articles:', error);
            })
            .finally(() => setLoadingArticles(false));
    }, []);

    const groupedArticles = useMemo(() => {
        const groups = {};
        for (const s of BLOG_SECTIONS) groups[s] = [];

        for (const a of articles) {
            const cat = (a.category || a.categoria || '').toString().trim().toLowerCase();
            let placed = false;
            for (const s of BLOG_SECTIONS) {
                const key = s.toLowerCase();
                if (cat === key) {
                    groups[s].push(a);
                    placed = true;
                    break;
                }
            }
            if (!placed) {
                groups['Articulos'].push(a);
            }
        }
        return groups;
    }, [articles]);

    return { BLOG_SECTIONS, categoryEvents, groupedArticles, loadingArticles };
}
