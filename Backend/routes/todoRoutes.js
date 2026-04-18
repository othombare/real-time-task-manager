const express = require("express");
const todoController = require("../controllers/todoController");
const authController = require("../controllers/authController");

const router = express.Router();

router.use(authController.protect);

router.route("/").get(todoController.getMyTodos).post(todoController.createTodo);
router.route("/completed").delete(todoController.clearCompletedTodos);
router.route("/:id").patch(todoController.updateTodo).delete(todoController.deleteTodo);

module.exports = router;
