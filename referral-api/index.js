const express = require('express');
const { PrismaClient } = require('@prisma/client');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
require('dotenv').config();

const prisma = new PrismaClient();
const app = express();
app.use(bodyParser.json());

app.post('/referrals', async (req, res) => {
  const { referrerName, referrerEmail, refereeName, refereeEmail } = req.body;

  // Validate input
  if (!referrerName || !referrerEmail || !refereeName || !refereeEmail) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    // Save referral to database
    const referral = await prisma.referral.create({
      data: {
        referrerName,
        referrerEmail,
        refereeName,
        refereeEmail,
      },
    });

    // Send referral email
    await sendReferralEmail(referrerName, referrerEmail, refereeName, refereeEmail);

    res.status(201).json(referral);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

async function sendReferralEmail(referrerName, referrerEmail, refereeName, refereeEmail) {
  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
  });

  let mailOptions = {
    from: process.env.GMAIL_USER,
    to: refereeEmail,
    subject: 'Course Referral',
    text: `${referrerName} (${referrerEmail}) has referred you for a course.`
  };

  await transporter.sendMail(mailOptions);
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
