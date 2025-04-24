// WebSocket接続
const socket = new WebSocket('wss://qmltso6u8b.execute-api.ap-northeast-1.amazonaws.com/production');

socket.onopen = () => {
  
  console.log('接続しました');
  // 接続後すぐに履歴をリクエスト
  socket.send(JSON.stringify({ action: 'getHistory' }));
  console.log('サーバーにリクエストしました');
};

socket.onmessage = (event) => {
  if (!event.data || event.data === '{}' || event.data.trim() === '') {
    return; // 無視
  }
  console.log('履歴受信開始します')
  const json = JSON.parse(event.data);

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
};
socket.onclose = () => console.log('切断されました');

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
  const side = json.mine ? 'mine' : 'other';
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
