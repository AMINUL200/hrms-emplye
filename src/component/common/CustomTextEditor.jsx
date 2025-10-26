// components/CustomTextEditor.jsx
import React, { useRef } from 'react';
import JoditEditor from 'jodit-react';

const CustomTextEditor = ({ 
  value, 
  onChange, 
  placeholder = 'Start typing...',
  height = 400,
  disabled = false 
}) => {
  const editor = useRef(null);

  // Configuration without image insertion
  const config = {
    readonly: disabled,
    placeholder: placeholder,
    height: height,
    toolbarButtonSize: 'medium',
    removeButtons: [
      'image', // Remove image button
      'file', // Remove file upload
      'video', // Remove video
      'media', // Remove media
      'source', // Remove source code editor
      'about', // Remove about
      'print', // Remove print
      'symbols', // Remove symbols
      'table', // Remove table (optional)
      'hr', // Remove horizontal line (optional)
    ],
    buttons: [
      'bold', 'italic', 'underline', 'strikethrough',
      '|', 'ul', 'ol', 'outdent', 'indent',
      '|', 'font', 'fontsize', 'brush', 'paragraph',
      '|', 'align', 'undo', 'redo',
      '|', 'link', 'unlink',
      '|', 'fullsize', 'preview'
    ],
    showXPathInStatusbar: false,
    showCharsCounter: false,
    showWordsCounter: false,
    toolbarAdaptive: false
  };

  return (
    <div className="custom-text-editor">
      <JoditEditor
        ref={editor}
        value={value}
        config={config}
        tabIndex={1}
        onBlur={onChange} // Better for performance
      />
    </div>
  );
};

export default CustomTextEditor;