class JoinCourse {
  static async sendSignUp(data) {
    try {
      const response = await backend.post('courses/join', data);
      const alert = `<div id="join_course_alert" class="alert alert-success" role="alert">${response.message}</div>`;
      document.getElementById('join_course_group')?.insertAdjacentHTML('afterbegin', alert);
      document.cookie = 'student=true;path=/';
      window.location.reload();
    } catch (err) {
      const alert = `<div id="join_course_alert" class="alert alert-danger" role="alert">${err.error || 'Virhe'}</div>`;
      document.getElementById('join_course_group')?.insertAdjacentHTML('afterbegin', alert);
    }
  }
}

function serializeForm(form) {
  return Object.fromEntries(new FormData(form).entries());
}

window.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('joiningForm');

  form?.addEventListener('submit', event => {
    event.preventDefault();
    document.getElementById('join_course_alert')?.remove();
    const data = serializeForm(form);
    JoinCourse.sendSignUp(data);
  });
});
