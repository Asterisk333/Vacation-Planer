let selections = {};
let username = "";
const year = 2027;

function start() {
  username = document.getElementById("username").value.trim();
  if (!username) return alert("Bitte Name eingeben.");

  document.getElementById("name-step").style.display = "none";
  document.getElementById("calendar-step").style.display = "block";
  document.getElementById("hello").innerText = "Hallo " + username;

  renderCalendar();
}

function renderCalendar() {
  const calendar = document.getElementById("calendar");
  calendar.innerHTML = "";
  for (let month = 0; month < 12; month++) {
    const monthDiv = document.createElement("div");
    monthDiv.className = "month";

    const title = document.createElement("h4");
    title.innerText = new Date(year, month).toLocaleString("de-DE", { month: "long" });
    monthDiv.appendChild(title);

    const grid = document.createElement("div");
    grid.className = "grid";

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
      selections[dateStr] = selections[dateStr] || "maybe";

      const dayDiv = document.createElement("div");
      dayDiv.className = "day " + selections[dateStr];
      dayDiv.innerText = d;
      dayDiv.dataset.date = dateStr;
      dayDiv.onclick = () => toggle(dayDiv);

      grid.appendChild(dayDiv);
    }

    monthDiv.appendChild(grid);
    calendar.appendChild(monthDiv);
  }
}

function toggle(dayDiv) {
  const date = dayDiv.dataset.date;
  const current = selections[date];
  let next = "maybe";
  if (current === "maybe") next = "no";
  else if (current === "no") next = "yes";
  else next = "maybe";
  selections[date] = next;
  dayDiv.className = "day " + next;
}

async function save() {
  const data = { user: username, year, choices: selections };
  const res = await fetch("/save", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  if (!res.ok) return alert("Fehler beim Speichern");
  alert("Gespeichert");
}