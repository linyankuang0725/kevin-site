function json(data, init = {}) {
  return new Response(JSON.stringify(data), {
    status: init.status || 200,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      ...init.headers,
    },
  });
}

const stems = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const branches = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
const elements = ['木', '火', '土', '金', '水'];
const zodiacMap = [
  ['摩羯座', 19], ['水瓶座', 18], ['雙魚座', 20], ['牡羊座', 19], ['金牛座', 20], ['雙子座', 20],
  ['巨蟹座', 22], ['獅子座', 22], ['處女座', 22], ['天秤座', 22], ['天蠍座', 21], ['射手座', 21], ['摩羯座', 31],
];

function getZodiacSign(month, day) {
  return day <= zodiacMap[month - 1][1] ? zodiacMap[month - 1][0] : zodiacMap[month][0];
}

function positiveMod(n, mod) {
  return ((n % mod) + mod) % mod;
}

function getYearPillar(year) {
  return `${stems[positiveMod(year - 4, 10)]}${branches[positiveMod(year - 4, 12)]}`;
}

function getMonthPillar(year, month) {
  return `${stems[positiveMod(year * 2 + month, 10)]}${branches[positiveMod(month + 1, 12)]}`;
}

function getDayPillar(date) {
  const base = Date.UTC(1984, 1, 2);
  const target = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
  const diffDays = Math.floor((target - base) / 86400000);
  return `${stems[positiveMod(diffDays, 10)]}${branches[positiveMod(diffDays, 12)]}`;
}

function getHourPillar(dayStemIndex, hour) {
  const branchIndex = Math.floor(((hour + 1) % 24) / 2);
  const stemIndex = positiveMod(dayStemIndex * 2 + branchIndex, 10);
  return `${stems[stemIndex]}${branches[branchIndex]}`;
}

function deriveFiveElementBalance(year, month, day, hour) {
  const counts = { 木: 0, 火: 0, 土: 0, 金: 0, 水: 0 };
  [year, month, day, hour].forEach((v, i) => {
    counts[elements[positiveMod(v + i, 5)]] += 1;
  });
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  return {
    counts,
    dominant: sorted[0][0],
    weakest: sorted[sorted.length - 1][0],
  };
}

function buildStructuredProfile(input) {
  const dt = new Date(`${input.birthDate}T${input.birthTime || '00:00'}:00Z`);
  const year = Number(input.birthDate.slice(0, 4));
  const month = Number(input.birthDate.slice(5, 7));
  const day = Number(input.birthDate.slice(8, 10));
  const hour = Number((input.birthTime || '00:00').split(':')[0]);
  const zodiac = getZodiacSign(month, day);
  const yearPillar = getYearPillar(year);
  const monthPillar = getMonthPillar(year, month);
  const dayPillar = getDayPillar(dt);
  const dayStemIndex = stems.indexOf(dayPillar[0]);
  const hourPillar = getHourPillar(dayStemIndex, hour);
  const balance = deriveFiveElementBalance(year, month, day, hour);

  return {
    zodiac,
    pillars: { year: yearPillar, month: monthPillar, day: dayPillar, hour: hourPillar },
    fiveElements: balance,
    weeklySignal:
      balance.dominant === '木' ? '適合擴張，但要先定順序' :
      balance.dominant === '火' ? '動能強，但避免躁進與過度承諾' :
      balance.dominant === '土' ? '適合穩定落地與收斂' :
      balance.dominant === '金' ? '適合判斷、取捨與定標準' :
      '適合整合、觀察與保留彈性',
  };
}

function fallbackReading(input, profile) {
  const wantsWhatsapp = input.whatsappOptIn && input.phone;
  return `# 綜合命理分析

## 基本命盤摘要
- **姓名：** ${input.name}
- **出生資料：** ${input.birthDate} ${input.birthTime} · ${input.birthPlace}
- **星座：** ${profile.zodiac}
- **四柱（簡化計算）：** ${profile.pillars.year} / ${profile.pillars.month} / ${profile.pillars.day} / ${profile.pillars.hour}
- **五行偏向：** 主 ${profile.fiveElements.dominant}，較弱 ${profile.fiveElements.weakest}
- **WhatsApp 週報：** ${wantsWhatsapp ? `已選擇接收（${input.phone}）` : '未開啟'}

## 一句話總評
你這份命盤的整體訊號偏向 **${profile.weeklySignal}**。你不是適合盲目衝刺的人，而是更適合在判斷清楚之後，把能量集中在高槓桿的方向。

## 1) 事業 / 工作
從簡化四柱來看，你的優勢更偏向「判斷與配置」，不是單純執行。近期工作上最值得注意的是：先縮小戰線，再提高命中率。這會比同時推很多題目更有效。

## 2) 關係 / 人際
你在人際互動上比較適合直接、明確、有結構的溝通方式。若近期關係上出現誤解，關鍵通常不是情感不夠，而是訊號不夠清楚。

## 3) 狀態 / 能量
五行傾向顯示，你當前比較需要平衡節奏與注意力。避免讓外界雜訊打亂自己的決策順序，否則會出現腦中分頁太多、效率下降的情況。

## 本週 3 個行動
1. 只抓 1–2 件最值得推的事情。
2. 留一段安靜時間做決策，不要在訊息轟炸時定方向。
3. 減少一個低價值義務或干擾來源。

## 本週避坑提醒
- 過早承諾
- 同時開太多條線
- 用忙碌感取代實際進展

## 幸運時間窗
- **週一上午：** 適合定方向
- **週三下午：** 適合談關鍵關係與對齊
- **週五上午：** 適合收斂與做總結

## 說明
這是後端規則型 fallback 版本；若已設定 LLM 金鑰，後端可進一步產出更自然、更細膩的解讀。`;
}

async function llmReading(input, profile, env) {
  const apiKey = env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const prompt = `你是一位結合八字、紫微、人類圖與星座語感的中文命理分析師。請根據以下結構化資料，輸出一份務實、不浮誇、可讀性高的繁體中文報告。\n\n使用者資料：${JSON.stringify(input, null, 2)}\n結構化命盤摘要：${JSON.stringify(profile, null, 2)}\n\n要求：\n1. 使用 markdown 輸出\n2. 結構固定：\n- 標題\n- 基本命盤摘要\n- 一句話總評\n- 1) 事業 / 工作\n- 2) 關係 / 人際\n- 3) 狀態 / 能量\n- 本週 3 個行動\n- 本週避坑提醒\n- 幸運時間窗\n3. 語氣務實、帶命理感但不要過度神怪\n4. 不要假裝做出超高精度命盤，請把內容建立在提供的結構化資料上\n5. 請明確提到四柱與五行偏向`; 

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4.1-mini',
      temperature: 0.7,
      messages: [
        { role: 'system', content: '你是中文命理報告撰寫助手。' },
        { role: 'user', content: prompt },
      ],
    }),
  });

  if (!res.ok) return null;
  const data = await res.json();
  return data.choices?.[0]?.message?.content || null;
}

export async function onRequestPost(context) {
  try {
    const body = await context.request.json();
    const required = ['name', 'birthDate', 'birthTime', 'birthPlace'];
    for (const key of required) {
      if (!body[key]) return json({ ok: false, error: `${key} is required` }, { status: 400 });
    }

    const profile = buildStructuredProfile(body);
    const llm = await llmReading(body, profile, context.env);
    const markdown = llm || fallbackReading(body, profile);

    return json({
      ok: true,
      mode: llm ? 'llm' : 'fallback',
      profile,
      markdown,
    });
  } catch (error) {
    return json({ ok: false, error: String(error?.message || error) }, { status: 500 });
  }
}
