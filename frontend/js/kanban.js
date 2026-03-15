document.addEventListener('DOMContentLoaded', async () => {
    const user = api.checkAuth();

    // Set User Info
    document.getElementById('userName').textContent = user.name;
    document.getElementById('userRole').textContent = user.role.charAt(0).toUpperCase() + user.role.slice(1);
    document.getElementById('userInitials').textContent = user.name.charAt(0).toUpperCase();

    const filterSelect = document.getElementById('filterProject');

    const dropTodo = document.getElementById('drop-todo');
    const dropProgress = document.getElementById('drop-progress');
    const dropCompleted = document.getElementById('drop-completed');

    let tasks = [];
    let draggedTaskEl = null;

    async function init() {
        try {
            const projRes = await api.getProjects();

            // Populate Projects Dropdown
            const projOptions = projRes.data.map(p => `<option value="${p._id}">${p.projectName}</option>`).join('');
            filterSelect.innerHTML += projOptions;

            await fetchAndRenderTasks();
        } catch (error) {
            showToast(error.message, 'error');
        }
    }

    async function fetchAndRenderTasks(projId = '') {
        try {
            const res = await api.getTasks(projId);
            tasks = res.data;
            renderKanban();
        } catch (error) {
            showToast(error.message, 'error');
        }
    }

    function getTaskClass(status) {
        if (status === 'Completed') return 'completed';
        if (status === 'In Progress') return 'progress';
        return 'todo';
    }

    function renderKanban() {
        dropTodo.innerHTML = '';
        dropProgress.innerHTML = '';
        dropCompleted.innerHTML = '';

        let countTodo = 0;
        let countProgress = 0;
        let countCompleted = 0;

        tasks.forEach(t => {
            const el = document.createElement('div');
            el.className = `task-card ${getTaskClass(t.status)}`;
            el.draggable = true;
            el.dataset.id = t._id;

            el.innerHTML = `
                <h4>${t.taskTitle}</h4>
                <div class="task-meta">
                    <span><i class="fa-solid fa-briefcase"></i> ${t.projectId?.projectName || 'N/A'}</span>
                    <span><i class="fa-solid fa-user"></i> ${t.assignedTo?.name || 'Unassigned'}</span>
                    <span><i class="fa-regular fa-calendar-xmark"></i> ${new Date(t.deadline).toLocaleDateString()}</span>
                </div>
            `;

            // Drag events
            el.addEventListener('dragstart', () => {
                draggedTaskEl = el;
                el.style.opacity = '0.5';
            });
            el.addEventListener('dragend', () => {
                draggedTaskEl = null;
                el.style.opacity = '1';
            });

            if (t.status === 'To Do') {
                dropTodo.appendChild(el);
                countTodo++;
            } else if (t.status === 'In Progress') {
                dropProgress.appendChild(el);
                countProgress++;
            } else {
                dropCompleted.appendChild(el);
                countCompleted++;
            }
        });

        document.getElementById('count-todo').textContent = countTodo;
        document.getElementById('count-progress').textContent = countProgress;
        document.getElementById('count-completed').textContent = countCompleted;
    }

    filterSelect.addEventListener('change', (e) => {
        fetchAndRenderTasks(e.target.value);
    });

    // Setup Dropzones
    const columns = document.querySelectorAll('.kanban-column');

    columns.forEach(col => {
        const dropzone = col.querySelector('.tasks-dropzone');
        const status = col.dataset.status;

        col.addEventListener('dragover', (e) => {
            e.preventDefault();
            col.classList.add('drag-over');
        });

        col.addEventListener('dragleave', () => {
            col.classList.remove('drag-over');
        });

        col.addEventListener('drop', async (e) => {
            e.preventDefault();
            col.classList.remove('drag-over');

            if (draggedTaskEl) {
                const taskId = draggedTaskEl.dataset.id;
                const task = tasks.find(t => t._id === taskId);

                if (task && task.status !== status) {
                    // Update locally for quick UI feedback
                    task.status = status;
                    renderKanban();

                    // Update on server
                    try {
                        await api.updateTask(taskId, { status: status });
                        showToast(`Task moved to ${status}`);
                    } catch (error) {
                        showToast(error.message, 'error');
                        // Re-fetch to reset state on error
                        fetchAndRenderTasks(filterSelect.value);
                    }
                }
            }
        });
    });

    init();
});
