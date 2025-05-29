const nodemailer = require('nodemailer');

// Create transporter with Gmail SMTP
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.CONTACT_EMAIL || 'project.kresta@gmail.com',
        pass: process.env.CONTACT_EMAIL_PASSWORD || 'kresta04'
    }
});

// @route POST /api/contact
exports.sendContactMessage = async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;

        // Validate required fields
        if (!name || !email || !subject || !message) {
            return res.status(400).json({ 
                success: false, 
                message: "All fields are required" 
            });
        }        // Email options
        const mailOptions = {
            from: process.env.CONTACT_EMAIL || 'project.kresta@gmail.com',
            to: process.env.CONTACT_EMAIL || 'project.kresta@gmail.com',
            subject: `Contact Form: ${subject}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                    <h2 style="color: #333; text-align: center; margin-bottom: 30px;">New Contact Form Submission</h2>
                    
                    <div style="background-color: #f9f9f9; padding: 20px; border-radius: 5px; margin-bottom: 20px;">
                        <h3 style="color: #555; margin-top: 0;">Contact Details</h3>
                        <p><strong>Name:</strong> ${name}</p>
                        <p><strong>Email:</strong> ${email}</p>
                        <p><strong>Subject:</strong> ${subject}</p>
                    </div>
                    
                    <div style="background-color: #fff; padding: 20px; border-left: 4px solid #007bff;">
                        <h3 style="color: #555; margin-top: 0;">Message</h3>
                        <p style="line-height: 1.6; white-space: pre-wrap;">${message}</p>
                    </div>
                    
                    <div style="margin-top: 30px; text-align: center; color: #888; font-size: 12px;">
                        <p>This message was sent from the Project Kresta contact form.</p>
                        <p>Timestamp: ${new Date().toLocaleString()}</p>
                    </div>
                </div>
            `
        };

        // Send email
        await transporter.sendMail(mailOptions);        // Send confirmation email to the sender
        const confirmationMailOptions = {
            from: process.env.CONTACT_EMAIL || 'project.kresta@gmail.com',
            to: email,
            subject: 'Thank you for contacting Project Kresta',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                    <h2 style="color: #333; text-align: center; margin-bottom: 30px;">Thank You for Reaching Out!</h2>
                    
                    <div style="background-color: #f9f9f9; padding: 20px; border-radius: 5px; margin-bottom: 20px;">
                        <p>Dear ${name},</p>
                        <p>Thank you for contacting Project Kresta. We have received your message and will get back to you as soon as possible.</p>
                    </div>
                    
                    <div style="background-color: #fff; padding: 20px; border-left: 4px solid #007bff;">
                        <h3 style="color: #555; margin-top: 0;">Your Message Summary</h3>
                        <p><strong>Subject:</strong> ${subject}</p>
                        <p><strong>Message:</strong></p>
                        <p style="line-height: 1.6; white-space: pre-wrap;">${message}</p>
                    </div>
                    
                    <div style="margin-top: 30px; text-align: center;">
                        <p style="color: #555;">Follow us on social media:</p>
                        <div style="margin: 20px 0;">
                            <a href="https://instagram.com/projectkresta" style="text-decoration: none; color: #007bff; margin: 0 10px;">Instagram</a>
                            <a href="https://facebook.com/projectkresta" style="text-decoration: none; color: #007bff; margin: 0 10px;">Facebook</a>
                            <a href="https://linkedin.com/company/projectkresta" style="text-decoration: none; color: #007bff; margin: 0 10px;">LinkedIn</a>
                        </div>
                    </div>
                    
                    <div style="margin-top: 30px; text-align: center; color: #888; font-size: 12px;">
                        <p>Best regards,<br>The Project Kresta Team</p>
                        <p>© 2025 Project Kresta. All rights reserved.</p>
                    </div>
                </div>
            `
        };

        await transporter.sendMail(confirmationMailOptions);

        res.json({ 
            success: true, 
            message: "Message sent successfully! We'll get back to you soon." 
        });

    } catch (error) {
        console.error("Error sending contact message:", error);
        res.status(500).json({ 
            success: false, 
            message: "Failed to send message. Please try again later." 
        });
    }
};
