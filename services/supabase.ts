import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dxskcjtyigphizptafyj.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR4c2tjanR5aWdwaGl6cHRhZnlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI1NDgxNDgsImV4cCI6MjA3ODEyNDE0OH0.8ZIJrvtYtsUlsQPvXdOrh28cQLjVyw9TDyzG01jswYU';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
