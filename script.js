// todo model

class Todo {
  #list = [];

  constructor(initialList = []) {
    this.list = JSON.parse(localStorage.getItem("todo-list")) ?? initialList;
  }

  get list() {
    return this.#list;
  }

  set list(value) {
    this.#list = value;
    localStorage.setItem("todo-list", JSON.stringify(value));
  }

  getById(id) {
    return this.list.find((todo) => todo.id === id);
  }

  createTodo(newTodo) {
    this.list = [...this.list, { id: Math.random(), ...newTodo }];
  }

  updateTodo(id, newTodo) {
    this.list = this.list.map((todo) =>
      todo.id === id ? { ...todo, ...newTodo } : todo
    );
  }

  deleteTodo(id) {
    this.list = this.list.filter((todo) => todo.id !== id);
  }

  searchByTitle(title) {
    return this.list.filter((todo) =>
      todo.title.toLowerCase().includes(title.toLowerCase())
    );
  }
}

const todoModel = new Todo();

// todo filter

const inputFilter = document.getElementById("filter-todo");

inputFilter.oninput = (e) => {
  renderTodoList(todoModel.searchByTitle(e.target.value));
};

// todo form

const todoForm = document.getElementById("todo-form");
const inputWrappers = todoForm.querySelectorAll(".input-wrapper");
const inputTitle = document.getElementById("title");
const inputDescription = document.getElementById("description");

let editId = null;

const validateTodoForm = (values) => {
  const { title = "", description = "" } = values;
  const errors = {};

  if (!title.length) {
    errors.title = "Required";
  }

  if (!description.length) {
    errors.description = "Required";
  }

  if (title.length > 32) {
    errors.title = "max length 32";
  }

  if (description.length > 100) {
    errors.description = "max length 100";
  }

  return Object.keys(errors).length ? errors : null;
};

const clearFormValues = () => {
  inputTitle.value = "";
  inputDescription.value = "";
  inputFilter.value = "";
  editId = null;

  inputWrappers.forEach((inputWrapper) => {
    inputWrapper.classList.remove("error");
    const span = inputWrapper.querySelector(".description");
    span.textContent = "";
    span.hidden = true;
  });
};

const setFormValues = (todoId) => {
  editId = todoId;

  const { title, description } = todoModel.getById(todoId);
  inputTitle.value = title;
  inputDescription.value = description;
};

todoForm.onsubmit = (e) => {
  e.preventDefault();

  const newTodoValues = {
    title: inputTitle.value,
    description: inputDescription.value,
  };

  const errors = validateTodoForm(newTodoValues);

  if (!errors) {
    if (editId) {
      todoModel.updateTodo(editId, newTodoValues);
    } else {
      todoModel.createTodo(newTodoValues);
    }

    clearFormValues();
    renderTodoList(todoModel.list);
  } else {
    if (errors.title) {
      inputTitle.parentNode.classList.add("error");
      inputTitle.nextElementSibling.textContent = errors.title;
      inputTitle.nextElementSibling.hidden = false;
    }

    if (errors.description) {
      inputDescription.parentNode.classList.add("error");
      inputDescription.nextElementSibling.textContent = errors.description;
      inputDescription.nextElementSibling.hidden = false;
    }
  }
};

todoForm.onreset = (e) => {
  e.preventDefault();
  clearFormValues();
};

// todo list

const todoListContainer = document.getElementById("list-container");

const createTodoContent = (todo) => {
  const wrapper = document.createElement("div");
  wrapper.className = "todo-content";

  if (todo.completed) {
    wrapper.classList.add("completed");
  }

  wrapper.innerHTML = `
          <h6>${todo.title}</h6>
          <p>${todo.description}</p>
      `;

  return wrapper;
};

const createTodoActions = (todo) => {
  const wrapper = document.createElement("div");
  wrapper.className = "todo-actions";

  if (!todo.completed) {
    const doneButton = document.createElement("button");
    doneButton.textContent = "Done";
    doneButton.classList.add("submit-btn");
    doneButton.onclick = () => {
      todoModel.updateTodo(todo.id, { completed: true });
      renderTodoList(todoModel.list);
    };

    const editButton = document.createElement("button");
    editButton.textContent = "Edit";
    editButton.classList.add("edit-btn");
    editButton.onclick = () => {
      setFormValues(todo.id);
    };

    wrapper.append(doneButton, editButton);
  }

  const deleteButton = document.createElement("button");
  deleteButton.textContent = "Delete";
  deleteButton.classList.add("delete-btn");
  deleteButton.onclick = () => {
    todoModel.deleteTodo(todo.id);
    renderTodoList(todoModel.list);
  };

  wrapper.append(deleteButton);
  return wrapper;
};

const renderTodoList = (todos) => {
  if (!todos?.length) {
    todoListContainer.innerHTML = "<h2>No tasks yet</h2>";
    return;
  }

  todoListContainer.innerHTML = "";
  const ul = document.createElement("ul");
  ul.className = "todo-list";

  todos.forEach((todo) => {
    const li = document.createElement("li");

    const content = createTodoContent(todo);
    const actions = createTodoActions(todo);

    li.append(content, actions);
    ul.append(li);
  });

  todoListContainer.append(ul);
};

renderTodoList(todoModel.list);
