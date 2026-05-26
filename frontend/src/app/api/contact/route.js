import connectDB from '@/lib/mongodb';
import ContactMessage from '@/models/ContactMessage';
import Notification from '@/models/Notification';

export async function POST(req) {
  try {
    await connectDB();
    const data = await req.json();

    const contactMsg = await ContactMessage.create({
      name: data.name,
      phone: data.phone || '',
      email: data.email,
      topic: data.topic,
      message: data.message
    });

    // Create a detailed notification for the admin
    await Notification.create({
      isAdmin: true,
      title: `New Contact Request: ${data.topic}`,
      message: `Name: ${data.name}\nEmail: ${data.email}\nPhone: ${data.phone || 'N/A'}\n\nMessage:\n${data.message}`,
      type: 'wholesale_inquiry', // reused for contact messages
    });

    return Response.json({ success: true, message: 'Message sent successfully.' }, { status: 201 });
  } catch (error) {
    console.error('Error in contact form submission:', error);
    return Response.json({ message: 'Internal Server Error', error: error.message }, { status: 500 });
  }
}
