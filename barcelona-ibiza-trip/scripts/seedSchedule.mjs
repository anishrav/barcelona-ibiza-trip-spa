import { createClient } from '@supabase/supabase-js';
import schedule from '../seed/schedule.json' assert { type: 'json' };

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(url, key);

const { error } = await supabase.from('schedule').insert(schedule);
if (error) {
  console.error('Error seeding schedule:', error);
  process.exit(1);
}
console.log('Seeded schedule successfully');
