class Fullscreen {
  static getQueryVariable(name) {
    return new URLSearchParams(window.location.search).get(name) || '';
  }

  static _setAlertState(coursekey, isError, message) {
    const loadingAlert = document.getElementById(`loadingAlert${coursekey}`);
    if (!loadingAlert) return;

    loadingAlert.classList.remove('alert-info', 'alert-danger');
    loadingAlert.classList.add(isError ? 'alert-danger' : 'alert-info');
    const strong = loadingAlert.querySelector('strong');
    if (strong) strong.textContent = message;
  }

  static async getPageData(html_id) {
    try {
      const response = await fetch(`${FRONTEND_BASE_URL}kurssit/${encodeURIComponent(html_id)}/print.html`);
      if (!response.ok) throw new Error('Page load error');
      return await response.text();
    } catch (err) {
      console.warn('Could not retrieve course page', err);
      throw err;
    }
  }

  static async getData(courseId, html_id, coursekey) {
    if (!courseId || !html_id || !coursekey) {
      Fullscreen._setAlertState(coursekey, true, 'Virhe! Tulostaulua ei pystytty lataamaan.');
      return;
    }

    try {
      const pageData = await Fullscreen.getPageData(html_id);
      const scoreboardData = await backend.get(`courses/${courseId}/scoreboard`);
      Scoreboard.createScoreboard(pageData, scoreboardData, scoreboardData.coursekey);
    } catch (err) {
      Fullscreen._setAlertState(coursekey, true, 'Virhe! Tulostaulua ei pystytty lataamaan.');
      console.warn(err);
    }
  }

  static init() {
    const courseId = Fullscreen.getQueryVariable('id');
    const html_id = Fullscreen.getQueryVariable('html_id');
    const coursekey = Fullscreen.getQueryVariable('coursekey');

    document.querySelectorAll('.scoreboard').forEach(el => el.id = `checkmarkTable${coursekey}`);
    document.querySelectorAll('.alert').forEach(el => el.id = `loadingAlert${coursekey}`);

    Fullscreen.getData(courseId, html_id, coursekey);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  Fullscreen.init();
});
