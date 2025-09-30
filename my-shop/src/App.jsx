import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={
            <div style={{ padding: '20px', textAlign: 'center' }}>
              <h1>Trang Chủ</h1>
              <p>Đăng nhập thành công! 🎉</p>
              <a href="/login">Đăng nhập</a>
            </div>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;