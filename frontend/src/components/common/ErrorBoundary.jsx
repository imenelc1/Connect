import React from "react";

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return <div style={{ color: 'red' }}>
        <h2>Erreur détectée :</h2>
        <pre>{this.state.error?.message}</pre>
      </div>;
    }
    return this.props.children;
  }
}
