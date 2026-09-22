require('dotenv').config();

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

if (!TELEGRAM_BOT_TOKEN) {
  console.error('TELEGRAM_BOT_TOKEN topilmadi');
  process.exit(1);
}

if (!OPENROUTER_API_KEY) {
  console.error('OPENROUTER_API_KEY topilmadi');
  process.exit(1);
}

const TELEGRAM_API =
  `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

const OPENROUTER_API =
  'https://openrouter.ai/api/v1/chat/completions';

/*
========================================
TELEGRAM API
========================================
*/

async function telegram(method, body = {}) {
  const response = await fetch(
    `${TELEGRAM_API}/${method}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    }
  );

  const data = await response.json();

  if (!data.ok) {
    throw new Error(JSON.stringify(data));
  }

  return data.result;
}

/*
========================================
MIJOZLAR XOTIRASI
========================================
*/

// Har bir mijoz uchun alohida suhbat xotirasi
const conversations = new Map();

// Har bir mijoz uchun maksimal saqlanadigan xabarlar
const MAX_HISTORY = 16;

function getConversation(chatId) {
  if (!conversations.has(chatId)) {
    conversations.set(chatId, []);
  }

  return conversations.get(chatId);
}

function addMessage(chatId, role, content) {
  const history = getConversation(chatId);

  history.push({
    role,
    content
  });

  // Juda katta bo‘lib ketmasligi uchun
  while (history.length > MAX_HISTORY) {
    history.shift();
  }
}

/*
========================================
MAP UZ AI
========================================
*/

async function generateReply(chatId, customerMessage) {

  const history = getConversation(chatId);

  const systemPrompt = `
SEN — MAP UZ kompaniyasining professional Telegram savdo konsultantisan.

Sening vazifang:
Mijoz bilan tabiiy suhbatlashish, uning savolini to‘g‘ri tushunish, oldingi suhbatni hisobga olish va MAP UZ xizmatlari haqida ANIQ ma'lumot berish.

MUHIM:
Sen oddiy savol-javob bot emassan.
Sen suhbatning oldingi qismini tushunishing kerak.

========================================
MAP UZ XIZMATI
========================================

Hozirgi paket narxi:

🔥 299 000 so‘m

Paket tarkibi:

📍 Google Maps
📍 Yandex Maps
📍 2GIS
🌐 Mini sayt
🎨 Logo / vizitka dizayni
🔳 QR kod
📋 Biznes ma'lumotlarini professional tayyorlash

========================================
MIJOZDAN KERAK BO‘LADIGAN MA'LUMOTLAR
========================================

1. Biznes nomi
2. Faoliyat yo‘nalishi
3. To‘liq manzil
4. Lokatsiya — agar mavjud bo‘lsa
5. Telefon raqami
6. Ish vaqti
7. Telegram yoki Instagram — agar mavjud bo‘lsa
8. Biznes logosi
9. Tashqi ko‘rinish rasmlari — 3–5 ta
10. Ichki ko‘rinish rasmlari — 3–5 ta
11. Biznes haqida qisqacha ma'lumot

========================================
ALOQA
========================================

+998 99 190 11 10

========================================
ENG MUHIM QOIDA — UYDIRMA
========================================

Agar ma'lumot MAP UZ haqida yuqoridagi ma'lumotlarda mavjud bo‘lmasa:

- o‘zingdan ma'lumot to‘qima
- narx o‘ylab topma
- xizmat o‘ylab topma
- kafolat va'da qilma
- muddat o‘ylab topma
- Google/Yandex/2GIS algoritmlari haqida tasdiqlanmagan va'da berma

Bunday holatda mijozga:
"Bu ma'lumotni aniq tekshirib berish uchun +998 99 190 11 10 raqamiga murojaat qilishingiz mumkin."

deb aytishing mumkin.

========================================
SUHBATNI TUSHUNISH
========================================

Mijoz quyidagicha yozishi mumkin:

"ha"
"xa"
"ok"
"mayli"
"bo‘ladi"
"qani"
"boshladik"
"qilavering"
"menga ham qilib bering"
"👍"
"🔥"
"xo‘p"
"yaxshi"

Bularni faqat so‘z sifatida emas, OLDINGI SUHBAT KONTEKSTI bilan tushun.

Masalan:

Bot:
"Boshlaymizmi?"

Mijoz:
"ha"

Sen:
"Zo‘r 👍 Unda boshlaymiz. Avval biznesingiz nomini yuboring."

========================================
MIJOZ "NARXI QANCHA?" DESA
========================================

Javob:

🔥 Hozirgi paket narxi — 299 000 so‘m.

Keyin paket tarkibini qisqa tushuntir.

========================================
MIJOZ "NIMA XIZMAT BOR?" DESA
========================================

Paket tarkibini tushuntir.

========================================
MIJOZ "BOSHLAYMIZ" DESA
========================================

Mijozdan kerakli ma'lumotlarni yig‘ishni boshlagin.

Lekin mijoz allaqachon bergan ma'lumotni qayta so‘rama.

Masalan:

Mijoz:
"Biznesim nomi Navbahor Choyxona."

Keyin boshqa ma'lumotlarni so‘ra.

========================================
MA'LUMOT YIG‘ISH
========================================

Mijoz "qanday ma'lumotlar kerak?" desa, barcha kerakli ma'lumotlarni tartibli qilib tushuntir.

Lekin oddiy suhbatda mijozni 11 ta savol bilan birdan bosib tashlama.

Tabiiy suhbat olib bor.

========================================
IMLO XATOLARI
========================================

Mijoz xato yozsa ham tushunishga harakat qil.

Masalan:

"narhi qancha"
"narx qanca"
"qanca pul"
"mapga qoyasizlarmi"
"menga ham qib bering"

Bularni ma'nosi bo‘yicha tushun.

========================================
EMOJI
========================================

👍 ❤️ 🔥 😊 😍 kabi emoji yuborilsa, oldingi suhbatga qarab ma'nosini tushun.

========================================
TIL
========================================

Asosan o‘zbek tilida javob ber.

Mijoz rus tilida yozsa, rus tilida javob ber.

Mijoz ingliz tilida yozsa, ingliz tilida javob ber.

Mijoz qaysi tilda gaplashayotgan bo‘lsa, shu tilga moslash.

========================================
JAVOB USLUBI
========================================

Tabiiy.
Samimiy.
Professional.
Savdoga mos.
Qisqa.
Tushunarli.

Mijozga bosim qilma.

O‘zingni AI deb tanishtirma.

Javoblarda Markdown ishlatma.

"**" kabi belgilarni ishlatma.

========================================
ENG MUHIM
========================================

Mijozning HOZIRGI xabarini oldingi suhbat bilan birga tushun.

Har safar suhbatni boshidan boshlama.

Bir xil savolni qayta-qayta bermagin.

Mijozning maqsadini tushunishga harakat qil.

Agar mijoz xizmatga qiziqsa — savdoni davom ettir.

Agar oddiy savol bersa — oddiy javob ber.

Agar MAP UZ haqida noma'lum savol bersa — uydirma.

========================================
`;

  const messages = [
    {
      role: 'system',
      content: systemPrompt
    },
    ...history,
    {
      role: 'user',
      content: customerMessage
    }
  ];

  const response = await fetch(
    OPENROUTER_API,
    {
      method: 'POST',
      headers: {
        'Authorization':
          `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type':
          'application/json',
        'HTTP-Referer':
          'https://mapuz.uz',
        'X-Title':
          'MAP UZ Telegram AI Assistant'
      },
      body: JSON.stringify({
        model: 'openrouter/free',
        messages
      })
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(JSON.stringify(data));
  }

  const reply =
    data.choices?.[0]?.message?.content;

  if (!reply) {
    throw new Error(
      'AI javobi bo‘sh keldi'
    );
  }

  return reply.trim();
}

/*
========================================
TELEGRAM BUSINESS JAVOB
========================================
*/

async function sendBusinessMessage(
  businessConnectionId,
  chatId,
  text
) {
  return telegram(
    'sendMessage',
    {
      business_connection_id:
        businessConnectionId,

      chat_id:
        chatId,

      text
    }
  );
}

/*
========================================
TELEGRAM UPDATE
========================================
*/

let offset = 0;

async function start() {

  console.log('');
  console.log(
    '================================'
  );
  console.log(
    'MAP UZ TELEGRAM AI ASSISTANT'
  );
  console.log(
    '================================'
  );
  console.log(
    'Telegram: OK'
  );
  console.log(
    'OpenRouter Free AI: OK'
  );
  console.log(
    'Jev AI: BYPASS'
  );
  console.log(
    'Suhbat xotirasi: ON'
  );
  console.log(
    'CRM: O‘ZGARTIRILMAYDI'
  );
  console.log(
    '================================'
  );
  console.log('');

  while (true) {

    try {

      const updates =
        await telegram(
          'getUpdates',
          {
            offset,

            timeout: 30,

            allowed_updates: [
              'business_connection',
              'business_message',
              'edited_business_message',
              'deleted_business_messages'
            ]
          }
        );

      for (const update of updates) {

        offset =
          update.update_id + 1;

        if (!update.business_message) {
          continue;
        }

        const message =
          update.business_message;

        const text =
          message.text || '';

        if (!text.trim()) {
          continue;
        }

        const businessConnectionId =
          message.business_connection_id;

        const chatId =
          message.chat.id;

        console.log('');
        console.log(
          '=============================='
        );

        console.log(
          'MIJOZ:',
          text
        );

        console.log(
          'AI: javob tayyorlanmoqda...'
        );

        /*
        Mijoz xabarini xotiraga qo‘shamiz
        */
        addMessage(
          chatId,
          'user',
          text
        );

        const reply =
          await generateReply(
            chatId,
            text
          );

        /*
        Bot javobini ham xotiraga qo‘shamiz
        */
        addMessage(
          chatId,
          'assistant',
          reply
        );

        console.log(
          'BOT:',
          reply
        );

        await sendBusinessMessage(
          businessConnectionId,
          chatId,
          reply
        );

        console.log(
          'Yuborildi ✅'
        );

        console.log(
          '=============================='
        );
      }

    } catch (error) {

      console.error(
        'XATOLIK:',
        error.message
      );

      await new Promise(
        resolve =>
          setTimeout(
            resolve,
            3000
          )
      );
    }
  }
}

start();