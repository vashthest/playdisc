import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PlaysListPage from './pages/PlaysListPage';
import PlayViewerPage from './pages/PlayViewerPage';
import PlayEditorPage from './pages/PlayEditorPage';
import './App.css'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<PlaysListPage />} />
        <Route path="/play/:id" element={<PlayViewerPage />} />
        <Route path="/play/:id/edit" element={<PlayEditorPage />} />
      </Routes>
    </Router>
  );
}

export default App;
