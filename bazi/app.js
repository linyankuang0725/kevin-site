const form = document.getElementById('bazi-form');
const reportEl = document.getElementById('markdown-report');
const summaryName = document.getElementById('summary-name');
const summaryScore = document.getElementById('summary-score');
const summaryWhatsapp = document.getElementById('summary-whatsapp');

function getZodiacSign(month, day) {
  const signs = [
    ['Capricorn', 19], ['Aquarius', 18], ['Pisces', 20], ['Aries', 19], ['Taurus', 20], ['Gemini', 20],
    ['Cancer', 22], ['Leo', 22], ['Virgo', 22], ['Libra', 22], ['Scorpio', 21], ['Sagittarius', 21], ['Capricorn', 31]
  ];
  return day <= signs[month - 1][1] ? signs[month - 1][0] : signs[month][0];
}

function getTimeBucket(time) {
  const hour = Number((time || '00:00').split(':')[0]);
  if (hour < 6) return 'deep Yin';
  if (hour < 12) return 'rising Yang';
  if (hour < 18) return 'active Yang';
  return 'settling Yin';
}

function pickSignal(month, hour) {
  if ([1, 4, 9].includes(month)) return 'Reset and realignment';
  if (hour >= 21 || hour < 6) return 'Quiet strategy';
  if ([3, 6, 11].includes(month)) return 'Momentum with restraint';
  return 'Focused growth';
}

function buildReport({ name, birthDate, birthTime, birthPlace, gender, phone, whatsappOptIn }) {
  const [year, month, day] = birthDate.split('-').map(Number);
  const zodiac = getZodiacSign(month, day);
  const timeBucket = getTimeBucket(birthTime);
  const signal = pickSignal(month, Number((birthTime || '00:00').split(':')[0]));
  const wantsWhatsapp = Boolean(whatsappOptIn && phone);

  const pronoun = gender === 'male' ? 'his' : gender === 'female' ? 'her' : 'their';

  const markdown = `# Integrated Destiny Report\n\n## Core summary\n${name}'s current profile points to a **strategic, pattern-aware, operator-like personality**. Across Bazi, Ziwei, Human Design, and Astrology, the dominant signal is not about doing more — it is about choosing better, reducing noise, and committing energy where leverage is highest.\n\n## Profile snapshot\n- **Name:** ${name}\n- **Birth date:** ${birthDate}\n- **Birth time:** ${birthTime}\n- **Birthplace:** ${birthPlace}\n- **Astrology signal:** ${zodiac}\n- **Energy rhythm:** ${timeBucket}\n- **Weekly signal:** ${signal}\n- **WhatsApp weekly report:** ${wantsWhatsapp ? `Enabled (${phone})` : 'Not enabled'}\n\n## Integrated reading\nFrom a **Ziwei-style perspective**, this chart reads more like a decision-maker than a passive executor. The life theme is tied to direction, structure, and the ability to see where effort should or should not go.\n\nFrom a **Bazi-style perspective**, the current energy pattern suggests that balance matters more than force. This is not a profile that wins by endless intensity. It performs best when timing, clarity, and self-regulation are aligned.\n\nFrom a **Human Design-style perspective**, decision quality improves when there is inner clarity before commitment. External pressure may create premature yeses, but the strongest outcomes come when ${pronoun} own timing is respected.\n\nFrom an **Astrology-style perspective**, the ${zodiac} tone shows up as the outer layer: style, response pattern, and interpersonal energy. It adds visible character to the deeper structural themes from Ziwei and Bazi.\n\n## 1) Career / Work\nThis profile is strongest in roles that require **judgment, sequencing, and resource allocation**. Low-leverage busywork drains the system quickly, while strategic framing and meaningful ownership unlock momentum.\n\n- Focus on one or two high-value priorities instead of expanding blindly.\n- Avoid being captured by urgency from other people.\n- Work becomes more powerful when direction is set before execution accelerates.\n\n## 2) Relationships / People\nInterpersonally, the strongest mode is **clear, direct, elegant communication**. This profile usually does not need more emotional noise; it needs more signal quality.\n\n- Say the real need earlier.\n- Protect energy from vague expectations.\n- Precision and honesty will work better than over-explaining.\n\n## 3) State / Energy\nThe main risk is rarely lack of ability. It is more often **fragmented attention**. When too many loops stay open, clarity falls faster than motivation.\n\n- Reduce cognitive tab overload.\n- Keep a nightly reset habit.\n- Use calm decision windows for important commitments.\n\n## 3 actions for this week\n1. Choose the single most meaningful current project and define the next visible milestone.\n2. Remove one obligation that creates activity but not momentum.\n3. Block one uninterrupted decision session to review direction, not just tasks.\n\n## Pitfalls to avoid\n- Committing too early before internal clarity is present.\n- Opening parallel tracks out of anxiety.\n- Mistaking movement for meaningful progress.\n\n## Lucky action windows\n- **Monday morning:** direction-setting and priority resets\n- **Wednesday afternoon:** alignment conversations and difficult clarifications\n- **Friday late morning:** summary thinking, decision closure, and commitment setting\n\n## Final note\nThis is a **v0 integrated report template**, designed to feel like a polished international product. The long-term direction is to convert this into a true dynamic destiny engine with stronger chart logic, better timing interpretation, and optional WhatsApp weekly delivery.`;

  return { markdown, signal, wantsWhatsapp };
}

function renderMarkdown(md) {
  return md
    .replace(/^### (.*)$/gm, '<h3>$1</h3>')
    .replace(/^## (.*)$/gm, '<h2>$1</h2>')
    .replace(/^# (.*)$/gm, '<h1>$1</h1>')
    .replace(/^\- \*\*(.*?)\*\*: (.*)$/gm, '<li><strong>$1:</strong> $2</li>')
    .replace(/^\- (.*)$/gm, '<li>$1</li>')
    .replace(/^(\d+)\. (.*)$/gm, '<li>$2</li>')
    .split(/\n\n+/)
    .map(block => {
      if (/^<h[1-3]>/.test(block)) return block;
      if (block.includes('<li>')) {
        const isOrdered = /<li>/.test(block) && /actions for this week/i.test(block) === false && /^<li>/.test(block.trim());
        return `<ul>${block}</ul>`;
      }
      return `<p>${block.replace(/\n/g, '<br/>')}</p>`;
    })
    .join('');
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(form).entries());
  const payload = {
    name: data.name?.trim() || 'User',
    birthDate: data.birthDate,
    birthTime: data.birthTime,
    birthPlace: data.birthPlace?.trim() || 'Unknown',
    gender: data.gender || '',
    phone: data.phone?.trim() || '',
    whatsappOptIn: Boolean(data.whatsappOptIn),
  };

  const result = buildReport(payload);
  summaryName.textContent = `${payload.name}'s live v0 report`;
  summaryScore.textContent = result.signal;
  summaryWhatsapp.textContent = result.wantsWhatsapp ? 'Enabled' : 'Not enabled';
  reportEl.innerHTML = renderMarkdown(result.markdown);
  document.getElementById('report-root').scrollIntoView({ behavior: 'smooth', block: 'start' });
});

const initial = buildReport({
  name: 'Template User',
  birthDate: '1990-01-01',
  birthTime: '09:00',
  birthPlace: 'Taipei, Taiwan',
  gender: '',
  phone: '',
  whatsappOptIn: false,
});
reportEl.innerHTML = renderMarkdown(initial.markdown);
