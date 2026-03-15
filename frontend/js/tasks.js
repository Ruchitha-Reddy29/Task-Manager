document.addEventListener('DOMContentLoaded', async () => {
    const user = api.checkAuth();

    // Set User Info
    document.getElementById('userName').textContent = user.name;
    document.getElementById('userRole').textContent = user.role.charAt(0).toUpperCase() + user.role.slice(1);
    document.getElementById('userInitials').textContent = user.name.charAt(0).toUpperCase();

    const tbody = document.getElementById('tasksTbody');
    const modal = document.getElementById('taskModal');
    const form = document.getElementById('taskForm');
    const filterSelect = document.getElementById('filterProject');
    const projectSelect = document.getElementById('projectId');
    const userSelect = document.getElementById('assignedTo');

    let tasks = [];
    let projects = [];
    let users = [];

    async function init() {
        try {
            const [projRes, userRes] = await Promise.all([
                api.getProjects(),
                api.getUsers()
            ]);

            projects = projRes.data;
            users = userRes.data;

            // Populate Projects Dropdown
            const projOptions = projects.map(p => `<option value="${p._id}">${p.projectName}</option>`).join('');
            filterSelect.innerHTML += projOptions;
            projectSelect.innerHTML = `<option value="">Select a Project...</option>` + projOptions;

            // Populate Users Dropdown
            userSelect.innerHTML = `<option value="">Select a User...</option>` + users.map(u => `<option value="${u._id}">${u.name} (${u.role})</option>`).join('');

            await fetchAndRenderTasks();
        } catch (error) {
            showToast(error.message, 'error');
        }
    }

    async function fetchAndRenderTasks(projId = '') {
        try {
            const res = await api.getTasks(projId);
            tasks = res.data;
            renderTasks();
        } catch (error) {
            showToast(error.message, 'error');
            tbody.innerHTML = `<tr><td colspan="6" class="text-center" style="color: var(--danger)">Failed to load tasks</td></tr>`;
        }
    }

    function getStatusBadge(status) {
        if (status === 'Completed') return '<span class="badge badge-completed">Completed</span>';
        if (status === 'In Progress') return '<span class="badge badge-progress">In Progress</span>';
        return '<span class="badge badge-todo">To Do</span>';
    }

    function renderTasks() {
        if (tasks.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" class="text-center">No tasks found. Create one!</td></tr>`;
            return;
        }

        tbody.innerHTML = tasks.map(t => `
        <tr>
          <td><strong>${t.taskTitle}</strong></td>
          <td>${t.projectId?.projectName || 'N/A'}</td>
          <td>${t.assignedTo?.name || 'Unassigned'}</td>
          <td>${new Date(t.deadline).toLocaleDateString()}</td>
          <td>${getStatusBadge(t.status)}</td>
          <td class="actions-cell">
            <button class="btn btn-primary btn-sm" onclick="editTask('${t._id}')"><i class="fa-solid fa-pen"></i></button>
            <button class="btn btn-danger btn-sm" onclick="deleteTaskReq('${t._id}')"><i class="fa-solid fa-trash"></i></button>
          </td>
        </tr>
      `).join('');
    }

    filterSelect.addEventListener('change', (e) => {
        fetchAndRenderTasks(e.target.value);
    });

    // --- Modal Logic ---
    document.getElementById('openCreateModal').addEventListener('click', () => {
        form.reset();
        document.getElementById('taskId').value = '';
        document.getElementById('modalTitle').textContent = 'Create Task';
        modal.classList.add('show');
    });

    [document.getElementById('closeModal'), document.getElementById('cancelModal')].forEach(btn => btn.addEventListener('click', () => {
        modal.classList.remove('show');
    }));

    window.onclick = function (event) {
        if (event.target == modal) modal.classList.remove('show');
    }

    // --- Create/Update Logic ---
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('taskId').value;
        const taskData = {
            taskTitle: document.getElementById('taskTitle').value,
            description: document.getElementById('description').value,
            projectId: document.getElementById('projectId').value,
            assignedTo: document.getElementById('assignedTo').value,
            deadline: document.getElementById('deadline').value,
            status: document.getElementById('status').value
        };

        try {
            if (id) {
                await api.updateTask(id, taskData);
                showToast('Task updated successfully');
            } else {
                await api.createTask(taskData);
                showToast('Task created successfully');
            }
            modal.classList.remove('show');
            fetchAndRenderTasks(filterSelect.value);
        } catch (error) {
            showToast(error.message, 'error');
        }
    });

    // Global methods for inline onclick
    window.editTask = (id) => {
        const t = tasks.find(task => task._id === id);
        if (!t) return;

        document.getElementById('taskId').value = t._id;
        document.getElementById('taskTitle').value = t.taskTitle;
        document.getElementById('description').value = t.description;
        document.getElementById('projectId').value = t.projectId?._id || '';
        document.getElementById('assignedTo').value = t.assignedTo?._id || '';
        document.getElementById('deadline').value = t.deadline.split('T')[0];
        document.getElementById('status').value = t.status;

        document.getElementById('modalTitle').textContent = 'Edit Task';
        modal.classList.add('show');
    };

    window.deleteTaskReq = async (id) => {
        if (confirm('Are you sure you want to delete this task?')) {
            try {
                await api.deleteTask(id);
                showToast('Task deleted successfully');
                fetchAndRenderTasks(filterSelect.value);
            } catch (error) {
                showToast(error.message, 'error');
            }
        }
    };

    init();
});
