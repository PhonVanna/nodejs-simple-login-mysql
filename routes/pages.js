const express = require('express');
const authController = require('../controllers/auth');
const postController = require('../controllers/post');

const router = express.Router();

router.get('/', [authController.isLoggedIn, postController.homelistposts], (req, res) => {
    res.render('index', {
        user: req.user,
        posts: req.posts
    });
});

router.get('/register',  (req, res) => {
    if(req.cookies.jwt){
        res.redirect('/profile');
    }else{
        res.render("register")
    }   
});


router.get('/login', (req, res) => {
    if(req.cookies.jwt){
        res.redirect('/profile');
    }else{
        res.render("login")
    }   
});


router.get('/profile', [authController.isLoggedIn, postController.listposts], (req, res) => {
    if(req.user){
        res.render("profile", {
            user: req.user,
            posts: req.posts
        });
    }else{
        res.redirect('/login');
    }
});


router.get('/add', authController.isLoggedIn, (req, res) => {
    if(req.user){
        res.render("create", {
            user: req.user
        });
    }
});


router.post('/add', [authController.isLoggedIn, postController.create], (req, res) => {
    if(req.user){
        res.render("create", {
            user: req.user
        });
    }
});



router.get('/edit/:id', authController.isLoggedIn, postController.getSinglePost, (req, res) => {
    if(req.user){
        res.render("edit", {
            user: req.user,
            post: req.post
        });
    }
});


router.post('/edit/:id', [authController.isLoggedIn, postController.updatePost], (req, res) => {
    if(req.user){
        res.render("edit", {
            user: req.user
        });
    }
});

module.exports = router;
