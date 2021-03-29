const mysql = require('mysql');
const jwt =  require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { promisify } = require('util');

const db = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER, 
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE
});

exports.register = (req, res) => {
    
    const {name, email, password, passwordConfirm } = req.body;

    const qrySelect = 'SELECT email FROM users WHERE email = ?';
    const qryInsert = "INSERT INTO users SET ?";

    db.query(qrySelect, [email], async (error, results) => {
        if(error) {
            console.log(error);
        }
        
        if(results.length > 0) {
            return res.render('register', {
                message: 'That email is already in used!', 
                code: false
            });
        }else if(password != passwordConfirm){
            return res.render('register', {
                message: 'Password do not match!',
                code: false
            });
        }
        
        let hashedPassword = await bcrypt.hash(password, 8);
        // console.log(hashedPassword);
        db.query(qryInsert, {username: name, email: email, password: hashedPassword}, (error, results) => {
            if(error) {
                console.log(error);
            }else{
                // console.log(results);
                return res.render('register', {
                    message: 'Successfully Inserted!',
                    code: true
                });
            }
        });

    }); 

}

exports.login = async (req, res) => {
    
    try {
        const {email, password } = req.body;

        if(!email || !password) {
            return res.status(400).render('login', {
                message: 'Please input email and password!',
                code: false
            });
        }

        const qrySelect = 'SELECT * FROM users WHERE email = ?';

        db.query(qrySelect, [email], async (error, results) => {
            if(!results || !(await bcrypt.compare(password, results[0].password))) {
                console.log(results);
                return res.status(401).render('login', {
                    message: 'E-mail or Password is invalid!',
                    code: false
                });
            }else{
                const id = results[0].id;

                const token = jwt.sign({ id: id }, process.env.JWT_SECRET, {
                    expiresIn: process.env.JWT_EXPIRES_IN
                });

                // console.log('The token is: ' + token);

                const cookieOptions = {
                    expires: new Date(
                        Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 1000
                    ),
                    httpOnly: true
                }

                res.cookie('jwt', token, cookieOptions);
                res.status(200).redirect('/');
            }
        });
        
    } catch (error) {
        console.log(error);
    }

}

exports.isLoggedIn = async (req, res, next) => {
    // console.log(req.cookies);
    if(req.cookies.jwt) {
        try {
            // verify the token
            const decoded = await promisify(jwt.verify) (
                    req.cookies.jwt, 
                    process.env.JWT_SECRET
                );
            // console.log(decoded);

            //check if the user still exist
            db.query("SELECT * FROM users WHERE id = ?", [decoded.id], (error, result) => {
                if(!result) {
                    return next();
                }
                req.user = result[0];
                return next();
            });
        } catch (error) {
            return next();
        }
    }else {
        next();
    }   
}

exports.logout = async (req, res) => {
    res.cookie('jwt', 'logout', {
        expires: new Date(Date.now() + 2 * 1000),
        httpOnly: true
    });

    res.status(200).redirect('/');
}

