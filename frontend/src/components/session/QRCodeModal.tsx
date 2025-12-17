import { Fragment, useEffect, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { SessionInfo, useSessionStore } from '../../stores/sessionStore';

/**
 * QRCodeModal - Displays QR code for WhatsApp authentication
 * Requirements: 3.2, 9.4
 */

interface QRCodeModalProps {
  session: SessionInfo | null;
  isOpen: boolean;
  onClose: () => void;
}

export function QRCodeModal({ session, isOpen, onClose }: QRCodeModalProps) {
  const [qrData, setQrData] = useState<{ qr: string; qrBase64: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { getQRCode } = useSessionStore();

  // Fetch QR code when modal opens or session changes
  useEffect(() => {
    if (isOpen && session) {
      // First check if session already has QR data
      if (session.qrBase64) {
        setQrData({ qr: session.qrCode || '', qrBase64: session.qrBase64 });
      } else {
        // Fetch from API
        setIsLoading(true);
        getQRCode(session.sessionId).then((data) => {
          setQrData(data);
          setIsLoading(false);
        });
      }
    } else {
      setQrData(null);
    }
  }, [isOpen, session, getQRCode]);

  // Update QR data when session updates (real-time via WebSocket)
  useEffect(() => {
    if (session?.qrBase64) {
      setQrData({ qr: session.qrCode || '', qrBase64: session.qrBase64 });
    }
  }, [session?.qrBase64, session?.qrCode]);

  // Close modal when session becomes connected
  useEffect(() => {
    if (session?.status === 'connected') {
      onClose();
    }
  }, [session?.status, onClose]);

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
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
                    Scan QR Code
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>


                <div className="text-center">
                  {session && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      Session: <span className="font-medium">{session.name || session.sessionId}</span>
                    </p>
                  )}

                  {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                      <p className="mt-4 text-gray-500 dark:text-gray-400">Loading QR code...</p>
                    </div>
                  ) : qrData?.qrBase64 ? (
                    <div className="flex flex-col items-center">
                      <div className="bg-white p-4 rounded-lg">
                        <img
                          src={qrData.qrBase64}
                          alt="WhatsApp QR Code"
                          className="w-64 h-64"
                        />
                      </div>
                      <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                        Open WhatsApp on your phone and scan this QR code
                      </p>
                      <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
                        QR code refreshes automatically
                      </p>
                    </div>
                  ) : session?.status === 'connected' ? (
                    <div className="flex flex-col items-center py-12">
                      <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <p className="mt-4 text-green-600 dark:text-green-400 font-medium">
                        Session Connected!
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center py-12">
                      <p className="text-gray-500 dark:text-gray-400">
                        QR code not available
                      </p>
                      <p className="mt-2 text-sm text-gray-400 dark:text-gray-500">
                        The session may already be connected or still initializing
                      </p>
                    </div>
                  )}
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

export default QRCodeModal;
