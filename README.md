# Kisallioppiminen.fi with marking system

* Production version: https://ruumi5.github.io/web-page/

## Setting up Kisallioppiminen.fi site locally with Jekyll

Go to project folder and execute the following commands
```bash
gem install bundler
bundle install
```
To serve Jekyll site locally, execute
```bash
bundle exec jekyll serve
```
Your local Kisallioppiminen.fi site is now live at `http://localhost:4000`

More detailed instructions can be found [here](https://help.github.com/articles/setting-up-your-github-pages-site-locally-with-jekyll/).


## Run Jekyll with a local backend

Backend is being automatically detected. For more details look at the common.js file in js folder to see how this happens. A normal login (not the Google one), will only appear if Jekyll is being run locally. Sometimes this might not be the behavior you want, but there is a way to bypass it.

If you want to have a normal login, run this command in the browser's console:
```javascript
view._addNormalLoginToModal(backendUrl)
```
And replace `backendUrl` with the base of the backend location (You don't need to append "users/sign_in" to it). If you leave method without parameters, then the backendUrl will BACKEND_BASE_URL, which is spesified in common.js file.

Note that backend forward after login does not work yet, so you might need to manually return to your frontend.


## Unit testing

Unit tests are run with Karma, Jasmin and Phantomjs. Node and npm has to be installed in your system. Npm usually comes with node, but if not, it has to be installed manually.

To install everything you need to run the test suite, execute in the project root
```bash
npm install
```
After that you should be able to run tests
```bash
npm test
```
Karma is configured to execute tests everytime a change is made. Check if you have to make some changes in karma.conf.js when you add new js files.
