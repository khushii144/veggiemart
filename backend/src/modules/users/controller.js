import bcrypt from 'bcryptjs';
import { json } from '../../lib/response.js';
import { User, connectDB } from './service.js';

export async function POST(req) {
  try {
    await connectDB();
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return json({ message: 'All fields are required' }, { status: 400 });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return json({ message: 'User already exists' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({ name, email, password: hashedPassword });

    return json({ message: 'User registered successfully' }, { status: 201 });
  } catch (error) {
    console.error(error);
    return json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
