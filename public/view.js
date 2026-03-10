async function loadData() {
    const user = document.getElementById("user").value.trim();
    if (!user) return alert("User eingeben.");
    const res = await fetch(`/load/${user}/2027`);
    if (!res.ok) return alert("Keine Daten gefunden.");
    const data = await res.json();
    renderCalendar(data);
  }
  
  function renderCalendar(data) {
    const calendar = document.getElementById("calendar");
    calendar.innerHTML = "";
    const choices = data.choices;
    const year = data.year;
  
    for (let month = 0; month < 12; month++) {
      const m = document.createElement("div");
      m.className = "month";
  
      const title = document.createElement("h4");
      title.innerText = new Date(year, month).toLocaleString("de-DE", { month: "long" });
      m.appendChild(title);
  
      const grid = document.createElement("div"); grid.className = "grid";
  
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      for (let d = 1; d <= daysInMonth; d++) {
        const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
        const v = choices[dateStr] || "maybe";
        const dayDiv = document.createElement("div");
        dayDiv.className = "day " + v;
        dayDiv.innerText = d;
        grid.appendChild(dayDiv);
      }
  
      m.appendChild(grid);
      calendar.appendChild(m);
    }
  }