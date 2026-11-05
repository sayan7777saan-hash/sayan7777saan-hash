const username = process.env.GITHUB_USERNAME || "sayan7777saan-hash";
const token = process.env.GH_TOKEN;
if (!token) throw new Error("Missing GH_TOKEN secret. Add a token with read:user permission.");

const to = new Date();
const from = new Date(to);
from.setUTCDate(from.getUTCDate() - 364);

const query = `
query($login: String!, $from: DateTime!, $to: DateTime!) {
  user(login: $login) {
    contributionsCollection(from: $from, to: $to) {
      contributionCalendar {
        totalContributions
        weeks {
          contributionDays {
            date
            contributionCount
            color
          }
        }
      }
    }
  }
}`;
const response = await fetch("https://api.github.com/graphql", {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${token}`,
    "Content-Type": "application/json",
    "User-Agent": "github-contribution-dashboard"
  },
  body: JSON.stringify({
    query,
    variables: { login: username, from: from.toISOString(), to: to.toISOString() }
  })
});
const payload = await response.json();
if (!response.ok || payload.errors) {
  throw new Error(JSON.stringify(payload.errors || payload));
}
const calendar = payload.data?.user?.contributionsCollection?.contributionCalendar;
if (!calendar) throw new Error(`Could not find GitHub user: ${username}`);

const days = calendar.weeks.flatMap(w => w.contributionDays);
const total = calendar.totalContributions;
let current = 0, longest = 0, run = 0;
for (let i = 0; i < days.length; i++) {
  if (days[i].contributionCount > 0) {
    run++;
    longest = Math.max(longest, run);
  } else run = 0;
}
let end = days.length - 1;
if (days[end]?.contributionCount === 0) end--;
for (let i = end; i >= 0 && days[i].contributionCount > 0; i--) current++;

const W = 1600, H = 650;
const x0 = 112, y0 = 250, cell = 19, gap = 8, step = cell + gap;
const colors = ["#101b32", "#183b70", "#245db3", "#258de5", "#26c5f4"];
const esc = s => String(s).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;");
const monthLabels = [];
let lastMonth = "";
days.forEach((d, i) => {
  const date = new Date(d.date + "T00:00:00Z");
  const month = date.toLocaleString("en-US", { month: "short", timeZone: "UTC" });
  const week = Math.floor(i / 7);
  if (date.getUTCDate() <= 7 && month !== lastMonth) {
    monthLabels.push(`<text x="${x0 + week * step}" y="222" class="month">${month}</text>`);
    lastMonth = month;
  }
});
const rects = days.map((d, i) => {
  const week = Math.floor(i / 7), dow = new Date(d.date + "T00:00:00Z").getUTCDay();
  const level = d.contributionCount === 0 ? 0 : Math.min(4, Math.ceil(d.contributionCount / 3));
  const color = level === 0 ? colors[0] : colors[level];
  return `<rect x="${x0 + week * step}" y="${y0 + dow * step}" width="${cell}" height="${cell}" rx="5" fill="${color}"><title>${esc(d.date)}: ${d.contributionCount} contributions</title></rect>`;
}).join("\n");
const weekCount = Math.ceil(days.length / 7);
const gridWidth = weekCount * step - gap;
const dayLabels = ["Sun","Tue","Thu","Sat"].map((d, i) =>
  `<text x="36" y="${y0 + (i*2) * step + 14}" class="day">${d}</text>`).join("");
const legend = colors.map((c, i) =>
  `<rect x="${112 + i*40}" y="435" width="22" height="22" rx="5" fill="${c}"/>`).join("");

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<defs>
  <linearGradient id="title" x1="0" x2="1"><stop stop-color="#8b7cff"/><stop offset="1" stop-color="#42c9f5"/></linearGradient>
  <linearGradient id="line" x1="0" x2="1"><stop stop-color="#476dff"/><stop offset=".55" stop-color="#a45cff"/><stop offset="1" stop-color="#17213d"/></linearGradient>
  <filter id="glow"><feGaussianBlur stdDeviation="8" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
</defs>
<rect width="1600" height="650" rx="28" fill="#080d1b"/>
<rect x="1" y="1" width="1598" height="648" rx="27" fill="none" stroke="#20294b" stroke-width="2"/>
<path d="M38 28 H1562" stroke="#242d52" stroke-width="2"/>
<text x="62" y="135" font-size="58" fill="url(#title)" font-family="Segoe UI,Arial,sans-serif" font-weight="700">▮ Contribution Activity</text>
<path d="M785 116 H1545" stroke="url(#line)" stroke-width="3"/>
<text x="64" y="195" font-size="29" fill="#aeb9dc" font-family="Segoe UI,Arial,sans-serif" font-style="italic">Consistency is the key to growth.</text>
<rect x="36" y="220" width="1528" height="265" rx="22" fill="#0b1122" stroke="#20294b" stroke-width="2"/>
{''.join(monthLabels)}
{dayLabels}
{rects}
<text x="64" y="451" class="day">Less</text>
{legend}
<text x="328" y="451" class="day">More</text>
<rect x="36" y="510" width="1528" height="105" rx="22" fill="#0d1328" stroke="#292d59" stroke-width="2"/>
<path d="M540 530 V595 M1055 530 V595" stroke="#30345f" stroke-width="2"/>
<text x="92" y="570" font-size="43" fill="#8d7cff" font-family="Segoe UI,Arial,sans-serif">♨</text>
<text x="160" y="565" font-size="42" fill="#f4f6ff" font-family="Segoe UI,Arial,sans-serif" font-weight="700">${current}</text>
<text x="160" y="595" font-size="22" fill="#aeb9dc" font-family="Segoe UI,Arial,sans-serif">Current Streak (days)</text>
<text x="600" y="570" font-size="43" fill="#b17cff" font-family="Segoe UI,Arial,sans-serif">🏆</text>
<text x="675" y="565" font-size="42" fill="#f4f6ff" font-family="Segoe UI,Arial,sans-serif" font-weight="700">${longest}</text>
<text x="675" y="595" font-size="22" fill="#aeb9dc" font-family="Segoe UI,Arial,sans-serif">Longest Streak (days)</text>
<text x="1115" y="570" font-size="42" fill="#54bfff" font-family="Segoe UI,Arial,sans-serif">▦</text>
<text x="1180" y="565" font-size="42" fill="#f4f6ff" font-family="Segoe UI,Arial,sans-serif" font-weight="700">${total.toLocaleString("en-US")}</text>
<text x="1180" y="595" font-size="22" fill="#aeb9dc" font-family="Segoe UI,Arial,sans-serif">Total Contributions</text>
<style>
.month{fill:#aeb9dc;font:20px 'Segoe UI',Arial,sans-serif}
.day{fill:#aeb9dc;font:18px 'Segoe UI',Arial,sans-serif}
</style>
</svg>`;
await import("node:fs/promises").then(fs => fs.mkdir("assets", { recursive: true }));
await import("node:fs/promises").then(fs => fs.writeFile("assets/contribution-dashboard.svg", svg));
console.log(`Generated dashboard for ${username}: ${total} contributions`);
