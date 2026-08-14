const WS = {
    connection: null,
    currentUser: null,
    onMessage: null,
    onOnlineUsers: null,
    onClose: null,
    
    connect(username) {
        this.currentUser = username;
        const host = window.location.host;
        const wsUrl = `ws://${host}/ws/${username}`;
        console.log('🔵 WebSocket подключение:', wsUrl);
        
        try {
            this.connection = new WebSocket(wsUrl);
        } catch (e) {
            console.error('❌ Ошибка создания WebSocket:', e);
            if (this.onClose) this.onClose();
            return;
        }
        
        this.connection.onopen = () => {
            console.log('🟢 WebSocket подключен');
            UI.updateWSStatus('connected');
        };
        
        this.connection.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                console.log('📩 Получено:', data);
                if (data.type === 'online_users' && this.onOnlineUsers) {
                    this.onOnlineUsers(data.users);
                } else if (this.onMessage) {
                    this.onMessage(data);
                }
            } catch (e) {
                console.error('❌ Ошибка парсинга:', e);
            }
        };
        
        this.connection.onclose = () => {
            console.log('🔴 WebSocket отключен');
            UI.updateWSStatus('disconnected');
            if (this.onClose) this.onClose();
        };
        
        this.connection.onerror = (error) => {
            console.error('❌ WebSocket ошибка:', error);
            UI.updateWSStatus('error');
        };
    },
    
    send(data) {
        if (this.connection && this.connection.readyState === WebSocket.OPEN) {
            this.connection.send(JSON.stringify(data));
            return true;
        }
        return false;
    },
    
    disconnect() {
        if (this.connection) {
            try {
                this.connection.close();
            } catch (e) {}
            this.connection = null;
        }
    }
};