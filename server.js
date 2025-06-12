const express = require('express');
const bodyParser = require('body-parser');
const { MongoClient } = require('mongodb');
const ObjId = require('mongodb').ObjectId;

const app = express();
const url = 'mongodb+srv://admin:1234@cluster0.ca16ucv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const sha = require('sha256');

app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

let session = require('express-session');
app.use(session({
  secret: 'dkufe8938493j4e08349u',
  resave:false,
  saveUninitialized: true
}));

app.use('/image', express.static(__dirname + '/public/image'));

let mydb;

// MongoDB 연결 후 서버 및 라우터 시작
MongoClient.connect(url)
  .then(client => {
    console.log("MongoDB 연결 성공");
    mydb = client.db('myboard');

    // 라우터 정의
    app.get('/', (req, res) => {
      res.render('index.ejs', {user: req.session.user || null});
    });

    app.get('/enter', (req, res) => {
      res.render('enter.ejs');
    });

    let multer = require('multer');
    let storage = multer.diskStorage({
      destination : function(req, file, done){
        done(null, './public/image')
      },
      filename: function(req, file, done){
        done(null, file.originalname)
      }
    });

    let upload = multer({storage : storage});
    let imagepath='';
    app.post('/photo', upload.single('picture'), function(req, res){
      imagepath='/image/'+req.file.originalname;
      res.redirect('/enter');
    });

    app.post('/save', (req, res) => {
      console.log(req.body);
      mydb.collection('post').insertOne({
        title: req.body.title,
        content: req.body.content,
        date: req.body.someDate,
        path: imagepath
      }).then(result => {
        console.log('데이터 추가 성공');
      }).catch(err => {
        console.error("저장 실패:", err);
        res.status(500).send('DB 오류');
      });
      res.redirect("/list");
    });

    // /list 라우트 (Promise 체인 버전)
    app.get('/list', (req, res) => {
    mydb.collection('post').find().toArray().then(result => {           // 성공 시
        console.log(result);      // 결과 확인
        res.render('list.ejs', { data: result });
        })
        .catch(err => {            // 실패 시
        console.error('DB 조회 오류:', err);
        res.status(500).send('DB 오류 발생');
        });
    });

    app.post("/delete", function(req, res){
        console.log(req.body._id);
        req.body._id= new ObjId(req.body._id);
        mydb.collection('post').deleteOne(req.body)
        .then(result=>{
            console.log('삭제완료');
            res.status(200).send();
        })
    });

    // '/content' 요청에 대한 처리 루틴
    app.get('/content/:id', function(req, res){
      console.log(req.params.id);
      req.params.id = new ObjId(req.params.id);
      mydb
        .collection("post")
        .findOne({ _id : req.params.id})
        .then((result) => {
          console.log(result);
          res.render("content.ejs", { data:result});
        });
    });

    app.get("/edit/:id", function (req, res){
      console.log(req.params.id);
      req.params.id = new ObjId(req.params.id);
      mydb
        .collection("post")
        .findOne({ _id : req.params.id})
        .then((result) => {
          console.log(result);
          res.render("edit.ejs", { data:result});
        });
    });

    app.post('/edit', (req, res) => {
      console.log(req.body);
      req.body.id = new ObjId(req.body.id);
      mydb.collection('post').updateOne({_id:req.body.id},{$set: {
        title: req.body.title,
        content: req.body.content,
        date: req.body.someDate
      }}).then(result => {
        console.log('수정완료');
        res.redirect('/list');
      }).catch(err => {
        console.log(err);
      });
    });

    app.get("/session", function(req, res){
      if(isNaN(req.session.milk)){
        req.session.milk = 0;
      }
      req.session.milk = req.session.milk + 1000;
      res.send("session :" + req.session.milk + "원원");
    });

    app.get("/login", function(req, res){
      console.log("로그인 페이지");
      if(req.session.user){
        console.log('세션 유지');
        res.render('index.ejs', {user: req.session.user});
      }else{
        res.render("login.ejs");
      }
    });

    app.post("/login", function(req, res){
      console.log("아이디: " + req.body.userid);
      console.log("비밀번호: " + req.body.userpw);

      mydb
        .collection("account")
        .findOne({userid:req.body.userid})
        .then((result) => {
          if(result.userpw == sha(req.body.userpw)){
            req.session.user = req.body;
            console.log('새로운 로그인');
            res.render('index.ejs', {user : req.session.user});
          }else{
            res.render('login.ejs');
          }
        });
    });

    app.get("/logout", function (req, res){
      console.log("로그아웃");
      req.session.destroy();
      res.render('index.ejs', {user :null});
    });

    app.get("/signup", function(req,res){
      res.render("signup.ejs");
    });

    app.post("/signup", function(req, res){
      console.log(req.body.userid);
      console.log(sha(req.body.userpw));
      console.log(req.body.usergroup);
      console.log(req.body.useremail);

      mydb
        .collection("account")
        .insertOne({
          userid: req.body.userid,
          userpw: sha(req.body.userpw),
          usergroup: req.body.usergroup,
          useremail: req.body.useremail,
        })
        .then((result) => {
          console.log("회원가입 성공");
        });
      res.redirect("/");
    });
    // 서버 시작
    app.listen(8080, () => {
      console.log("포트 8080으로 서버 대기중...");
    });

  })
  .catch(err => {
    console.error("MongoDB 연결 실패:", err);
  });
