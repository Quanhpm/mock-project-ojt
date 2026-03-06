import { useState, useEffect, useMemo } from 'react';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import {
  ClassicEditor,
  Autoformat,
  AutoImage,
  Autosave,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Code,
  Link,
  Paragraph,
  Heading,
  BlockQuote,
  List,
  ListProperties,
  Indent,
  IndentBlock,
  ImageBlock,
  ImageInline,
  ImageInsert,
  ImageInsertViaUrl,
  ImageResize,
  ImageStyle,
  ImageTextAlternative,
  ImageToolbar,
  ImageUpload,
  ImageCaption,
  PictureEditing,
  Table,
  TableToolbar,
  TableCellProperties,
  TableColumnResize,
  TableCaption,
  TableProperties,
  Essentials,
  FontSize,
  FontFamily,
  FontColor,
  FontBackgroundColor,
  MediaEmbed,
  CodeBlock,
  PasteFromOffice,
  TextTransformation,
  TodoList,
} from 'ckeditor5';
import 'ckeditor5/ckeditor5.css';

interface CKEditorFieldProps {
  value?: string;
  onChange?: (data: string) => void;
  placeholder?: string;
  hasError?: boolean;
}

export function CKEditorField({
  value = '',
  onChange,
  placeholder = 'Enter content here...',
  hasError = false,
}: CKEditorFieldProps) {
  const [isLayoutReady, setIsLayoutReady] = useState(false);

  useEffect(() => {
    setIsLayoutReady(true);
    return () => setIsLayoutReady(false);
  }, []);

  const editorConfig = useMemo(() => {
    if (!isLayoutReady) return undefined;
    return {
      toolbar: {
        items: [
          'heading', '|',
          'fontSize', 'fontFamily', 'fontColor', 'fontBackgroundColor', '|',
          'bold', 'italic', 'underline', 'strikethrough', 'code', '|',
          'link', 'insertImage', 'insertImageViaUrl', 'mediaEmbed',
          'insertTable', 'blockQuote', 'codeBlock', '|',
          'bulletedList', 'numberedList', 'todoList', 'outdent', 'indent',
        ],
        shouldNotGroupWhenFull: false,
      },
      plugins: [
        Autoformat, AutoImage, Autosave, Bold, Italic, Underline, Strikethrough,
        Code, Link, Paragraph, Heading, BlockQuote, List, ListProperties,
        Indent, IndentBlock, ImageBlock, ImageInline, ImageInsert, ImageInsertViaUrl,
        ImageResize, ImageStyle, ImageTextAlternative, ImageToolbar, ImageUpload,
        ImageCaption, PictureEditing, Table, TableToolbar, TableCellProperties,
        TableColumnResize, TableCaption, TableProperties, Essentials,
        FontSize, FontFamily, FontColor, FontBackgroundColor,
        MediaEmbed, CodeBlock, PasteFromOffice, TextTransformation, TodoList,
      ],
      heading: {
        options: [
          { model: 'paragraph' as const, title: 'Paragraph', class: 'ck-heading_paragraph' },
          { model: 'heading1' as const, view: 'h1' as const, title: 'Heading 1', class: 'ck-heading_heading1' },
          { model: 'heading2' as const, view: 'h2' as const, title: 'Heading 2', class: 'ck-heading_heading2' },
          { model: 'heading3' as const, view: 'h3' as const, title: 'Heading 3', class: 'ck-heading_heading3' },
        ],
      },
      image: {
        toolbar: [
          'toggleImageCaption', 'imageTextAlternative', '|',
          'imageStyle:inline', 'imageStyle:wrapText', 'imageStyle:breakText', '|',
          'resizeImage',
        ],
      },
      table: {
        contentToolbar: ['tableColumn', 'tableRow', 'mergeTableCells', 'tableProperties', 'tableCellProperties'],
      },
      list: {
        properties: { styles: true, startIndex: true, reversed: true },
      },
      fontFamily: { supportAllValues: true },
      fontSize: {
        options: [10, 12, 14, 'default', 18, 20, 22],
        supportAllValues: true,
      },
      licenseKey: 'GPL',
      placeholder,
    };
  }, [isLayoutReady, placeholder]);

  return (
    <div style={{ border: hasError ? '1px solid #ef4444' : '1px solid #e0e0e0', borderRadius: '8px', overflow: 'hidden' }}>
      {editorConfig && (
        <CKEditor
          editor={ClassicEditor}
          config={editorConfig}
          data={value}
          onChange={(_event, editor) => {
            onChange?.(editor.getData());
          }}
        />
      )}
    </div>
  );
}
