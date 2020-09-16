const Classroom = require('../models/classroom');
const { v4: uuidv4 } = require('uuid');
const firebaseAdmin = require('../authentication/firebase');


exports.postAddClassroom = (req, res, next) => {
    const sessionCookie = req.cookies.session || '';
    const user = firebaseAdmin.auth().currentUser;
    const title = req.body.title;
    const yearLevel = req.body.yearLevel;
    const subject = req.body.subject;
    const classCode = uuidv4();
    const teacherID = user.uid;

    
    firebaseAdmin.auth().verifySessionCookie(sessionCookie, true).then(() => {
        Classroom.create({
            teacherID: teacherID,
            classCode: classCode,
            subject: subject,
            yearLevel: yearLevel,
            title: title
       }).catch(err => {
           console.log(err);
           res.redirect('/');
       })
    })
}

exports.getTeacherDashboard = (req, res, next) => {
    const sessionCookie = req.cookies.session || '';
    // Store the session cookie on the database.
    
    firebaseAdmin.auth().verifySessionCookie(sessionCookie, true)
    .then((decodedClaims) => {
        //return serveContentForUser('/profile', req, res, decodedClaims);
        console.log(decodedClaims)
        res.render('teacher/teacher-dashboard')
    }).catch((err) => {
        res.redirect('/login');
    })
}