var express = require('express');
var empModel=require('../modules/employee');
var uploadModel=require('../modules/upload');
const bodyparser=require('body-parser');
var multer =require('multer');
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
  

  var upload =multer({
    storage:Storage   
  }).single('file');
router.get('/', function(req, res, next) {
  employee.exec(function(err,data){
    if(err) throw err;
    res.render('index', { title: 'Employee Records',records:data,succ:'' });
   
  });
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
      res.render('index', { title: 'Employee Records',records:data });
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
