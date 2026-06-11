import cron from "node-cron";
import { User } from "../Models/User.Models.js";
import { sendBirthdayMail } from "../Config/BirthdayMail.js";
// import { sendBirthdayMail } from "../Config/BirthdayMail.js";

cron.schedule("0 0 * * *", async () => {
  try {
    const today = new Date();

    const day = today.getDate();
    const month = today.getMonth();

    const users = await User.find();

    const birthdayUsers = users.filter((user) => {
      const dob = new Date(user.dateofBirth);

      return (
        dob.getDate() === day &&
        dob.getMonth() === month
      );
    });

    if (!birthdayUsers.length) return;

    for (const birthdayUser of birthdayUsers) {
      for (const user of users) {
        await sendBirthdayMail(
          user.email,
          user.firstname,
          `${birthdayUser.firstname} ${birthdayUser.lastname}`,
          user._id.toString() === birthdayUser._id.toString()
        );
      }
    }

    console.log("Birthday mails sent");
  } catch (error) {
    console.log(error);
  }
});