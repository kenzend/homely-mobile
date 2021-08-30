# Contributing to Hestia Home Manager
We love your input! We want to make contributing to this project as easy and transparent as possible, whether it's:


- Reporting a bug
- Discussing the current state of the code
- Submitting a fix
- Proposing new features
- Becoming a maintainer


## We Develop with Github
We use github to host code, to track issues and feature requests, as well as accept pull requests.


## We Use [Github Flow](https://guides.github.com/introduction/flow/index.html), So All Code Changes Happen Through Pull Requests
Pull requests are the best way to propose changes to the codebase. We actively welcome your pull requests:


1  Claim the issue in github that you are working on. If the issue doesn’t exist, create one for it.
2. Fork the repo and create your branch from `master` by using `git checkout master` and `git checkout -b feature-branch name`.
3. If you've changed APIs, update the documentation.
4. Make sure your code lints.
5. Perform thorough manual testing/make sure the test suite passes
6. Issue that pull request! (Remember to add an appropriate label i.e. ‘bug’ or ‘enhancement’ and link the pull request to the issue in the project board)
7. Get the request approved by another team member before merging


## Report bugs using Github's [issues](https://github.com/piercebring/Homely/issues)
We use GitHub issues to track public bugs. Report a bug by [opening a new issue](); it's that easy!


## Write bug reports with detail, background, and sample code


**Great Bug Reports** tend to have:


- Which platform is the bug on (front-end, api, mobile) add it to the correct repository?
- A quick summary and/or background
- Steps to reproduce
  - Be specific!
  - Give sample code if you can. 
- What you expected would happen
- What actually happens
- Notes (possibly including why you think this might be happening, or stuff you tried that didn't work)
- Screenshots or recordings (if applicable).


# Testing
Frontend and Mobile:
Make sure changes are sufficiently manually tested before issuing a pull request.
Reference for making unit tests using mobile’s framework Nativescript: https://v6.docs.nativescript.org/angular/tooling/testing/testing


Backend: 
Write unit tests for all new changes and make sure all changes still pass existing tests in the test suite before issuing a pull request.


## Use a Consistent Coding Style


* Tabs for indentation
* Use camelCase for variable naming
* We recommend using Prettier code formatter when working in homely-frontend repo 


## References
This document was adapted from this contribution guidelines template (https://gist.github.com/briandk/3d2e8b3ec8daf5a27a62)