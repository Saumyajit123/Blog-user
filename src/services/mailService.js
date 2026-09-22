const transporter = require("../config/mailConfig");

const sendCredentialsMail = async (email, name, password) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM,

    to: email,

    subject: "Your Blog Management Account Credentials",

    html: `
            <h2>Welcome ${name}</h2>

            <p>Your account has been created successfully.</p>

            <p><strong>Login Email:</strong> ${email}</p>

            <p><strong>Password:</strong> ${password}</p>

            <p>Please login and change your password after your first login.</p>

            <br>

            <p>Regards,<br>
            Blog Management System</p>
        `,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = {
  sendCredentialsMail,
};
