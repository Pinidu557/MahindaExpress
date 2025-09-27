import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './index.css';

const container = document.getElementById('root');
const root = createRoot(container);

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, info) {
    // eslint-disable-next-line no-console
    console.error('App crashed:', error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 16, color: '#b91c1c', background: '#fee2e2' }}>
          An error occurred: {String(this.state.error)}
        </div>
      );
    }
    return this.props.children;
  }
}

root.render(
  <ErrorBoundary>
    <React.StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </React.StrictMode>
  </ErrorBoundary>
);


