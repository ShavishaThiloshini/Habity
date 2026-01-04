/* ======================
   HabitBloom 🌸 Script
====================== */

const form = document.querySelector(".habit-form");
const input = document.querySelector(".habit-form input");
const habitList = document.querySelector(".habit-list");
const toast = document.getElementById("toast");

/* Filters (future-ready) */
let filter = "all";

/* Load habits */
let habits = JSON.parse(localStorage.getItem("habits")) || [];

/* Weekly progress data (Mon → Sun) */
let weekData = JSON.parse(localStorage.getItem("weekData")) || 
[false, false, false, false, false, false, false];

/* Initial render */
renderHabits();
updateProgress();
renderCalendar();

/* ======================
   Add Habit
====================== */
form.addEventListener("submit", (e) => {
    e.preventDefault();

    const text = input.value.trim();
    if (!text) return;

    habits.push({
        id: Date.now(),
        name: text,
        streak: 0,
        lastDone: null
    });

    saveHabits();
    renderHabits();
    input.value = "";
});

/* ======================
   Render Habits
====================== */
function renderHabits() {
    habitList.innerHTML = "";

    const today = new Date().toDateString();

    let filtered = habits.filter(habit => {
        if (filter === "completed") return habit.lastDone === today;
        return true;
    });

    if (filtered.length === 0) {
        habitList.innerHTML = `<p style="color:#777;">🌱 No habits yet. Start growing!</p>`;
        return;
    }

    filtered.forEach(habit => {
        const doneToday = habit.lastDone === today;

        const div = document.createElement("div");
        div.className = "habit";

        div.innerHTML = `
            <div>
                <div class="habit-name">${habit.name}</div>
                <div class="streak">🔥 ${habit.streak} day streak</div>
            </div>
            <div>
                <button class="done-btn">${doneToday ? "✔" : "Done"}</button>
                <button class="delete-btn">❌</button>
            </div>
        `;

        div.querySelector(".done-btn").onclick = () => markDone(habit.id);
        div.querySelector(".delete-btn").onclick = () => deleteHabit(habit.id);

        habitList.appendChild(div);
    });
}

/* ======================
   Mark Habit Done
====================== */
function markDone(id) {
    const today = new Date();
    const todayStr = today.toDateString();

    habits.forEach(habit => {
        if (habit.id === id && habit.lastDone !== todayStr) {
            habit.streak++;
            habit.lastDone = todayStr;

            /* 👉 Weekly progress update */
            const day = today.getDay(); // 0 (Sun) - 6 (Sat)
            const index = day === 0 ? 6 : day - 1; // Convert to Mon-Sun
            weekData[index] = true;

            showToast();
        }
    });

    saveHabits();
    saveWeek();
    renderHabits();
    updateProgress();
    renderCalendar();
}

/* ======================
   Delete Habit
====================== */
function deleteHabit(id) {
    habits = habits.filter(h => h.id !== id);
    saveHabits();
    renderHabits();
}

/* ======================
   Toast Message
====================== */
function showToast() {
    const msgs = [
        "Great job! 🌟",
        "You're growing! 🌱",
        "Keep going! 💖",
        "Habit complete! 🌸"
    ];
    toast.textContent = msgs[Math.floor(Math.random() * msgs.length)];
    toast.classList.add("show");

    setTimeout(() => toast.classList.remove("show"), 1500);
}

/* ======================
   Save to LocalStorage
====================== */
function saveHabits() {
    localStorage.setItem("habits", JSON.stringify(habits));
}

function saveWeek() {
    localStorage.setItem("weekData", JSON.stringify(weekData));
}

/* ======================
   Weekly Progress Update
====================== */
function updateProgress() {
    const bars = document.querySelectorAll(".day .bar");
    let completed = 0;

    weekData.forEach((done, index) => {
        if (bars[index]) {
            if (done) {
                bars[index].classList.add("active");
                completed++;
            } else {
                bars[index].classList.remove("active");
            }
        }
    });

    const percent = Math.round((completed / 7) * 100);
    const value = document.getElementById("progressValue");
    if (value) value.innerText = percent + "%";
}

/* Dark mode toggle */

const toggleBtn = document.getElementById("themeToggle");
const savedTheme = localStorage.getItem("theme");

if (savedTheme === "dark") {
  document.body.classList.add("dark");
  toggleBtn.textContent = "🌞";
}

toggleBtn.addEventListener("click", () => {
  document.body.classList.toggle("dark");

  if (document.body.classList.contains("dark")) {
    localStorage.setItem("theme", "dark");
    toggleBtn.textContent = "🌞";
  } else {
    localStorage.setItem("theme", "light");
    toggleBtn.textContent = "🌙";
  }
});

/* Streak Calendar Render */

function renderCalendar() {
  const grid = document.getElementById("calendarGrid");
  if (!grid) return;

  grid.innerHTML = "";

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day).toDateString();

    const div = document.createElement("div");
    div.className = "calendar-day";
    div.textContent = day;

    // If ANY habit was done on this date → mark done
    const done = habits.some(habit => habit.lastDone === date);
    if (done) div.classList.add("done");

    grid.appendChild(div);
  }
}

/* ======================
   Weekly Reset & Export 🔄📤
====================== */

document.getElementById("resetWeek").addEventListener("click", () => {
  if (!confirm("Reset this week's progress? 🌱")) return;

  weekData = [false, false, false, false, false, false, false];
  localStorage.setItem("weekData", JSON.stringify(weekData));

  updateProgress();
  alert("Week reset! Ready for a fresh start 🌸");
});

document.getElementById("exportData").addEventListener("click", () => {
  const data = {
    habits,
    weekData,
    exportedAt: new Date().toLocaleString()
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json"
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");

  a.href = url;
  a.download = "HabitBloom-progress.json";
  a.click();

  URL.revokeObjectURL(url);
});
