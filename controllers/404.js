exports.get404 = (req, res, next) => {
  res.locals.user = req.session.sessionType;
  res.status(404).render('404', { pageTitle: 'Page Not Found' });
};
