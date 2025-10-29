import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Mail, Check } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface ClientInviteButtonProps {
  clientId: string;
  clientEmail: string;
  clientName: string;
  coachName: string;
  invitationSentAt?: string;
}

export function ClientInviteButton({ 
  clientId, 
  clientEmail, 
  clientName, 
  coachName,
  invitationSentAt 
}: ClientInviteButtonProps) {
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(!!invitationSentAt);

  const sendInvitation = async () => {
    setSending(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase.functions.invoke('send-client-invitation', {
        body: {
          clientId,
          clientEmail,
          clientName,
          coachName
        },
        headers: {
          'x-user-id': user?.id
        }
      });

      if (error) throw error;

      setSent(true);
      toast.success('Invitation sent!', {
        description: `${clientName} will receive an email to access their portal.`
      });
    } catch (error) {
      console.error('Error sending invitation:', error);
      toast.error('Failed to send invitation');
    } finally {
      setSending(false);
    }
  };

  return (
    <Button
      onClick={sendInvitation}
      disabled={sending || sent}
      variant={sent ? "outline" : "default"}
      size="sm"
    >
      {sent ? (
        <>
          <Check className="h-4 w-4 mr-2" />
          Invited
        </>
      ) : (
        <>
          <Mail className="h-4 w-4 mr-2" />
          {sending ? 'Sending...' : 'Send Invite'}
        </>
      )}
    </Button>
  );
}
