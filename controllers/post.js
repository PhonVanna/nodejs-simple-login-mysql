const mysql = require('mysql');

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
    
                const qrySelect = 'SELECT * FROM posts WHERE user_id = ?'

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


exports.create = (req, res) => {
    
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
            const user_id = req.user.id;
                    const post_title = req.body.post_title;
                    const post_description = req.body.post_description;
                    const post_photo = '3.jpg';
                    const post_status = req.body.status;
            
                    const qryInsert = "INSERT INTO posts SET ?";
                        
                    db.query(qryInsert, {user_id: user_id, post_title: post_title, post_description: post_description, post_photo: post_photo, status: post_status}, (error, results) => {
                        if(error) {
                            console.log(error);
                        }else{
                            console.log(results);
                            return res.render('create', {
                                message: 'Successfully Inserted!',
                                code: true
                            });
                        }
                    });
        }   
    }else{
        
        return res.render('create', {
            message: 'Make sure you have input all the columns!',
            code: false
        });
    }

}



// const user_id = req.user.id;
//         const post_title = req.body.post_title;
//         const post_description = req.body.post_description;
//         const post_photo = '3.jpg';
//         const post_status = req.body.status;

//         const qryInsert = "INSERT INTO posts SET ?";
            
//         db.query(qryInsert, {user_id: user_id, post_title: post_title, post_description: post_description, post_photo: post_photo, status: post_status}, (error, results) => {
//             if(error) {
//                 console.log(error);
//             }else{
//                 console.log(results);
//                 return res.render('create', {
//                     message: 'Successfully Inserted!',
//                     code: true
//                 });
//             }
//         });