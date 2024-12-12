const Post = require('../models/Post');  
const User = require('../models/User');
const authenticateToken = require('../middlewares/authMiddleware');
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const { bucketPost } = require('../config/cloudstorage');

const storage = multer.memoryStorage();

const upload = multer({ storage: storage }).single('imageFile');


const createPost = async (req, res) => {
    upload(req, res, async (err) => {
        if (err) {
            return res.status(500).json({ 
                error: true, 
                message: 'Error uploading file', 
                listpost: [] 
            });
        }

        const { description } = req.body;

        if (!description) {
            return res.status(400).json({ 
                error: true, 
                message: 'Description is required', 
                listpost: [] 
            });
        }

        const username = req.user.username;
        const imageuser = req.user.imageUrl;
        const imageFile = req.file;

        if (!imageFile) {
            return res.status(400).json({ 
                error: true, 
                message: 'Image file is required', 
                listpost: [] 
            });
        }

        const fileName = `${Date.now()}-${uuidv4()}${path.extname(imageFile.originalname)}`;

        try {
            const file = bucketPost.file(fileName);
            const stream = file.createWriteStream({
                metadata: {
                    contentType: imageFile.mimetype,
                },
            });

            stream.on('error', (uploadError) => {
                return res.status(500).json({ 
                    error: true, 
                    message: 'Error uploading to GCS', 
                    listpost: [] 
                });
            });

            stream.on('finish', async () => {
                try {
                    const imageUrl = `https://storage.googleapis.com/${bucketPost.name}/${fileName}`;
                    const newPost = {
                        username,
                        description,
                        imageUrl,
                        imageuser,
                        createdAt: new Date(),
                    };

                    const result = await Post.create(
                        newPost.username,
                        newPost.description,
                        newPost.imageUrl,
                        newPost.imageuser,
                        newPost.createdAt
                    );

                    res.status(201).json({
                        error: false,
                        message: 'Post created successfully',
                        listpost: [{
                            id: result.insertId, 
                            username: newPost.username,
                            description: newPost.description,
                            imageUrl: newPost.imageUrl,
                            imageuser: newPost.imageuser,
                            createdAt: newPost.createdAt,                          
                        }]
                    });
                } catch (dbError) {
                    res.status(500).json({ 
                        error: true, 
                        message: 'Error creating post', 
                        listpost: [] 
                    });
                }
            });

            stream.end(imageFile.buffer);

        } catch (uploadError) {
            res.status(500).json({ 
                error: true, 
                message: 'Error processing post creation', 
                listpost: [] 
            });
        }
    });
};


const getAllPosts = (req, res) => {
    Post.getAll((err, results) => {
        if (err) {
            return res.status(500).json({ 
                error: true,
                message: 'Error fetching posts',
                listpost: [],
            });
        }
        
        const formattedPosts = results.map(post => ({
            id: post.id,
            name: post.username,
            description: post.description,
            photoUrl: post.imageUrl,
            imageuser: post.imageUser,
            createdAt: post.createdAt,
            // lat: post.lat || null,  // Tambahkan data latitude jika ada
            // lon: post.lon || null,  // Tambahkan data longitude jika ada
        }));

        res.status(200).json({
            error: false,
            message: 'Stories fetched successfully',
            listpost: formattedPosts,
        });
    });
};


const getPostById = (req, res) => {
    const { id } = req.params;  
    
    Post.getById(id, (err, post) => {
        if (err || !post) {
            return res.status(404).json({ message: 'Post not found' });
        }
        res.status(200).json(post);  
    });
};


// const updatePost = (req, res) => {
//     console.log('req.params:', req.params); 
//     console.log('req.body:', req.body);    
//     const { id } = req.params; 
//     const { username } = req.body; 
//     const { description } = req.body; 

//     if (!description) {
//         return res.status(400).json({
//             error: true,
//             message: 'Description is required',
//             listpost: []
//         });
//     }

//     Post.findByIdAndUsername(id, username, (err, post) => {
//         if (err) {
//             return res.status(500).json({
//                 error: true,
//                 message: 'Error finding post',
//                 listpost: []
//             });
//         }

//         if (!post) {
//             return res.status(404).json({
//                 error: true,
//                 message: 'Post not found for this user',
//                 listpost: []
//             });
//         }

//         Post.update(id, description, (err, updatedPost) => {
//             if (err) {
//                 return res.status(500).json({
//                     error: true,
//                     message: 'Error updating post',
//                     listpost: []
//                 });
//             }

//             // Format data output
//             const formattedPost = {
//                 id: updatedPost.id,
//                 name: updatedPost.username,
//                 description: updatedPost.description,
//                 photoUrl: updatedPost.imageUrl,
//                 createdAt: updatedPost.createdAt,
//             };

//             res.status(200).json({
//                 error: false,
//                 message: 'Post updated successfully',
//                 listpost: [formattedPost]
//             });
//         });
//     });
// };



// const deletePost = (req, res) => {
//     const { id } = req.params;  
    
//     Post.delete(id, (err) => {
//         if (err) {
//             return res.status(500).json({ message: 'Error deleting post', error: err });
//         }
//         res.status(200).json({ message: 'Post deleted successfully' });
//     });
// };

module.exports = {
    createPost,
    getAllPosts,
    getPostById,
    // updatePost,
    // deletePost
};
