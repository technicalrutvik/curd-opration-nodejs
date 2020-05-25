var express = require('express');
var empModel=require('../modules/employee');
var uploadModel=require('../modules/upload');
const bodyparser=require('body-parser');
var multer =require('multer');
var jwt = require('jsonwebtoken');
var path = require('path');
var path = require('path');

// router.use(bodyparser.urlencoded({extended:false}));
// router.use(bodyparser.json());
var router = express.Router();
var employee=empModel.find({});
var imagedata=uploadModel.find({});

/* GET home page. */
router.use(express.static(__dirname+"./public/"));
var Storage=multer.diskStorage({
  destination:"./public/uploads/",
  filename:(req,file,cb)=>{
    cb(null,file.fieldname+"_"+Date.now()+path.extname(file.originalname));
  }
});
  
if (typeof localStorage === "undefined" || localStorage === null) {
  const LocalStorage = require('node-localstorage').LocalStorage;
  localStorage = new LocalStorage('./scratch');
}

  var upload =multer({
    storage:Storage   
  }).single('file');

  function checkLogin(req,res,next){
    var mytoken=localStorage.getItem('mytoken');
    try{
      jwt.verify(mytoken,'logintoken');
    }
    catch(err){
      res.send("you need to login access this page");
    }
    next(); 
  }



router.get('/',checkLogin, function(req, res, next) {
  employee.exec(function(err,data){
    if(err) throw err;
    res.render('index', { title: 'Employee Records',records:data,succ:'' });
   
  });
});

router.get('/login', function(req, res, next) {
  var token = jwt.sign({ foo:'bar'},'logintoken');
  localStorage.setItem('mytoken',token)
  res.send("login successfully");
});

router.get('/logout', function(req, res, next) {
  localStorage.removeItem('mytoken');
  res.send("logout successfully");
});

router.get('/upload', function(req, res, next) {
    imagedata.exec(function(err,data){
    if(err) throw err;
    res.render('upload_file', { title: 'Upload File',records:data,succ:'' });
    });
});

router.post('/upload',upload, function(req, res, next) {
  var imagefile=req.file.filename;
  var success =req.file.filename+"uploaded successfully";

   var imageDetails=new uploadModel({
     imagename:imagefile
   })

imageDetails.save(function(err,doc){
  if(err) throw err;

  imagedata.exec(function(err,data){
    if(err) throw err;
    res.render('upload_file', { title: 'Upload ',records:data,succ:success });  
  });

});
});

router.post("/",function(req,res,next){
  var empDetails = new empModel({
    name:req.body.uname,
    email:req.body.email,
    etype:req.body.emptype,
    hourlyrate:req.body.hrlyrate,
    totalHour:req.body.ttlhr,
    total: parseInt (req.body.hrlyrate)  * parseInt(req.body.ttlhr),
    
  });
  empDetails.save(function(err,res1){
    employee.exec(function(err,data){
      if(err) throw err;
      res.render('index', { title: 'Employee Records',records:data,succ:"Record Inserted successfully" });
  });


  });
  

});

router.post("/search",function(req,res,next){

  var flrtName = req.body.fltrname;
  var fltrEmail = req.body.fltremail;
  var fltremptype = req.body.fltremptype;

  if(flrtName !='' && fltrEmail !='' && fltremptype !=''){
    var filterparameter ={ $and:[{name:flrtName},
    {$and:[{email:fltrEmail},{etype:fltremptype}]}] 
    }
  }
  else if(flrtName !='' && fltrEmail =='' && fltremptype !=''){
    
    var filterparameter ={ $and:[{name:flrtName},{etype:fltremptype}]
      } 
  }
    else if(flrtName =='' && fltrEmail !='' && fltremptype !=''){
  
      var filterparameter ={ $and:[{email:fltrEmail},{etype:fltremptype}]
      }
    }
    else if(flrtName =='' && fltrEmail =='' && fltremptype !=''){
  
      var filterparameter ={ etype:fltremptype
      }
    }
  else{
    var filterparameter={}
  }

var employeeFilter=empModel.find(filterparameter);

  employeeFilter.exec(function(err,data){
      if(err) throw err;
      res.render('index', { title: 'Employee Records',records:data,succ:'' });
      });
  });



  router.get('/delete/:id', function(req, res, next) {
    
    var id =req.params.id;
    var del = empModel.findByIdAndDelete(id);
    
    del.exec(function(err){
      if(err) throw err;
      employee.exec(function(err,data){
        if(err) throw err;
        res.render('index', { title: 'Employee Records',records:data,succ:'Record Deleted successfully' });
    });
    })
  });
  router.get('/edit/:id', function(req, res, next) {

    var id =req.params.id;
    var edit = empModel.findById(id);

    edit.exec(function(err,data){
      if(err) throw err;
      res.render('edit', { title: ' Employee Records',records:data }); 
    });
  });

  router.post('/update/', function(req, res, next) {

    var update = empModel.findByIdAndUpdate(req.body.id,{

      name:req.body.uname,
      email:req.body.email,
      etype:req.body.emptype,
      hourlyrate:req.body.hrlyrate,
      totalHour:req.body.ttlhr,
      total: parseInt (req.body.hrlyrate)  * parseInt(req.body.ttlhr),

    });

    update.exec(function(err,data){
      if(err) throw err;
      employee.exec(function(err,data){
        if(err) throw err;
        res.render('index', { title: 'Employee Records',records:data,succ:"Record Updated successfully" });
    });

    });
  });

module.exports = router;
