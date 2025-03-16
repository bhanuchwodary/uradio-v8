
declare namespace JSX {
  interface HTMLAttributes<T> extends React.HTMLAttributes<T> {
    directory?: boolean | string;
    webkitdirectory?: boolean | string;
  }
}

interface HTMLInputElement {
  webkitdirectory: boolean | string;
  directory: boolean | string;
}
