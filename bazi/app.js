const form = document.getElementById('bazi-form');
const reportEl = document.getElementById('markdown-report');
const summaryName = document.getElementById('summary-name');
const summaryScore = document.getElementById('summary-score');
const summaryWhatsapp = document.getElementById('summary-whatsapp');

const zodiacMap = [
  ['摩羯座', 19], ['水瓶座', 18], ['雙魚座', 20], ['牡羊座', 19], ['金牛座', 20], ['雙子座', 20],
  ['巨蟹座', 22], ['獅子座', 22], ['處女座', 22], ['天秤座', 22], ['天蠍座', 21], ['射手座', 21], ['摩羯座', 31]
];
const stems = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];
const branches = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
const elements = ['木','火','土','金','水'];

function getZodiacSign(month, day) {
  return day <= zodiacMap[month - 1][1] ? zodiacMap[month - 1][0] : zodiacMap[month][0];
}

function getTimeBranch(hour) {
  return branches[Math.floor(((hour + 1) % 24) / 2)];
}

function getYearPillar(year) {
  const stem = stems[(year - 4) % 10 < 0 ? ((year - 4) % 10) + 10 : (year - 4) % 10];
  const branch = branches[(year - 4) % 12 < 0 ? ((year - 4) % 12) + 12 : (year - 4) % 12];
  return `${stem}${branch}`;
}

function getElementBias(month, hour) {
  const idx = (month + hour) % 5;
  return {
    dominant: elements[idx],
    support: elements[(idx + 2) % 5],
    caution: elements[(idx + 3) % 5],
  };
}

function buildChineseReport({ name, birthDate, birthTime, birthPlace, gender, phone, whatsappOptIn }) {
  const [year, month, day] = birthDate.split('-').map(Number);
  const hour = Number((birthTime || '00:00').split(':')[0]);
  const zodiac = getZodiacSign(month, day);
  const yearPillar = getYearPillar(year);
  const timeBranch = getTimeBranch(hour);
  const elementBias = getElementBias(month, hour);
  const wantsWhatsapp = Boolean(whatsappOptIn && phone);

  const signal = elementBias.dominant === '木'
    ? '擴張但要收斂'
    : elementBias.dominant === '火'
    ? '有動能但忌躁進'
    : elementBias.dominant === '土'
    ? '適合穩定落地'
    : elementBias.dominant === '金'
    ? '適合判斷與取捨'
    : '適合觀察與整合';

  const markdown = `# 綜合命理分析\n\n## 基本資料\n- **姓名：** ${name}\n- **出生日期：** ${birthDate}\n- **出生時間：** ${birthTime}\n- **出生地點：** ${birthPlace}\n- **星座：** ${zodiac}\n- **年柱（簡化）：** ${yearPillar}\n- **時支（簡化）：** ${timeBranch}\n- **五行偏向（簡化推估）：** 主 ${elementBias.dominant}，輔 ${elementBias.support}，需留意 ${elementBias.caution}\n- **WhatsApp 週報：** ${wantsWhatsapp ? `已選填（${phone}）` : '未開啟'}\n\n## 一句話總評\n你目前的命理訊號偏向 **${signal}**。整體看起來，你不是適合用蠻力一路衝的人，而是更適合靠判斷、節奏與選擇來放大結果。\n\n## 綜合主軸\n從 **八字** 的角度看，${yearPillar} 年柱搭配 ${timeBranch} 時支的簡化訊號，呈現出一種「需要靠方向感與節奏感來穩定輸出」的型態。這類型的人，通常不是做得越多越好，而是選得越準越強。\n\n從 **紫微語感** 來看，你的人生主軸比較像是要學會站到正確位置，掌握資源、節奏與決策，而不是長期待在只負責執行、卻沒有主導權的位置。你若放在對的位置，推進速度會很快；若放錯地方，則容易產生內耗、煩躁與被浪費的感覺。\n\n從 **人類圖語感** 來看，你比較不適合在外界很吵、資訊很多、情緒很急的情況下做重大決定。真正好的決策，往往來自你內在已經對齊之後的清楚，而不是被情境推著走的當下反應。\n\n從 **星座** 的層面看，${zodiac} 的外顯特質會讓你呈現出特定的互動方式與情緒風格：你重視品質、討厭低效率、對人事物有自己的判斷標準，也不太容易長期忍受空話與模糊。\n\n## 1) 事業 / 工作\n你在工作上最強的地方，不是單純執行，而是 **判斷什麼值得做、什麼該先做、什麼需要延後**。這代表你適合高槓桿的角色，例如：整合、決策、主導、策略、優先級排序。\n\n近期的能量提醒是：不要被太多平行任務切碎。你真正需要的不是再多做一點，而是更明確地收斂，把主要資源壓到最值得的主題上。\n\n## 2) 關係 / 人際\n你在人際互動上，通常比較適合 **直接、清楚、有內容** 的交流方式。你並不缺社交能力，但你對低品質互動的容忍度相對低。這意味著，關係經營的重點不在於多，而在於準。\n\n近期若感覺溝通變多、雜訊變多，建議你更早說出真正的需求，而不是等到情緒累積後才表達不耐。\n\n## 3) 狀態 / 能量\n你目前最值得注意的，不一定是體力，而是 **腦內開太多分頁**。當你同時想推太多件事情、或同時看見太多可能性時，會開始出現注意力分散、判斷變慢、情緒煩躁的現象。\n\n簡單講，你的問題通常不是沒能力，而是太容易進入高維度分心。\n\n## 本週 3 個行動\n1. 只選 1–2 個真正高槓桿的主題，不要同時推太多。\n2. 幫自己留一段安靜、不被打斷的判斷時間。\n3. 把不必要的義務、低品質承諾、雜訊來源減掉一個。\n\n## 本週避坑提醒\n- 不要在還沒想清楚時就太早答應。\n- 不要把忙碌誤認成進展。\n- 不要因為焦慮而開更多新題。\n\n## 幸運時間窗\n- **週一上午：** 適合定方向、定優先級。\n- **週三下午：** 適合談關鍵對齊與關係修正。\n- **週五上午：** 適合做總結、收斂與下一步決策。\n\n## 說明\n這是 **v0 版本**，目前已從純模板進步到「根據輸入資料做簡化動態計算與生成」。但它還不是完整的專業命盤引擎。\n\n下一步若要做到「真的在算」，我建議升級成：\n1. **命盤計算後端**：把八字四柱、時區、出生地換算做準。\n2. **LLM 解讀層**：把真實命盤結果轉成自然語言報告。\n3. **週報系統**：若使用者勾選 WhatsApp，就定期推送個人化週報。`;

  return { markdown, signal, wantsWhatsapp };
}

function renderMarkdown(md) {
  const lines = md.split('\n');
  let html = '';
  let inUl = false;
  let inOl = false;

  const closeLists = () => {
    if (inUl) { html += '</ul>'; inUl = false; }
    if (inOl) { html += '</ol>'; inOl = false; }
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) { closeLists(); continue; }
    if (line.startsWith('# ')) { closeLists(); html += `<h1>${line.slice(2)}</h1>`; continue; }
    if (line.startsWith('## ')) { closeLists(); html += `<h2>${line.slice(3)}</h2>`; continue; }
    if (line.startsWith('### ')) { closeLists(); html += `<h3>${line.slice(4)}</h3>`; continue; }
    if (/^\d+\.\s/.test(line)) {
      if (!inOl) { closeLists(); html += '<ol>'; inOl = true; }
      html += `<li>${line.replace(/^\d+\.\s/, '')}</li>`;
      continue;
    }
    if (line.startsWith('- ')) {
      if (!inUl) { closeLists(); html += '<ul>'; inUl = true; }
      html += `<li>${line.slice(2)}</li>`;
      continue;
    }
    closeLists();
    html += `<p>${line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</p>`;
  }
  closeLists();
  return html;
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(form).entries());
  const payload = {
    name: data.name?.trim() || '使用者',
    birthDate: data.birthDate,
    birthTime: data.birthTime,
    birthPlace: data.birthPlace?.trim() || '未知',
    gender: data.gender || '',
    phone: data.phone?.trim() || '',
    whatsappOptIn: Boolean(data.whatsappOptIn),
  };

  const result = buildChineseReport(payload);
  summaryName.textContent = `${payload.name} 的 v0 分析`;
  summaryScore.textContent = result.signal;
  summaryWhatsapp.textContent = result.wantsWhatsapp ? '已開啟' : '未開啟';
  reportEl.innerHTML = renderMarkdown(result.markdown);
  document.getElementById('report-root').scrollIntoView({ behavior: 'smooth', block: 'start' });
});

const initial = buildChineseReport({
  name: '模板使用者',
  birthDate: '1990-01-01',
  birthTime: '09:00',
  birthPlace: '台北，台灣',
  gender: '',
  phone: '',
  whatsappOptIn: false,
});
reportEl.innerHTML = renderMarkdown(initial.markdown);
