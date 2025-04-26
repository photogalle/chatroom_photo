let socket;
let pingPongTimer= null;

function connectWebSocket() {

  // WebSocket接続
  socket = new WebSocket('wss://qmltso6u8b.execute-api.ap-northeast-1.amazonaws.com/production');

  socket.onopen = () => {
    
    console.log('接続しました');

    // チャット欄の内容をすべてクリア
    const chatDiv = document.getElementById('chat');
    chatDiv.innerHTML = '';

    // 接続後すぐに履歴をリクエスト
    socket.send(JSON.stringify({ action: 'getHistory' }));
    console.log('サーバーにリクエストしました');
    checkConnection();
  };

  socket.onmessage = (event) => {
    try {
      const json = JSON.parse(event.data);

      if (!event.data || event.data === '{}' || event.data.trim() === '') {
        return; // 無視
      }
    
      if (json.message === 'Internal server error') {
        return; // 無視
      }

      if (event.data === 'pong') {
        if (pingPongTimer) clearTimeout(pingPongTimer);
        return checkConnection();
      }

      console.log('履歴受信開始します')

      console.log(json);
      if (json.uuid) {
        uuid = json.uuid;
      } else {
        const chatDiv = document.getElementById('chat');
        const msgElement = createMessage(json);
        chatDiv.appendChild(msgElement);
        chat.scrollTop = chat.scrollHeight;
        console.log("受信:", event.data);
      }

    } catch (e) {
      console.error('JSON解析エラー:', e);
      return; // JSONパースできないものは無視
    }
  };
  socket.onclose = () => {
    console.warn('WebSocket切断されました。5秒後に再接続します...');
    setTimeout(connectWebSocket, 2000); // 5秒後に再接続
  };

  socket.onerror = (err) => {
    console.error('WebSocketエラー:', err);
  };
}

// 初回接続
connectWebSocket();

function sendMessage() {
  console.log('メッセージ送信を開始します');
  const now = new Date();
  const json = {
    action: 'sendMessage', 
    name: document.getElementById('nameInput').value,
    message: document.getElementById('msgInput').value,
    time: `${now.toLocaleDateString()} ${now.toLocaleTimeString()}`,
  };
  // メッセージ送信
  socket.send(JSON.stringify(json));
  document.getElementById('msgInput').value = '';
  console.log('メッセージ登録完了しました');
}

// ここから下はDOM生成処理（メッセージ受信後のDOM生成）
function createMessage(json) {
  console.log('受け取ったメッセージを画面描写します');
  const side = json.side ? 'mine' : 'other';
  const sideElement = createDiv(side);
  const sideTextElement = createDiv(`${side}-text`);
  const timeElement = createDiv('time');
  const nameElement = createDiv('name');
  const textElement = createDiv('text');
  timeElement.textContent = json.time;
  nameElement.textContent = json.name;
  textElement.textContent = json.message;
  sideElement.appendChild(sideTextElement);
  sideTextElement.appendChild(timeElement);
  sideTextElement.appendChild(nameElement);
  sideTextElement.appendChild(textElement);
  return sideElement;
}

function createDiv(className) {
  const element = document.createElement('div');
  element.classList.add(className);
  return element;
}

// Ping/Pong チェック
function checkConnection() {
  setTimeout(() => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send('ping');
      pingPongTimer = setTimeout(() => {
        console.log('応答なし。再接続します...');
        socket.close(); // onclose が発火して再接続される
      }, 1000);
    }
  }, 30000);
}
