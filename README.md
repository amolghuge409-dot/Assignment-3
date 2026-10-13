# Assignment 3: Student Result Management System

A responsive student-results dashboard made with HTML, CSS, and vanilla
JavaScript. Add a student's details and five subject marks to calculate the
total, percentage, grade, and pass status. The class overview identifies the
topper and calculates the class average and pass rate.

## Run locally

Open `index.html` in a modern browser. There is no build step or package
installation.

## Publish with GitHub Pages

The repository's `main` branch deploys through the workflow in
`.github/workflows/deploy-pages.yml`. GitHub Pages uses GitHub Actions as its
publishing source.

## Rules

- Five subjects: Mathematics, Science, English, Computer, and Social Studies.
- Each subject is marked out of 100; total marks are out of 500.
- A student passes when they score at least 35 in every subject.
- Grades: A+ (90%+), A (80%+), B (70%+), C (60%+), D (50%+), E (below 50%); a student below the pass mark in any subject receives F.
- The topper has the highest percentage. Ties are resolved by total marks.

## Data and privacy

Student entries are stored in this browser's local storage so they remain
available on this device. They are not uploaded to a server or shared with
GitHub Pages. Use the Remove button to delete a record from this browser.
