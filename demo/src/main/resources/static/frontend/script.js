const API_URL = "http://localhost:8080/api/tasks";


async function loadTasks() {
    const response = await fetch(API_URL);
    const tasks = await response.json();
    console.log(tasks);

    const taskList = document.getElementById("taskList");
    const PRIORITY_LABELS = {
        low: "Alacsony",
        medium: "Közepes",
        high: "Magas"
    };
    taskList.innerHTML = "";

    tasks.forEach(task => {
        const li = document.createElement("li");
        li.className = task.completed ? "completed" : "";
        li.innerHTML = `
            <span>${task.title} - ${task.deadline} (${task.description})</span>
            <span>Prioritás: ${PRIORITY_LABELS[task.priority] || "Ismeretlen"}</span>
            <div>
                <button onclick="deleteTask(${task.id})">Törlés</button>
                <button onclick="toggleComplete(${task.id}, ${task.completed})">
                    ${task.completed ? "Visszavonás" : "Kész"}
                </button>
            </div>
        `;
        taskList.appendChild(li);
    });
}

document.getElementById("taskForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const title = document.getElementById("taskTitle").value;
    const description = document.getElementById("taskDescription").value;
    const deadline = document.getElementById("taskDeadline").value;

    await fetch(API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ title, description, deadline, completed: false }),
    });

    document.getElementById("taskForm").reset();
    loadTasks();
});

async function deleteTask(id) {
    if (confirm("Biztosan törölni szeretnéd ezt a feladatot?")) {
        await fetch(${API_URL}/${id}, { method: "DELETE" });
        loadTasks();
    } else {
        console.log("Törlés megszakítva.");
    }
}

// Feladat állapotának váltása
async function toggleComplete(id, completed){
    const response = await fetch(${API_URL}/${id});
    const task = await response.json(); // Betöltjük az aktuális feladatot
    await fetch(${API_URL}/${id}, {
    method: "PUT",
        headers: {
        "Content-Type": "application/json",
    },
    body: JSON.stringify({
        ...task, // Megtartjuk az eredeti adatokat
        completed: !completed, // Frissítjük a completed mezőt
    }),
});
loadTasks();
}

loadTasks();