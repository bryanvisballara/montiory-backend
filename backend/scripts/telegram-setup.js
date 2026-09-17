const token = process.env.TELEGRAM_BOT_TOKEN?.trim()

if (!token) {
  console.log(`
Para configurar Telegram:

1. Abre Telegram y busca @BotFather
2. Escribe /newbot
3. Nombre: Montiory Pedidos
4. Username: algo como montiory_pedidos_bot
5. Copia el token que te da BotFather
6. Pégalo en TELEGRAM_BOT_TOKEN
7. Abre el bot, pulsa Start y envíale cualquier mensaje
8. Vuelve a correr: node scripts/telegram-setup.js
`)
  process.exit(1)
}

const response = await fetch(`https://api.telegram.org/bot${token}/getUpdates`)
const payload = await response.json()

if (!payload.ok) {
  console.error(payload.description || 'No se pudieron leer los chats del bot')
  process.exit(1)
}

const chats = new Map()

for (const update of payload.result || []) {
  const chat = update.message?.chat || update.my_chat_member?.chat || update.channel_post?.chat
  if (chat?.id) {
    chats.set(String(chat.id), chat.title || [chat.first_name, chat.last_name].filter(Boolean).join(' ') || chat.username || String(chat.id))
  }
}

if (!chats.size) {
  console.log('Todavía no hay chats. Abre el bot en Telegram, pulsa Start y vuelve a correr este script.')
  process.exit(0)
}

console.log('Chats encontrados. Copia TELEGRAM_CHAT_ID en .env y en Render:\n')
for (const [id, name] of chats) {
  console.log(`${id}  ${name}`)
}
