const admin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    return res.status(403).json({ 
      message: "אין לך הרשאה לביצוע פעולה זו - נדרש חשבון מנהל" 
    });
  }
};

module.exports = { admin };