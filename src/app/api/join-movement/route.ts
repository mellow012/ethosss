import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sendNotificationEmail } from "@/lib/nodemailer";
import { createNotification, notifyAdmins } from "@/lib/notifications";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, name, email, phone, message, skills } = body;

    if (!type || !name || !email || !message) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    const application = await db.involvement.create({
      data: {
        type,
        name,
        email,
        phone,
        message,
        skills,
        userId,
      },
    });

    // Send Email Notification
    await sendNotificationEmail({
      to: 'contact.ethosss@gmail.com',
      subject: `New ${type.toUpperCase()}: ${name}`,
      text: `
        New ${type} received from ${name}.
        
        Details:
        - Name: ${name}
        - Email: ${email}
        - Phone: ${phone || 'N/A'}
        - Message: ${message}
        - Skills/Info: ${skills || 'N/A'}
      `,
    });

    // Create In-App Notification if user is logged in
    if (userId) {
      try {
        await createNotification({
          userId,
          title: 'Submission Received',
          message: `Thank you for your ${type} submission! We have received your message and will get back to you soon.`,
          type: 'success'
        });
      } catch (notifErr) {
        console.error("Failed to send in-app notification:", notifErr);
      }
    }

    // Notify Admins
    try {
      await notifyAdmins({
        title: `New ${type} Application`,
        message: `${name} has submitted a ${type} application.`,
        type: 'info',
        link: '/admin?tab=overview'
      });
    } catch (adminNotifErr) {
      console.error("Failed to notify admins:", adminNotifErr);
    }

    return NextResponse.json({ success: true, application });
  } catch (error: any) {
    console.error("Join Movement POST error:", error);
    return NextResponse.json(
      { error: "Failed to submit application", details: error.message },
      { status: 500 }
    );
  }
}
