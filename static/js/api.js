const API = {
    async request(url, data) {
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams(data)
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || `Ошибка ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },
    
    async get(url) {
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error('Ошибка загрузки');
            return await response.json();
        } catch (error) {
            console.error('GET Error:', error);
            throw error;
        }
    }
};
