import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sendNotificationEmail } from "@/lib/nodemailer";
import { createNotification } from "@/lib/notifications";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized. Please log in to become a member." }, { status: 401 });
    }

    const body = await request.json();
    const { planId } = body;

    if (!planId) {
      return NextResponse.json({ error: "Plan ID is required" }, { status: 400 });
    }

    // Check if user already has an active membership
    const existingMembership = await db.membership.findFirst({
      where: {
        userId: session.user.id,
        status: 'active'
      }
    });

    if (existingMembership) {
      // For now, we update it or return error. Let's return error for simplicity.
      return NextResponse.json({ error: "You already have an active membership." }, { status: 400 });
    }

    const membership = await db.membership.create({
      data: {
        userId: session.user.id,
        planId,
        status: 'active',
        startDate: new Date(),
      },
    });

    // Create In-App Notification
    try {
      await createNotification({
        userId: session.user.id,
        title: 'Welcome to the Movement!',
        message: `Your ${planId} membership is now active. Thank you for supporting the Ethosss mission!`,
        type: 'success',
        link: '/dashboard'
      });
    } catch (notifErr) {
      console.error("Failed to send in-app notification:", notifErr);
    }

    // Send Email Notification
    await sendNotificationEmail({
      to: 'contact.ethosss@gmail.com',
      subject: `New Member Joined: ${session.user.name || session.user.email}`,
      text: `
        A new member has joined Ethosss!
        
        Details:
        - Member Name/Email: ${session.user.name || session.user.email}
        - Plan: ${planId}
        - Status: Active
      `,
    });

    return NextResponse.json({ success: true, membership });
  } catch (error: any) {
    console.error("Membership POST error:", error);
    return NextResponse.json(
      { error: "Failed to process membership", details: error.message },
      { status: 500 }
    );
  }
}
