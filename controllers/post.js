const mysql = require('mysql');

const db = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER, 
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE
});


exports.homelistposts = async (req, res, next) => {
            // const qrySelect = "SELECT * FROM posts WHERE status='1'";
            const qrySelect = "SELECT posts.*, users.username, users.user_photo " + 
                            "FROM posts LEFT JOIN users ON posts.user_id = users.id WHERE posts.status='1';";
            
            console.log(qrySelect);
            db.query(qrySelect,  async (error, results) => {
                if(results) {
                    req.posts = results;
                    return next();
                }
            });
}

exports.listposts = async (req, res, next) => {
    if(req.user){
        if(req.user.id){
            try {
                
                let user_id = req.user.id;
    
                const qrySelect = 'SELECT * FROM posts WHERE user_id = ?'
            
                db.query(qrySelect, [user_id], async (error, results) => {
                    if(results.length > 0) {
                        req.posts = results;
                        return next();
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



