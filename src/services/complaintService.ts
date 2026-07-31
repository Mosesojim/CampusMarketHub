import { supabase } from '../lib/supabase';

export interface Complaint {
  id: string;
  user_id: string;
  subject: string;
  message: string;
  status: 'pending' | 'resolved' | 'rejected';
  created_at: string;
}

export const ComplaintService = {
  getComplaints: async () => {
    const { data, error } = await supabase
      .from('complaints')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data as Complaint[];
  },

  createComplaint: async (complaintData: Omit<Complaint, 'id' | 'created_at' | 'status'>) => {
    const { data, error } = await supabase
      .from('complaints')
      .insert([complaintData])
      .select()
      .single();
      
    if (error) throw error;
    return data as Complaint;
  },

  updateComplaintStatus: async (id: string, status: Complaint['status']) => {
    const { error } = await supabase
      .from('complaints')
      .update({ status })
      .eq('id', id);
      
    if (error) throw error;
  }
};
