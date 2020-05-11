import crypto from "crypto";

const Schema = {};

Schema.createUserSchema = (mongoose) => {
  // 스키마 정의
  const UserSchema = mongoose.Schema({
    id: { type: String, required: true, unique: true, default: " " }, // , unique: true -> Deprecation
    hashed_password: { type: String, required: true, default: " " },
    salt: { type: String, required: true },
    name: { type: String, index: "hashed", default: " " },
    age: { type: Number, default: -1 },
    create_at: { type: Date, index: { unique: false }, default: Date.now },
    updated_at: { type: Date, index: { unique: false }, default: Date.now },
  });

  // password를 virtual 메소드로 정의 :
  // MongoDB에 저장되지 않는 편리한 속성임.
  // 특정 속성을 지정하고 set, get 메소드를 정의함
  UserSchema.virtual("password")
    .set(function (password) {
      this._password = password;
      this.salt = this.makeSalt();
      this.hashed_password = this.encryptPassword(password);
      console.log(`virtual password 호출됨: ${this.hashed_password}`);
    })
    .get(function () {
      return this._password;
    });

  UserSchema.method("encryptPassword", function (plainText, inSalt) {
    if (inSalt) {
      return crypto
        .createHmac("sha256", inSalt)
        .update(plainText)
        .digest("hex");
    } else {
      return crypto
        .createHmac("sha256", this.salt)
        .update(plainText)
        .digest("hex");
    }
  });

  // salt 값 만들기 메소드
  UserSchema.method("makeSalt", function () {
    return Math.round(new Date().valueOf() * Math.random()) + "";
  });

  // 인증 메소드 - 입력된 비밀번호와 비교 (true/false 리턴)
  UserSchema.method("authenticate", function (
    plainText,
    inSalt,
    hashed_password
  ) {
    if (inSalt) {
      console.log(
        `authenticate 호출됨 : ${plainText} -> ${this.encryptPassword(
          plainText,
          inSalt
        )} : ${hashed_password}`
      );
      return this.encryptPassword(plainText, inSalt) === hashed_password;
    } else {
      console.log(
        `authenticate 호출됨 : ${plainText} -> ${this.encryptPassword(
          plainText
        )} : ${hashed_password}`
      );
      return this.encryptPassword(plainText, inSalt) === hashed_password;
    }
  });

  UserSchema.path("id").validate(function (id) {
    return id.length;
  }, "id  칼럼의 값이 없습니다.");

  UserSchema.path("name").validate(function (name) {
    return name.length;
  }, "name 칼럼의 값이 없습니다.");

  // 화살표 함수로는 안됨
  UserSchema.static("findById", function (id, callback) {
    return this.find({ id }, callback);
  });

  // 화살표 함수로는 안됨
  UserSchema.static("findAll", function (callback) {
    return this.find({}, callback);
  });
  console.log("UserSchema 정의함.");

  return UserSchema;
};

module.exports = Schema;
