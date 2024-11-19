import express from "express";
import connect from "./schemas/index.js";
import todosRouter from "./routes/todos.router.js";
import errorHandlerMiddleware from "./middlewares/error-handler-middleware.js";

const app = express();
const PORT = 3000;

connect();

// Express에서 req.body에 접근하여 body 데이터를 사용할 수 있도록 설정합니다.
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//경로에 있는 파일을 아무런 가공 없이 그대로 전달해주는 미들웨어
app.use(express.static("./assets"));

const router = express.Router();

router.get("/", (req, res) => {
  return res.json({ message: "Hi!" });
});

app.use("/api", [router, todosRouter]);

//에러 처리 미들웨어 등록
//라우터 하단에 등록하는 이유 -> 미들웨어는 등록된 순서대로 실행되기 때문에 라우터에서 에러가 발생되면 서버가 실행되기 전에 에러를 잡을 수 있다.
app.use(errorHandlerMiddleware);

app.listen(PORT, () => {
  console.log(PORT, "포트로 서버가 열렸어요!");
});

//미들웨어는 위에서 아래로 실행된다. 동기 프로그래밍같은 순서
//todosRouter -> 단순하게 리턴을 하기때문에 next가 실행이 되지 않는다
//라우터는 미들웨어와 비슷하게 실행이 된다
