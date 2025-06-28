// supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gzgzfdiiebqhyqgoyvup.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd6Z3pmZGlpZWJxaHlxZ295dnVwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEwNzkyMDMsImV4cCI6MjA2NjY1NTIwM30.8qZZ6K0FewENIBlpdu342pr2VyDbEoVHiTu0igqpn7M';

export const supabase = createClient(supabaseUrl, supabaseKey); 