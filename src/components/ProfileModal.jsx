import AccountModal from './AccountModal';

export default function ProfileModal({ isOpen, onClose, initialTab = 'edit' }) {
  return (
    <AccountModal 
      isOpen={isOpen} 
      onClose={onClose} 
      initialTab={initialTab} 
    />
  );
}

