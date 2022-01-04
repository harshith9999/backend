const nodemailer = require("nodemailer");

const sendEmail = async (email, subject, text) => {
  try {
    const transporter = nodemailer.createTransport({
      host: 'http://localhost:4000',
      service: 'gmail',
      secure: true,
      auth: {
        user: "harshiith.p@gmail.com",
        pass: "jevpew-3Cucxi-vusfyq",
      },
    });

    await transporter.sendMail({
      from: "harshiith.p@gmail.com",
      to: email,
      subject: subject,
      text: text,
    });
    console.log("email sent sucessfully");
  } catch (error) {
    console.log("email not sent");
    console.log(error);
  }
};

module.exports = sendEmail;