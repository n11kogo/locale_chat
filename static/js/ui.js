const UI = {
    showMessage(text, type = 'error') {
        const area = document.getElementById('message-area');
        area.className = type;
        area.textContent = text;
        setTimeout(() => area.textContent = '', 5000);
    },
    
    addMessage(from, text, time, isMy = false, file = null) {
        const messagesDiv = document.getElementById('messages');
        const div = document.createElement('div');
        div.className = 'message';
        div.classList.add(isMy ? 'my-message' : 'other-message');
        
        const senderName = document.createElement('span');
        senderName.className = 'sender-name';
        senderName.textContent = from;
        senderName.style.color = '#64b5f6';
        senderName.style.fontWeight = '600';
        div.appendChild(senderName);
        
        if (file && text.includes('Голосовое')) {
            const voiceContainer = document.createElement('div');
            voiceContainer.className = 'voice-message';
            
            const playBtn = document.createElement('button');
            playBtn.className = 'voice-play-btn';
            playBtn.textContent = '▶';
            playBtn.style.cssText = 'background:none; border:none; color:' + (isMy ? '#0e1621' : '#64b5f6') + '; font-size:20px; cursor:pointer; width:32px; height:32px; display:flex; align-items:center; justify-content:center; flex-shrink:0;';
            
            const waves = document.createElement('div');
            waves.className = 'voice-waves';
            waves.innerHTML = '<span></span><span></span><span></span><span></span><span></span>';
            waves.style.cssText = 'display:flex; align-items:center; gap:3px; height:24px; flex:1; margin:0 8px;';
            
            const duration = document.createElement('span');
            duration.className = 'voice-duration';
            duration.textContent = '0:00';
            duration.style.cssText = 'font-size:12px; opacity:0.7; min-width:32px; text-align:right;';
            
            const audio = document.createElement('audio');
            audio.src = file;
            audio.style.display = 'none';
            
            let isPlaying = false;
            let durationSet = false;
            
            playBtn.addEventListener('click', () => {
                if (isPlaying) {
                    audio.pause();
                    playBtn.textContent = '▶';
                    waves.style.opacity = '0.3';
                    isPlaying = false;
                } else {
                    audio.play();
                    playBtn.textContent = '⏸';
                    waves.style.opacity = '1';
                    isPlaying = true;
                }
            });
            
            audio.addEventListener('timeupdate', () => {
                const current = Math.floor(audio.currentTime);
                const total = Math.floor(audio.duration || 0);
                const mins = String(Math.floor(current / 60)).padStart(2, '0');
                const secs = String(current % 60).padStart(2, '0');
                duration.textContent = mins + ':' + secs;
                
                const waveSpans = waves.querySelectorAll('span');
                const intensity = Math.min(1, audio.currentTime / 10);
                waveSpans.forEach((span) => {
                    const h = 4 + Math.random() * 12 * intensity;
                    span.style.height = h + 'px';
                    span.style.width = '3px';
                    span.style.background = isMy ? '#0e1621' : '#64b5f6';
                    span.style.borderRadius = '2px';
                    span.style.transition = 'height 0.1s';
                });
            });
            
            audio.addEventListener('ended', () => {
                playBtn.textContent = '▶';
                waves.style.opacity = '0.3';
                isPlaying = false;
                const total = Math.floor(audio.duration || 0);
                const mins = String(Math.floor(total / 60)).padStart(2, '0');
                const secs = String(total % 60).padStart(2, '0');
                duration.textContent = mins + ':' + secs;
                const waveSpans = waves.querySelectorAll('span');
                waveSpans.forEach((span) => {
                    span.style.height = '4px';
                });
            });
            
            audio.addEventListener('loadedmetadata', () => {
                const total = Math.floor(audio.duration || 0);
                const mins = String(Math.floor(total / 60)).padStart(2, '0');
                const secs = String(total % 60).padStart(2, '0');
                duration.textContent = mins + ':' + secs;
                durationSet = true;
            });
            
            setTimeout(() => {
                if (!durationSet && audio.duration) {
                    const total = Math.floor(audio.duration || 0);
                    const mins = String(Math.floor(total / 60)).padStart(2, '0');
                    const secs = String(total % 60).padStart(2, '0');
                    duration.textContent = mins + ':' + secs;
                    durationSet = true;
                }
            }, 500);
            
            voiceContainer.appendChild(playBtn);
            voiceContainer.appendChild(waves);
            voiceContainer.appendChild(duration);
            voiceContainer.appendChild(audio);
            
            voiceContainer.style.cssText = 'display:flex; align-items:center; gap:4px; padding:6px 10px; background:' + (isMy ? 'rgba(255,255,255,0.15)' : 'rgba(100,181,246,0.1)') + '; border-radius:10px; margin-top:4px; min-width:180px; max-width:280px;';
            
            div.appendChild(voiceContainer);
            
            const timeSpan = document.createElement('span');
            timeSpan.className = 'time';
            timeSpan.textContent = time || '';
            div.appendChild(timeSpan);
            
        } else if (file) {
            const ext = file.split('.').pop().toLowerCase();
            const isImage = ['jpg','jpeg','png','gif','webp','svg','bmp','ico'].includes(ext);
            const isVideo = ['mp4','webm','ogg','mov','avi','mkv'].includes(ext);
            
            if (isImage) {
                const img = document.createElement('img');
                img.src = file;
                img.onclick = () => window.open(file, '_blank');
                div.appendChild(document.createElement('br'));
                div.appendChild(img);
            } else if (isVideo) {
                const video = document.createElement('video');
                video.src = file;
                video.controls = true;
                div.appendChild(document.createElement('br'));
                div.appendChild(video);
            } else {
                const fileName = file.split('/').pop();
                const link = document.createElement('a');
                link.href = file;
                link.target = '_blank';
                link.download = fileName;
                link.textContent = '📎 ' + fileName;
                if (isMy) {
                    link.style.color = '#000000';
                } else {
                    link.style.color = '#64b5f6';
                }
                div.appendChild(document.createElement('br'));
                div.appendChild(link);
            }
            
            const timeSpan = document.createElement('span');
            timeSpan.className = 'time';
            timeSpan.textContent = time || '';
            div.appendChild(timeSpan);
            
        } else {
            const textNode = document.createElement('span');
            textNode.textContent = text;
            div.appendChild(textNode);
            
            const timeSpan = document.createElement('span');
            timeSpan.className = 'time';
            timeSpan.textContent = time || '';
            div.appendChild(timeSpan);
        }
        
        messagesDiv.appendChild(div);
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    },
    
    addSystemMessage(text, time) {
        const messagesDiv = document.getElementById('messages');
        const div = document.createElement('div');
        div.style.cssText = 'text-align: center; color: #6b7d94; font-size: 13px; padding: 6px 0;';
        div.textContent = `${text} ${time ? '• ' + time : ''}`;
        messagesDiv.appendChild(div);
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    },
    
    updateWSStatus(status) {
        const el = document.getElementById('ws-status');
        if (status === 'connected') {
            el.innerHTML = '🟢 В сети';
            el.style.color = '#6bc46b';
        } else if (status === 'connecting') {
            el.innerHTML = '🟡 Подключение...';
            el.style.color = '#ffd43b';
        } else {
            el.innerHTML = '🔴 Не в сети';
            el.style.color = '#ff6b6b';
        }
    },
    
    updateUsersList(users, currentUser) {
        const list = document.getElementById('users-list');
        const count = document.getElementById('online-count');
        list.innerHTML = '';
        
        const sorted = [...users].sort((a, b) => {
            if (a === currentUser) return -1;
            if (b === currentUser) return 1;
            return a.localeCompare(b);
        });
        
        sorted.forEach(user => {
            const li = document.createElement('li');
            const isMe = user === currentUser;
            
            const nameSpan = document.createElement('span');
            nameSpan.className = 'user-name';
            nameSpan.textContent = isMe ? `${user} (Вы)` : user;
            if (isMe) {
                nameSpan.style.color = '#64b5f6';
                nameSpan.style.fontWeight = '600';
            }
            
            const status = document.createElement('span');
            status.className = 'user-status';
            status.textContent = '🟢';
            
            li.appendChild(nameSpan);
            li.appendChild(status);
            
            list.appendChild(li);
        });
        
        count.textContent = users.length;
    }
};
