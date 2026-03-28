// Flatpickr options (keep existing behavior)
flatpickr('.flatpickr', {
  locale: 'fi',
  defaultDate: 'a',
  altInput: true,
  altFormat: 'F j, Y'
});

class Course {
  static _showValidationMessage(type, message) {
    const alertHtml = `<div id="join_course_alert" class="alert alert-${type}" role="alert">${message}</div>`;
    const validationElement = document.getElementById('validationMessage');
    if (validationElement) {
      validationElement.innerHTML = alertHtml;
      validationElement.style.display = 'block';
    }
  }

  static async createCoursePost(data) {
    const course = {
      html_id: data.courseSelect,
      coursekey: data.coursekey,
      name: data.courseName,
      startdate: data.startDate,
      enddate: data.endDate
    };

    try {
      const response = await backend.post('courses/newcourse', course);
      Course._showValidationMessage('success', response.message);
      document.cookie = 'teacher=true;path=/';
      window.location.reload();
    } catch (err) {
      Course._showValidationMessage('danger', err.error || 'Virhe kurssin luomisessa');
    }
  }

  static async getCourseExercises(data) {
    try {
      const response = await fetch(`${FRONTEND_BASE_URL}kurssit/${encodeURIComponent(data.courseSelect)}/print.html`, { method: 'GET' });
      if (!response.ok) {
        throw new Error('Sivu ei saatavilla');
      }
      await Course.createCoursePost(data);
    } catch (err) {
      console.warn('Kurssin harjoitussivu ei latautunut', err);
      Course._showValidationMessage('danger', 'Kurssin sivua ei löytynyt');
    }
  }

  static init(data) {
    return Course.getCourseExercises(data);
  }
}

function gatherFormData(form) {
  return Object.fromEntries(new FormData(form).entries());
}

function validateCourseForm() {
  const submitButton = document.getElementById('submitCourse');
  const validationMessage = document.getElementById('validationMessage');

  const fields = ['courseName', 'coursekey', 'startDate', 'endDate'];
  const isValid = fields.every(id => {
    const el = document.getElementById(id);
    return el && el.value.trim().length > 0;
  });

  if (submitButton) submitButton.disabled = !isValid;
  if (validationMessage) validationMessage.style.display = isValid ? 'none' : 'block';
}

window.addEventListener('DOMContentLoaded', () => {
  const submitCourse = document.getElementById('submitCourse');
  const courseForm = submitCourse?.closest('form');

  submitCourse?.addEventListener('click', event => {
    event.preventDefault();
    Course._showValidationMessage('info', 'Kurssia luodaan...');
    if (!courseForm) return;
    const data = gatherFormData(courseForm);
    Course.init(data);
  });

  document.querySelectorAll('input').forEach(input => input.addEventListener('input', validateCourseForm));
  validateCourseForm();
});
