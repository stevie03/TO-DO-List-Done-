const API_URL = "http://localhost:8080/api/tasks";


async function loadTasks() {
    const response = await fetch(API_URL);
    const tasks = await response.json();
    console.log(tasks);

    const taskList = document.getElementById("taskList");
    taskList.innerHTML = "";

    tasks.forEach(task => {
        const li = document.createElement("li");
        li.className = task.completed ? "completed" : "";
        li.innerHTML = `
            <span>${task.title} - ${task.deadline} (${task.description})</span>
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
function editTask(id) {
    fetch(`${API_URL}/${id}`)
        .then(response => response.json())
        .then(task => {
            const form = document.createElement('form');
            form.innerHTML = `
                <label>Cím: <input type="text" id="editTitle" value="${task.title}" /></label>
                <label>Leírás: <input type="text" id="editDescription" value="${task.description}" /></label>
                <label>Határidő: <input type="datetime-local" id="editDeadline" value="${task.deadline ? task.deadline.slice(0, 16) : ''}" /></label>
                <label>Prioritás:
                    <select id="editPriority">
                        <option value="low" ${task.priority === "low" ? "selected" : ""}>Alacsony</option>
                        <option value="medium" ${task.priority === "medium" ? "selected" : ""}>Közepes</option>
                        <option value="high" ${task.priority === "high" ? "selected" : ""}>Magas</option>
                    </select>
                </label>
                <button type="button" onclick="saveTask(${task.id})">Mentés</button>
                <button type="button" onclick="loadTasks()">Mégse</button>
            `;
            document.getElementById("taskList").innerHTML = "";
            document.getElementById("taskList").appendChild(form);
        })
        .catch(error => console.error("Error loading task for editing:", error));
}

async function saveTask(id) {
    const title = document.getElementById("editTitle").value;
    const description = document.getElementById("editDescription").value;
    const deadline = document.getElementById("editDeadline").value || null;
    const priority = document.getElementById("editPriority").value;

    try {
        await fetch(`${API_URL}/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title, description, deadline, priority, completed: false }),
        });
        loadTasks();
    } catch (error) {
        console.error('Error saving task:', error);
    }
}
loadTasks();