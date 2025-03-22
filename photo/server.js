const fs = require('fs');
const WebSocket = require('ws');
const http = require('http');
const crypto = require('crypto');
const path = require('path');

const chatLogFile = path.join(__dirname, 'chat-log.txt');

// WebSocketのサーバ作成
const server = http.createServer((req, res) => {
    if (req.method === 'GET' && req.url === '/') {
        fs.readFile(path.join(__dirname, 'index.html'), (err, data) => {
            if (err) {
                res.writeHead(500);
                res.end('Error loading index.html');
                return;
            }
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(data);
        });
    } else if (req.method === 'GET' && req.url === '/index.js') {
        fs.readFile(path.join(__dirname, 'index.js'), (err, data) => {
            if (err) {
                res.writeHead(500);
                res.end('Error loading index.js');
                return;
            }
            res.writeHead(200, { 'Content-Type': 'application/javascript' });
            res.end(data);
        });
    } else {
        res.writeHead(404);
        res.end('Not Found');
    }
});

const wss = new WebSocket.Server({ server });

// クライアントのIPアドレスを取得する関数
function getClientIp(req) {
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    return ip.replace(/^.*:/, '');  // IPv6アドレスの場合、IPv4部分を取り出す
}

// WebSocket接続, ws が接続したクライアント
wss.on('connection', (ws,req) => {
	  // クライアント識別子、今回は使わない...
	  //const uuid = crypto.randomUUID();
	  //ws.send(JSON.stringify({ uuid }));
	
          const clientIp = getClientIp(req); // クライアントのIPアドレスを取得
          console.log(`New connection from IP: ${clientIp}`);

	  //Send chat history to the newly connected client
	  fs.readFile(chatLogFile, 'utf8', (err, data) => {
  	  	if (!err && data) {
			const lines = data.split('\n');
			lines.forEach((line) => {
				if (line.trim() !== '') {
					line_wk1 = line.replace('{','');
					line_wk2 = line_wk1.replace('}',',');

                    			const [name,message,time,ip] = line_wk2.split(',');
					wk_name = name.replace(' "name":"','');
					wk_message = message.replace('"message":"','');
					wk_time = time.replace('"time":"','');
					const json = {
    						name: wk_name.replace('"',''),
    						message: wk_message.replace('"',''),
    						time: wk_time.replace('"',''),
  	  				};
	  				// 履歴送信
  	  				ws.send(JSON.stringify(json));
                		}
			});
  	  	}
   	  });
	  
  	  // メッセージ受信処理
  	  ws.on('message', (message) => {
        	console.log('Received: ' + message);
　　　　　　　　const json = JSON.parse(message);

                const logMessage = ` ${message} ${clientIp}`;
		

	        // Append message to chat log file
	        fs.appendFile(chatLogFile, logMessage + '\n', (err) => {
	            if (err) throw err;
	        });

	        // Broadcast message to all connected clients
	        wss.clients.forEach((client) => {
		        // メッセージ送信先クライアントがメッセージ受信クライアントの判定を設定
	        	json.mine = ws === client;
	      		if (client.readyState === WebSocket.OPEN) {
			        // メッセージを送信
			        client.send(JSON.stringify(json));
	      		}
    		});
  	　});

	  ws.on('close', () => {
	        console.log('A user disconnected');
	  });
});

server.listen(3000, () => {
  console.log('WebSocket Server is running on port 3000');
});