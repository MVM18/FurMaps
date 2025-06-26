// supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://sqpcbhaaxfdpkeembgpr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNxcGNiaGFheGZkcGtlZW1iZ3ByIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1NTk1NDIsImV4cCI6MjA2NjEzNTU0Mn0.QqvLciGYiaMep0YdKEnuHPftLgbV4CoWdCjmXF9DjBY';

export const supabase = createClient(supabaseUrl, supabaseKey); 