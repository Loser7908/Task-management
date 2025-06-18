// utils/mailer.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

exports.sendTaskUpdateEmail = async (to, task) => {
  // Populate the lastUpdatedBy field if it exists
  let updatedByInfo = 'Unknown user';
  if (task.lastUpdatedBy) {
    try {
      const User = require('../models/User');
      const updater = await User.findById(task.lastUpdatedBy);
      if (updater) {
        updatedByInfo = updater.email;
      }
    } catch (error) {
      console.error('Error fetching updater info:', error.message);
    }
  }

  const mailOptions = {
    from: `"Task Manager" <${process.env.EMAIL_USER}>`,
    to,
    subject: `Task Updated: ${task.title}`,
    text: `The task "${task.title}" has been updated by ${updatedByInfo}.

New Status: ${task.status}
Due Date: ${new Date(task.dueDate).toLocaleDateString()}
Description: ${task.description}
`,
    html: `
      <h2>Task Updated</h2>
      <p><strong>Task:</strong> ${task.title}</p>
      <p><strong>Updated by:</strong> ${updatedByInfo}</p>
      <p><strong>New Status:</strong> ${task.status}</p>
      <p><strong>Due Date:</strong> ${new Date(task.dueDate).toLocaleDateString()}</p>
      <p><strong>Description:</strong> ${task.description}</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('📧 Task update email sent to', to);
  } catch (error) {
    console.error('❌ Failed to send email:', error.message);
  }
};
