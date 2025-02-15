import React from 'react';
import PropTypes from 'prop-types';
import redraft, { createStylesRenderer } from 'redraft';
import { Heading, Text, Link, Chip, Paragraph } from '@innovaccer/design-system';
import { renderToStaticMarkup } from 'react-dom/server';
import { defaultColors } from '../config/defaultToolbar';

const listStyle = {
  padding: '0px',
  margin: '0px',
};

const styleMap = {
  BOLD: {
    fontWeight: 'bold',
  },
  ITALIC: {
    fontStyle: 'italic',
  },
  UNDERLINE: {
    textDecoration: 'underline',
  },
  STRIKETHROUGH: {
    textDecoration: 'line-through',
  },
};

const options = {
  cleanup: {
    after: 'all',
    types: 'all',
    split: true,
  },
};

const addBreaklines = (children) => children.map((child) => [child, <br />]);

const InlineWrapper = ({ children, style, key }) => (
  <span key={key} style={style}>
    {children}
  </span>
);

const getList = (children, keys) => (
  <>
    {children.map((child, i) => (
      <li key={keys[i]}>{child}</li>
    ))}
  </>
);

const defaultHeadings = {
  'header-one': (children, { keys }) =>
    children.map((child, i) => (
      <Heading size="xxl" key={keys[i]}>
        {child}
      </Heading>
    )),
  'header-two': (children, { keys }) =>
    children.map((child, i) => (
      <Heading size="xl" key={keys[i]}>
        {child}
      </Heading>
    )),
  'header-three': (children, { keys }) =>
    children.map((child, i) => (
      <Heading size="l" key={keys[i]}>
        {child}
      </Heading>
    )),
  'header-four': (children, { keys }) =>
    children.map((child, i) => (
      <Heading size="m" key={keys[i]}>
        {child}
      </Heading>
    )),
};

const defaultList = {
  'unordered-list-item': (children, { keys }) => <ul style={listStyle}>{getList(children, keys)}</ul>,
  'ordered-list-item': (children, { keys }) => <ol style={listStyle}>{getList(children, keys)}</ol>,
};

const defaultEntities = {
  LINK: (children, entity, { key }) => (
    <Link key={key} href={entity.url}>
      {children}
    </Link>
  ),
  IMAGE: (children, props) => {
    const { src, alt, height, width, alignment } = props;
    const imageAlign = alignment ? alignment : 'left';

    return (
      <p id='RichTextEditor-Image' style={{ justifyContent: imageAlign, display: 'flex' }}>
        <img src={src} alt={alt} height={height} width={width} />
      </p>
    );
  },
  MENTION: (children, entity, { key }) => <span name={entity.value} className='Chip--input Chip d-inline-flex mt-3' key={key}>{children}</span>,
};

const getUnstyledBlock = (children, keys) => (
  <>
    {children.map((child, i) => {
      const text = child.length > 1 && child[1][0];

      if (text && text.includes('\n')) {
        const newBlock = text.split('\n');
        return <Paragraph key={keys[i]}>{addBreaklines(newBlock)}</Paragraph>;
      }
      else if(child && child[1]?.length === 0){
        return <p><br></br></p>
      } 
      else {
        return <Paragraph key={keys[i]}>{addBreaklines(child)}</Paragraph>;
      }
    })}
  </>
);

const defaultBlocks = {
  unstyled: (children, { keys }, test) => getUnstyledBlock(children, keys),
  atomic: (children, obj) => children[0],
};

const getColors = (newColors) => {
  const colors = [...defaultColors, ...newColors];

  const colorsStyleMap = colors.reduce((acc, curr) => {
    const styleName = `color-${curr}`;
    const style = {
      color: curr,
    };

    return { ...acc, [styleName]: style };
  }, {});

  return colorsStyleMap;
};

const getPreviewComponent = (raw, { entities = {}, headings = {}, list = {}, colors = [] }) => {
  const updatedEntities = { ...defaultEntities, ...entities };
  const updatedHeadings = { ...defaultHeadings, ...headings };
  const updatedList = { ...defaultList, ...list };
  const blocks = { ...defaultBlocks, ...updatedHeadings, ...updatedList };
  const styles = { ...styleMap, ...getColors(colors) };

  const renderer = {
    blocks,
    entities: updatedEntities,
    styles: createStylesRenderer(InlineWrapper, styles),
  };

  //Case 1: Pass options as third argument when require cleanup feature
  // return redraft(raw, renderer, options);

  //Case 2: Pass false as third argument when needs to render empty blocks with no text or data
  return redraft(raw, renderer, false);
};

const convertToHTML = (raw, withCSS = false, renderer = {}) => {
  if (!raw) {
    return '';
  }

  const previewComponent = getPreviewComponent(raw, renderer);

  if (!previewComponent) {
    return '';
  }

  const html = renderToStaticMarkup(previewComponent);

  if (html) {
    const { name, version } = require('../../package.json');
    const cdnPath = `https://s3.us-east-1.amazonaws.com/webui-assets/${name}/v${version}/design-system.css`;
    const css = withCSS ? `<link rel="stylesheet" href="${cdnPath}">` : '';

    return `${css} ${renderToStaticMarkup(previewComponent)}`;
  }

  return '';
};

/**
 * ###Note about `EditorPreview.utils.convertToHTML`:
 * - HTML obtained from this preview component includes CSS and is not supposed to be passed in editor props as initialContent.
 * - Paramenters of `EditorPreview.utils.convertToHTML`:
 *  1. raw: Result of the `Editor.utils.convertToRaw`
 *  2. withCSS: Determines if link tag (with required CSS classes CDN Path) is concatenated along with HTML string.
 *  3. renderer: Object with custom renderers( { entities, headings, list, colors } )
 */
export const EditorPreview = ({ raw, entities, headings, list, colors }) => {
  if (!raw) {
    return null;
  }

  const renderers = { entities, headings, list, colors };
  const previewComponent = getPreviewComponent(raw, renderers);

  if (!previewComponent) {
    return null;
  }

  return <>{previewComponent}</>;
};

EditorPreview.utils = {
  convertToHTML,
};

EditorPreview.propTypes = {
  /**
   * Result of the `Editor.utils.convertToRaw`
   */
  raw: PropTypes.object.isRequired,
  /**
   * Array of colors used in Editor `Color Picker`
   */
  colors: PropTypes.arrayOf(PropTypes.string),
  /**
   * Object with `unordered-list-item` and `ordered-list-item` list callbacks called recursively to render a nested structure.
   *
   * Here `children` are an array of blocks with same styling
   *
   * The key passed here is just an index based on rendering order inside a block
   *
   * <pre style="font-family: monospace; font-size: 13px; background: #f8f8f8">
   * Example:
   *  const list = {
   *   'unordered-list-item':
   *      (children, { keys }) => (
   *        ```
   *        <ul>
   *        ```
   *          {children.map((child, i) => (
   *            ```
   *            <li key={keys[i]}>{child}</li>
   *            ```
   *          ))}
   *       ```
   *       </ul>
   *       ```
   *   ),
   *  };
   * </pre>
   */
  list: PropTypes.object,
  /**
   * Object with headers callbacks called recursively to render a nested structure.
   *
   * ***Headers keys are `header-one`, `header-two`, `header-three` and `header-four`.***
   *
   * Here `children` are an array of blocks with same styling
   *
   * The key passed here is just an index based on rendering order inside a block
   *
   * <pre style="font-family: monospace; font-size: 13px; background: #f8f8f8">
   * Example:
   *  const headers = {
   *   'header-one':
   *      (children, { keys }) => (
   *         {children.map((child, i) => (
   *            ```
   *            <Heading size="xxl" key={keys[i]}>{child}</Heading>
   *            ```
   *         ))}
   *   ),
   *  };
   * </pre>
   */
  headings: PropTypes.object,
  /**
   * Object with `LINK`, `MENTION` and `IMAGE` callbacks called recursively to render a nested structure.
   *
   * Here `children` are an array of blocks with same styling
   *
   * `Entity` represents data.
   *
   * <pre style="font-family: monospace; font-size: 13px; background: #f8f8f8">
   * Example:
   *  const entities = {
   *    MENTION: (children, entity, { key }) => (
   *      ```
   *      <Chip label={children} name={entity.value} type={"input"} />
   *      ```
   *    ),
   *    IMAGE: (children, entity) => (
   *      ```
   *      <img src={entity.src} height={entity.height} width={entity.width} />
   *      ```
   *    ),
   *    LINK: (children, entity, { key }) => (
   *      ```
   *      <Link key={key} href={entity.url}>
   *      ```
   *        {children}
   *      ```
   *      </Link>
   *      ```
   *    ),
   *  };
   * </pre>
   */
  entities: PropTypes.object,
};

EditorPreview.defaultProps = {
  entities: {},
  headings: {},
  list: {},
  colors: [],
};

export default EditorPreview;
