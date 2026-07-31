import { supabase } from '../lib/supabase';

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  body: string;
  read: boolean;
  created_at: string;
}

export const NotificationService = {
  getUserNotifications: async (userId: string) => {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data as Notification[];
  },

  markAsRead: async (id: string) => {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', id);
      
    if (error) throw error;
  },
  
  createNotification: async (notificationData: Omit<Notification, 'id' | 'created_at' | 'read'>) => {
    const { data, error } = await supabase
      .from('notifications')
      .insert([notificationData])
      .select()
      .single();
      
    if (error) throw error;
    return data as Notification;
  }
};
