import color from '../../images/color.svg';
import embedded from '../../images/embedded.svg';
import image from '../../images/image.svg';

export const defaultColors = [
  'var(--text)',
  'var(--secondary)',
  'var(--success)',
  'var(--primary)',
  'var(--alert)',
  'var(--accent1)',
];

export default {
  options: [
    'heading',
    'textDecoration',
    'colorPicker',
    'list',
    'insert',
    // "link",
    // "embedded",
    // "image",
  ],
  textDecoration: {
    max: 4,
    options: ['bold', 'italic', 'underline', 'strikethrough'],
    bold: { icon: 'format_bold', title: 'Bold (command B)', label: 'Bold' },
    italic: { icon: 'format_italic', title: 'Italic (command I)', label: 'Italic' },
    underline: { icon: 'format_underlined', title: 'Underline (command U)', label: 'Underline' },
    strikethrough: { icon: 'strikethrough_s', title: 'Strikethrough', label: 'Strikethrough' },
  },
  heading: {
    icon: 'text_fields',
    options: [
      //"Normal",
      'H1',
      'H2',
      'H3',
      'H4',
    ],
  },
  list: {
    options: ['unordered', 'ordered'],
    unordered: { icon: 'format_list_bulleted', title: ' Bulleted list' },
    ordered: { icon: 'format_list_numbered', title: 'Numbered list' },
  },
  colorPicker: {
    icon: color,
    colors: defaultColors,
  },
  insert: {
    max: 3,
    options: ['image', 'mention', 'link'],
    image: {
      icon: 'insert_photo',
      isVisible: true,
      title: 'Image',
      alt: '',
      defaultSize: {
        height: '100px',
        width: '300px',
      },
      inputAccept: 'image/gif,image/jpeg,image/jpg,image/png,image/svg',
      uploadCallback: (file) => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader(); // eslint-disable-line no-undef
          reader.onload = (e) => resolve({ data: { link: reader.result } });
          reader.onerror = (e) => reject(e);
          reader.readAsDataURL(file);
        });
      },
    },
    link: {
      isVisible: true,
      icon: 'insert_link',
      linkCallback: undefined,
      title: 'Link',
    },
    mention: {
      isVisible: true,
      icon: 'alternate_email',
      title: 'Personalization',
    },
  },
  // link: {
  //   inDropdown: false,
  //   className: undefined,
  //   component: undefined,
  //   popupClassName: undefined,
  //   dropdownClassName: undefined,
  //   showOpenOptionOnHover: true,
  //   defaultTargetOption: "_self",
  //   options: ["link", "unlink"],
  //   link: { icon: 'insert_link', className: undefined, title: undefined },
  //   //unlink: { icon: unlink, className: undefined, title: undefined },
  //   linkCallback: undefined
  // },
  embedded: {
    icon: embedded,
    className: undefined,
    component: undefined,
    popupClassName: undefined,
    embedCallback: undefined,
    defaultSize: {
      height: 'auto',
      width: 'auto',
    },
    title: undefined,
  },
  image: {
    icon: image,
    className: undefined,
    component: undefined,
    popupClassName: undefined,
    urlEnabled: true,
    uploadEnabled: true,
    previewImage: false,
    alignmentEnabled: true,
    uploadCallback: undefined,
    inputAccept: 'image/gif,image/jpeg,image/jpg,image/png,image/svg',
    alt: { present: false, mandatory: false },
    defaultSize: {
      height: 'auto',
      width: 'auto',
    },
    title: undefined,
  },
};
