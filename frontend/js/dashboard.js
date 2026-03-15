document.addEventListener('DOMContentLoaded', async () => {
    const user = api.checkAuth();

    // Set User Info in Sidebar
    document.getElementById('userName').textContent = user.name;
    document.getElementById('userRole').textContent = user.role.charAt(0).toUpperCase() + user.role.slice(1);
    document.getElementById('userInitials').textContent = user.name.charAt(0).toUpperCase();

    try {
        // Fetch Projects and Tasks
        const [projectsRes, tasksRes] = await Promise.all([
            api.getProjects(),
            api.getTasks()
        ]);

        const projects = projectsRes.data || [];
        const tasks = tasksRes.data || [];

        // Compute stats
        const totalProjects = projects.length;
        const totalTasks = tasks.length;
        const completedTasks = tasks.filter(t => t.status === 'Completed').length;
        const pendingTasks = tasks.filter(t => t.status !== 'Completed').length;

        // Update DOM
        document.getElementById('statProjects').textContent = totalProjects;
        document.getElementById('statTotalTasks').textContent = totalTasks;
        document.getElementById('statCompletedTasks').textContent = completedTasks;
        document.getElementById('statPendingTasks').textContent = pendingTasks;

        // populate generic activity
        const activityMsg = document.getElementById('activityMsg');
        const activityList = document.getElementById('activityList');

        if (tasks.length === 0 && projects.length === 0) {
            activityMsg.textContent = "No projects or tasks found. Create one to get started!";
        } else {
            activityMsg.style.display = 'none';

            // recent 5 tasks logic as activity
            const recentTasks = [...tasks].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);

            recentTasks.forEach(task => {
                const li = document.createElement('li');
                li.style.padding = '1rem 0';
                li.style.borderBottom = '1px solid var(--border)';

                const dotColor = task.status === 'Completed' ? 'var(--secondary)' : task.status === 'In Progress' ? 'var(--warning)' : 'var(--danger)';

                li.innerHTML = `
          <div style="display: flex; align-items: center; gap: 1rem;">
             <div style="width: 10px; height: 10px; border-radius: 50%; background-color: ${dotColor}"></div>
             <div>
                <strong>${task.taskTitle}</strong>
                <div style="font-size: 0.85rem; color: var(--text-muted)">Project: ${task.projectId?.projectName || 'Unknown'} &bull; Assigned to: ${task.assignedTo?.name || 'Unassigned'}</div>
             </div>
             <div style="margin-left: auto;">
                <span style="font-size: 0.8rem; padding: 0.25rem 0.5rem; background: var(--light); border-radius: 4px;">${task.status}</span>
             </div>
          </div>
        `;
                activityList.appendChild(li);
            });
        }

    } catch (error) {
        showToast(error.message, 'error');
    }
});
