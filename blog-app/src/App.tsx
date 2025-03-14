import { Routes, Route } from "react-router-dom";
import { Suspense } from "react";
import Layout from "./components/Layout";
import { lazy } from "react";

const PostList = lazy(() => import("./components/PostList"));
const PostDetail = lazy(() => import("./components/PostDetail"));
const AddPostForm = lazy(() => import("./components/AddPostForm"));
const EditPostForm = lazy(() => import("./components/EditPostForm"));

function App() {
  return (
    <Suspense>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<PostList />} />
          <Route path="posts/new" element={<AddPostForm />} />
          <Route path="posts/:id" element={<PostDetail />} />
          <Route path="posts/:id/edit" element={<EditPostForm />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

export default App;
