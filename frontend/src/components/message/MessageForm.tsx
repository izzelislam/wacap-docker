import { useState, FormEvent } from 'react';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { useMessageStore } from '../../stores/messageStore';
import { SessionInfo } from '../../stores/sessionStore';

/**
 * MessageForm - Form for sending WhatsApp messages
 * Requirements: 4.1, 4.2
 */

type MessageType = 'text' | 'media' | 'location' | 'contact';

interface MessageFormProps {
  session: SessionInfo;
  onSuccess?: () => void;
}

export function MessageForm({ session, onSuccess }: MessageFormProps) {
  const { sendText, sendMedia, sendLocation, sendContact, isLoading, error, clearError } = useMessageStore();
  
  const [messageType, setMessageType] = useState<MessageType>('text');
  const [to, setTo] = useState('');
  
  // Text message fields
  const [message, setMessage] = useState('');
  
  // Media fields
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaBase64, setMediaBase64] = useState('');
  const [mimetype, setMimetype] = useState('image/jpeg');
  const [caption, setCaption] = useState('');
  const [fileName, setFileName] = useState('');
  
  // Location fields
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [locationName, setLocationName] = useState('');
  const [address, setAddress] = useState('');
  
  // Contact fields
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    clearError();

    let success = false;

    switch (messageType) {
      case 'text':
        success = await sendText({
          sessionId: session.sessionId,
          to,
          message,
        });
        break;
      case 'media':
        success = await sendMedia({
          sessionId: session.sessionId,
          to,
          url: mediaUrl || undefined,
          base64: mediaBase64 || undefined,
          mimetype,
          caption: caption || undefined,
          fileName: fileName || undefined,
        });
        break;
      case 'location':
        success = await sendLocation({
          sessionId: session.sessionId,
          to,
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
          name: locationName || undefined,
          address: address || undefined,
        });
        break;
      case 'contact':
        success = await sendContact({
          sessionId: session.sessionId,
          to,
          contact: {
            fullName: contactName,
            phoneNumber: contactPhone,
          },
        });
        break;
    }

    if (success) {
      // Reset form
      setMessage('');
      setMediaUrl('');
      setMediaBase64('');
      setCaption('');
      setFileName('');
      setLatitude('');
      setLongitude('');
      setLocationName('');
      setAddress('');
      setContactName('');
      setContactPhone('');
      onSuccess?.();
    }
  };

  const messageTypes: { value: MessageType; label: string }[] = [
    { value: 'text', label: 'Text' },
    { value: 'media', label: 'Media' },
    { value: 'location', label: 'Location' },
    { value: 'contact', label: 'Contact' },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Message Type Selector */}
      <div className="flex space-x-2">
        {messageTypes.map((type) => (
          <button
            key={type.value}
            type="button"
            onClick={() => setMessageType(type.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              messageType === type.value
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            {type.label}
          </button>
        ))}
      </div>

      {/* Recipient */}
      <Input
        label="To (Phone Number)"
        placeholder="628123456789 or 08123456789"
        value={to}
        onChange={(e) => setTo(e.target.value)}
        required
      />

      {/* Text Message Fields */}
      {messageType === 'text' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Message
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
            rows={4}
            required
            className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400 dark:placeholder-gray-500"
          />
        </div>
      )}

      {/* Media Fields */}
      {messageType === 'media' && (
        <>
          <Input
            label="Media URL"
            placeholder="https://example.com/image.jpg"
            value={mediaUrl}
            onChange={(e) => setMediaUrl(e.target.value)}
          />
          <p className="text-sm text-gray-500 dark:text-gray-400 -mt-2">
            Or use the file upload below
          </p>
          <MediaUpload
            onFileSelect={(base64, type, name) => {
              setMediaBase64(base64);
              setMimetype(type);
              setFileName(name);
            }}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="MIME Type"
              placeholder="image/jpeg"
              value={mimetype}
              onChange={(e) => setMimetype(e.target.value)}
              required
            />
            <Input
              label="File Name (optional)"
              placeholder="image.jpg"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
            />
          </div>
          <Input
            label="Caption (optional)"
            placeholder="Image caption..."
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
          />
        </>
      )}

      {/* Location Fields */}
      {messageType === 'location' && (
        <>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Latitude"
              type="number"
              step="any"
              placeholder="-6.2088"
              value={latitude}
              onChange={(e) => setLatitude(e.target.value)}
              required
            />
            <Input
              label="Longitude"
              type="number"
              step="any"
              placeholder="106.8456"
              value={longitude}
              onChange={(e) => setLongitude(e.target.value)}
              required
            />
          </div>
          <Input
            label="Location Name (optional)"
            placeholder="Jakarta"
            value={locationName}
            onChange={(e) => setLocationName(e.target.value)}
          />
          <Input
            label="Address (optional)"
            placeholder="Jl. Example No. 123"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </>
      )}

      {/* Contact Fields */}
      {messageType === 'contact' && (
        <>
          <Input
            label="Contact Name"
            placeholder="John Doe"
            value={contactName}
            onChange={(e) => setContactName(e.target.value)}
            required
          />
          <Input
            label="Contact Phone"
            placeholder="628123456789"
            value={contactPhone}
            onChange={(e) => setContactPhone(e.target.value)}
            required
          />
        </>
      )}

      {/* Error Display */}
      {error && (
        <div className="p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg">
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Submit Button */}
      <Button type="submit" isLoading={isLoading} className="w-full">
        Send Message
      </Button>
    </form>
  );
}

/**
 * MediaUpload - File upload component for media messages
 * Requirements: 4.2
 */
interface MediaUploadProps {
  onFileSelect: (base64: string, mimetype: string, fileName: string) => void;
}

function MediaUpload({ onFileSelect }: MediaUploadProps) {
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Remove data URL prefix to get pure base64
      const base64 = result.split(',')[1];
      onFileSelect(base64, file.type, file.name);
      setSelectedFile(file.name);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        Upload File
      </label>
      <div className="flex items-center space-x-3">
        <label className="cursor-pointer px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
          <span>Choose File</span>
          <input
            type="file"
            onChange={handleFileChange}
            accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx"
            className="hidden"
          />
        </label>
        {selectedFile && (
          <span className="text-sm text-gray-600 dark:text-gray-400 truncate max-w-xs">
            {selectedFile}
          </span>
        )}
      </div>
    </div>
  );
}

export default MessageForm;
