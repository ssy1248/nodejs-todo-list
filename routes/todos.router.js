import express from 'express';
import joi from "joi";
import Todo from "../schemas/todo.schemas.js";

const router = express.Router();

const createdTodoSchema = joi.object({
  value: joi.string().min(1).max(50).required(),
});

/** 할일 등록 API */
router.post("/todos", async (req, res, next) => {
  try {
    const validation = await createdTodoSchema.validateAsync(req.body);
    const { value } = validation;

    if (!value) {
      return res.status(400).json({
        errorMessage: "해야 할 일(value) 데이터가 존재하지 않습니다.",
      });
    }

    //findOne -> 1개의 데이터만 조회한다.
    const todoMaxOrder = await Todo.findOne().sort("-order").exec();

    const order = todoMaxOrder ? todoMaxOrder.order + 1 : 1;

    //todo라는 형식을 인스턴스 형식으로 만든거고
    const todo = new Todo({ value, order });
    //실제로 db에 저장한다.
    await todo.save();

    return res.status(201).json({ todo: todo });
  } catch (error) {
    //Router 다음에 있는 에러 처리 미들웨어에 접근한다.
    next(error);
  }
});

/** 해야할 일 목록 조회 API */
router.get("/todos", async (req, res, next) => {
  const todos = await Todo.find().sort("-order").exec();

  return res.status(200).json({ todos });
});

/** 해야할 일 순서 변경 , 완료 / 해제, 내용 변경 API */
router.patch("/todos/:todoId", async (req, res, next) => {
  const { todoId } = req.params;
  const { order, done, value } = req.body;

  const curretnTodo = await Todo.findById(todoId).exec();
  if (!curretnTodo) {
    return res
      .status(404)
      .json({ errorMessage: "존재하지 않는 해야할 일 입니다." });
  }

  if (order) {
    const targetTodo = await Todo.findOne({ order }).exec();
    if (targetTodo) {
      targetTodo.order = curretnTodo.order;
      await targetTodo.save();
    }

    curretnTodo.order = order;
  }
  if (done !== undefined) {
    curretnTodo.doneAt = done ? new Date() : null;
  }
  if (value) {
    curretnTodo.value = value;
  }

  await curretnTodo.save();

  return res.status(200).json({});
});

/** 할 일 삭제 API*/
router.delete("/todos/:todoId", async (req, res) => {
  // 삭제할 '해야할 일'의 ID 값을 가져옵니다.
  const { todoId } = req.params;

  // 삭제하려는 '해야할 일'을 가져옵니다. 만약, 해당 ID값을 가진 '해야할 일'이 없다면 에러를 발생시킵니다.
  const todo = await Todo.findById(todoId).exec();
  if (!todo) {
    return res
      .status(404)
      .json({ errorMessage: "존재하지 않는 todo 데이터입니다." });
  }

  // 조회된 '해야할 일'을 삭제합니다.
  await Todo.deleteOne({ _id: todoId }).exec();

  return res.status(200).json({});
});

export default router;
