const form = document.getElementById('bazi-form');
const reportEl = document.getElementById('markdown-report');
const summaryName = document.getElementById('summary-name');
const summaryScore = document.getElementById('summary-score');
const summaryWhatsapp = document.getElementById('summary-whatsapp');

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
      html += `<li>${line.slice(2).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</li>`;
      continue;
    }
    closeLists();
    html += `<p>${line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</p>`;
  }
  closeLists();
  return html;
}

const DIRECT_BRIDGE_URL = 'https://yan-kuang-lin-ux32ln.tail1c0251.ts.net/bazi/report';
const DIRECT_BRIDGE_TOKEN = 'qJtkn2BNllI-PTOv1KrMXnOcQB3G-1mGNNE3b0grDD0';

async function generateReport(payload) {
  const res = await fetch(DIRECT_BRIDGE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${DIRECT_BRIDGE_TOKEN}`,
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`API ${res.status}`);
  return await res.json();
}

form.addEventListener('submit', async (event) => {
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

  summaryName.textContent = `${payload.name} 的分析產生中...`;
  summaryScore.textContent = '計算中';
  summaryWhatsapp.textContent = payload.whatsappOptIn && payload.phone ? '已勾選' : '未開啟';
  reportEl.innerHTML = '<p>正在計算命盤摘要並生成分析，請稍候...</p>';

  try {
    const result = await generateReport(payload);
    if (!result.ok) throw new Error(result.error || 'unknown error');
    summaryName.textContent = `${payload.name} 的 v1 分析`;
    summaryScore.textContent = result.mode === 'llm' ? 'LLM 解讀' : '規則型 fallback';
    summaryWhatsapp.textContent = payload.whatsappOptIn && payload.phone ? '已勾選' : '未開啟';
    reportEl.innerHTML = renderMarkdown(result.markdown);
    document.getElementById('report-root').scrollIntoView({ behavior: 'smooth', block: 'start' });
  } catch (error) {
    summaryName.textContent = `${payload.name} 的分析失敗`;
    summaryScore.textContent = '錯誤';
    reportEl.innerHTML = `<p>目前後端分析暫時失敗：${String(error.message || error)}</p><p>這通常代表 Cloudflare Pages Functions 尚未部署完成，或尚未設定 LLM secret。稍後再試即可。</p>`;
  }
});

reportEl.innerHTML = renderMarkdown(`# 綜合命理分析\n\n## 說明\n這個版本已經升級為 **前端表單 → 後端 API → 命盤摘要計算 → 解讀輸出** 的架構。\n\n當後端已部署且有可用 LLM secret 時，系統會輸出較自然的中文解讀；若尚未設定，會自動退回規則型 fallback。\n\n## 下一步\n請直接輸入你的出生資料，系統會嘗試即時生成分析。`);
