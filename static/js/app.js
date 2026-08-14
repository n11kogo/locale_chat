
// ===== САЙДБАР =====
const sidebar = document.getElementById('sidebar');
const openSidebarBtn = document.getElementById('open-sidebar');
const closeSidebarBtn = document.getElementById('sidebar-close');

function openSidebar() {
    sidebar.classList.add('open');
}

function closeSidebar() {
    sidebar.classList.remove('open');
}

if (openSidebarBtn) {
    openSidebarBtn.addEventListener('click', openSidebar);
}
if (closeSidebarBtn) {
    closeSidebarBtn.addEventListener('click', closeSidebar);
}

// Закрытие при клике вне сайдбара (только на телефоне)
document.addEventListener('click', (e) => {
    if (window.innerWidth <= 768) {
        if (sidebar.classList.contains('open')) {
            if (!sidebar.contains(e.target) && e.target !== openSidebarBtn) {
                closeSidebar();
            }
        }
    }
});

let currentUser = null;
let currentSessionId = null;
let mediaRecorder = null;
let audioChunks = [];
let voiceTimer = null;
let voiceSeconds = 0;
let isRecording = false;
let recordedBlob = null;

const loginScreen = document.getElementById('login-screen');
const chatScreen = document.getElementById('chat-screen');
const usernameInput = document.getElementById('username-input');
const loginBtn = document.getElementById('login-btn');
const logoutBtn = document.getElementById('logout-btn');
const currentUsername = document.getElementById('current-username');
const messageInput = document.getElementById('message-input');
const sendBtn = document.getElementById('send-btn');
const fileInput = document.getElementById('file-input');
const voiceBtn = document.getElementById('voice-btn');
const voiceCancelBtn = document.getElementById('voice-cancel-btn');
const emojiBtn = document.getElementById('emoji-btn');
const emojiPicker = document.getElementById('emoji-picker');

const emojiData = [
    { emoji: '😊', tags: ['улыбка', 'радость', 'добро', 'привет'] },
    { emoji: '😂', tags: ['смех', 'ржать', 'прикол', 'весело'] },
    { emoji: '🤣', tags: ['смех', 'ржать', 'угар', 'прикол'] },
    { emoji: '❤️', tags: ['любовь', 'сердце', 'лайк', 'обожаю'] },
    { emoji: '🔥', tags: ['огонь', 'горячо', 'круто', 'классно'] },
    { emoji: '👍', tags: ['лайк', 'ок', 'хорошо', 'согласен'] },
    { emoji: '😍', tags: ['влюблен', 'обожаю', 'красиво', 'вау'] },
    { emoji: '🥰', tags: ['нежность', 'любовь', 'тепло', 'забота'] },
    { emoji: '😘', tags: ['целую', 'люблю', 'нежность'] },
    { emoji: '😁', tags: ['улыбка', 'радость', 'счастье'] },
    { emoji: '😅', tags: ['смех', 'неловко', 'стесняюсь'] },
    { emoji: '😆', tags: ['смех', 'весело', 'угар'] },
    { emoji: '😇', tags: ['ангел', 'невинность', 'доброта'] },
    { emoji: '😉', tags: ['подмигиваю', 'намек', 'хитро'] },
    { emoji: '😋', tags: ['вкусно', 'ням', 'еда'] },
    { emoji: '😎', tags: ['крутой', 'стильный', 'козырь'] },
    { emoji: '😏', tags: ['хитро', 'намек', 'ухмылка'] },
    { emoji: '😐', tags: ['нейтрально', 'спокойно', 'пофиг'] },
    { emoji: '😔', tags: ['грусть', 'печаль', 'жаль'] },
    { emoji: '😭', tags: ['плачу', 'рыдаю', 'очень грустно'] },
    { emoji: '😱', tags: ['страх', 'ужас', 'крик'] },
    { emoji: '😳', tags: ['стыд', 'смущение', 'краснею'] },
    { emoji: '😴', tags: ['сплю', 'сон', 'устал'] },
    { emoji: '🤔', tags: ['думаю', 'размышление', 'сомнение'] },
    { emoji: '🤩', tags: ['восторг', 'вау', 'круто'] },
    { emoji: '🤯', tags: ['шок', 'взрыв мозга', 'ничего себе'] },
    { emoji: '🥺', tags: ['жаль', 'умоляю', 'грусть'] },
    { emoji: '🥶', tags: ['холод', 'мёрзну', 'зима'] },
    { emoji: '🥵', tags: ['жарко', 'жар', 'лето'] },
    { emoji: '💀', tags: ['смерть', 'страх', 'хэллоуин'] },
    { emoji: '👻', tags: ['призрак', 'страшно', 'хэллоуин'] },
    { emoji: '🎃', tags: ['тыква', 'хэллоуин', 'страшно'] },
    { emoji: '🤖', tags: ['робот', 'технологии', 'искусственный'] },
    { emoji: '👽', tags: ['инопланетянин', 'космос', 'чужой'] },
    { emoji: '🐶', tags: ['собака', 'друг', 'питомец'] },
    { emoji: '🐱', tags: ['кот', 'питомец', 'милый'] },
    { emoji: '🐰', tags: ['кролик', 'пасха', 'милый'] },
    { emoji: '🦊', tags: ['лиса', 'хитрая', 'животное'] },
    { emoji: '🐻', tags: ['медведь', 'мишка', 'животное'] },
    { emoji: '🐼', tags: ['панда', 'милый', 'животное'] },
    { emoji: '🐨', tags: ['коала', 'милый', 'австралия'] },
    { emoji: '🦁', tags: ['лев', 'хищник', 'царь'] },
    { emoji: '🐮', tags: ['корова', 'молоко', 'животное'] },
    { emoji: '🐷', tags: ['свинья', 'хрю', 'животное'] },
    { emoji: '🐸', tags: ['лягушка', 'жаба', 'ква'] },
    { emoji: '🐵', tags: ['обезьяна', 'примат', 'весело'] },
    { emoji: '🐔', tags: ['курица', 'птица', 'яйцо'] },
    { emoji: '🐧', tags: ['пингвин', 'антарктида', 'птица'] },
    { emoji: '🐦', tags: ['птица', 'полёт', 'весна'] },
    { emoji: '🦋', tags: ['бабочка', 'красиво', 'насекомое'] },
    { emoji: '🐌', tags: ['улитка', 'медленно', 'сад'] },
    { emoji: '🐞', tags: ['божья коровка', 'удача', 'насекомое'] },
    { emoji: '🌺', tags: ['цветок', 'красота', 'природа'] },
    { emoji: '🌹', tags: ['роза', 'любовь', 'цветок'] },
    { emoji: '🌸', tags: ['сакура', 'весна', 'цветок'] },
    { emoji: '🌻', tags: ['подсолнух', 'солнце', 'цветок'] },
    { emoji: '🌼', tags: ['ромашка', 'лето', 'цветок'] },
    { emoji: '🌷', tags: ['тюльпан', 'весна', 'цветок'] },
    { emoji: '💐', tags: ['букет', 'цветы', 'праздник'] },
    { emoji: '🌱', tags: ['росток', 'природа', 'новое'] },
    { emoji: '🍀', tags: ['клевер', 'удача', 'ирландия'] },
    { emoji: '🌵', tags: ['кактус', 'пустыня', 'растение'] },
    { emoji: '🎄', tags: ['ёлка', 'новый год', 'праздник'] },
    { emoji: '🌲', tags: ['сосна', 'лес', 'природа'] },
    { emoji: '🌳', tags: ['дерево', 'природа', 'лес'] },
    { emoji: '🌴', tags: ['пальма', 'тропики', 'отдых'] },
    { emoji: '🍎', tags: ['яблоко', 'фрукт', 'еда'] },
    { emoji: '🍐', tags: ['груша', 'фрукт', 'еда'] },
    { emoji: '🍊', tags: ['апельсин', 'фрукт', 'еда'] },
    { emoji: '🍋', tags: ['лимон', 'фрукт', 'еда'] },
    { emoji: '🍌', tags: ['банан', 'фрукт', 'еда'] },
    { emoji: '🍉', tags: ['арбуз', 'фрукт', 'лето'] },
    { emoji: '🍇', tags: ['виноград', 'фрукт', 'еда'] },
    { emoji: '🍓', tags: ['клубника', 'ягода', 'еда'] },
    { emoji: '🍒', tags: ['вишня', 'ягода', 'еда'] },
    { emoji: '🍑', tags: ['персик', 'фрукт', 'еда'] },
    { emoji: '🍍', tags: ['ананас', 'фрукт', 'еда'] },
    { emoji: '🥝', tags: ['киви', 'фрукт', 'еда'] },
    { emoji: '🍅', tags: ['помидор', 'овощ', 'еда'] },
    { emoji: '🥑', tags: ['авокадо', 'фрукт', 'еда'] },
    { emoji: '🥦', tags: ['брокколи', 'овощ', 'еда'] },
    { emoji: '🥬', tags: ['капуста', 'овощ', 'еда'] },
    { emoji: '🥒', tags: ['огурец', 'овощ', 'еда'] },
    { emoji: '🌶️', tags: ['перец', 'острый', 'еда'] },
    { emoji: '🌽', tags: ['кукуруза', 'овощ', 'еда'] },
    { emoji: '🥕', tags: ['морковь', 'овощ', 'еда'] },
    { emoji: '🥔', tags: ['картофель', 'овощ', 'еда'] },
    { emoji: '🍞', tags: ['хлеб', 'еда', 'завтрак'] },
    { emoji: '🥖', tags: ['багет', 'хлеб', 'франция'] },
    { emoji: '🧀', tags: ['сыр', 'еда', 'молочное'] },
    { emoji: '🥚', tags: ['яйцо', 'еда', 'завтрак'] },
    { emoji: '🍳', tags: ['яичница', 'завтрак', 'еда'] },
    { emoji: '🥞', tags: ['блины', 'завтрак', 'еда'] },
    { emoji: '🥓', tags: ['бекон', 'еда', 'завтрак'] },
    { emoji: '🥩', tags: ['мясо', 'еда', 'стейк'] },
    { emoji: '🍗', tags: ['курица', 'еда', 'мясо'] },
    { emoji: '🍔', tags: ['бургер', 'еда', 'фастфуд'] },
    { emoji: '🍟', tags: ['картошка фри', 'еда', 'фастфуд'] },
    { emoji: '🍕', tags: ['пицца', 'еда', 'италия'] },
    { emoji: '🌭', tags: ['хотдог', 'еда', 'фастфуд'] },
    { emoji: '🍦', tags: ['мороженое', 'еда', 'десерт'] },
    { emoji: '🍩', tags: ['пончик', 'десерт', 'еда'] },
    { emoji: '🍪', tags: ['печенье', 'десерт', 'еда'] },
    { emoji: '🎂', tags: ['торт', 'праздник', 'десерт'] },
    { emoji: '🍰', tags: ['пирожное', 'десерт', 'еда'] },
    { emoji: '🧁', tags: ['капкейк', 'десерт', 'праздник'] },
    { emoji: '🍫', tags: ['шоколад', 'десерт', 'еда'] },
    { emoji: '🍬', tags: ['конфета', 'десерт', 'еда'] },
    { emoji: '🍭', tags: ['леденец', 'десерт', 'еда'] },
    { emoji: '☕', tags: ['кофе', 'напиток', 'утро'] },
    { emoji: '🍵', tags: ['чай', 'напиток', 'согреться'] },
    { emoji: '🍺', tags: ['пиво', 'алкоголь', 'бар'] },
    { emoji: '🥂', tags: ['тост', 'праздник', 'алкоголь'] },
    { emoji: '🍷', tags: ['вино', 'алкоголь', 'вечер'] },
    { emoji: '🥃', tags: ['виски', 'алкоголь', 'бар'] },
    { emoji: '🍸', tags: ['коктейль', 'алкоголь', 'вечеринка'] },
    { emoji: '🍹', tags: ['коктейль', 'алкоголь', 'лето'] },
    { emoji: '🍾', tags: ['шампанское', 'праздник', 'алкоголь'] },
    { emoji: '🌙', tags: ['луна', 'ночь', 'спокойствие'] },
    { emoji: '☀️', tags: ['солнце', 'день', 'тепло'] },
    { emoji: '⭐', tags: ['звезда', 'ночь', 'желание'] },
    { emoji: '🌍', tags: ['земля', 'мир', 'планета'] },
    { emoji: '🌈', tags: ['радуга', 'красота', 'солнце'] },
    { emoji: '☁️', tags: ['облако', 'погода', 'небо'] },
    { emoji: '⛅', tags: ['солнце', 'погода', 'день'] },
    { emoji: '🌧️', tags: ['дождь', 'погода', 'осень'] },
    { emoji: '🌨️', tags: ['снег', 'зима', 'погода'] },
    { emoji: '🌊', tags: ['волна', 'море', 'отдых'] },
    { emoji: '🚀', tags: ['космос', 'полёт', 'технологии'] },
    { emoji: '🛸', tags: ['нло', 'космос', 'инопланетяне'] },
    { emoji: '🚗', tags: ['машина', 'транспорт', 'поездка'] },
    { emoji: '🚕', tags: ['такси', 'транспорт', 'поездка'] },
    { emoji: '🚙', tags: ['внедорожник', 'транспорт', 'поездка'] },
    { emoji: '🚌', tags: ['автобус', 'транспорт', 'город'] },
    { emoji: '🚓', tags: ['полиция', 'машина', 'закон'] },
    { emoji: '🚑', tags: ['скорая', 'помощь', 'больница'] },
    { emoji: '🚒', tags: ['пожар', 'машина', 'огонь'] },
    { emoji: '🚲', tags: ['велосипед', 'спорт', 'езда'] },
    { emoji: '🛴', tags: ['самокат', 'езда', 'дети'] },
    { emoji: '🛹', tags: ['скейтборд', 'спорт', 'езда'] },
    { emoji: '✈️', tags: ['самолёт', 'путешествие', 'полёт'] },
    { emoji: '🚁', tags: ['вертолёт', 'полёт', 'транспорт'] },
    { emoji: '🚢', tags: ['корабль', 'море', 'путешествие'] },
    { emoji: '⛵', tags: ['парусник', 'море', 'отдых'] },
    { emoji: '🚤', tags: ['катер', 'море', 'скорость'] },
    { emoji: '⚽', tags: ['футбол', 'спорт', 'игра'] },
    { emoji: '🏀', tags: ['баскетбол', 'спорт', 'игра'] },
    { emoji: '🏈', tags: ['американский футбол', 'спорт', 'игра'] },
    { emoji: '⚾', tags: ['бейсбол', 'спорт', 'игра'] },
    { emoji: '🎾', tags: ['теннис', 'спорт', 'игра'] },
    { emoji: '🏐', tags: ['волейбол', 'спорт', 'игра'] },
    { emoji: '🏓', tags: ['пинг-понг', 'спорт', 'игра'] },
    { emoji: '🏸', tags: ['бадминтон', 'спорт', 'игра'] },
    { emoji: '🎯', tags: ['дартс', 'игра', 'точность'] },
    { emoji: '🎮', tags: ['игры', 'гейминг', 'консоль'] },
    { emoji: '🎲', tags: ['кубик', 'игра', 'настольная'] },
    { emoji: '♟️', tags: ['шахматы', 'игра', 'стратегия'] },
    { emoji: '🎳', tags: ['боулинг', 'спорт', 'игра'] },
    { emoji: '🎭', tags: ['театр', 'искусство', 'актёр'] },
    { emoji: '🎨', tags: ['искусство', 'рисование', 'творчество'] },
    { emoji: '🎬', tags: ['кино', 'фильм', 'режиссёр'] },
    { emoji: '🎤', tags: ['микрофон', 'пение', 'выступление'] },
    { emoji: '🎧', tags: ['наушники', 'музыка', 'аудио'] },
    { emoji: '🎵', tags: ['музыка', 'нота', 'песня'] },
    { emoji: '🎶', tags: ['музыка', 'ноты', 'мелодия'] },
    { emoji: '🎹', tags: ['пианино', 'музыка', 'инструмент'] },
    { emoji: '🥁', tags: ['барабаны', 'музыка', 'ритм'] },
    { emoji: '🎸', tags: ['гитара', 'музыка', 'рок'] },
    { emoji: '🎻', tags: ['скрипка', 'музыка', 'классика'] },
    { emoji: '📱', tags: ['телефон', 'гаджет', 'связь'] },
    { emoji: '💻', tags: ['компьютер', 'работа', 'интернет'] },
    { emoji: '⌨️', tags: ['клавиатура', 'печать', 'работа'] },
    { emoji: '🖥️', tags: ['компьютер', 'монитор', 'работа'] },
    { emoji: '💰', tags: ['деньги', 'богатство', 'кошелёк'] },
    { emoji: '💵', tags: ['доллар', 'деньги', 'валюта'] },
    { emoji: '💶', tags: ['евро', 'деньги', 'валюта'] },
    { emoji: '💳', tags: ['карта', 'деньги', 'оплата'] },
    { emoji: '🏦', tags: ['банк', 'деньги', 'здание'] },
    { emoji: '🔧', tags: ['гаечный ключ', 'ремонт', 'инструмент'] },
    { emoji: '🔨', tags: ['молоток', 'ремонт', 'инструмент'] },
    { emoji: '⚒️', tags: ['молоток и кирка', 'ремонт', 'инструмент'] },
    { emoji: '🔩', tags: ['болт и гайка', 'ремонт', 'инструмент'] },
    { emoji: '⚙️', tags: ['шестеренка', 'механизм', 'техника'] },
    { emoji: '🧰', tags: ['ящик с инструментами', 'ремонт', 'работа'] },
    { emoji: '🧲', tags: ['магнит', 'физика', 'притяжение'] },
    { emoji: '💣', tags: ['бомба', 'опасность', 'взрыв'] },
    { emoji: '💥', tags: ['взрыв', 'эффект', 'огонь'] },
    { emoji: '🔪', tags: ['нож', 'кухня', 'инструмент'] },
    { emoji: '⚔️', tags: ['мечи', 'битва', 'рыцарь'] },
    { emoji: '🛡️', tags: ['щит', 'защита', 'рыцарь'] },
    { emoji: '🎣', tags: ['рыбалка', 'отдых', 'море'] },
    { emoji: '🧗', tags: ['скалолазание', 'спорт', 'экстрим'] },
    { emoji: '🚴', tags: ['велосипед', 'спорт', 'езда'] },
    { emoji: '🏋️', tags: ['тренажер', 'спорт', 'зал'] },
    { emoji: '🧘', tags: ['йога', 'спорт', 'медитация'] },
    { emoji: '🏊', tags: ['плавание', 'спорт', 'бассейн'] },
    { emoji: '🧖', tags: ['сауна', 'отдых', 'спа'] },
    { emoji: '🛁', tags: ['ванна', 'отдых', 'релакс'] },
    { emoji: '🛀', tags: ['купание', 'отдых', 'ванна'] },
    { emoji: '🧼', tags: ['мыло', 'чистота', 'гигиена'] }
];

let emojiSearchValue = '';

function renderEmojis(filter = '') {
    emojiSearchValue = filter;
    emojiPicker.innerHTML = '';
    
    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.placeholder = '🔍 Поиск...';
    searchInput.id = 'emoji-search';
    searchInput.value = filter;
    searchInput.addEventListener('input', function(e) {
        renderEmojis(e.target.value.toLowerCase().trim());
    });
    emojiPicker.appendChild(searchInput);
    
    const grid = document.createElement('div');
    grid.className = 'emoji-grid';
    
    const filtered = filter ? emojiData.filter(e => {
        const emojiMatch = e.emoji.includes(filter);
        const tagMatch = e.tags.some(tag => tag.includes(filter));
        return emojiMatch || tagMatch;
    }) : emojiData;
    
    if (filtered.length === 0) {
        const empty = document.createElement('div');
        empty.className = 'emoji-empty';
        empty.textContent = '😕 Ничего не найдено';
        grid.appendChild(empty);
    } else {
        filtered.forEach(item => {
            const span = document.createElement('span');
            span.className = 'emoji-item';
            span.textContent = item.emoji;
            span.title = item.tags.join(', ');
            span.onclick = () => {
                messageInput.value += item.emoji;
                messageInput.focus();
                setTimeout(() => {
                    const search = document.getElementById('emoji-search');
                    if (search) {
                        search.focus();
                        search.setSelectionRange(search.value.length, search.value.length);
                    }
                }, 50);
            };
            grid.appendChild(span);
        });
    }
    
    emojiPicker.appendChild(grid);
    
    setTimeout(() => {
        const search = document.getElementById('emoji-search');
        if (search && emojiPicker.style.display !== 'none') {
            search.focus();
            search.setSelectionRange(search.value.length, search.value.length);
        }
    }, 50);
}

renderEmojis('');

emojiBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (emojiPicker.style.display === 'none' || emojiPicker.style.display === '') {
        emojiPicker.style.display = 'block';
        renderEmojis(emojiSearchValue);
    } else {
        emojiPicker.style.display = 'none';
    }
});

document.addEventListener('click', (e) => {
    if (emojiPicker.style.display !== 'none') {
        if (!emojiPicker.contains(e.target) && e.target !== emojiBtn) {
            emojiPicker.style.display = 'none';
        }
    }
});

loginBtn.addEventListener('click', login);
usernameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') login();
});

function login() {
    const username = usernameInput.value.trim();
    if (!username) {
        document.getElementById('message-area').className = 'error';
        document.getElementById('message-area').textContent = '❌ Введите имя!';
        return;
    }
    currentUser = username;
    startChat();
}

function startChat() {
    loginScreen.style.display = 'none';
    chatScreen.style.display = 'block';
    currentUsername.textContent = currentUser;
    document.getElementById('messages').innerHTML = '';
    
    WS.onMessage = (data) => {
        if (data.type === 'message') {
            const isMy = data.session_id && data.session_id === currentSessionId;
            UI.addMessage(data.from, data.text, data.time, isMy, data.file);
        } else if (data.type === 'system') {
            UI.addSystemMessage(data.text, data.time);
        }
    };
    
    WS.onOnlineUsers = (users) => {
        UI.updateUsersList(users, currentUser);
    };
    
    WS.onClose = () => {
        UI.updateWSStatus('disconnected');
        currentUser = null;
        currentSessionId = null;
        chatScreen.style.display = 'none';
        loginScreen.style.display = 'flex';
        document.getElementById('message-area').className = 'error';
        document.getElementById('message-area').textContent = '⚠️ Соединение потеряно';
    };
    
    WS.connect(currentUser);
    UI.updateWSStatus('connected');
    loadMessages();
}

async function loadMessages() {
    try {
        const response = await fetch('/messages');
        const data = await response.json();
        const messagesDiv = document.getElementById('messages');
        messagesDiv.innerHTML = '';
        if (data.messages && data.messages.length > 0) {
            data.messages.forEach(msg => {
                const isMy = msg.session_id && msg.session_id === currentSessionId;
                UI.addMessage(msg.from, msg.text, msg.time, isMy, msg.file);
            });
            messagesDiv.scrollTop = messagesDiv.scrollHeight;
        }
    } catch (error) {
        console.error('Ошибка загрузки сообщений:', error);
    }
}

// ===== ОТПРАВКА =====
sendBtn.addEventListener('click', sendMessageOrVoice);

// Автоматическое изменение высоты textarea
messageInput.addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = Math.min(this.scrollHeight, 120) + 'px';
});

messageInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        sendMessageOrVoice();
    }
    // Shift+Enter и Ctrl+Enter работают по умолчанию для переноса строки
});

async function sendMessageOrVoice() {
    if (isRecording) {
        await stopVoiceRecordingAndSend();
        return;
    }
    
    if (recordedBlob) {
        await sendVoiceMessage();
        return;
    }
    
    const text = messageInput.value.trim();
    if (!text || !currentUser) return;
    if (WS.send({ type: 'message', text })) {
        messageInput.value = '';
        messageInput.style.height = 'auto';
    }
}

async function stopVoiceRecordingAndSend() {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
        mediaRecorder.stop();
        clearInterval(voiceTimer);
    }
    await new Promise(resolve => setTimeout(resolve, 200));
    
    if (recordedBlob) {
        await sendVoiceMessage();
    } else {
        UI.showMessage('❌ Голосовое не записано', 'error');
        resetVoiceUI();
    }
}

async function sendVoiceMessage() {
    const formData = new FormData();
    formData.append('username', currentUser);
    formData.append('file', recordedBlob, 'voice.webm');
    
    UI.showMessage('⏳ Отправка голосового...', 'success');
    
    try {
        const response = await fetch('/upload', {
            method: 'POST',
            body: formData
        });
        const result = await response.json();
        if (result.success) {
            WS.send({
                type: 'file',
                file_url: result.file_url,
                filename: '🎤 Голосовое сообщение'
            });
            UI.showMessage('✅ Голосовое отправлено!', 'success');
        }
    } catch (error) {
        UI.showMessage('❌ Ошибка: ' + error.message, 'error');
    }
    
    recordedBlob = null;
    resetVoiceUI();
}

voiceBtn.addEventListener('click', startVoiceRecording);
voiceCancelBtn.addEventListener('click', cancelVoiceRecording);

async function startVoiceRecording() {
    if (isRecording) return;
    recordedBlob = null;
    
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);
        audioChunks = [];
        isRecording = true;
        
        mediaRecorder.ondataavailable = (event) => {
            audioChunks.push(event.data);
        };
        
        mediaRecorder.onstop = () => {
            if (audioChunks.length > 0) {
                recordedBlob = new Blob(audioChunks, { type: 'audio/webm' });
            }
            stream.getTracks().forEach(track => track.stop());
        };
        
        mediaRecorder.start();
        
        voiceBtn.style.display = 'none';
        voiceCancelBtn.style.display = 'flex';
        
        voiceSeconds = 0;
        messageInput.value = '⏺ ' + formatTime(voiceSeconds);
        messageInput.disabled = true;
        messageInput.style.height = 'auto';
        
        clearInterval(voiceTimer);
        voiceTimer = setInterval(() => {
            voiceSeconds++;
            messageInput.value = '⏺ ' + formatTime(voiceSeconds);
        }, 1000);
        
    } catch (error) {
        UI.showMessage('❌ Нет доступа к микрофону', 'error');
    }
}

function formatTime(seconds) {
    const mins = String(Math.floor(seconds / 60)).padStart(2, '0');
    const secs = String(seconds % 60).padStart(2, '0');
    return mins + ':' + secs;
}

function cancelVoiceRecording() {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
        mediaRecorder.stop();
        audioChunks = [];
        recordedBlob = null;
    }
    clearInterval(voiceTimer);
    resetVoiceUI();
    UI.showMessage('❌ Запись отменена', 'error');
}

function resetVoiceUI() {
    isRecording = false;
    voiceBtn.style.display = 'flex';
    voiceCancelBtn.style.display = 'none';
    messageInput.value = '';
    messageInput.disabled = false;
    messageInput.placeholder = 'Введите сообщение...';
    messageInput.style.height = 'auto';
    clearInterval(voiceTimer);
    voiceSeconds = 0;
    if (!recordedBlob) {
        audioChunks = [];
    }
}

fileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file || !currentUser) return;
    if (file.size > 50 * 1024 * 1024) {
        alert('Файл слишком большой! Максимум 50MB.');
        fileInput.value = '';
        return;
    }
    
    const formData = new FormData();
    formData.append('username', currentUser);
    formData.append('file', file);
    
    UI.showMessage(`⏳ Загрузка: ${file.name} (0%)`, 'success');
    
    try {
        const xhr = new XMLHttpRequest();
        const uploadPromise = new Promise((resolve, reject) => {
            xhr.open('POST', '/upload', true);
            xhr.upload.onprogress = (event) => {
                if (event.lengthComputable) {
                    const percent = Math.round((event.loaded / event.total) * 100);
                    UI.showMessage(`⏳ Загрузка: ${file.name} (${percent}%)`, 'success');
                }
            };
            xhr.onload = () => {
                if (xhr.status === 200) resolve(JSON.parse(xhr.responseText));
                else reject(new Error('Ошибка загрузки'));
            };
            xhr.onerror = () => reject(new Error('Ошибка сети'));
            xhr.send(formData);
        });
        
        const result = await uploadPromise;
        if (result.success) {
            UI.showMessage(`✅ Файл загружен: ${file.name}`, 'success');
            WS.send({
                type: 'file',
                file_url: result.file_url,
                filename: file.name
            });
        }
        fileInput.value = '';
    } catch (error) {
        UI.showMessage('❌ Ошибка: ' + error.message, 'error');
        fileInput.value = '';
    }
});

logoutBtn.addEventListener('click', () => {
    if (isRecording) cancelVoiceRecording();
    WS.disconnect();
    currentUser = null;
    currentSessionId = null;
    chatScreen.style.display = 'none';
    loginScreen.style.display = 'flex';
    document.getElementById('messages').innerHTML = '';
    document.getElementById('users-list').innerHTML = '';
    UI.updateWSStatus('disconnected');
});

