document.addEventListener('DOMContentLoaded', async () => {
    const user = api.checkAuth();

    // Set User Info
    document.getElementById('userName').textContent = user.name;
    document.getElementById('userRole').textContent = user.role.charAt(0).toUpperCase() + user.role.slice(1);
    document.getElementById('userInitials').textContent = user.name.charAt(0).toUpperCase();

    const teamContainer = document.getElementById('teamContainer');

    function getRoleClass(role) {
        if (role === 'admin') return 'role-admin';
        if (role === 'manager') return 'role-manager';
        return 'role-user';
    }

    try {
        const res = await api.getUsers();
        const users = res.data;

        if (users.length === 0) {
            teamContainer.innerHTML = '<p>No team members found.</p>';
            return;
        }

        teamContainer.innerHTML = users.map(u => `
            <div class="member-card">
                <div class="member-avatar">${u.name.charAt(0).toUpperCase()}</div>
                <h3>${u.name}</h3>
                <p><i class="fa-regular fa-envelope"></i> ${u.email}</p>
                <p><i class="fa-regular fa-calendar" style="margin-right:0.25rem;"></i> Joined ${new Date(u.createdAt).toLocaleDateString()}</p>
                <div class="role-badge ${getRoleClass(u.role)}">${u.role}</div>
            </div>
        `).join('');

    } catch (error) {
        showToast(error.message, 'error');
        teamContainer.innerHTML = '<p style="color:var(--danger)">Failed to load team members.</p>';
    }
});
