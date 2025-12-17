import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Input } from '../common/Input';
import { Button } from '../common/Button';

/**
 * CreateSessionModal - Modal for creating a new WhatsApp session
 * Requirements: 3.1
 */

interface CreateSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (sessionId: string, name?: string) => Promise<boolean>;
  isLoading: boolean;
}

export function CreateSessionModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
}: CreateSessionModalProps) {
  const [sessionId, setSessionId] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate session ID
    const trimmedId = sessionId.trim();
    if (!trimmedId) {
      setError('Session ID is required');
      return;
    }

    // Validate format (alphanumeric, hyphens, underscores)
    const sessionIdRegex = /^[a-zA-Z0-9_-]+$/;
    if (!sessionIdRegex.test(trimmedId)) {
      setError('Session ID must contain only letters, numbers, hyphens, and underscores');
      return;
    }

    const success = await onSubmit(trimmedId, name.trim() || undefined);
    
    if (success) {
      // Reset form and close
      setSessionId('');
      setName('');
      setError('');
      onClose();
    }
  };

  const handleClose = () => {
    setSessionId('');
    setName('');
    setError('');
    onClose();
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 shadow-xl transition-all">
                <div className="flex items-center justify-between mb-4">
                  <Dialog.Title className="text-lg font-semibold text-gray-900 dark:text-white">
                    Create New Session
                  </Dialog.Title>
                  <button
                    onClick={handleClose}
                    className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>


                <form onSubmit={handleSubmit} className="space-y-4">
                  <Input
                    label="Session ID"
                    placeholder="my-whatsapp-session"
                    value={sessionId}
                    onChange={(e) => setSessionId(e.target.value)}
                    error={error}
                    required
                    autoFocus
                  />

                  <Input
                    label="Display Name (optional)"
                    placeholder="My WhatsApp"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />

                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    The session ID is used to identify this WhatsApp connection. 
                    Use only letters, numbers, hyphens, and underscores.
                  </p>

                  <div className="flex justify-end gap-3 pt-4">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={handleClose}
                      disabled={isLoading}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      isLoading={isLoading}
                    >
                      Create Session
                    </Button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

export default CreateSessionModal;
