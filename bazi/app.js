const form = document.getElementById('bazi-form');

const reportEls = {
  summaryName: document.getElementById('summary-name'),
  summaryScore: document.getElementById('summary-score'),
  summaryWhatsapp: document.getElementById('summary-whatsapp'),
  verdict: document.getElementById('verdict'),
  integrated: document.getElementById('integrated-reading'),
  career: document.getElementById('career-list'),
  relationship: document.getElementById('relationship-list'),
  energy: document.getElementById('energy-list'),
  actions: document.getElementById('actions-list'),
  pitfalls: document.getElementById('pitfalls-list'),
  windows: document.getElementById('windows-list'),
};

function setList(el, items) {
  el.innerHTML = items.map((item) => `<li>${item}</li>`).join('');
}

function buildTemplate(name, birthPlace, wantsWhatsapp) {
  return {
    score: 'Strategic alignment',
    whatsapp: wantsWhatsapp ? 'Opted in for future weekly reports' : 'Not enabled yet',
    verdict: `${name}, this week favors selective commitment, deep focus, and high-leverage moves over scattered effort. Your profile reads strongest when you choose clearly instead of reacting quickly.`,
    integrated: `Across Bazi, Ziwei, Human Design, and Astrology, your current pattern suggests a strategic operator profile: thoughtful, pattern-aware, and strongest when aligning direction, timing, and energy discipline. ${birthPlace ? `Birthplace noted as ${birthPlace}, which is useful for future timing calibration.` : ''}`.trim(),
    career: [
      'Your strongest work mode is not doing more, but choosing better. Reduce optional tasks and protect one major priority.',
      'This is a strong week for structuring, editing, reframing, and making sharper decisions.',
      'Do not let urgency from other people replace your own internal priority order.'
    ],
    relationship: [
      'Keep communication direct, elegant, and specific. Precision will work better than emotional over-explaining.',
      'You may feel less tolerant of low-quality interactions this week; use boundaries early, not after frustration builds.',
      'If a relationship matters, say the actual need rather than assuming the other side can infer it.'
    ],
    energy: [
      'Your main risk is cognitive overload, not lack of capability.',
      'When too many open loops stack up, your clarity drops faster than your motivation.',
      'Short reset rituals — walking, writing tomorrow\'s top 3, or clearing a workspace — will give outsized return.'
    ],
    actions: [
      'Choose one meaningful project and define a visible next milestone within 7 days.',
      'Remove or defer one obligation that creates noise but does not create momentum.',
      'Create one quiet decision block with no messaging, no meetings, and no reactive tabs open.'
    ],
    pitfalls: [
      'Do not overcommit before your own thinking is settled.',
      'Avoid opening new tracks just because the existing ones feel emotionally heavy.',
      'Do not confuse motion, reading, or endless planning with genuine forward movement.'
    ],
    windows: [
      'Monday morning — planning, prioritization, and directional resets.',
      'Wednesday afternoon — alignment talks, collaborative decisions, and key clarifications.',
      'Friday late morning — summary thinking, closure, and next-step commitment.'
    ]
  };
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const data = new FormData(form);
  const name = data.get('name')?.toString().trim() || 'User';
  const birthPlace = data.get('birthPlace')?.toString().trim() || '';
  const wantsWhatsapp = Boolean(data.get('whatsappOptIn')) && Boolean(data.get('phone'));
  const template = buildTemplate(name, birthPlace, wantsWhatsapp);

  reportEls.summaryName.textContent = `${name}'s v0 preview`;
  reportEls.summaryScore.textContent = template.score;
  reportEls.summaryWhatsapp.textContent = template.whatsapp;
  reportEls.verdict.textContent = template.verdict;
  reportEls.integrated.textContent = template.integrated;
  setList(reportEls.career, template.career);
  setList(reportEls.relationship, template.relationship);
  setList(reportEls.energy, template.energy);
  setList(reportEls.actions, template.actions);
  setList(reportEls.pitfalls, template.pitfalls);
  setList(reportEls.windows, template.windows);

  document.getElementById('report-root').scrollIntoView({ behavior: 'smooth', block: 'start' });
});
