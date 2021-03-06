const mysql = require('mysql');
const path = require('path');


const db = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER, 
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE
});


exports.homelistposts = async (req, res, next) => {
    try {
        const qrySelect = "SELECT posts.*, users.fullname, users.user_photo " + 
                            "FROM posts LEFT JOIN users ON posts.user_id = users.id WHERE posts.status='1';";
            
            db.query(qrySelect,  async (error, results) => {
                if(results) {
                    req.posts = results;
                    return next();
                }
            });
    } catch (error) {
        console.log(error);
    }
            
}

exports.listposts = async (req, res, next) => {
    if(req.user){

        if(req.user.id){
            try {
                let user_id = req.user.id;
    
                const qrySelect = "SELECT * FROM posts WHERE user_id = ? AND status='1'";

                db.query(qrySelect, [user_id], async (error, results) => {
                    if(results) {
                        req.posts = results;
                        return next();
                    }else{
                        console.log(error);
                    }
                });
            } catch (error) {
                console.log(error);
            }
       }else{
            res.status(200).redirect('/login');
       }
    }else{
        res.status(200).redirect('/login');
    }
}


exports.create = (req, res, next) => {
    
    if(req.body) {
       if(req.body.post_title === ''){
            return res.render('create', {
                message: 'Please Input Title',
                code: false
            });
       }else if(req.body.post_description ===  ''){
            return res.render('create', {
                message: 'Please Input Description',
                code: false
            });
       }else{

            if(req.files){
                const target_file = req.files.post_photo;
                const user_id = req.user.id;
                const post_title = req.body.post_title;
                const post_description = req.body.post_description;
                const post_photo = Date.now() + '-' + target_file.name;
                const post_status = req.body.status;


                const qryInsert = "INSERT INTO posts SET ?";
                
                // target_file.mv(path, callback)
                target_file.mv(path.join(__dirname, '../public/blog_imgs', post_photo), (err) => {
                    if (err){
                        return res.render('create', {
                            message: 'Error File Upload',
                            code: false
                        });
                    }else{
                        db.query(qryInsert, {user_id: user_id, post_title: post_title, post_description: post_description, post_photo: post_photo, status: post_status}, (error, results) => {
                            if(error) {
                                console.log(error);
                            }else{
                                console.log(results);
                                res.status(200).redirect('/profile');
                            }
                        });
                    }
                })
                    
            }else{
                return res.render('create', {
                    message: 'Please Upload File',
                    code: false
                });
            }
        }      
    }else{
        return res.render('create', {
            message: 'Make sure you have input all the columns!',
            code: false
        });
    }
                            
}


exports.getSinglePost = async (req, res, next) => {
    // console.log(req.params.id);
    if(req.params.id){

        const post_id = req.params.id;
        const user_id = req.user.id;

        try {
        const qrySelect = "SELECT posts.*, users.fullname, users.user_photo " + 
                            "FROM posts LEFT JOIN users ON posts.user_id = users.id WHERE posts.status='1' AND " +
                            "posts.id = ? AND posts.user_id = ?";
            
            db.query(qrySelect,  [post_id, user_id], async (error, results) => {
                if(error || !results[0]){
                    res.status(200).redirect('/profile');
                }else{
                    if(results[0]) {
                        req.post = results[0];
                        return next();
                    }else{
                        console.log(error);
                    }
                }
            });
        } catch (error) {
            console.log(error);
        }
    }else{
        res.status(200).redirect('/profile');
    }
    
    
            
}


exports.updatePost = async (req, res, next) => {

    
    if(req.body) {
        if(req.body.post_title === ''){
             return res.render('edit', {
                 message: 'Please Input Title',
                 code: false
             });
        }else if(req.body.post_description ===  ''){
             return res.render('edit', {
                 message: 'Please Input Description',
                 code: false
             });
        }else{
            const user_id = req.user.id;
            const post_title = req.body.post_title;
            const post_description = req.body.post_description;
            const post_status = req.body.status;

            const post_id = req.params.id;
             
            if(!req.files){
                let post_photo = req.body.old_image;

                const qryUpdate = "UPDATE posts SET ? WHERE posts.id = ? AND user_id = ?";

                console.log(qryUpdate);

                const updateData = {
                    user_id: user_id, 
                    post_title: post_title, 
                    post_description: post_description, 
                    post_photo: post_photo, 
                    status: post_status
                };
                            
                db.query(qryUpdate, [updateData, post_id, user_id], (error, results) => {
                    if(error) {
                        console.log(error);
                    }else{
                        console.log(results);
                        return res.status(200).redirect('/profile');
                    }
                });
            }else{

                const target_file = req.files.post_photo;
                const post_photo = Date.now() + '-' + target_file.name;

                // target_file.mv(path, callback)
                target_file.mv(path.join(__dirname, '../public/blog_imgs', post_photo), (err) => {
                    if(err){
                        return res.render('edit', {
                            message: 'Error File Upload',
                            code: false
                        });
                    }else{
                        const qryUpdate = "UPDATE posts SET ? WHERE posts.id = ? AND user_id = ?";

                        console.log(qryUpdate);

                        const updateData = {
                            user_id: user_id, 
                            post_title: post_title, 
                            post_description: post_description, 
                            post_photo: post_photo, 
                            status: post_status
                        };
                                    
                        db.query(qryUpdate, [updateData, post_id, user_id], (error, results) => {
                            if(error) {
                                console.log(error);
                            }else{
                                console.log(results);
                                return res.status(200).redirect('/profile');
                            }
                        });
                    }
                });
            }
         }   
     }else{
         
         return res.render('edit', {
             message: 'Make sure you have input all the columns!',
             code: false
         });
     }
            
}


exports.deletePost = async (req, res, next) => {

    console.log(req.params.id);

    if(req.params.id){

        const post_id = req.params.id;
        const user_id = req.user.id;

        try {
            const qryDelete = "DELETE FROM posts WHERE posts.id = ? AND posts.user_id = ?";
            
            db.query(qryDelete,  [post_id, user_id], async (error) => {
                if(error){
                    res.status(200).redirect('/profile');
                }else{
                    console.log('success deleted');
                    res.status(200).redirect('/profile');
                }
            });
        } catch (error) {
            console.log(error);
        }
    }else{
        res.status(200).redirect('/profile');
    }  
            
}