const Classroom = require('../models/classroom');
const { v4: uuidv4 } = require('uuid');

const Teacher = require('../models/teacher');
const generate = require('nanoid-generate');
const dictionary = require('nanoid-dictionary');


exports.getTeacherDashboard = (req, res, next) => {
    if(req.session.user){
        const email = req.session.user;
        // Also Search the Classroom Table with matching teacherID.
        Classroom.findAll({
            
            where: {
                teacherID: email
            },
            attributes: ['classCode', 'yearLevel', 'title', 'subject']
        }).then((classrooms) => {
            console.log(classrooms)
            Teacher.findOne({ where: {email: email } })
            .then(teacher => {
                res.render('teacher/teacher-dashboard', {
                    path: '/teacher-dashboard',
                    name: teacher.firstName,
                    classrooms: classrooms
                })  
            }).catch(err => res.redirect('/teacher-signin'))
        }).catch((err) => {
            res.redirect('/')
        })
        
    } else {
        res.redirect('/')
    }
}

exports.postAddClassroom = (req, res, next) => {
    const className = req.body.className
    const yearLevel = req.body.yearLevel
    const subject = req.body.subject
    // Easy to Remember Single Classcode Signon for High Schoolers
    const classCode = generate.english(8);
    
    Classroom.create({
        teacherID: req.session.user,
        classCode: classCode,
        subject: subject,
        yearLevel: yearLevel,
        title: className
    }).catch(err => {
        console.log(err);
        res.redirect('/');
    }).then(() => {
        res.redirect('/teacher-dashboard')
    })
    
}


exports.getTeacherStudents = (req, res, next) => {
    if(req.session.user){
        const email = req.session.user;
        // First find the teacherID from the teacher email on the Teacher Table.
        // Return all students from the Student Table with the matching teacherID.
        res.render('teacher/teacher-students', {
            path: '/teacher-students'
        })
    } else {
        res.redirect('/')
    }
}

exports.getClassroom = (req, res, next) => {
    
    if(req.session.user) {
        const classCode = req.params.classroomCode;
        Classroom.findOne({classCode: classCode})
        .then((classRoom) => {
            console.log(classRoom)
            res.render('teacher/teacher-classroom', {
                games: classRoom,
                path: '/teacher-dashboard'
            })
        })
    } else {
        res.redirect('/');
    }
}

exports.postDeleteClassroom = (req, res, next) => {
    if(req.session.user){
        const classCode = req.body.classCode
        Classroom.destroy({
            where: {
                classCode: classCode
            }
        }).then(() => {
            res.redirect('/teacher-dashboard')
        })
    } else {
        res.redirect('/');
    }
}