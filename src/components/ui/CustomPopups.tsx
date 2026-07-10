import { useEffect, useState } from 'react';
import { Modal } from './Modal';
import { AlertCircle, HelpCircle } from 'lucide-react';

interface CustomConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
}

export function CustomConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDestructive = false,
}: CustomConfirmModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="flex flex-col gap-4">
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-lg shrink-0 ${isDestructive ? 'bg-red-50 text-red-600' : 'bg-[#e0f2fe] text-[#0369a1]'}`}>
            <AlertCircle className="w-5 h-5" />
          </div>
          <p className="text-sm text-gray-600 mt-1 leading-relaxed">{message}</p>
        </div>
        <div className="flex justify-end gap-3 mt-4 border-t border-gray-100 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`px-4 py-2 text-sm font-semibold text-white rounded-lg transition-colors cursor-pointer ${
              isDestructive ? 'bg-[#d72b1f] hover:bg-[#b91d13]' : 'bg-[#0369a1] hover:bg-[#0284c7]'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
}

interface CustomPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (value: string) => void;
  title: string;
  message: string;
  defaultValue?: string;
  placeholder?: string;
  confirmText?: string;
  cancelText?: string;
}

export function CustomPromptModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  defaultValue = '',
  placeholder = '',
  confirmText = 'Submit',
  cancelText = 'Cancel',
}: CustomPromptModalProps) {
  const [value, setValue] = useState(defaultValue);

  useEffect(() => {
    if (isOpen) {
      setValue(defaultValue);
    }
  }, [isOpen, defaultValue]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onConfirm(value);
          onClose();
        }}
        className="flex flex-col gap-4"
      >
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg shrink-0 bg-gray-100 text-gray-600">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-gray-600 mt-1 leading-relaxed mb-3">{message}</p>
            <input
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={placeholder}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[14px] text-gray-900 bg-gray-50 focus:outline-none focus:ring-1 focus:ring-gray-300 focus:bg-white transition-colors"
              autoFocus
              required
            />
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-4 border-t border-gray-100 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer"
          >
            {cancelText}
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-semibold text-white bg-gray-950 hover:bg-gray-800 rounded-lg transition-colors cursor-pointer"
          >
            {confirmText}
          </button>
        </div>
      </form>
    </Modal>
  );
}
