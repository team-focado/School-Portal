const express=require('express');
const path =require('path');
const router=express.Router();
const bcrypt = require('bcrypt-nodejs');
var Student = require('../model/user').student;
var Teacher = require('../model/user').teacher;
var upload = require('../config/multer').noticeUpload;
var uploadAssignment = require('../config/multer').assignmentUpload;
var uploadTimeTable = require('../config/multer').timeTableUpload;
var Notice = require('../model/user').notice;
var School = require('../model/user').school;
var Contact = require('../model/user').contact;
var Assignment = require('../model/user').assignment;
var Exam = require('../model/user').exam;
var Marks = require('../model/user').marks;
var request = require("request");
var timeTable = require('../model/user').timeTable;
var blog = require('../model/user').blog;
var healthForm = require('../model/user').healthForm;

function createUserInComet(userId, userName) {
	return new Promise(function(resolve, reject) {

		var options = { method: 'POST',
			url: 'https://api.cometondemand.net/api/v2/createUser',
			headers:
				{
					'api-key': '51429x3f91156fa69639df9fba365fe0892855',
				},
			formData: { UID: userId, name: userName} };

		request(options, function (error, response, body) {
			if (error) reject(error);
			resolve(body);
		});
	})
}

var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
	service: 'gmail',
	auth:{
		user: 'focado11@gmail.com',
		pass: 'schoolportal'
	},
	tls: {
		rejectUnauthorized: false
	}


});


const passport=require('passport');

router.get('/data',function (req,res) {
	res.json(req.user._doc);
})

router.get('/teacherData',isTeacher,function (req,res) {
	res.json()
})

router.get('/login',function (req,res) {
    res.redirect('/login.html')
})

router.get('/signup',function (req,res) {
    res.redirect('/signup.html')
})

router.get('/student-login',function (req,res) {
	res.redirect('/loginStudent.html')
})

router.get('/teacher-login',function (req,res) {
	res.redirect('/loginTeacher.html')
})

router.use('/schoolOauth',isSchool,express.static(path.join(__dirname,'../frontend/schoolOauth')));
router.use('/teacherOauth',isTeacher,express.static(path.join(__dirname,'../frontend/teacherOauth')));
router.use('/studentOauth',isStudent,express.static(path.join(__dirname,'../frontend/studentOauth')));
router.use('/uploads',express.static(path.join(__dirname,'../uploads')));
router.use('/home',express.static(path.join(__dirname,'../frontend/withoutOauth')));
router.use('/',express.static(path.join(__dirname,'../homepage')));

router.get('/studentSignup',isSchool ,function (req,res) {
	res.redirect('/schoolOauth/studentSignup.html');
})

router.get('/teacherSignup',isSchool , function (req,res) {
	res.redirect('/schoolOauth/teacherSignup.html');
})
router.get('/uploadNotice', isSchool, function (req,res) {
	res.redirect('/schoolOauth/uploadNotice.html');
})

router.get('/updateSubjects', isSchool, function (req,res) {
	res.redirect('/schoolOauth/fillSubjects.html');
})

router.get('/contactStudent' , isStudent, function (req,res) {
	res.redirect('/studentOauth/contact.html');
})

router.get('/rating' , isStudent, function (req,res) {
	res.redirect('/studentOauth/rating.html');
})

router.get('/contactTeacher' , isTeacher, function (req,res) {
	res.redirect('/teacherOauth/contact.html');
})

router.get('/assignment',isTeacher, function (req,res) {
	res.redirect('/teacherOauth/uploadAssignment.html');
})

router.post('/schoolSignup',passport.authenticate('school.signup',{


    failureRedirect: '/signup', // okay
    failureFlash: true

}),function (req,res) {
	res.redirect('/schoolOauth/schoolDashboard.html');

})

router.post('/studentLogin', passport.authenticate('student.login',{


	failureRedirect: '/student-login',
	failureFlash: true

}),function (req,res) {
	res.redirect('/studentOauth/studentDashboard.html');
})


router.get('/teacherChat',function (req,res) {

	var query = {class_section : req.user._doc.class_section,
				school : req.user._doc.school
	};
	Student.find(query,function (err,data) {
		var friends = "";
		for(var i=0;i<data.length;i++){
			var id = String(data[i]._doc._id);
			friends += id + ',';
			var name = data[i]._doc.firstname + ' ' + data[i]._doc.lastname;
			createUserInComet(id,name)
				.then((data)=>{
					console.log(data);
				})
				.catch((err)=>{
					console.log(err);
				})
		}
		console.log(friends);
		var obj = {};
		obj.name = req.user._doc.firstname + ' ' + req.user._doc.lastname;
		obj.id = String(req.user._doc._id);
		obj.friends = friends;
		console.log(obj);
		setTimeout(function () {
			res.render('teacherChat',obj);
		},2000);

	})

})



router.get('/studentChat',function (req,res) {
	var query = {class_section : req.user._doc.class_section,
		school : req.user._doc.school
	};
	Teacher.find(query,function (err,data) {
		var friends = "";
		for(var i=0;i<data.length;i++){
			var id = String(data[i]._doc._id);
			friends += id + ',';
			var name = data[i]._doc.firstname + ' ' + data[i]._doc.lastname;
			createUserInComet(id,name)
				.then((data)=>{
					console.log(data);
				})
				.catch((err)=>{
					console.log(err);
				})
		}
		console.log(friends);
		var obj = {};
		obj.name = req.user._doc.firstname + ' ' + req.user._doc.lastname;
		obj.id = String(req.user._doc._id);
		obj.friends = friends;
		console.log(obj);
		setTimeout(function () {
			res.render('studentChat',obj);
		},2000);

	})
})
router.post('/uploadMarks',function (req,res) {
	console.log(req);
	for(i in req.body){
		if(i=='examName'){
			continue;
		}
		if(i=='subject'){
			continue;
		}
		if(i=='class'){
			continue;
		}
		var newExam = new Marks();
		newExam.examName = req.body.examName;
		newExam.subject = req.body.subject;
		newExam.student = i;
		newExam.class = req.body.class;
		newExam.marks = Number(req.body[i]);
		newExam.school = req.user._doc.school;
		newExam.save(function (err) {
			if(err) throw (err);

			console.log('hello');
		})
	}
	setTimeout(function () {
		res.redirect('/teacherOauth/teacherDashboard.html');
	},2000)
})

router.get('/marksData', isStudent ,function (req,res) {
	var o2 = {};

	Marks.find({student: String(req.user._doc._id),school: req.user._doc.school},function (err,data) {
		//console.log(req);
		for(var i=0;i<data.length;i++){
			if (!o2[data[i]._doc.examName]) {
				o2[data[i]._doc.examName] = {}
			}
			o2[data[i]._doc.examName][data[i]._doc.subject]= data[i]._doc.marks;
		}

		console.log(o2);
		//console.log("-----------");
		res.json(o2);
	})


})


router.post('/marksDataTeacher' ,function (req,res) {
	var o2 = {};
	Marks.find({student: req.body.id,school: req.user._doc.school},function (err,data) {
		console.log(data);
		for(var i=0;i<data.length;i++){
			if (!o2[data[i]._doc.examName]) {
				o2[data[i]._doc.examName] = {}
			}
			o2[data[i]._doc.examName][data[i]._doc.subject]= data[i]._doc.marks;
		}


			console.log(o2);
			//console.log("-----------");
			res.json(o2);
	})


})


router.get('/examName',function (req,res) {
	var arr=[];
	Exam.find({school:req.user._doc.school},function (err,data) {
		for(var i=0;i<data.length;i++){
			console.log(data[i].name)
			arr.push(data[i].name)
			console.log(arr);
		}
		res.json(arr);
	})

})

router.post('/examWiseDataTeacher',function (req,res) {
	var obj = {};   // examName in post request
	console.log(req);
	Marks.find({school : req.user._doc.school ,examName: req.body.examName},function (err,data) {
		for(var i=0;i<data.length;i++){

			if(obj[`${data[i]._doc.subject}`]){

				marks= data[i]._doc.marks;
				obj[`${data[i]._doc.subject}`].push(marks);
			}
			else{
				obj[`${data[i]._doc.subject}`]=[];

				marks= data[i]._doc.marks;
				obj[`${data[i]._doc.subject}`].push(marks);
			}
		}
		console.log(obj);
		var tosend ={};
		for(i in obj){
			var arr = obj[i];
			var max = 0;

			var sum =0;
			for(var j =0 ;j<arr.length;j++){
				sum+= arr[j];
				if(arr[j] > max){
					max = arr[j];
				}
			}
			sum = sum / arr.length;
			tosend[i]={};
			tosend[i].max = max;
			tosend[i].avg = sum;
		}
		res.json(tosend);
	})
})


router.post('/examWiseData',function (req,res) {
	var obj = {};
	console.log(req);
	Marks.find({school : req.user._doc.school ,examName: req.body.examName},function (err,data) {
		for(var i=0;i<data.length;i++){

			if(obj[`${data[i]._doc.subject}`]){

				marks= data[i]._doc.marks;
				obj[`${data[i]._doc.subject}`].push(marks);
			}
			else{
				obj[`${data[i]._doc.subject}`]=[];

				marks= data[i]._doc.marks;
				obj[`${data[i]._doc.subject}`].push(marks);
			}
		}
		console.log(obj);
		var tosend ={};
		for(i in obj){
			var arr = obj[i];
			var max = 0;

			var sum =0;
			for(var j =0 ;j<arr.length;j++){
				sum+= arr[j];
				if(arr[j] > max){
					max = arr[j];
				}
			}
			sum = sum / arr.length;
			tosend[i]={};
			tosend[i].max = max;
			tosend[i].avg = sum;
		}
		res.json(tosend);
	})
})

router.get('/classDataTeacher',isTeacher,function (req,res) {
	var obj = {};
	Marks.find({class : req.user._doc.class_section,school:req.user._doc.school},function (err,data) {
		console.log(data);
		for(var i=0;i<data.length;i++){
			if(obj[`${data[i]._doc.subject}`]){
				var temp ={};
				temp.examName = data[i]._doc.examName;
				temp.marks= data[i]._doc.marks;
				obj[`${data[i]._doc.subject}`].push(temp);
			}
			else{
				obj[`${data[i]._doc.subject}`]=[];
				var temp ={};
				temp.examName = data[i]._doc.examName;
				temp.marks= data[i]._doc.marks;
				obj[`${data[i]._doc.subject}`].push(temp);
			}
		}
		console.log(obj);
		var tosend ={};
		for(i in obj){
			var arr = obj[i];
			var max = 0;

			var sum =0;
			for(var j =0 ;j<arr.length;j++){
				sum+= arr[j].marks;
				if(arr[j].marks > max){
					max = arr[j].marks;
				}
			}
			sum = sum / arr.length;
			tosend[i]={};
			tosend[i].max = max;
			tosend[i].avg = sum;
		}
		res.json(tosend);
	})

})


router.get('/classData',isStudent,function (req,res) {
	var obj = {};
	Marks.find({class : req.user._doc.class_section,school:req.user._doc.school},function (err,data) {
			console.log(data);
		for(var i=0;i<data.length;i++){
			if(obj[`${data[i]._doc.subject}`]){
				var temp ={};
				temp.examName = data[i]._doc.examName;
				temp.marks= data[i]._doc.marks;
				obj[`${data[i]._doc.subject}`].push(temp);
			}
			else{
				obj[`${data[i]._doc.subject}`]=[];
				var temp ={};
				temp.examName = data[i]._doc.examName;
				temp.marks= data[i]._doc.marks;
				obj[`${data[i]._doc.subject}`].push(temp);
			}
		}
		console.log(obj);
		var tosend ={};
		for(i in obj){
			var arr = obj[i];
			var max = 0;

			var sum =0;
			for(var j =0 ;j<arr.length;j++){
				sum+= arr[j].marks;
				if(arr[j].marks > max){
					max = arr[j].marks;
				}
			}
			sum = sum / arr.length;
			tosend[i]={};
			tosend[i].max = max;
			tosend[i].avg = sum;
		}
		res.json(tosend);
	})

})

router.post('/teacherLogin', passport.authenticate('teacher.login',{


	failureRedirect: '/teacher-login',
	failureFlash: true

}),function (req,res) {
	res.redirect('/teacherOauth/teacherDashboard.html');
})

router.post('/studentSignup', function(req,res){
	Student.findOne({'email':req.body.email},function (err,user) {
		if(err){
			throw err;
		}
		else if(user){
			req.flash('userError', 'user already exists')
			res.redirect('/schoolOauth/schoolDashboard.html')
		}

		console.log(req);
		var newUser=new Student();
		newUser.typeOf = 'Student';
		newUser.firstnamegit  = req.body.firstname;
		newUser.lastname = req.body.lastname;
		newUser.phone = req.body.phone;
		newUser.age= req.body.age;
		newUser.admissionNumber=req.body.admissionNumber;
		newUser.rollNumber=req.body.rollNumber;
		newUser.address=req.body.address
		newUser.school = req.user._doc.name;
		newUser.email=req.body.email;


		newUser.subject = req.body.subject;

		newUser.class_section = req.body.class_section;

		newUser.password=newUser.encryptPassword(req.body.password);
		newUser.save(function (err) {
			if(err) throw (err);

			return res.redirect('/schoolOauth/schoolDashboard.html')
		})
	})

	})


router.post('/teacherSignup', function(req,res){
	Teacher.findOne({'email':req.body.email},function (err,user) {
		if(err){
			throw err;
		}
		else if(user){
			req.flash('userError', 'user already exists')
			res.redirect('/schoolOauth/schoolDashboard.html')
		}
		console.log(req);
		var newUser=new Teacher();
		newUser.typeOf = 'Teacher';
		newUser.school = req.user._doc.name;
		newUser.email=req.body.email;
		newUser.firstname = req.body.firstname;
		newUser.lastname = req.body.lastname;
		newUser.phone = req.body.phone;
		newUser.school = req.user._doc.name;

		var ans = req.body.subject;

		newUser.subject = ans;
		req.body.subject;
		var ans1 = req.body.class_section;
		classarr = ans1.split(',');
		newUser.class_section = classarr;
		newUser.password=newUser.encryptPassword(req.body.password);
		newUser.save(function (err) {
			if(err) throw (err);

			res.redirect('/schoolOauth/schoolDashboard.html')
		})
	})

})




router.post('/login',passport.authenticate('school.login',{


    failureRedirect: '/home/login',
    failureFlash: true

}),function (req,res) {
	res.redirect('/schoolOauth/schoolDashboard.html')
})


router.post('/uploadTimeTable',(req,res)=> {
	console.log(req);
	uploadTimeTable(req, res, function (err) {
		if (err) {
			// An error occurred when uploading
			console.log(err);
			return;
		}
		console.log(req);
		var newTimeTable = new timeTable();
		newTimeTable.class_section = req.body.class;
		newTimeTable.school = req.user._doc.name;
		newTimeTable.filePath = req.file.path;
		newTimeTable.save(function (err) {
			if(err) throw (err);

			res.redirect('/schoolOauth/schoolDashboard.html')
		})
	})
});



router.post('/uploadNotice',(req,res)=> {
	upload(req, res, function (err) {
		if (err) {
			// An error occurred when uploading
			console.log(err);
			return;
		}
		console.log(req);
		var newNotice = new Notice();
		newNotice.topic = req.body.topic;
		newNotice.target = req.body.target;
		newNotice.date = req.body.date;
		newNotice.description = req.body.description;
		newNotice.filePath = req.file.path;
		newNotice.school = req.user._doc.name;
		newNotice.save(function (err) {
			if(err) throw (err);

			res.redirect('/schoolOauth/schoolDashboard.html')
		})
	})
});

router.post('/fillSubjects',isSchool, function (req,res) {
	var query = { name: req.user._doc.name };
	var arr=[];
	var ans = req.body.subject;
	arr=ans.split(',');

	School.update(query, {subject : arr}, function (err,data) {
		console.log(data);
		res.redirect('/schoolOauth/schoolDashboard.html')
	})
})

router.get('/getSubjects', function (req,res) {
	res.json(req.user._doc.subject);
})

router.get('/getSubject',isTeacher,function (req,res) {
	res.json(req.user._doc.subject);
})
 router.get('/getNoticeSchool', isSchool, function (req,res) {
	 Notice.find({school : req.user._doc.name},function (err,data) {
	 	var arr=[];
	 	for(var i=0;i<data.length;i++){
	 		arr.push(data[i]._doc);
	    }
		res.json(arr);
	 })
 })

 router.get('/getTimeTable',isStudent,function(req,res){
	 console.log(req);
	  timeTable.find({school : req.user._doc.school, class_section : req.user._doc.class_section},function(err,data){
			var arr = [];
			for(i=0;i<data.length;i++){
				arr.push(data[i]._doc);
			}
			res.json(arr);
	  })
 })

router.post('/ranking',function (req,res) {

	var student = {};
	Marks.find({school: req.user_doc.school,
				class:req.user._doc.class_section,
				subject:req.body.subject
				},function (err,Maindata) {
					for(var i=0;i<Maindata.length;i++){
						if(student[`${Maindata[i].student}`]){
							student[`${Maindata[i].student}`] += Maindata[i].marks;
						}
						else{
							student[`${Maindata[i].student}`] = Maindata[i].marks;
						}
					}
				var sortable=[];
				for(var key in student)
					if(student.hasOwnProperty(key))
						sortable.push([key, student[key]]); // each item is an array in format [key, value]

				// sort items by value
				sortable.sort(function(a, b)
				{
					return b[1]-a[1]; // compare numbers
				});
				console.log(sortable);
				var final = {}
				var top5 = []
				var studentRank = {};
				for(var i=0;i<sortable.length;i++){
//
					if(sortable[i][0]== String(req.user._doc._id)){
						studentRank = {
							id:sortable[i][0],
							rank: i+1,
							//name: req.user._doc.firstname+" "+req.user._doc.lastname
						}
					}
				}
				for(var i=0;i<sortable.length;i++){
					if(i<5){
						Student.findOne({_id:sortable[i][0] },function (err,data) {
							console.log(data);
							top5.push({
								id: sortable[i][0],
								name : data._doc.firstname + " "+ data._doc.lastname,
								rank: i+1
							})
						})

					}
					else{
						break;
					}

				}

				final.top5rank = top5;
				final.studentRank = studentRank;
				res.json(final);

	})
})

router.get('/getStudents',isTeacher,function (req,res) {

	var query = {class_section : req.user._doc.class_section};
	Student.find(query,function (err,data) {
		var arr = [];
		for(var i=0;i<data.length;i++){
			var obj={};
			obj.id = String(data[i]._id);

			obj.name = data[i].firstname + ' ' + data[i].lastname;
			arr.push(obj);
		}
		res.json(arr);
	})
})




router.get('/getAssignment' ,function (req,res) {
	Assignment.find({school : req.user._doc.school,
		class_section : req.user._doc.class_section
	},function (err,data) {
		res.json(data);
	})

})

router.get('/getNoticeStudent', isStudent, function (req,res) {
	Notice.find({school : req.user._doc.school,
		$or:[
			{'target':'Student'}, {'target':'Student and Teacher'}
		]
	},function (err,data) {
		var arr=[];
		for(var i=0;i<data.length;i++){
			arr.push(data[i]._doc);
		}
		res.json(arr);
	})
})

router.get('/getNoticeTeacher', isTeacher, function (req,res) {
	Notice.find({school : req.user._doc.school,
		$or:[
			{'target':'Teacher'}, {'target':'Student and Teacher'}
		]

	},function (err,data) {
		var arr=[];
		for(var i=0;i<data.length;i++){
			arr.push(data[i]._doc);
		}
		res.json(arr);
	})
})

router.post('/contact',function (req,res) {
	var contact = new Contact();
	console.log(req);
	if(req.body.tosend == 'School Administration'){
		contact.description = req.body.description;
		contact.topic = req.body.subject;
		contact.firstname = req.user._doc.firstname;
		contact.lastname = req.user._doc.lastname;
		contact.school = req.user._doc.school;
		contact.target = req.body.tosend;
		contact.typeOf = req.user._doc.typeOf;
		if(contact.typeOf == "Student"){
			contact.class_section = req.user._doc.class_section;
		}
		contact.save(function (err) {
			if(err) throw (err);
			if(req.user._doc.typeOf == 'Student'){
				res.redirect('/studentOauth/studentDashboard.html');
			}
			else{
				res.redirect('/teacherOauth/teacherDashboard.html');
			}

		})

	}
	if(req.body.tosend == 'Focado Team'){
		var mailOptions = {
			from: 'focado11@gmail.com',
			to: 'mohankukreja1@gmail.com',
			subject: req.body.subject,
			text: `firstname : ${req.user._doc.firstname},
				   lastname : ${req.user._doc.lastname},
				   school : ${req.user._doc.school}
				   description: ${req.body.description}
			`
		};

		transporter.sendMail(mailOptions, function(error, info){
			if (error) {
				console.log(error);
			} else {
				console.log('Email sent: ' + info.response);
				if(req.user._doc.typeOf == 'Student'){
					res.redirect('/studentOauth/studentDashboard.html');
				}
				else{
					res.redirect('/teacherOauth/teacherDashboard.html');
				}
			}
		})

	}
})



router.get('/getContact',isSchool,function (req,res) {
	Contact.find({school: req.user._doc.name},function(err,data){
		var arr=[];
		for(var i=0;i<data.length;i++){
			arr.push(data[i]._doc);
		}
		res.json(arr);
	})
})


router.get('/getRating',isTeacher,function (req,res) {
	var query = { firstname: req.user._doc.firstname , lastname: req.user._doc.lastname };
	Teacher.find(query,function (err,data) {
		res.json(data[0]._doc.rating);
	})
})


router.get('/teachers' , isStudent , function(req,res){
	console.log(req);
	var query = {class_section : req.user._doc.class_section};
	Teacher.find(query,function (err,data) {
		var arr = [];
		for(var i=0;i<data.length;i++){
			var name = data[i].firstname + ' ' + data[i].lastname;
			arr.push(name);
		}
		res.json(arr);
	})
})


router.get('/students' , isTeacher , function(req,res){
	console.log(req);
	var query = {class_section : req.user._doc.class_section};
	Student.find(query,function (err,data) {
		var arr = [];
		for(var i=0;i<data.length;i++){
			var name = data[i].firstname + ' ' + data[i].lastname;
			arr.push({id:data[i].id,name:name});
		}
		res.json(arr);
	})
})

router.get('/getAllTeachers', isSchool,function(req,res){
	Teacher.find({school: req.user._doc.name},function(err,data){
			var arr = [];
			for(var i=0;i<data.length;i++){
				var obj = {};

				obj.id = data[i].id;
				obj.name = data[i].firstname+ " " + data[i].lastname;
				arr.push(obj);
			}
			res.json(arr);
	})
})


router.post('/getTeacherRating',isSchool,function(req,res){
	Teacher.find({_id:req.body.id},function(err,data){
		var obj = {};
		var counter = data[0]._doc.ratingNumber;
		obj.approach = data[0]._doc.approach/counter;
		obj.assignment = data[0]._doc.assignment/counter;
		obj.depth = data[0]._doc.depth/counter;
		obj.marking = data[0]._doc.marking/counter;
		obj.pace = data[0]._doc.pace/counter;
		obj.response = data[0]._doc.response/counter;
		obj.syllabus = data[0]._doc.syllabus/counter;
		res.json(obj);
	})
})

router.get('/getStudentRating',isStudent,function(req,res){
	console.log(req);
	Student.find({_id:req.user.id},function(err,data){
		var obj = {};
		var counter = data[0]._doc.ratingNumber;
		obj.discipline = data[0]._doc.discipline/counter;
		obj.interaction = data[0]._doc.interaction/counter;
		obj.listening = data[0]._doc.listening/counter;
		obj.participation = data[0]._doc.participation/counter;
		obj.punctuality = data[0]._doc.punctuality/counter;
		obj.tackling = data[0]._doc.tackling/counter;
		obj.understanding = data[0]._doc.understanding/counter;
		obj.creativity = data[0]._doc.creativity/counter;
		obj.curiosity = data[0]._doc.curiosity/counter;
		res.json(obj);
	})
})



router.post('/addExam',function (req,res) {
	var newExam = new Exam();
	newExam.name = req.body.subject;
	newExam.class = req.body.class;
	newExam.school = req.user._doc.name;
	console.log(newExam.school);
	newExam.save(function (err) {
		if(err) throw (err);

		res.redirect('/schoolOauth/schoolDashboard.html')
	})
})





router.post('/rating',function (req,res) {
	console.log(req);
	var name = req.body.name;
	console.log(name);
	var arr = name.split(" ");


	var query = { firstname: arr[0] , lastname: arr[1],school: req.user._doc.school };
	Teacher.find(query,function (err,data) {
		console.log(data);
		var approach = (data[0]._doc.approach);
		approach += Number(req.body.approach);
		var assignment = data[0]._doc.assignment;
		assignment += Number(req.body.assignment);
		var depth = data[0]._doc.depth;
		depth += Number(req.body.depth);
		var marking = data[0]._doc.marking;
		marking += Number(req.body.marking);
		var pace = data[0]._doc.pace;
		pace += Number(req.body.pace);
		var response = data[0]._doc.response;
		response += Number(req.body.response);
		var syllabus = data[0]._doc.syllabus;
		syllabus += Number(req.body.syllabus);
		var counter = data[0]._doc.ratingNumber;
		counter++;



		Teacher.update(query,{approach : approach , assignment : assignment , depth: depth,marking:marking,pace:pace,response: response,syllabus:syllabus,ratingNumber : counter} , function (err,data) {
			console.log(data);
			res.redirect('/studentOauth/studentDashboard.html');
		})
//tocheck

	})
})


router.get('/test',function (req,res) {
	Student.find({class_section : ['6-B','12-A']},function (err,data) {
		console.log(data);
	})
})





router.post('/ratingStudent',function (req,res) {
	console.log(req.body);
	
	var query = {_id: req.body.id};
	Student.find(query,function (err,data) {
		console.log(data);
		var discipline = (data[0]._doc.discipline);
		discipline += Number(req.body.discipline);
		var interaction = data[0]._doc.interaction;
		interaction += Number(req.body.interaction);
		var understanding = data[0]._doc.understanding;
		understanding += Number(req.body.understanding);
		var tackling = data[0]._doc.tackling;
		tackling += Number(req.body.tackling);
		var listening = data[0]._doc.listening;
		listening += Number(req.body.listening);
		var participation = data[0]._doc.participation;
		participation += Number(req.body.participation);
		var punctuality = data[0]._doc.punctuality;
		punctuality += Number(req.body.punctuality);
		var creativity = data[0]._doc.creativity;
		creativity += Number(req.body.creativity);
		var curiosity = data[0]._doc.curiosity;
		curiosity += Number(req.body.curiosity);
		var counter = data[0]._doc.ratingNumber;
		counter++;
		
		
		
			
			Student.update(query,{
				discipline:discipline,
				interaction:interaction,
				understanding:understanding,
				tackling:tackling,
				listening:listening,
				participation:participation,
				punctuality:punctuality,
				creativity:creativity,
				curiosity:curiosity,
				ratingNumber : counter
			}  , function (err,data) {

				res.redirect('/teacherOauth/teacherDashboard.html');
				return;
			})

		
		


	})
})

router.get('/getExams',function (req,res) {
	Exam.find({school : req.user._doc.school},function (err,data) {

		var obj={};
		for(var j=0;j<data.length;j++){


			var ans = data[j]._doc.class;
			var data2 = req.user._doc.class_section;
			var ans2=[];
			for(var i=0;i<data2.length;i++){
				ans2.push(data2[i].split("-")[0]);

			}

			console.log(ans2);
			var dataF = ans.filter(value => -1 !== ans2.indexOf(value));
			console.log(dataF);
			var ret = [];
			for(var i=0;i<data2.length ; i++){
				for(var k=0;k<dataF.length;k++){
					var temp = data2[i].search(dataF[j]);
					if(temp == -1){

					}
					else{
						ret.push(data2[i]);
					}
				}
			}
			obj[`${data[j]._doc.name}`.trim()] =  ret;


		}
		res.json(obj);

	})
})


router.post('/uploadAssignment',function (req,res) {
	uploadAssignment(req, res, function (err) {
		if (err) {
			// An error occurred when uploading
			console.log(err);
			return;
		}
		console.log(req);
		var newAssignment = new Assignment();
		newAssignment.topic = req.body.topic;
		newAssignment.filePath = req.file.path;
		newAssignment.deadline = req.body.deadline;
		newAssignment.description = req.body.description;
		newAssignment.teacherFirstname = req.user._doc.firstname;
		newAssignment.teacherLastname = req.user._doc.lastname;
		newAssignment.school = req.user._doc.school;
		var classarr =[];
		var ans1 = req.body.class_section;
		classarr = ans1.split(',');
		newAssignment.class_section = classarr;


		newAssignment.save(function (err) {
			if(err) throw (err);

			res.redirect('/teacherOauth/teacherDashboard.html');
		})
	})
})


router.get('/logout',function (req,res) {

    req.logout();
    res.redirect('/');
})

router.post('/changePassword',function (req,res) {

    var email = req.body.email;
    if(req.body.type == "Teacher"){
    	Teacher.findOne({email:req.body.email},function (err,data) {
    		console.log(data);
    		var newPass = Math.random().toString(36).substring(7);

			console.log(newPass);
		    var temp =  bcrypt.hashSync(newPass,bcrypt.genSaltSync(10),null);
		    Teacher.findOneAndUpdate({email:req.body.email}, {$set:{password:temp}}, {new: true}, function(err, doc){
			    if(err){
				    console.log("Something wrong when updating data!");
			    }
			    var mailOptions = {
				    from: 'focado11@gmail.com',
				    to: `${req.body.email}`,
				    subject: 'password changed',
				    text: `New Password set to ${newPass}`
			    };

			    transporter.sendMail(mailOptions, function(error, info){
				    if (error) {
					    console.log(error);
				    } else {
					    console.log('Email sent: ' + info.response);
					    res.redirect('/');
				    }
			    })

		    });


	    })
    }
    else if(req.body.type == "Student"){
	    Student.findOne({email:req.body.email},function (err,data) {
		    console.log(data);
		    var newPass = Math.random().toString(36).substring(7);

		    console.log(newPass);
		    var temp =  bcrypt.hashSync(newPass,bcrypt.genSaltSync(10),null);
		    Student.findOneAndUpdate({email:req.body.email}, {$set:{password:temp}}, {new: true}, function(err, doc){
			    if(err){
				    console.log("Something wrong when updating data!");
			    }
			    var mailOptions = {
				    from: 'focado11@gmail.com',
				    to: `${req.body.email}`,
				    subject: 'password changed',
				    text: `New Password set to ${newPass}`
			    };

			    transporter.sendMail(mailOptions, function(error, info){
				    if (error) {
					    console.log(error);
				    } else {
					    console.log('Email sent: ' + info.response);
					    res.redirect('/');
				    }
			    })

		    });


	    })
    }
    else{
	    School.findOne({email:req.body.email},function (err,data) {
		    console.log(data);
		    var newPass = Math.random().toString(36).substring(7);

		    console.log(newPass);
		    var temp =  bcrypt.hashSync(newPass,bcrypt.genSaltSync(10),null);
		    School.findOneAndUpdate({email:req.body.email}, {$set:{password:temp}}, {new: true}, function(err, doc){
			    if(err){
				    console.log("Something wrong when updating data!");
			    }
			    var mailOptions = {
				    from: 'focado11@gmail.com',
				    to: `${req.body.email}`,
				    subject: 'password changed',
				    text: `New Password set to ${newPass}`
			    };

			    transporter.sendMail(mailOptions, function(error, info){
				    if (error) {
					    console.log(error);
				    } else {
					    console.log('Email sent: ' + info.response);
					    res.redirect('/');
				    }
			    })

		    });


	    })
    }


})

router.post('/healthForm',isStudent,function(req,res){
	var newHealthForm = {};
	var query = {'admissionNumber':req.user._doc.admissionNumber,'school':req.user._doc.school};
	console.log(query);
	newHealthForm.admissionNumber = req.user._doc.admissionNumber;
	newHealthForm.school = req.user._doc.school;
	newHealthForm.bloodGroup = req.body.bloodGroup;
	newHealthForm.allergy = req.body.allergy;
	newHealthForm.chronicDisease = req.body.chronicDisease;
	newHealthForm.regularMedicine = req.body.regularMedicine;
	newHealthForm.tetanus = req.body.tetanus;
	newHealthForm.vaccinationCompleted = req.body.vaccinationCompleted;
	newHealthForm.fathersName = req.body.fathersName;
	newHealthForm.fathersNumber = req.body.fathersNumber;
	newHealthForm.mothersName = req.body.mothersName;
	newHealthForm.mathersNumber = req.body.mathersNumber;
	newHealthForm.doctorsName = req.body.doctorsName;
	newHealthForm.doctorsNumber = req.body.doctorsNumber;
	newHealthForm.fitToParticipate = req.body.fitToParticipate;
	healthForm.findOneAndUpdate(query,newHealthForm,{upsert:true},function(err, doc){
		if (err) return res.send(500, { error: err });
		return res.send("succesfully saved");
	})
})

router.post('/getMedicalForm',function(req,res){
	var query = {'admissionNumber':req.body.admissionNumber,'school':req.user._doc.name};
	console.log(req);
	healthForm.find(query,function(err,user){
		if(err) throw err;
		res.json(user);
	})
})

router.get('/teacherAssignmentClass',isTeacher,function (req,res) {
	res.json(req.user._doc.class_section);
})

router.post('/blog',function(req,res){
	var newBlog = new blog();
	newBlog.title = req.body.title;
	newBlog.content = req.body.content;
	newBlog.name = req.body.name;
	newBlog.date = req.body.date;
	newBlog.school = req.user._doc.name

	newBlog.save(function (err) {
		if(err) throw (err);

		res.redirect('/schoolOauth/schoolDashboard.html');
	})
})

router.get('/blog',function(req,res){
	blog.find({school: req.user._doc.school}).limit(10).exec(function(err,data){
		if(err) throw err;
		res.json(data);

	})
})

router.post('/dataUpload',function (req,res) {
	console.log(req);
	var query = {class_section : req.body.class ,
				subject: req.body.subject,
		school: req.user._doc.school
	}
	Student.find(query,function (err,data) {
		var arr = [];
		for(var i=0;i<data.length;i++){
			var obj ={};
			obj.nameStudent = data[i]._doc.firstname + ' ' + data[i]._doc.lastname;
			obj.id = String(data[i]._doc._id);
			arr.push(obj);
		}
		res.json(arr);
	})
})





function isSchool(req,res,next) {
	//console.log(req);
	if(!req.user){
		return res.redirect('/login')
	}
	if (req.user._doc.typeOf == 'School') { return next(); }
	res.redirect('/login') // to do
}

function isTeacher(req,res,next){
	if(!req.user){
		return res.redirect('/teacher-login')
	}
	if (req.user._doc.typeOf == 'Teacher') { return next(); }
	res.redirect('/teacher-login') // to do
}

function isStudent(req,res,next) {
	if(!req.user){
		return res.redirect('/student-login')
	}
	if (req.user._doc.typeOf == 'Student') { return next(); }
    res.redirect('/student-login') // to do
}

module.exports = router;


//http://localhost:3000/uploads/notice_uploads/notice-1533308933304.jpg
