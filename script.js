const SUBJECTS = [
  { key: "mathematics", label: "Mathematics" },
  { key: "science", label: "Science" },
  { key: "english", label: "English" },
  { key: "computer", label: "Computer" },
  { key: "socialStudies", label: "Social studies" },
];
const MAX_MARKS = SUBJECTS.length * 100;
const PASS_MARKS = 35;
const STORAGE_KEY = "gradely-student-results-v1";

const form = document.querySelector("#result-form");
const recordsBody = document.querySelector("#records-body");
const emptyState = document.querySelector("#empty-state");
const searchInput = document.querySelector("#record-search");
const marksError = document.querySelector("#marks-error");
const markInputs = SUBJECTS.map(({ key }) =>
  document.querySelector(`[name="${key}"]`),
);
let students = loadStudents();

function loadStudents() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return [];

    const records = JSON.parse(saved);
    if (!Array.isArray(records)) {
      throw new Error("Saved student results are not a list.");
    }

    return records.filter(
      (student) =>
        typeof student.id === "string" &&
        typeof student.name === "string" &&
        typeof student.rollNumber === "string" &&
        Array.isArray(student.marks) &&
        student.marks.length === SUBJECTS.length &&
        student.marks.every(
          (mark) => Number.isInteger(mark) && mark >= 0 && mark <= 100,
        ),
    );
  } catch (error) {
    console.error("Unable to load saved student results:", error);
    return [];
  }
}

function saveStudents() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
  } catch (error) {
    console.error("Unable to save student results to this device:", error);
    window.alert(
      "The results could not be saved in this browser. Check your browser storage settings.",
    );
    return false;
  }

  return true;
}

function calculateStudent(marks) {
  const total = marks.reduce((sum, mark) => sum + mark, 0);
  const percentage = (total / MAX_MARKS) * 100;
  const passed = marks.every((mark) => mark >= PASS_MARKS);
  const grade = !passed
    ? "F"
    : percentage >= 90
      ? "A+"
      : percentage >= 80
        ? "A"
        : percentage >= 70
          ? "B"
          : percentage >= 60
            ? "C"
            : percentage >= 50
              ? "D"
              : "E";

  return { total, percentage, passed, grade };
}

function findTopper(records = students) {
  return records.reduce((topper, student) => {
    if (!topper) return student;

    const studentResult = calculateStudent(student.marks);
    const topperResult = calculateStudent(topper.marks);
    if (studentResult.percentage > topperResult.percentage) return student;
    if (
      studentResult.percentage === topperResult.percentage &&
      studentResult.total > topperResult.total
    ) {
      return student;
    }
    return topper;
  }, null);
}

function updatePreview() {
  const enteredMarks = markInputs.map((input) =>
    input.value === "" ? null : Number(input.value),
  );
  const validMarks = enteredMarks.filter((mark) => mark !== null);
  const total = validMarks.reduce((sum, mark) => sum + mark, 0);
  const percentage = validMarks.length
    ? ((total / MAX_MARKS) * 100).toFixed(1)
    : null;

  document.querySelector("#preview-total").textContent = validMarks.length
    ? `${total} / ${MAX_MARKS}`
    : "—";
  document.querySelector("#preview-percentage").textContent = percentage
    ? `${percentage}% projected`
    : `out of ${MAX_MARKS}`;
}

function renderStats() {
  const totalStudents = students.length;
  const average = totalStudents
    ? students.reduce(
        (sum, student) => sum + calculateStudent(student.marks).percentage,
        0,
      ) / totalStudents
    : 0;
  const passedCount = students.filter(
    (student) => calculateStudent(student.marks).passed,
  ).length;
  const topper = findTopper();

  document.querySelector("#stat-students").textContent = String(totalStudents);
  document.querySelector("#stat-average").textContent = average.toFixed(1);
  document.querySelector("#stat-pass-rate").textContent = String(
    totalStudents ? Math.round((passedCount / totalStudents) * 100) : 0,
  );
  document.querySelector("#sidebar-count").textContent = String(totalStudents);
  document.querySelector("#record-count").textContent =
    `${totalStudents} ${totalStudents === 1 ? "record" : "records"}`;
  document.querySelector("#records-summary").textContent =
    `Showing ${totalStudents} ${totalStudents === 1 ? "student" : "students"}`;

  const topperName = document.querySelector("#stat-topper");
  const topperCaption = document.querySelector("#topper-caption");
  const topperPlaceholder = document.querySelector("#topper-placeholder");
  const topperDetail = document.querySelector("#topper-detail");

  if (!topper) {
    topperName.textContent = "—";
    topperCaption.textContent = "Add results to see the topper";
    topperPlaceholder.hidden = false;
    topperDetail.hidden = true;
    return;
  }

  const result = calculateStudent(topper.marks);
  topperName.textContent = topper.name;
  topperCaption.textContent = `${result.percentage.toFixed(1)}% overall`;
  topperPlaceholder.hidden = true;
  topperDetail.hidden = false;
  document.querySelector("#topper-avatar").textContent =
    topper.name.trim().charAt(0).toUpperCase();
  document.querySelector("#detail-name").textContent = topper.name;
  document.querySelector("#detail-roll").textContent =
    `Roll no. ${topper.rollNumber}`;
  document.querySelector("#detail-percentage").textContent =
    `${result.percentage.toFixed(1)}%`;
  document.querySelector("#topper-progress").style.width =
    `${result.percentage}%`;
  document.querySelector("#detail-total").textContent =
    `${result.total} / ${MAX_MARKS} marks`;
  document.querySelector("#detail-grade").textContent =
    `Grade ${result.grade}`;
}

function renderRecords() {
  const searchTerm = searchInput.value.trim().toLocaleLowerCase();
  const topper = findTopper();
  const filteredStudents = students
    .filter((student) =>
      `${student.name} ${student.rollNumber}`
        .toLocaleLowerCase()
        .includes(searchTerm),
    )
    .sort((first, second) => {
      const scoreDifference =
        calculateStudent(second.marks).percentage -
        calculateStudent(first.marks).percentage;
      return scoreDifference || first.name.localeCompare(second.name);
    });

  recordsBody.replaceChildren();
  emptyState.hidden = filteredStudents.length !== 0;
  if (students.length && !filteredStudents.length) {
    emptyState.querySelector("strong").textContent = "No matching students";
    emptyState.querySelector("span:not(.empty-illustration)").textContent =
      "Try a different name or roll number.";
    emptyState.querySelector("a").hidden = true;
  } else {
    emptyState.querySelector("strong").textContent = "No student results yet";
    emptyState.querySelector("span:not(.empty-illustration)").textContent =
      "Fill in the form above to add the first result.";
    emptyState.querySelector("a").hidden = false;
  }

  filteredStudents.forEach((student, index) => {
    const result = calculateStudent(student.marks);
    const row = document.createElement("tr");
    const isTopper = student.id === topper?.id;
    if (isTopper) row.classList.add("topper-row");

    const studentCell = document.createElement("td");
    const studentIdentity = document.createElement("div");
    studentIdentity.className = "student-cell";
    const avatar = document.createElement("span");
    avatar.className = `student-avatar tone-${index % 4}`;
    avatar.textContent = student.name.trim().charAt(0).toUpperCase();
    const nameAndSubtitle = document.createElement("span");
    const name = document.createElement("span");
    name.className = "student-name";
    name.textContent = student.name;
    const subtitle = document.createElement("span");
    subtitle.className = "student-sub";
    subtitle.textContent = isTopper ? "Class topper" : "Student";
    nameAndSubtitle.append(name, subtitle);
    studentIdentity.append(avatar, nameAndSubtitle);
    if (isTopper) {
      const marker = document.createElement("span");
      marker.className = "topper-marker";
      marker.setAttribute("aria-label", "Topper");
      marker.textContent = "✦";
      nameAndSubtitle.append(marker);
    }
    studentCell.append(studentIdentity);

    const rollCell = document.createElement("td");
    rollCell.textContent = student.rollNumber;
    const totalCell = document.createElement("td");
    totalCell.textContent = `${result.total} / ${MAX_MARKS}`;
    const percentageCell = document.createElement("td");
    percentageCell.className = "percentage-value";
    percentageCell.textContent = `${result.percentage.toFixed(1)}%`;
    const gradeCell = document.createElement("td");
    const gradeBadge = document.createElement("span");
    gradeBadge.className = "grade-pill";
    gradeBadge.textContent = result.grade;
    gradeCell.append(gradeBadge);
    const statusCell = document.createElement("td");
    const statusBadge = document.createElement("span");
    statusBadge.className = `status-pill ${result.passed ? "pass" : "fail"}`;
    statusBadge.textContent = result.passed ? "Passed" : "Needs improvement";
    statusCell.append(statusBadge);
    const actionCell = document.createElement("td");
    const deleteButton = document.createElement("button");
    deleteButton.className = "delete-button";
    deleteButton.type = "button";
    deleteButton.textContent = "Remove";
    deleteButton.setAttribute("aria-label", `Remove ${student.name}`);
    deleteButton.addEventListener("click", () => removeStudent(student.id));
    actionCell.append(deleteButton);

    row.append(
      studentCell,
      rollCell,
      totalCell,
      percentageCell,
      gradeCell,
      statusCell,
      actionCell,
    );
    recordsBody.append(row);
  });

  renderStats();
}

function removeStudent(id) {
  const student = students.find((record) => record.id === id);
  if (!student) return;
  if (!window.confirm(`Remove ${student.name}'s result from this device?`)) {
    return;
  }

  const previousStudents = students;
  students = students.filter((record) => record.id !== id);
  if (!saveStudents()) {
    students = previousStudents;
    return;
  }
  renderRecords();
}

function validateForm() {
  let isValid = true;
  const nameInput = document.querySelector("#student-name");
  const rollInput = document.querySelector("#roll-number");
  const nameError = document.querySelector("#name-error");
  const rollError = document.querySelector("#roll-error");
  const normalizedRoll = rollInput.value.trim().toLocaleUpperCase();
  const duplicateRoll = students.some(
    (student) => student.rollNumber.toLocaleUpperCase() === normalizedRoll,
  );

  const nameIsValid =
    nameInput.value.trim().length >= 2 &&
    nameInput.value.trim().length <= 80 &&
    nameInput.checkValidity();
  nameError.textContent = nameIsValid
    ? ""
    : "Enter a student name with at least 2 characters.";
  nameInput.closest(".field").classList.toggle("has-error", !nameIsValid);
  nameInput.setAttribute("aria-invalid", String(!nameIsValid));
  isValid &&= nameIsValid;

  const rollIsValid =
    rollInput.value.trim().length > 0 &&
    rollInput.value.trim().length <= 30 &&
    !duplicateRoll;
  rollError.textContent = duplicateRoll
    ? "This roll number already has a result."
    : rollIsValid
      ? ""
      : "Enter a roll number.";
  rollInput.closest(".field").classList.toggle("has-error", !rollIsValid);
  rollInput.setAttribute("aria-invalid", String(!rollIsValid));
  isValid &&= rollIsValid;

  const marksAreValid = markInputs.every((input) => {
    const mark = input.valueAsNumber;
    const valid =
      input.value.trim() !== "" &&
      Number.isInteger(mark) &&
      mark >= 0 &&
      mark <= 100;
    input.closest(".mark-field").classList.toggle("has-error", !valid);
    input.setAttribute("aria-invalid", String(!valid));
    return valid;
  });
  marksError.textContent = marksAreValid
    ? ""
    : "Enter a whole-number mark from 0 to 100 for every subject.";
  isValid &&= marksAreValid;

  if (!isValid) {
    const firstInvalid = form.querySelector('[aria-invalid="true"]');
    firstInvalid?.focus();
  }

  return isValid;
}

form.addEventListener("input", (event) => {
  const input = event.target;
  if (input instanceof HTMLInputElement && markInputs.includes(input)) {
    input.setAttribute("aria-invalid", "false");
    input.closest(".mark-field").classList.remove("has-error");
    const allMarksValid = markInputs.every(
      (markInput) =>
        markInput.value !== "" &&
        Number.isInteger(markInput.valueAsNumber) &&
        markInput.valueAsNumber >= 0 &&
        markInput.valueAsNumber <= 100,
    );
    if (allMarksValid) marksError.textContent = "";
  }
  updatePreview();

  if (input?.id === "student-name") {
    input.closest(".field").classList.remove("has-error");
    document.querySelector("#name-error").textContent = "";
    input.setAttribute("aria-invalid", "false");
  }
  if (input?.id === "roll-number") {
    input.closest(".field").classList.remove("has-error");
    document.querySelector("#roll-error").textContent = "";
    input.setAttribute("aria-invalid", "false");
  }
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!validateForm()) return;

  const name = document.querySelector("#student-name").value.trim();
  const rollNumber = document
    .querySelector("#roll-number")
    .value.trim();
  const marks = markInputs.map((input) => input.valueAsNumber);
  const student = {
    id: globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`,
    name,
    rollNumber,
    marks,
  };

  students.push(student);
  if (!saveStudents()) {
    students = students.filter((record) => record.id !== student.id);
    return;
  }

  form.reset();
  form.querySelectorAll('[aria-invalid="true"]').forEach((input) => {
    input.setAttribute("aria-invalid", "false");
  });
  form.querySelectorAll(".has-error").forEach((field) => {
    field.classList.remove("has-error");
  });
  marksError.textContent = "";
  updatePreview();
  renderRecords();
  document.querySelector("#student-name").focus();
});

searchInput.addEventListener("input", renderRecords);
markInputs.forEach((input) => input.addEventListener("input", updatePreview));

updatePreview();
renderRecords();
