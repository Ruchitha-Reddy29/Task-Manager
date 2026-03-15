document.addEventListener('DOMContentLoaded', () => {
    const user = api.checkAuth();

    // Set User Info
    document.getElementById('userName').textContent = user.name;
    document.getElementById('userRole').textContent = user.role.charAt(0).toUpperCase() + user.role.slice(1);
    document.getElementById('userInitials').textContent = user.name.charAt(0).toUpperCase();

    const tbody = document.getElementById('projectsTbody');
    const modal = document.getElementById('projectModal');
    const openModalBtn = document.getElementById('openCreateModal');
    const closeBtns = [document.getElementById('closeModal'), document.getElementById('cancelModal')];
    const form = document.getElementById('projectForm');

    let projects = [];

    async function fetchAndRenderProjects() {
        try {
            const res = await api.getProjects();
            projects = res.data;
            renderProjects();
        } catch (error) {
            showToast(error.message, 'error');
            tbody.innerHTML = `<tr><td colspan="6" class="text-center" style="color: var(--danger)">Failed to load projects</td></tr>`;
        }
    }

    function renderProjects() {
        if (projects.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" class="text-center">No projects found. Create one!</td></tr>`;
            return;
        }

        tbody.innerHTML = projects.map(p => `
      <tr>
        <td><strong>${p.projectName}</strong></td>
        <td>${p.description.substring(0, 50)}${p.description.length > 50 ? '...' : ''}</td>
        <td>${new Date(p.startDate).toLocaleDateString()}</td>
        <td>${new Date(p.deadline).toLocaleDateString()}</td>
        <td>${p.createdBy?.name || 'Unknown'}</td>
        <td class="actions-cell">
          <button class="btn btn-primary btn-sm" onclick="editProject('${p._id}')"><i class="fa-solid fa-pen"></i></button>
          <button class="btn btn-danger btn-sm" onclick="deleteProjectReq('${p._id}')"><i class="fa-solid fa-trash"></i></button>
        </td>
      </tr>
    `).join('');
    }

    // --- Modal Logic ---
    openModalBtn.addEventListener('click', () => {
        form.reset();
        document.getElementById('projectId').value = '';
        document.getElementById('modalTitle').textContent = 'Create Project';
        modal.classList.add('show');
    });

    closeBtns.forEach(btn => btn.addEventListener('click', () => {
        modal.classList.remove('show');
    }));

    window.onclick = function (event) {
        if (event.target == modal) modal.classList.remove('show');
    }

    // --- Create/Update Logic ---
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('projectId').value;
        const projectData = {
            projectName: document.getElementById('projectName').value,
            description: document.getElementById('description').value,
            startDate: document.getElementById('startDate').value,
            deadline: document.getElementById('deadline').value,
        };

        try {
            if (id) {
                await api.updateProject(id, projectData);
                showToast('Project updated successfully');
            } else {
                await api.createProject(projectData);
                showToast('Project created successfully');
            }
            modal.classList.remove('show');
            fetchAndRenderProjects();
        } catch (error) {
            showToast(error.message, 'error');
        }
    });

    // Global methods for inline onclick
    window.editProject = (id) => {
        const p = projects.find(proj => proj._id === id);
        if (!p) return;

        document.getElementById('projectId').value = p._id;
        document.getElementById('projectName').value = p.projectName;
        document.getElementById('description').value = p.description;
        document.getElementById('startDate').value = p.startDate.split('T')[0];
        document.getElementById('deadline').value = p.deadline.split('T')[0];

        document.getElementById('modalTitle').textContent = 'Edit Project';
        modal.classList.add('show');
    };

    window.deleteProjectReq = async (id) => {
        if (confirm('Are you sure you want to delete this project?')) {
            try {
                await api.deleteProject(id);
                showToast('Project deleted successfully');
                fetchAndRenderProjects();
            } catch (error) {
                showToast(error.message, 'error');
            }
        }
    };

    fetchAndRenderProjects();
});
