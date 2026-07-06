const ROLE_LABELS = {
  'citizen-facilitator': 'Facilitator',
  'learning': 'Learning',
  'can-train': 'Trainer',
  'can-host': 'Can Host',
  'researcher': 'Researcher',
  'organisation': 'Organisation',
};

const TOPIC_LABELS = {
  'political-polarisation': 'Political Polarisation',
  'housing': 'Housing & Cost of Living',
  'climate': 'Climate & Energy',
  'immigration': 'Immigration',
  'healthcare': 'Healthcare',
  'other': 'Other Topics',
};

function personInitials(name) {
  return name.split(/\s+/).map(w => w[0] || '').join('').slice(0, 2).toUpperCase();
}

function buildPersonCard(person) {
  const roles = person.roles || [];
  const roleLabels = roles.map(r => ROLE_LABELS[r] || r).filter(Boolean);
  const topicLabels = (person.topics || []).map(t => TOPIC_LABELS[t] || t).filter(Boolean);
  const avatar = person.initials || personInitials(person.name);

  const tags = [...topicLabels];
  if (roles.includes('can-train')) tags.push('Can train others');

  return `<div class="person-card" data-tags="${roles.join(' ')}">
      <div class="person-avatar">${avatar}</div>
      <div class="person-role">${roleLabels.join(' · ') || 'Member'}</div>
      <div class="person-name">${person.name}</div>
      <div class="person-location">📍 ${person.location}</div>
      ${tags.length ? `<div class="tags">${tags.slice(0, 4).map(t => `<span class="tag">${t}</span>`).join('')}</div>` : ''}
    </div>`;
}

function placeholderCard() {
  return `<div class="person-card" style="opacity:0.45;border-style:dashed;" data-tags="__placeholder">
      <div class="person-avatar" style="background:var(--muted);">?</div>
      <div class="person-role">Facilitator</div>
      <div class="person-name">Your name here</div>
      <div class="person-location">📍 Your city</div>
      <div class="tags"><span class="tag"><a href="directory.html#join" style="color:inherit;text-decoration:none;">Add yourself →</a></span></div>
    </div>`;
}

async function loadDirectory(gridId, opts) {
  const grid = document.getElementById(gridId);
  if (!grid) return;
  const { limit, placeholders, onLoad } = opts || {};

  let approved = [];
  try {
    const res = await fetch('directory.json');
    const all = await res.json();
    approved = all.filter(p => p.approved);
  } catch {
    return;
  }

  if (onLoad) onLoad(approved);

  const shown = limit != null ? approved.slice(0, limit) : approved;
  let html = shown.map(buildPersonCard).join('');

  if (placeholders) {
    const fill = Math.max(0, placeholders - shown.length);
    for (let i = 0; i < fill; i++) html += placeholderCard();
  }

  grid.innerHTML = html;
}
