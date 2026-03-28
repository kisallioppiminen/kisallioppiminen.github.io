class CourseList {
  constructor() {
    this.myCourses = [];
    this.selectedCourseName = '';
    this.selectedCourseKey = '';
  }

  static _formatDateRange(startdate, enddate) {
    const start = new Date(startdate);
    const end = new Date(enddate);
    const format = date => `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear().toString().slice(-2)}`;
    return `${format(start)} – ${format(end)}`;
  }

  _createListItem(course) {
    const formattedTime = CourseList._formatDateRange(course.startdate, course.enddate);
    const listItem = view.createListItem(course, formattedTime);
    document.querySelector('.courseList')?.appendChild(listItem);
  }

  createCourseList(data) {
    this.myCourses = data;
    this.myCourses.forEach(course => this._createListItem(course));
    this._bindScoreboardLinks(data);
    this._bindRemoveFromCourse();
  }

  _bindScoreboardLinks(data) {
    document.querySelectorAll('header h1 a').forEach(link => {
      link.addEventListener('click', () => {
        const scoreboard = new Scoreboard();
        scoreboard.init(data, link.id);
      });
    });
  }

  _bindRemoveFromCourse() {
    document.getElementById('leaveCourse')?.addEventListener('click', async () => {
      const coursekeyInput = document.getElementById('coursekeyRemove')?.value.trim();
      if (!coursekeyInput) return;

      const matching = this.myCourses.find(c => c.coursekey === coursekeyInput || c.html_id === coursekeyInput || c.html_id === this.selectedCourseKey || c.coursekey === this.selectedCourseKey);
      const alert = document.getElementById('remove_course_alert');

      if (!matching) {
        if (alert) {
          alert.textContent = 'Kurssia ei löytynyt';
          alert.className = 'alert alert-danger';
          alert.style.display = 'block';
        }
        return;
      }

      try {
        await backend.delete(`students/${Session.getUserId()}/courses/${matching.id}`);
        document.deleteCookie('student');
        document.deleteCookie('teacher');
        document.deleteCookie('role');

        if (alert) {
          alert.textContent = `Olet poistunut kurssilta ${matching.name} (${matching.html_id})`;
          alert.className = 'alert alert-success';
          alert.style.display = 'block';
        }

        setTimeout(() => Session.getSession(), 500);
      } catch (err) {
        if (alert) {
          alert.textContent = 'Poisto epäonnistui';
          alert.className = 'alert alert-danger';
          alert.style.display = 'block';
        }
        console.warn(err);
      }
    });
  }

  async init() {
    const role = window.location.pathname.includes('/omat_kurssit') ? 'students' : 'teachers';

    try {
      const data = await backend.get(`${role}/${Session.getUserId()}/courses`);
      this.createCourseList(data);
    } catch (err) {
      console.warn('Could not fetch course list:', err);
    }
  }
}

window.addEventListener('DOMContentLoaded', () => {
  const courseList = new CourseList();
  courseList.init();

  $('#leaveCourseModal').on('show.bs.modal', function (event) {
    const trigger = event.relatedTarget;
    courseList.selectedCourseName = $(trigger).siblings('h1:first').text();
    courseList.selectedCourseKey = $(trigger).siblings('h3').text();
    $('#remove_course_alert').text(`Olet poistumassa kurssilta ${courseList.selectedCourseName}. Poistuminen poistaa lopullisesti kaikki kurssiin liittyvät tietosi.`);
  });
});
