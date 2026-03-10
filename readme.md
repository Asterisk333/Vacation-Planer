# Holiday Planner 2027

A small web app to collect availability from multiple users and visualize the combined results in a calendar view.  
Users select **yes / no / maybe** for each day of 2027, and the server stores each user's data as a JSON file.  
A group view shows color‑coded overlaps for all selected users.

## Features
- Per‑user availability calendar (yes / no / maybe)
- Automatic JSON storage on the server
- Group aggregation with:
  - Red = at least one user selected “no”
  - Green = all users selected “yes”
  - Yellow → green gradient = mix without any "no"
- Hover tooltips showing counts per day
- Simple Node.js backend (Express)

## Project Structure
```

app/
public/        # Frontend files (HTML, JS, CSS)
data/          # User JSON files (auto‑generated)
server.js      # API and calendar aggregation
package.json
start.sh
Procfile

```

## Installation
```

npm install

```

## Run the Server
```

npm start

```

Or with the helper script:
```

./start.sh

```

## Deploy
Platforms like Railway, Render, Vercel, or Heroku will:
- Install dependencies automatically
- Run `npm start` using the included Procfile

## Pages
- `/` → user calendar input  
- `/view.html` → single user view  
- `/group.html` → group availability comparison  

## Requirements
- Node.js 18+
- No external database (JSON file storage)

---

Simple app, easy to modify, and ready for small groups planning a trip together.