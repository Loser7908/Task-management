const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendTaskUpdateNotification = async (adminEmail, taskTitle, updatedBy) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: adminEmail,
      subject: 'Task Update Notification',
      html: `
        <h2>Task Update Alert</h2>
        <p>The task "${taskTitle}" has been updated by ${updatedBy}.</p>
        <p>Please check the task management system for more details.</p>
      `
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Email sending failed:', error);
    throw new Error('Failed to send email notification');
  }
};

module.exports = {
  sendTaskUpdateNotification
}; 