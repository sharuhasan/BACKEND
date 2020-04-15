var express = require('express');
var router = express.Router();
var mongoose=require('mongoose');
var url = 'mongodb://localhost:27017/test';
mongoose.connect("mongodb://localhost:27017/test2",  {useNewUrlParser: true, useUnifiedTopology: true});
var schema = mongoose.Schema;
const bcrypt = require('bcrypt');
const saltRounds = 10;



var userdataschema= new schema({
    name : String,
    email : String,
    password :String,
    number : String,
    state: String
},{collection:'user-data'});

var user_data=mongoose.model('user-data',userdataschema);

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index',{title:'CRUD-APP',success:req.session.success,errors:req.session.errors });
  req.session.errors=null;
  req.session.success=null;

});

router.get('/get-data',function(req,res,next){
    user_data.find()
        .then(function(doc){
            res.render('index',{items:doc});
        })
});


router.post('/insert',function(req,res,next){

  req.check('name','Name cannot be left BLANK').notEmpty();
  req.check('email','Invalid Email Address').isEmail();
  req.check('password',"Password is invalid : Password should have a minimum length of 6 characters ").isLength({min:6});
  req.check('password',"Password is Invalid : Both Passwords do not match").equals(req.body.confirmpassword);
  req.check('number','Invalid Mobile Number').isMobilePhone();

  var errors=req.validationErrors();
  if(errors)
  {
      req.session.errors=errors;
      req.session.success=false;
      res.redirect('/');
  }
  else {
      req.session.success=true;
      var enc_password;
      bcrypt.genSalt(saltRounds, function (err, salt) {
          bcrypt.hash(req.body.password, salt, function (err, hash) {
              enc_password = hash;
          });
      });
      var item =
          {
              name: req.body.name,
              email: req.body.email,
              number: req.body.number,
              password: enc_password,
              state: req.body.state
          };
      var data = new user_data(item);
      data.save();
      res.redirect('/');
  }});


router.post('/update',function(req,res,next){

    var enc_password;
    bcrypt.genSalt(saltRounds, function (err, salt) {
        bcrypt.hash(req.body.password, salt, function (err, hash) {
            enc_password = hash;
        });
    });
    var item =
        {
            name: req.body.name,
            email: req.body.email,
            number: req.body.number,
            password: enc_password,
            state: req.body.state
        };
    var id =req.body.id;
    user_data.findById(id,function(err,doc){
        if(err)
        {
            console.error('error , user data not found');
        }
        doc.name = req.body.name;
        doc.email =req.body.email;
        doc.password =enc_password;
        doc.number =req.body.number;
        doc.state=req.body.state;
        doc.save();
    });
    res.redirect('/');

});


router.post('/delete',function(req,res,next){
    var id =req.body.id;
    user_data.findByIdAndRemove(id).exec();
    res.redirect('/');
});

module.exports = router;
