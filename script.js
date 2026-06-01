/* ============================================================
   SCRIPT.JS — My Todo Journal
   
   This file handles all the logic for the CRUD operations:
   C — Create  (addTodo)
   R — Read    (displayTodos)
   U — Update  (editTodo, saveEdit)
   D — Delete  (deleteTodo)
   
   TABLE OF CONTENTS:
   1. Data Storage
   2. Editing State Tracker
   3. addTodo()       — Create a new task
   4. displayTodos()  — Show all tasks on the page
   5. editTodo()      — Load a task into the form for editing
   6. saveEdit()      — Save the edited task
   7. cancelEdit()    — Cancel editing and reset the form
   8. deleteTodo()    — Remove a task
   9. handleSubmit()  — Decide between Add or Update
   10. updateTaskCount() — Update the counter badge
   11. clearForm()    — Reset the input fields
   12. generateId()   — Create a unique ID for each task
============================================================ */


/* ============================================================
   1. DATA STORAGE
   
   We store all todos in a JavaScript array called `todos`.
   Each todo is an OBJECT with three properties:
     - id:          a unique number to identify the task
     - title:       the task name (string)
     - description: extra notes about the task (string)
   
   Example todo object:
   { id: 1718000000000, title: "Buy coffee", description: "Try the Ethiopian blend" }
============================================================ */
let todos = [];  // Start with an empty list


/* ============================================================
   2. EDITING STATE TRACKER
   
   When the user clicks "Edit" on a task, we need to remember
   WHICH task is being edited.
   
   `editingId` stores the id of the task being edited.
   When no task is being edited, it is null.
============================================================ */
let editingId = null;  // null means "not editing anything right now"


/* ============================================================
   3. addTodo()
   
   WHAT IT DOES: Creates a new todo and adds it to the list.
   
   HOW IT WORKS:
   1. Read the title from the input field.
   2. Validate — make sure the title isn't empty.
   3. Build a new todo object.
   4. Push (add) it to the todos array.
   5. Re-render the list on screen.
   6. Clear the input fields.
============================================================ */
function addTodo() {
  // Step 1: Get the values the user typed in
  // .trim() removes any extra spaces from the beginning or end
  const titleInput       = document.getElementById('taskTitle');
  const descriptionInput = document.getElementById('taskDescription');

  const title       = titleInput.value.trim();
  const description = descriptionInput.value.trim();

  // Step 2: Validate — don't add empty tasks
  if (title === '') {
    // Briefly shake the input to signal an error
    titleInput.style.borderColor = '#9B5E4A';
    titleInput.focus();

    // Reset border color after 1 second
    setTimeout(function() {
      titleInput.style.borderColor = '';
    }, 1000);

    return; // Stop here — don't continue adding
  }

  // Step 3: Create a new todo object
  const newTodo = {
    id:          generateId(),  // Unique ID (see function below)
    title:       title,
    description: description
  };

  // Step 4: Add the new todo to the array
  // .push() adds an item to the END of an array
  todos.push(newTodo);

  // Step 5: Refresh the list on screen
  displayTodos();

  // Step 6: Clear the form fields
  clearForm();
}


/* ============================================================
   4. displayTodos()
   
   WHAT IT DOES: Reads the `todos` array and draws each task
   as a card on the page.
   
   HOW IT WORKS:
   1. Find the <ul> element in the HTML.
   2. Clear its current content.
   3. If todos is empty, show the empty message and return.
   4. Otherwise, loop through the array and build a card
      for each todo using innerHTML.
   5. Update the task count badge.
============================================================ */
function displayTodos() {
  // Step 1: Get the list container from the HTML
  const todoList     = document.getElementById('todoList');
  const emptyMessage = document.getElementById('emptyMessage');

  // Step 2: Clear whatever is currently shown
  // (We will rebuild it from scratch each time)
  todoList.innerHTML = '';

  // Step 3: If there are no todos, show the empty state message
  if (todos.length === 0) {
    emptyMessage.style.display = 'block'; // Show the empty message
    updateTaskCount(0);
    return; // Stop here — nothing else to do
  }

  // Hide the empty message since we have tasks
  emptyMessage.style.display = 'none';

  // Step 4: Loop through every todo and create a card for each one
  // `for...of` is an easy way to loop through an array
  for (const todo of todos) {

    // Create a new <li> element (list item)
    const listItem = document.createElement('li');
    listItem.classList.add('todo-card');  // Add the CSS class for styling

    // Build the card's HTML content
    // We use template literals (backticks ``) to insert variables with ${...}
    listItem.innerHTML = `
      <div class="card-content">
        <h3 class="card-title">${escapeHtml(todo.title)}</h3>
        ${
          /* Only show the description if it's not empty */
          todo.description
            ? `<p class="card-description">${escapeHtml(todo.description)}</p>`
            : ''
        }
      </div>
      <div class="card-actions">
        <!-- onclick passes this todo's unique id to the edit/delete functions -->
        <button class="btn-edit"   onclick="editTodo(${todo.id})">Edit</button>
        <button class="btn-delete" onclick="deleteTodo(${todo.id})">Delete</button>
      </div>
    `;

    // Add the finished card to the list in the HTML
    todoList.appendChild(listItem);
  }

  // Step 5: Update the counter badge
  updateTaskCount(todos.length);
}


/* ============================================================
   5. editTodo()
   
   WHAT IT DOES: Loads an existing task's data into the form
   so the user can make changes.
   
   HOW IT WORKS:
   1. Find the todo in the array using its id.
   2. Pre-fill the form inputs with its current values.
   3. Change the button text from "Add Task" to "Update Task".
   4. Show the "Cancel" button.
   5. Save the id of the task being edited in `editingId`.
   6. Scroll the form into view.
   
   @param {number} id — the unique id of the todo to edit
============================================================ */
function editTodo(id) {
  // Step 1: Find the todo object whose id matches the given id
  // .find() searches the array and returns the first matching item
  const todo = todos.find(function(item) {
    return item.id === id;
  });

  // If no matching todo is found, stop (safety check)
  if (!todo) return;

  // Step 2: Pre-fill the form with the task's existing values
  document.getElementById('taskTitle').value       = todo.title;
  document.getElementById('taskDescription').value = todo.description;

  // Step 3: Change the button text so the user knows they're updating
  document.getElementById('submitBtn').textContent = 'Update Task';

  // Step 4: Show the Cancel button
  document.getElementById('cancelBtn').style.display = 'inline-block';

  // Step 5: Remember which task we are editing
  editingId = id;

  // Step 6: Smoothly scroll to the top of the page so the user sees the form
  document.getElementById('taskTitle').focus();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}


/* ============================================================
   6. saveEdit()
   
   WHAT IT DOES: Saves the changes made to an existing task.
   
   HOW IT WORKS:
   1. Read the updated values from the form.
   2. Validate — title can't be empty.
   3. Find the todo in the array using editingId.
   4. Update its properties with the new values.
   5. Re-render the list.
   6. Reset the form and editing state.
============================================================ */
function saveEdit() {
  // Step 1: Read the updated input values
  const title       = document.getElementById('taskTitle').value.trim();
  const description = document.getElementById('taskDescription').value.trim();

  // Step 2: Validate
  if (title === '') {
    document.getElementById('taskTitle').style.borderColor = '#9B5E4A';
    document.getElementById('taskTitle').focus();
    setTimeout(function() {
      document.getElementById('taskTitle').style.borderColor = '';
    }, 1000);
    return;
  }

  // Step 3: Find the todo being edited using its saved id
  const todo = todos.find(function(item) {
    return item.id === editingId;
  });

  if (!todo) return; // Safety check

  // Step 4: Update the todo's properties
  todo.title       = title;
  todo.description = description;

  // Step 5: Re-render the updated list
  displayTodos();

  // Step 6: Reset the form and clear the editing state
  clearForm();
  editingId = null;  // We are no longer editing anything
  document.getElementById('submitBtn').textContent    = 'Add Task';
  document.getElementById('cancelBtn').style.display = 'none';
}


/* ============================================================
   7. cancelEdit()
   
   WHAT IT DOES: Cancels the edit and resets the form to its
   default "Add Task" state.
============================================================ */
function cancelEdit() {
  // Clear the form fields
  clearForm();

  // Reset button text
  document.getElementById('submitBtn').textContent = 'Add Task';

  // Hide the cancel button
  document.getElementById('cancelBtn').style.display = 'none';

  // Clear the editing tracker
  editingId = null;
}


/* ============================================================
   8. deleteTodo()
   
   WHAT IT DOES: Removes a task from the list permanently.
   
   HOW IT WORKS:
   1. Filter the array to remove the todo with the matching id.
      .filter() returns a NEW array with items that pass the test.
      We keep all items EXCEPT the one to delete.
   2. Re-render the updated list.
   
   @param {number} id — the unique id of the todo to delete
============================================================ */
function deleteTodo(id) {
  // Step 1: Create a new array that excludes the deleted todo
  // For each item, we keep it only if its id does NOT match the one to delete
  todos = todos.filter(function(item) {
    return item.id !== id;
  });

  // If we were editing the deleted task, cancel the edit
  if (editingId === id) {
    cancelEdit();
  }

  // Step 2: Re-render the list without the deleted item
  displayTodos();
}


/* ============================================================
   9. handleSubmit()
   
   WHAT IT DOES: Decides whether to ADD a new task or UPDATE
   an existing one, based on whether we're currently editing.
   
   This is called when the main button is clicked.
   It acts as a "router" between addTodo() and saveEdit().
============================================================ */
function handleSubmit() {
  if (editingId !== null) {
    // We are editing — save the changes
    saveEdit();
  } else {
    // We are not editing — add a new task
    addTodo();
  }
}


/* ============================================================
   10. updateTaskCount()
   
   WHAT IT DOES: Updates the small badge that shows how many
   tasks exist.
   
   @param {number} count — the current number of todos
============================================================ */
function updateTaskCount(count) {
  const badge = document.getElementById('taskCount');

  // Use singular "task" for 1, plural "tasks" for all others
  if (count === 1) {
    badge.textContent = '1 task';
  } else {
    badge.textContent = count + ' tasks';
  }
}


/* ============================================================
   11. clearForm()
   
   WHAT IT DOES: Empties the input fields in the form.
============================================================ */
function clearForm() {
  document.getElementById('taskTitle').value       = '';
  document.getElementById('taskDescription').value = '';
}


/* ============================================================
   12. generateId()
   
   WHAT IT DOES: Creates a unique ID for each todo.
   
   We use Date.now() which returns the number of milliseconds
   since January 1, 1970 — this is always unique as long as
   two tasks aren't created at the exact same millisecond.
   
   @returns {number} — a unique timestamp-based ID
============================================================ */
function generateId() {
  return Date.now();
}


/* ============================================================
   BONUS HELPER: escapeHtml()
   
   WHAT IT DOES: Prevents XSS (Cross-Site Scripting) attacks.
   
   If someone types HTML characters like <, >, &, ", ' in their
   task title, this function converts them to safe text so they
   display as plain text rather than being treated as HTML code.
   
   This is a basic but important security practice.
   
   @param {string} text — user input to sanitize
   @returns {string}    — safe text
============================================================ */
function escapeHtml(text) {
  // Create a temporary div element
  const div = document.createElement('div');
  // Set the text content (browser handles the escaping)
  div.textContent = text;
  // Return the safely escaped HTML
  return div.innerHTML;
}


/* ============================================================
   INITIALIZATION
   
   Run displayTodos() once when the page first loads.
   This ensures the empty state message is visible right away.
============================================================ */
displayTodos();