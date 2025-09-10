// Simple WebSocket notification broker using ws (CommonJS)
// Run with: npm run ws

const WebSocket = require('ws')

const PORT = process.env.WS_PORT || 5178
const wss = new WebSocket.Server({ port: PORT })

// Map of userId -> Set of sockets
const userIdToSockets = new Map()

function addClient(userId, ws) {
  if (!userIdToSockets.has(userId)) {
    userIdToSockets.set(userId, new Set())
  }
  userIdToSockets.get(userId).add(ws)
}

function removeClient(userId, ws) {
  const set = userIdToSockets.get(userId)
  if (!set) return
  set.delete(ws)
  if (set.size === 0) userIdToSockets.delete(userId)
}

function sendToUser(userId, payload) {
  const set = userIdToSockets.get(userId)
  if (!set) return
  const message = JSON.stringify(payload)
  for (const client of set) {
    if (client.readyState === WebSocket.OPEN) client.send(message)
  }
}

wss.on('connection', (ws) => {
  let boundUserId = null

  ws.on('message', (data) => {
    try {
      const msg = JSON.parse(data)
      if (msg.type === 'auth' && msg.userId != null) {
        boundUserId = String(msg.userId)
        addClient(boundUserId, ws)
        ws.send(JSON.stringify({ type: 'ack', ok: true }))
      }
      if (msg.type === 'notify' && msg.toUserId != null && msg.notification) {
        sendToUser(String(msg.toUserId), { type: 'notification', notification: msg.notification })
      }
    } catch (e) {
      // ignore malformed
    }
  })

  ws.on('close', () => {
    if (boundUserId != null) removeClient(boundUserId, ws)
  })
})

console.log(`[ws] notification server listening on ws://localhost:${PORT}`)


