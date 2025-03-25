import React from 'react';
import { Table } from 'react-bootstrap';

const PostsManagement: React.FC = () => {
    const posts = [
        { id: 1, title: 'First Post', author: 'Author 1', date: '2023-01-01' },
        { id: 2, title: 'Second Post', author: 'Author 2', date: '2023-01-02' },
        // ... more posts
    ];

    return (
        <div className="container">
            <h1>Posts Management</h1>
            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Title</th>
                        <th>Author</th>
                        <th>Date</th>
                    </tr>
                </thead>
                <tbody>
                    {posts.map(post => (
                        <tr key={post.id}>
                            <td>{post.id}</td>
                            <td>{post.title}</td>
                            <td>{post.author}</td>
                            <td>{post.date}</td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </div>
    );
};

export default PostsManagement; 