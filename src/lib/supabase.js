import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://liscnaemgpccbiryqyww.supabase.co';
const supabaseKey = 'sb_publishable_dwBSMiBnx5uLTfpW7HYdUg_6_R6UYQh';

export const supabase = createClient(supabaseUrl, supabaseKey);