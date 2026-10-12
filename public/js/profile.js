document.addEventListener('DOMContentLoaded', async () => {
    const profileForm = document.getElementById('profile-form');
    const formMessage = document.getElementById('form-message');

    const showMsg = (msg, type) => {
        formMessage.textContent = msg;
        formMessage.style.display = 'block';
        formMessage.style.backgroundColor = type === 'error' ? '#FEE2E2' : '#DCFCE7';
        formMessage.style.color = type === 'error' ? '#B91C1C' : '#15803D';
        formMessage.style.border = `1px solid ${type === 'error' ? '#FCA5A5' : '#86EFAC'}`;
    };

    // Load profile
    try {
        const student = await api.request('/api/student/profile');
        document.getElementById('name').value = student.name || '';
        document.getElementById('collegeId').value = student.college_id || '';
        document.getElementById('email').value = student.email || '';
        document.getElementById('department').value = student.department || '';
        document.getElementById('academicYear').value = student.academic_year || '';
    } catch (error) {
        showMsg('Failed to load profile data.', 'error');
    }

    if (profileForm) {
        profileForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            formMessage.style.display = 'none';

            const name = document.getElementById('name').value.trim();
            if (!name) {
                showMsg('Name cannot be empty.', 'error');
                return;
            }

            try {
                await api.request('/api/student/profile', 'PUT', { name });
                showMsg('Profile updated successfully!', 'success');
            } catch (error) {
                showMsg(error.message, 'error');
            }
        });
    }
});
