const React = require("react");
const ReactDOMServer = require("react-dom/server");
const { DocumentRenderer } = require("@keystone-6/document-renderer");

export function renderDocumentToHtml(jsonDocument: any) {
  const html = ReactDOMServer.renderToStaticMarkup(
    React.createElement(DocumentRenderer, { document: jsonDocument })
  );
  return html;
}
