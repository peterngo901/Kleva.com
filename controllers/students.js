




exports.getStudentDashboard = (req, res, next) => {
    const name = req.session.name;
    res.render('student/student-dashboard', {
        path: '/student-dashboard',
        name: name
    });
}