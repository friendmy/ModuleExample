// express 기본 모듈 불러오기
import express from "express";
import http from "http";
import path from "path";

// express 미들웨어 불러오기
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
// import static from "static"; -> express.static로 사용 by me

// 오류 핸들러 모듈 사용
import expressErrorHandler from "express-error-handler";

// Session 미들웨어 불러오기
import expressSession from "express-session";

// express 객체 생셩
let app = express();

// 기본 속성 설정
app.set("port", process.env.PORT || 3000);

//body-parser를 사용해 application/x-www-form-urlencoded 파싱
app.use(bodyParser.urlencoded({ extended: false }));

//body-parser를 사용해 application/json 파싱
app.use(bodyParser.json());

// public 폴더를 static으로 오픈
app.use("/public", express.static(path.join(__dirname, "public")));

// cookie-parser 설정
app.use(cookieParser());

// 세션 설정
app.use(
  expressSession({
    //proxy: -> https와 관련하여 필요한 옵션
    secret: "my key", // 이 비밀키를 통해 Session Id를 암호화 하여 관리
    resave: false, // 세션에 요청이 들어간 후에 세션에 변동이 있든 없든 무조건 저장하겠다는 옵션
    saveUninitialized: true, // 세션이 세션 store에 저장되기 전에 uninitialized된 상태로 저장
  })
);

// 몽구스 사용
import mongoose from "mongoose";
import { createUserSchema } from "./database/user_schema";

// 데이터베이스 객체를 위한 변수 선언
let database;

// 데이터베이스 스키마 객체를 위한 변수 선언
let UserSchema;

// 데이터베이스 모델 객체를 위한 변수 선언
let UserModel;

import user from "./routes/user";

// 데이터베이스 연결
const connectDB = () => {
  // 데이터베이스 연결 정보
  const databaseUrl = "mongodb://localhost:27017/local";
  // 데이터베이스 연결
  console.log("데이터베이스 연결을 시도합니다.");
  mongoose.Promise = global.Promise;
  mongoose.connect(databaseUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  database = mongoose.connection;

  database.on(
    "error",
    console.error.bind(console, "mongoose connection error.")
  );
  database.on("open", () => {
    console.log(`데이터베이스에 연결되었습니다. ${databaseUrl}`);

    UserSchema = createUserSchema(mongoose);
    // 모델 정의
    UserModel = mongoose.model("users2", UserSchema);
    user.init(database, UserSchema, UserModel);
    console.log("UserModel 정의함");
  });

  database.on("disconnected", () => {
    console.log("연결이 끊어졌습니다. 5초 후 다시 연결합니다.");
    setInterval(connectDB, 5000);
  });
};

let router = express.Router();
router.route("/process/login").post(user.login); // 로그인 라우팅 함수 - 데이터베이스의 정보와 비교
router.route("/process/adduser").post(user.adduser); // 사용자 추가 라우팅 함수
router.route("/process/setpassword").post(user.setpassword); // 패스워드 수정 라우팅 함수
router.route("/process/listuser").post(user.listUser); // 사용자 리스트
app.use("/", router);

// 404 오류 페이지 처리
let errorHandler = expressErrorHandler({
  static: {
    "404": "./public/404.html",
  },
});

app.use(expressErrorHandler.httpError(404));
app.use(errorHandler);

// 서버 시작
http.createServer(app).listen(app.get("port"), () => {
  console.log(`서버가 시작되었습니다. 포트: ${app.get("port")}`);

  // 데이터베이스 연결
  connectDB();
});
