const mongoose = require("mongoose");
const Todo = require("../models/todoMode");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

const getOwnedTodo = async (todoId, userId) => {
  if (!mongoose.Types.ObjectId.isValid(todoId)) {
    throw new AppError("Invalid todo id.", 400);
  }

  const todo = await Todo.findOne({ _id: todoId, user: userId });

  if (!todo) {
    throw new AppError("Todo not found.", 404);
  }

  return todo;
};

exports.getMyTodos = catchAsync(async (req, res) => {
  const todos = await Todo.find({ user: req.user.id }).sort({ createdAt: -1 });

  res.status(200).json({
    status: "success",
    results: todos.length,
    data: {
      todos,
    },
  });
});

exports.createTodo = catchAsync(async (req, res, next) => {
  const todoText = String(req.body?.todo || "").trim();
  const description = String(req.body?.description || "").trim();

  if (!todoText) {
    return next(new AppError("Todo text is required.", 400));
  }

  const todo = await Todo.create({
    todo: todoText,
    description,
    user: req.user.id,
  });

  res.status(201).json({
    status: "success",
    data: {
      todo,
    },
  });
});

exports.updateTodo = catchAsync(async (req, res, next) => {
  const todo = await getOwnedTodo(req.params.id, req.user.id);
  const updates = {};

  if (Object.prototype.hasOwnProperty.call(req.body, "todo")) {
    const nextTodoText = String(req.body.todo || "").trim();

    if (!nextTodoText) {
      return next(new AppError("Todo text cannot be empty.", 400));
    }

    updates.todo = nextTodoText;
  }

  if (Object.prototype.hasOwnProperty.call(req.body, "description")) {
    updates.description = String(req.body.description || "").trim();
  }

  if (Object.prototype.hasOwnProperty.call(req.body, "completed")) {
    updates.completed = Boolean(req.body.completed);
  }

  Object.assign(todo, updates);
  await todo.save();

  res.status(200).json({
    status: "success",
    data: {
      todo,
    },
  });
});

exports.deleteTodo = catchAsync(async (req, res) => {
  const todo = await getOwnedTodo(req.params.id, req.user.id);
  await todo.deleteOne();

  res.status(204).json({
    status: "success",
    data: null,
  });
});

exports.clearCompletedTodos = catchAsync(async (req, res) => {
  const result = await Todo.deleteMany({ user: req.user.id, completed: true });

  res.status(200).json({
    status: "success",
    data: {
      deletedCount: result.deletedCount || 0,
    },
  });
});
