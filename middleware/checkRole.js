// middleware/checkRole.js
const checkRole = (requiredRoles) => {
  return (req, res, next) => {
    const user = req.user; // จาก verifyToken
    if (!user) {
      return res.status(401).json({ message: 'ไม่พบผู้ใช้' });
    }

    // สมมติว่า decoded token มี employee_id และ roles
    const employeeRoles = user.roles ? user.roles.split(',') : [];
    const hasRole = requiredRoles.some((role) => employeeRoles.includes(role));
    if (!hasRole) {
      return res.status(403).json({ message: 'คุณไม่มีสิทธิ์ในการดำเนินการนี้' });
    }
    next();
  };
};

export { checkRole };