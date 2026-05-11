import { supabaseAdmin } from "@/lib/supabase";

export async function createNotification({
  userId,
  title,
  message,
  type = 'info',
  link = null
}: {
  userId: string;
  title: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  link?: string | null;
}) {
  try {
    const { data, error } = await supabaseAdmin
      .from('Notification')
      .insert({
        id: crypto.randomUUID(),
        userId,
        title,
        message,
        type,
        link,
        isRead: false,
        createdAt: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error creating notification:", error);
    return null;
  }
}

export async function notifyAdmins({
  title,
  message,
  type = 'info',
  link = null
}: {
  title: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  link?: string | null;
}) {
  try {
    // Get all admins
    const { data: admins, error: adminError } = await supabaseAdmin
      .from('User')
      .select('id')
      .eq('role', 'admin');

    if (adminError || !admins) throw adminError || new Error("No admins found");

    // Create notifications for each admin
    const notifications = admins.map(admin => ({
      id: crypto.randomUUID(),
      userId: admin.id,
      title,
      message,
      type,
      link,
      isRead: false,
      createdAt: new Date().toISOString()
    }));

    const { error } = await supabaseAdmin
      .from('Notification')
      .insert(notifications);

    if (error) throw error;
  } catch (error) {
    console.error("Error notifying admins:", error);
  }
}
