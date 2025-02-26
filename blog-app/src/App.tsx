import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import PostList from './components/PostList';
import PostDetail from './components/PostDetail';
import AddPostForm from './components/AddPostForm';
import EditPostForm from './components/EditPostForm';
import './App.css';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<PostList />} />
        <Route path="posts/new" element={<AddPostForm />} />
        <Route path="posts/:id" element={<PostDetail />} />
        <Route path="posts/:id/edit" element={<EditPostForm />} />
      </Route>
    </Routes>
  );
}

export default App;
