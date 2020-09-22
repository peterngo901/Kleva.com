// Form Validation
const { validationResult } = require('express-validator')

// Password Encryption/Decryption
const bcrypt = require('bcryptjs')

// Models
const Teacher = require('../models/teacher');
const Creator = require('../models/creator');
/////////////////////////////////////////////////////////////////////////

// Teacher Authentication

exports.getTeacherSignup = (req, res, next) => { 
    res.render('teacher/teacher-signup', { // Teacher Signup Page.
        error: '',
        path: '/teacher-signup',
        pageTitle: 'Sign Up'
    })
}

exports.postTeacherSignup = (req, res, next) => {
    const email = req.body.username
    const school = req.body.school
    const password = req.body.password
    const firstName = req.body.firstName
    const lastName = req.body.lastName
    const postcode = req.body.postcode

    // Form Validation errors defined in (../routes/authenticated) router.postTeacherSignup().
    const errors = validationResult(req);

    const existingTeacher = Teacher.findOne({ where: {email: email } }) // Check if email exists in database, Teacher table.
    .then(existingTeacher => { 
        if(existingTeacher){ // Email already exists.
            return res.status(422).render('teacher/teacher-signup', {
                error: 'An account with this email already exists!',
                path: '/teacher-signup',
                pageTitle: 'Sign Up'
            })
        }
        // Email does not exist.
        return bcrypt.hash(password, 12).then(hashedPassword => { // Hash the password
            req.session.isLoggedIn = true;
            req.session.user = email; // Set session data to include the teacher email, helps us persist login state.
            
            Teacher.create({ // Create a new teacher in the teacher table.
                email: email,
                school: school,
                password: hashedPassword,
                firstName: firstName,
                lastName: lastName,
                postcode: postcode
            }).then(() => { // Render the teacher dashboard.
                res.status(202).redirect('/teacher-dashboard')
            }).catch(err => { // Error when inserting the teacher in the database.
                console.log(err);
                res.redirect('/');
            })
        })
    }).catch(err => { // Error when trying to find the email in the database.
        console.log(err);
        res.redirect('/');
    })
}

exports.getTeacherSignin = (req, res, next) => {
    res.render('teacher/teacher-signin', { // Teacher Signin Page.
        error: '',
        path: '/teacher-signin',
        pageTitle: 'Sign In'
    })
}

exports.postTeacherSignin = (req, res, next) => {
    const email = req.body.username;
    const password = req.body.password;
    Teacher.findOne({ where: {email: email }}) // Check to see if the email exists in the teacher table.
    .then((teacher) => {
        if(!teacher){  // Email does not exist.
            return res.redirect('/teacher-signin')
        }
        // Email does exist.
        bcrypt.compare(password, teacher.password) // Compare the password entered in the form with our database hashed password.
        .then(passwordMatch => {
            if(passwordMatch) { // Correct Password
                // Set the Session
                req.session.isLoggedIn = true;
                req.session.user = email;
                return res.redirect('/teacher-dashboard')
            }
            // Incorrect Password
            return res.redirect('/teacher-signin') // Redirect to the signin page.
        })
        .catch(err => {
            return res.redirect('/teacher-signin') // Redirect to the signin page.
        })
    })
}

/////////////////////////////////////////////////////////////////////////

// Creator Authentication

exports.getCreatorSignup = (req, res, next) => {
    res.render('creator/creator-signup', { // Creator Signup Page.
        error: '',
        path: '/creator-signup',
        pageTitle: 'Sign Up'
    })
}

exports.postCreatorSignup = (req, res, next) => {
    const email = req.body.username
    const companyName = req.body.companyName
    const password = req.body.password
   

    // Form Validation errors defined in (../routes/authenticated) router.postTeacherSignup().
    const errors = validationResult(req);

    const existingCreator = Creator.findOne({ where: {email: email } }) // Check if email exists in database, Teacher table.
    .then(existingCreator => { 
        if(existingCreator){ // Email already exists.
            return res.status(422).render('creator/creator-signup', {
                error: 'An account with this email already exists!',
                path: '/creator-signup',
                pageTitle: 'Sign Up'
            })
        }
        // Email does not exist.
        return bcrypt.hash(password, 12).then(hashedPassword => { // Hash the password
            req.session.isLoggedIn = true;
            req.session.user = email; // Set session data to include the teacher email, helps us persist login state.
            
            Creator.create({ // Create a new teacher in the teacher table.
                email: email,
                companyName: companyName,
                password: hashedPassword
            }).then(() => { // Render the teacher dashboard.
                res.status(202).redirect('/creator-dashboard')
            }).catch(err => { // Error when inserting the teacher in the database.
                res.redirect('/');
            })
        })
    }).catch(err => { // Error when trying to find the email in the database.
        res.redirect('/');
    })
}


exports.getCreatorSignin = (req, res, next) => {
    res.render('creator/creator-signin', { // Creator Signin Page.
        error: '',
        path: '/creator-signin',
        pageTitle: 'Sign In'
    })
}


exports.postCreatorSignin = (req, res, next) => {
    const email = req.body.username;
    const password = req.body.password;
    Creator.findOne({ where: {email: email }}) // Check to see if the email exists in the teacher table.
    .then((creator) => {
        if(!creator){  // Email does not exist.
            return res.redirect('/creator-signin')
        }
        // Email does exist.
        bcrypt.compare(password, creator.password) // Compare the password entered in the form with our database hashed password.
        .then(passwordMatch => {
            if(passwordMatch) { // Correct Password
                // Set the Session
                req.session.isLoggedIn = true;
                req.session.user = email;
                return res.redirect('/creator-dashboard')
            }
            // Incorrect Password
            return res.redirect('/creator-signin') // Redirect to the signin page.
        })
        .catch(err => {
            return res.redirect('/creator-signin') // Redirect to the signin page.
        })
    })
}

/////////////////////////////////////////////////////////////////////////


/////////////////////////////////////////////////////////////////////////

// Student Authentication

////////////////////////////////////////////////////////////////////////