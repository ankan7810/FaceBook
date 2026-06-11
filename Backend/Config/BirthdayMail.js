import nodemailer from "nodemailer";
import dotenv from "dotenv";

 dotenv.config({ path: "./.env" });

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export const sendBirthdayMail = async (
  recipientEmail,
  recipientName,
  birthdayPersonName,
  isBirthdayPerson = false
) => {
  let subject;
  let html;

  if (isBirthdayPerson) {
    subject = "🎉 Happy Birthday!";
    html = `
      <h2>Happy Birthday ${recipientName}! 🎂</h2>
      <p>Wishing you a fantastic year ahead.</p>
    `;
  } else {
    subject = `🎂 Today is ${birthdayPersonName}'s Birthday`;
    html = `
      <h2>${birthdayPersonName}'s Birthday 🎉</h2>
      <p>Don't forget to wish them!</p>
    `;
  }

  await transporter.sendMail({
    from: process.env.EMAIL,
    to: recipientEmail,
    subject,
    html,
  });
};
