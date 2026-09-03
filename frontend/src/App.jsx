import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Trash from './pages/Trash';
import Recent from './pages/Recent';
import Shared from './pages/Shared';
import Starred from './pages/Starred';
import { StorageProvider } from './context/StorageContext';
import './App.css';

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <StorageProvider>
      <Router>
        <div className="min-h-screen bg-[#fafafa] text-zinc-900 font-sans selection:bg-zinc-200">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/recent" 
            element={
              <ProtectedRoute>
                <Recent />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/shared" 
            element={
              <ProtectedRoute>
                <Shared />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/starred" 
            element={
              <ProtectedRoute>
                <Starred />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/trash" 
            element={
              <ProtectedRoute>
                <Trash />
              </ProtectedRoute>
            } 
          />
          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
    </StorageProvider>
  );
}

export default App;
