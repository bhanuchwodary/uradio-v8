
declare namespace JSX {
  interface HTMLAttributes<T> extends React.HTMLAttributes<T> {
    directory?: boolean | string;
    webkitdirectory?: boolean | string;
  }
}

interface HTMLInputElement extends HTMLElement {
  webkitdirectory: boolean | string;
  directory: boolean | string;
}
