function el(tag, attrs = {}, ...children) {
    const node = document.createElement(tag);
    Object.entries(attrs).forEach(([k, v]) => {
      if (k === "class") node.className = v;
      else if (k === "text") node.textContent = v;
      else node.setAttribute(k, v);
    });
    children.forEach(c => node.appendChild(c));
    return node;
  }
  
  async function loadUsers() {
    const year = document.getElementById("year").value;
    const res = await fetch(`/users/${year}`);
    if (!res.ok) { document.getElementById("users").innerHTML = "Keine User gefunden."; return; }
    const data = await res.json();
  
    const box = document.getElementById("users");
    box.innerHTML = "";
  
    data.users.forEach(u => {
      const id = `u_${u}`;
      const lbl = el("label", { style: "margin-right:10px" },
        el("input", { type: "checkbox", id, value: u, checked: true }),
        el("span", { text: " " + u })
      );
      box.appendChild(lbl);
    });
  }
  
  async function loadAggregate() {
    const year = document.getElementById("year").value;
    const selected = Array.from(document.querySelectorAll("#users input[type=checkbox]:checked"))
      .map(i => i.value);
  
    const query = selected.length ? `?users=${encodeURIComponent(selected.join(","))}` : "";
    const res = await fetch(`/aggregate/${year}${query}`);
    if (!res.ok) return alert("Keine Aggregationsdaten gefunden.");
  
    const data = await res.json();
    renderGroupCalendar(data);
  }
  
  function colorForCounts(c, total) {
    // Rot wenn es mind. ein Nein gibt
    if (c.no > 0) return "#ff6b6b";
    // Alle Ja -> Gruen
    if (c.yes === total) return "#2f9e44";
    // Keine Neins: Gelb→Gruen je nach Anteil Ja
    const ratio = total ? (c.yes / total) : 0;
    const hue = 50 + Math.round(70 * ratio); // 50 (gelb) bis 120 (gruen)
    return `hsl(${hue},70%,60%)`;
  }
  
  function renderGroupCalendar(agg) {
    const calendar = document.getElementById("calendar");
    calendar.innerHTML = "";
  
    const year = Number(agg.year);
    const perDay = agg.perDay;
    const total = agg.total;
  
    for (let month = 0; month < 12; month++) {
      const m = document.createElement("div");
      m.className = "month";
  
      const title = document.createElement("h4");
      title.innerText = new Date(year, month).toLocaleString("de-DE", { month: "long" });
      m.appendChild(title);
  
      const grid = document.createElement("div");
      grid.className = "grid";
  
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      for (let d = 1; d <= daysInMonth; d++) {
        const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
        const c = perDay[dateStr] || { yes: 0, no: 0, maybe: total };
        const bg = colorForCounts(c, total);
  
        const dayDiv = document.createElement("div");
        dayDiv.className = "day count";
        dayDiv.style.background = bg;
        dayDiv.style.borderColor = "#bdbdbd";
        dayDiv.innerText = d;
  
        dayDiv.setAttribute("data-tip", `${dateStr}
  Ja: ${c.yes}  Nein: ${c.no}  Vielleicht: ${c.maybe}`);
  
        grid.appendChild(dayDiv);
      }
  
      m.appendChild(grid);
      calendar.appendChild(m);
    }
  }