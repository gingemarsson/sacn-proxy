import React from 'react';
import ReactDOM from 'react-dom/client';
import MainContent from './components/mainContent';
import './style/style.scss';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
    <React.StrictMode>
        <MainContent />
    </React.StrictMode>,
);
