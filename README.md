# Student application Kisallioppiminen.fi with marking system

This is the development repository of beta.kisallioppiminen.fi frontend
* Development/Staging version: [https://ohtukisalli.github.io/dev-frontend/](https://ohtukisalli.github.io/dev-frontend/)
* Production version: [http://beta.kisallioppiminen.fi/](http://beta.kisallioppiminen.fi/)

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

To use Jekyll with local backend, execute
```bash
JEKYLL_ENV=local bundle exec jekyll serve
```
You can use Front Matter's site variable `site.backendbaseurl` and javascript global variable `BACKEND_BASE_URL`. Both will point to `http://localhost:3000/`, which is the default location of local backend.

Example on how to build html page based on an environment variable with Liquid:
```html
{% if jekyll.environment == "local" %}
<p>Hello world from local!</p>
<p>This section exist only if Jekyll has been started with JEKYLL_ENV=local.</p>
{% else %}
<p>Hello world from production!</p>
<p>This section is availiable if Jekyll was started normal way.</p>
{% endif %}
```

## Testing with Selenium

To run Selenium tests, execute
```bash
bundle exec rspec
```

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
