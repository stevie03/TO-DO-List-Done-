const API_URL = "http://localhost:8080/api/tasks";
const ACHIEVEMENT_URL = "http://localhost:8080/api/achievements";

async function loadTasks() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Network response was not ok');
        const tasks = await response.json();
        const taskList = document.getElementById("taskList");
        taskList.innerHTML = "";
        const PRIORITY_LABELS = {
            low: "Alacsony",
            medium: "Közepes",
            high: "Magas"
        };

        tasks.forEach(task => {
            const formattedDeadline = task.deadline
                ? new Date(task.deadline).toLocaleString("hu-HU", {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: 'numeric'
                })
                : 'Nincs hozzáadva határidő';

            const li = document.createElement("li");
            li.className = task.completed ? "completed" : "";
            li.innerHTML = `
                <span>${task.title} - ${formattedDeadline} (${task.description})</span>
                <span>Prioritás: ${PRIORITY_LABELS[task.priority] || "Ismeretlen"}</span>
                <div>
                    <button onclick="deleteTask(${task.id})">Törlés</button>
                    <button onclick="toggleComplete(${task.id}, ${task.completed})">
                        ${task.completed ? "Visszavonás" : "Kész"}
                    </button>
                    <button onclick="editTask(${task.id})">Szerkesztés</button>
                </div>
            `;
            taskList.appendChild(li);
        });
    } catch (error) {
        console.error('Error loading tasks:', error);
    }
}


async function deleteTask(id) {
    try {
        if (confirm("Biztosan törölni szeretnéd ezt a feladatot?")) {
            await fetch(`${API_URL}/${id}`, { method: "DELETE" });
            await loadTasks();
            await checkAchievements();
        } else {
            console.log("Törlés megszakítva.");
        }
    } catch (error) {
        console.error('Error deleting task:', error);
    }
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



async function toggleComplete(id, completed) {
    try {
        const response = await fetch(`${API_URL}/${id}`);
        if (!response.ok) throw new Error('Network response was not ok');
        const task = await response.json();
        await fetch(`${API_URL}/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                ...task,
                completed: !completed,
            }),
        });
        loadTasks();
        await checkAchievements();
    } catch (error) {
        console.error('Error toggling task:', error);
    }
}


async function checkAchievements() {
    try {
        const response = await fetch(ACHIEVEMENT_URL);
        const achievements = await response.json();

        for (let achievement of achievements) {
            if (achievement.unlocked && !achievement.alertShown) {
                alert(`Gratulálunk! Teljesítetted az achievementet: ${achievement.name}`);
                achievement.alertShown = true;


                await fetch(`${ACHIEVEMENT_URL}/${achievement.id}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        ...achievement,
                        alertShown: true,
                    })
                });
            }
        }

        loadAchievements();
    } catch (error) {
        console.error('Error checking achievements:', error);
    }
}






document.getElementById("taskForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const title = document.getElementById("taskTitle").value;
    const description = document.getElementById("taskDescription").value;
    const priority = document.getElementById("taskPriority").value;
    let deadline = document.getElementById("taskDeadline").value;


    if (deadline) {
        deadline = new Date(deadline).toISOString();
    } else {
        deadline = null;
    }

    try {
        await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ title, description, deadline, completed: false, priority }),
        });

        document.getElementById("taskForm").reset();
        loadTasks();
        checkAchievements();
    } catch (error) {
        console.error('Error adding task:', error);
    }
});








async function updateTask(id, updatedTask) {
    try {
        await fetch(`${API_URL}/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(updatedTask),
        });
        loadTasks();
    } catch (error) {
        console.error('Error updating task:', error);
    }
}






async function loadAchievements() {
    const response = await fetch(ACHIEVEMENT_URL);
    const achievements = await response.json();

    const achievementList = document.getElementById("achievementList");
    achievementList.innerHTML = "";

    achievements.forEach(achievement => {
        const li = document.createElement("li");
        li.innerText = achievement.name + (achievement.unlocked ? " - Teljesítve" : " - Nincs teljesítve");
        li.className = achievement.unlocked ? "unlocked" : "locked";
        achievementList.appendChild(li);
    });
}




loadTasks();
loadAchievements();
