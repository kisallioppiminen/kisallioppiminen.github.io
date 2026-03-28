class ButtonManager {
  constructor() {
    this.courseData = { coursekey: '', course_id: '', data: [] };
  }

  static getStatusFromColorId(colorId) {
    return ['red', 'yellow', 'green', 'gray'][colorId] || 'gray';
  }

  static getColorIdFromStatus(status) {
    return { red: 0, yellow: 1, green: 2, gray: 3 }[status] ?? 3;
  }

  static parseToken(token) {
    return {
      colorId: Number(token.charAt(0)),
      problemId: token.substring(2),
      status: ButtonManager.getStatusFromColorId(Number(token.charAt(0)))
    };
  }

  _changeProblemHeaderColor(token) {
    const { colorId, problemId } = ButtonManager.parseToken(token);
    const colors = ['rgb(217, 83, 79)', 'rgb(240, 173, 78)', 'rgb(92, 184, 92)', ''];
    const selectedColor = colors[colorId] || '';

    const header = document.querySelector(`div[id="${problemId}"] > header`);
    const textElement = document.querySelector(`h3[id="textbar_${problemId}"]`);
    if (!header) return;

    if (header.style.background === selectedColor && selectedColor !== '') {
      header.style.removeProperty('background');
      this.sendCheckmark(`3;${problemId}`);
      if (textElement) textElement.textContent = 'Miten tehtävä meni?';
    } else {
      header.style.background = selectedColor;
    }
  }

  _addButtons() {
    document.querySelectorAll('.tehtava').forEach(node => {
      const id = node.id;
      const buttonDiv = view.createButtonDiv(id);
      const buttonGroup = view.createButtonGroup();
      [0, 1, 2].forEach(colorId => buttonGroup.appendChild(view.createButton(colorId, id)));
      buttonDiv.appendChild(buttonGroup);
      const container = node.querySelector('div:nth-child(2):last-child');
      if (container) container.appendChild(buttonDiv);
    });

    document.querySelectorAll('.problemButton').forEach(button => {
      button.addEventListener('click', () => this.sendCheckmark(button.id));
    });
  }

  _colorCheckmarks(jsonData = { exercises: [] }) {
    jsonData.exercises.forEach(exercise => {
      const card = document.querySelector(`div[id="${exercise.id}"]`);
      if (card && exercise.status !== 'gray') {
        const token = `${ButtonManager.getColorIdFromStatus(exercise.status)};${exercise.id}`;
        this._changeProblemHeaderColor(token);
      }
    });
  }

  _getHtmlId(path = window.location.pathname) {
    const match = /(?:kurssit\/)([a-z0-9]+)(?:\/)/.exec(path);
    return match ? match[1] : '';
  }

  _extractCourseData(data = [], htmlId) {
    const course = data.find(item => item.html_id === htmlId);
    if (course) {
      this.courseData.coursekey = course.coursekey;
      this.courseData.course_id = course.id;
    }
  }

  async _getCheckmarks() {
    try {
      const data = await backend.get(`students/${Session.getUserId()}/courses/${this.courseData.course_id}/checkmarks`);
      this._colorCheckmarks(data);
    } catch (err) {
      console.warn('Could not retrieve checkmarks. ', err);
    }
  }

  _changeButtonTitleText(id, message) {
    const textElement = document.querySelector(`h3[id="textbar_${id}"]`);
    if (textElement) textElement.textContent = message;
  }

  async sendCheckmark(token) {
    const { problemId, status } = ButtonManager.parseToken(token);
    const checkmark = { html_id: problemId, status, coursekey: this.courseData.coursekey };

    try {
      await backend.post('checkmarks', checkmark);
      if (status !== 'gray') {
        this._changeButtonTitleText(problemId, 'Vastauksesi on lähetetty!');
        this._changeProblemHeaderColor(token);
      }
    } catch (err) {
      this._changeButtonTitleText(problemId, `Virhe! ${err.error || 'tuntematon virhe'}`);
    }
  }

  init(data = []) {
    this._extractCourseData(data, this._getHtmlId());
    if (!this.courseData.coursekey) {
      console.warn('No coursekey for this material.');
      return;
    }

    this._addButtons();
    this._getCheckmarks();
  }

  _invokeCourseSelect(htmlID, keys, data) {
    const title = document.getElementById('courseSelectModalTitle');
    const select = document.getElementById('courseSelect');
    if (!title || !select) return;

    title.textContent = `Opetat useampaa ${htmlID.toUpperCase()}-kurssia. Valitse listalta mitä kurssisuorituksia haluat katsoa.`;
    select.innerHTML = '';

    keys.forEach(key => {
      const option = document.createElement('option');
      option.value = key;
      option.textContent = `${htmlID.toUpperCase()} - ${key}`;
      select.appendChild(option);
    });

    $('#courseSelectModal').modal('toggle');

    const selectCourseButton = document.getElementById('selectCourseButton');
    if (!selectCourseButton) return;

    selectCourseButton.onclick = () => {
      const selectedCourse = data.find(item => item.coursekey === select.value);
      if (!selectedCourse) return;

      this.courseData.coursekey = selectedCourse.coursekey;
      this.courseData.course_id = selectedCourse.id;
      Statistics.getStats(this.courseData.course_id);
      document.cookie = `coursekey=${this.courseData.coursekey}; path=/kurssit/${htmlID};`;

      const currentCourse = document.getElementById('currentCourse');
      if (currentCourse) currentCourse.textContent = this.courseData.coursekey;
    };
  }

  _isTeacherCourse() {
    return this.courseData.data.some(course => course.coursekey === this.courseData.coursekey);
  }

  _extractTeacherCourses(data = []) {
    const htmlID = this._getHtmlId();
    const keys = [];

    data.forEach(item => {
      if (item.html_id === htmlID) {
        this.courseData.coursekey = item.coursekey;
        this.courseData.course_id = item.id;
        keys.push(item.coursekey);
      }
    });

    const selectedCoursekey = document.cookie.match(/(?:^|; )coursekey=([^;]+)/)?.[1];
    if (keys.length > 1 && !selectedCoursekey) {
      this._invokeCourseSelect(htmlID, keys, data);
    } else if (selectedCoursekey) {
      const selected = data.find(item => item.coursekey === selectedCoursekey);
      if (selected) {
        this.courseData.coursekey = selected.coursekey;
        this.courseData.course_id = selected.id;
      }
    }

    if (this.courseData.course_id && this._isTeacherCourse()) {
      Statistics.getStats(this.courseData.course_id);
      const scheduleManager = new ScheduleManager();

      const heading = document.querySelector('html body main.has-atop article article section header:first-child');
      if (heading) {
        const div = document.createElement('div');
        div.className = 'chosenCourse';
        div.innerHTML = `<h3>Valittu kurssi: <tt><span id="currentCourse">${this.courseData.coursekey}</span></tt></h3>`;
        heading.appendChild(div);
      }

      view.createOpenScheduleManagerLink();
      document.getElementById('open-schedule-modal')?.addEventListener('click', () => {
        scheduleManager.getSchedule(this.courseData.course_id);
        document.getElementById('schedule-footer-info').textContent = '';
      });

      document.getElementById('create-schedule')?.addEventListener('click', () => {
        scheduleManager.createSchedule(this.courseData.course_id);
      });
    }

    if (keys.length > 1) {
      const heading = document.querySelector('html body main.has-atop article article section header:first-child');
      if (heading) {
        const selectButton = document.createElement('button');
        selectButton.id = 'selectAnotherCourse';
        selectButton.className = 'btn btn-info';
        selectButton.style.marginBottom = '10px';
        selectButton.textContent = 'Valitse toinen kurssi';
        selectButton.addEventListener('click', () => this._invokeCourseSelect(htmlID, keys, data));
        heading.appendChild(selectButton);
      }
    }

    this.getAndShowSchedules(this.courseData.course_id);
  }

  getAndShowSchedules(courseId) {
    const scheduleCheckbox = new ScheduleCheckbox(courseId);
    document.getElementById('saveScheduleButton')?.addEventListener('click', () => {
      scheduleCheckbox.saveScheduleChanges();
    });
  }

  initTeacher(data = []) {
    this.courseData.data = data;
    this._extractTeacherCourses(data);
  }

  getCourseID() {
    return this.courseData.course_id;
  }

  toggleVisibilityByClass(className) {
    document.querySelectorAll(`.${className}`).forEach(el => {
      el.style.display = el.style.display === 'none' ? 'block' : 'none';
    });
  }

  async getTeacher() {
    if (document.getCookie('teacher') !== 'true') return;
    try {
      const data = await backend.get(`teachers/${Session.getUserId()}/courses`);
      this.initTeacher(data);
    } catch (err) {
      console.warn(err);
    }
  }

  async getStudent() {
    if (document.getCookie('student') !== 'true') return;
    try {
      const data = await backend.get(`students/${Session.getUserId()}/courses`);
      this.init(data);
    } catch (err) {
      console.warn('Error, could not get coursekey', err);
    }
  }

  async initialize() {
    const isStudent = document.getCookie('student') === 'true';
    const isTeacher = document.getCookie('teacher') === 'true';

    if (isStudent && isTeacher) {
      const heading = document.querySelector('html body main.has-atop article article section header:first-child');
      if (heading) {
        const roleButton = document.createElement('button');
        roleButton.className = 'changeRole btn btn-success';
        roleButton.style.marginBottom = '20px';
        roleButton.innerHTML = '<span id="roleSpan">Valitse käyttäjä</span>';
        roleButton.addEventListener('click', () => $('#selectRole').modal('toggle'));
        heading.appendChild(roleButton);
      }

      const role = document.cookie.split('; ').find(c => c.startsWith('role='))?.split('=')[1];
      if (role === 'teacher') {
        await this.getTeacher();
        document.getElementById('roleSpan').textContent = 'Opettaja';
      } else if (role === 'student') {
        await this.getStudent();
        document.getElementById('roleSpan').textContent = 'Opiskelija';
      } else {
        $('#selectRole').modal('toggle');
      }
    } else if (!isStudent && isTeacher) {
      await this.getTeacher();
    } else if (isStudent && !isTeacher) {
      await this.getStudent();
    }
  }
}

window.button = new ButtonManager();

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.toggleDivVisibility').forEach(el => el.addEventListener('click', () => window.button.toggleVisibilityByClass(el.id)));

  if (window.location.pathname.includes('/kurssit') && Session.getUserId() !== undefined) {
    window.button.initialize();
  }

  document.querySelectorAll('.roleButton').forEach(button => {
    button.addEventListener('click', async () => {
      if (button.id === 'teacher') {
        await window.button.getTeacher();
        document.cookie = 'role=teacher; path=/;';
      } else {
        await window.button.getStudent();
        document.cookie = 'role=student; path=/;';
      }
      location.reload();
    });
  });
});
