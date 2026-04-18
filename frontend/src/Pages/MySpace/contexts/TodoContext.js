import {createContext, useContext} from "react"

export const TodoContext = createContext({
    todos: [],
    loading: false,
    submitting: false,
    processingTodoId: null,
    error: "",
    addTodo: async ({ todo, description }) => false,
    updateTodo: async (id, { todo, description }) => false,
    deleteTodo: (id) => {},
    toggleComplete: (id) => {},
    clearCompleted: () => {},
    clearError: () => {}
})


export const useTodo = () => {
    return useContext(TodoContext)
}

export const TodoProvider = TodoContext.Provider
