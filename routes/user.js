let database;
let UserSchema;
let UserModel;

// 데이터베이스 객체, 스키마 객체, 모델 객체를 이 모듈에서 사용할 수 있도록 전달함
const init = (db, schema, model) => {
  console.log("init 호출됨");

  database = db;
  UserSchema = schema;
  UserModel = model;
};

const login = (req, res) => {
  console.log("/process/login 호출");

  const paramId = req.body.id;
  const paramPassword = req.body.password;

  if (database) {
    authUser(database, paramId, paramPassword, (err, docs) => {
      if (err) {
        throw err;
      }

      if (docs) {
        const username = docs[0].name;
        res.writeHead("200", { "Content-Type": "text/html;charset=utf8" });
        res.write(`<h1>${username} 님이 로그인 하셨습니다.</h1>`);
        res.write(`<div><p>Param id:${paramId}</p></div>`);
        res.write(`<div><p>Param Pw:${paramPassword}</p></div>`);
        res.write(
          `<br><br><a href='/public/setPassword.html'>패스워드 변경</a>`
        );
        res.write("<br><br><a href='/public/login.html'>다시 로그인하기</a>");
        res.end();
      } else {
        res.writeHead("200", { "Content-Type": "text/html;charset=utf8" });
        res.write("<h1>로그인 실패</h1>");
        res.write("<div><p>아이디와 비밀번호를 확인하십시요</p></div>");
        res.write("<br><br><a href='/public/login.html'>다시 로그인하기</a>");
        res.end();
      }
    });
  } else {
    res.writeHead("200", { "Content-Type": "text/html;charset=utf8" });
    res.write("<h2>데이터베이스 연결 실패</h2>");
    res.write("<div><p>데이터베이스에 연결하지 못했습니다.</p></div>");
    res.end();
  }
};

const adduser = (req, res) => {
  console.log("/process/adduser 호출됨");

  const paramId = req.body.id;
  const paramPassword = req.body.password;
  const paramName = req.body.name;

  if (database) {
    addUser(database, paramId, paramPassword, paramName, (err, result) => {
      if (err) {
        throw err;
      }

      if (result) {
        res.writeHead("200", { "Content-Type": "text/html;charset=utf8" });
        res.write("<h2>사용자 추가 성공</h2>");
        res.write("<br><br><a href='/public/login.html'>로그인하기</a>");
        res.end();
      } else {
        res.writeHead("200", { "Content-Type": "text/html;charset=utf8" });
        res.write("<h2>사용자 추가 실패</h2>");
        res.end();
      }
    });
  } else {
    res.writeHead("200", { "Content-Type": "text/html;charset=utf8" });
    res.write("<h2>데이터베이스 연결 실패</h2>");
    res.write("<div><p>데이터베이스에 연결하지 못했습니다.</p></div>");
    res.end();
  }
};

const setpassword = (req, res) => {
  console.log("/process/setpassword 호출됨");

  const paramId = req.body.id;
  const paramBeforePassword = req.body.beforePassword;
  const paramCurrentPassword = req.body.currentPassword;
  const paramCurrentPassword1 = req.body.currentPassword1;

  if (database) {
    authUser(database, paramId, paramBeforePassword, (err, docs) => {
      if (docs) {
        if (paramCurrentPassword === paramCurrentPassword1) {
          setPassword(
            database,
            paramId,
            paramCurrentPassword,
            (err, result) => {
              if (err) {
                throw err;
              }

              if (result) {
                res.writeHead("200", {
                  "Content-Type": "text/html;charset=utf8",
                });
                res.write("<h2>패스워드 변경 성공</h2>");
                res.write(
                  "<br><br><a href='/public/login.html'>로그인하기</a>"
                );
                res.end();
              }
            }
          );
        } else {
          res.writeHead("200", { "Content-Type": "text/html;charset=utf8" });
          res.write(
            "<div><p>변경패스워드와 변경 패스워드 확인이 다릅니다.</p></div>"
          );
          res.write("<div><p>패스워드 확인 후 다시 시도하세요.</p></div>");
          res.write(
            "<br><br><a href='/public/setpassword.html'>다시 시도하기</a>"
          );
          res.end();
        }
      } else {
        res.writeHead("200", { "Content-Type": "text/html;charset=utf8" });
        res.write("<div><p>아이디와 이전 비밀번호를 확인하십시요</p></div>");
        res.write(
          "<br><br><a href='/public/setpassword.html'>다시 시도하기</a>"
        );
        res.end();
      }
    });
  }
};

const listUser = (req, res) => {
  console.log("/process/listuser 호출됨");

  // 데이터베이스 객체가 초기화된 경우, 모델 객체의 메소드 호출
  if (database) {
    // 1. 모든 사용자 검색
    UserModel.findAll((err, results) => {
      // 오류가 발생했을 때 클라이언트로 오류 전송
      if (err) {
        console.error("사용자 리스트 조회 중 오류 발생:" + err.stack);

        res.writeHead("200", { "Content-Type": "text/html;charset=utf8" });
        res.write("<h2>사용자 리스트 조회 중 오류 발생</h2>");
        res.write(`${err.stack}`);
        res.end();
      }

      if (results) {
        console.dir(results);

        res.writeHead("200", { "Content-Type": "text/html;charset=utf8" });
        res.write("<h2>사용자 리스트</h2>");
        res.write("<div><ul>");

        for (let index = 0; index < results.length; index++) {
          const curId = results[index].id;
          const curName = results[index].name;
          res.write(`<li>#${index} + : ${curId},${curName}</li>`);
        }

        res.write("</ul></div>");
        res.end();
      } else {
        res.writeHead("200", { "Content-Type": "text/html;charset=utf8" });
        res.write("<h2>사용자 리스트 조회 실패</h2>");
        res.end();
      }
    });
  } else {
    // 데이터베이스 객체가 초기화되지 않았을 때 실패 응답 전송
    res.writeHead("200", { "Content-Type": "text/html;charset=utf8" });
    res.write("<h2>데이터베이스 연결 실패</h2>");
    res.end();
  }
};

// 패스워드 수정 함수
const setPassword = (database, id, password, callback) => {
  // users 컬렉션 참조
  // const users = database.collection("users");

  UserModel.findByIdAndUpdate({ id }, { $set: { password } }, (err, result) => {
    if (err) {
      callback(err, null);
      return;
    }
    console.log(result);
    callback(null, result);
  });
};

// 사용자 추가 함수
const addUser = (database, id, password, name, callback) => {
  // UserModel의 인스턴스 생성
  const user = new UserModel({ id, password, name });
  // save()로 저장
  user.save((err) => {
    if (err) {
      callback(err, null);
      return;
    }
    // 오류가 아닐경우
    console.log("사용자 데이터 추가함");
    callback(null, user);
  });
};

// 사용자 인증 함수
const authUser = (database, id, password, callback) => {
  console.log(`authUser 호출됨.: ${id}, ${password}`);

  UserModel.findById(id, (err, results) => {
    if (err) {
      callback(err, null);
      return;
    }

    console.log(`아이디 ${id}로 사용자 검색 결과`);

    if (results.length > 0) {
      console.log("아이디와 일치하는 사용자 찾음.");

      // 비밀번호 확인 : 모델 인스턴스 객체를 만들고 authenticate() 메소드 호출
      const user = new UserModel({ id });
      const authenticated = user.authenticate(
        password,
        results[0].salt,
        results[0].hashed_password
      );

      if (authenticated) {
        console.log("비밀번호 일치함");
        callback(null, results);
      } else {
        console.log("비밀번호 일치하지 않음");
        callback(null, null);
      }
    } else {
      console.log("아이디와 일치하는 사용자를 찾지 못함");
      callback(null, null);
    }
  });
};

// module.exports.login = login;
// module.exports.adduser = addUser;
// module.exports.listUser = listUser;
// module.exports.setPassword = setPassword;

export default { init, login, adduser, listUser, setpassword };
